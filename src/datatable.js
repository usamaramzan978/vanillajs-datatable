import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Selectable } from "./selectable";
import { DataTableEvents } from "./datatable-events";
import { KeyboardNavigation } from "./keyboard-navigation";
import { DEFAULT_THEME } from "./datatable-theme";
import {
    loadData,
    getData,
    getRowData,
    updateRow,
    deleteRow,
    addRow,
    findDataRows,
    findRowsByFieldContains,
    getRowIndex,
    redraw,
} from "./methods/dataMethods.js";

import { exportJSON, downloadSelectedJSON } from "./methods/exportMethods.js";
import { setSort, clearSort } from "./methods/sortingMethods.js";
import { copyToClipboard } from "./methods/utiilityMethods.js";
import {
    goToPage,
    setPageSize,
    getCurrentPage,
} from "./methods/paginationMethods.js";

export default class DataTable {
    constructor({
        data,
        tableId,
        url,
        perPage = 10,
        perPageOptions = [10, 25, 50],
        defaultSort = "id",
        defaultOrder = "asc", // Order direction must be "asc" or "desc".
        columns = [], // Add default empty array here
        dataSrc = null,
        saveState = false,

        selectable = false,
        selectMode = "single",
        selectionClass = "selected",
        selectionBgClass = "bg-red-100",

        keyboardNav = false,
        // Element IDs
        searchInputId = null,
        prevBtnId = null,
        nextBtnId = null,
        pageInfoId = null,
        infoTextId = null,
        paginationWrapperId = null,
        perPageSelectId = null,
        // Button IDs and visibility flags
        resetBtnId = null,
        reloadBtnId = null,
        exportBtnId = null,
        downloadCsvBtnId = null,
        printBtnId = null,
        pdfBtnId = null,

        // Features
        paginationType = "detailed",
        enableSort = true,
        sortableColumns = [],
        searchDelay = 300, // new

        loadingSpinnerId = null, // Default loading spinner ID
        loadingSpinner = false, // Whether to show the loading spinner by default
        loadingSpinnerDuration = 0, // Default loading spinner duration (in milliseconds)

        resetBtn = true,
        reloadBtn = true,
        printBtn = true,
        exportBtn = true,
        downloadCsvBtn = true,
        pdfBtn = true,
        perPageBtn = true,
        searchBtn = true,
        paginationBtn = true,

        columnFilterFields = null, // Array of column names to filter (for default inputs)
        theme = {}, // default to empty object
        columnGroups = [], // Add default empty array here
        stickyHeader = false,

        chunkSize = {
            print: 100,
            pdf: 50,
            excel: 50,
            csv: 50,
        },
        enableCustomColumnFilter = false,
        saveStateDuration = 60 * 60 * 1000, // 1 hour
    }) {
        this.theme = {
            ...DEFAULT_THEME,
            ...theme,
        };

        this.data = [];
        this.tableId = tableId;
        this.table = document.getElementById(tableId);
        this.url = url;
        this.rowsPerPage = perPage;
        this.perPageOptions = perPageOptions; // Store the custom per-page options
        this.sort = defaultSort;
        this.order = defaultOrder;
        this.search = "";
        this.chunkSize = chunkSize;
        this.currentPage = 1;
        this.dataSrc = dataSrc || "data"; // Default to 'data' if not provided
        this.enableSaveState = saveState;
        this.saveStateDuration = saveStateDuration;
        this.updatePagination = this.updatePagination.bind(this);

        // this.prevBtn = prevBtnId ? document.getElementById(prevBtnId) : null;
        // this.nextBtn = nextBtnId ? document.getElementById(nextBtnId) : null;
        // this.pageInfo = pageInfoId ? document.getElementById(pageInfoId) : null;
        // this.infoText = infoTextId ? document.getElementById(infoTextId) : null;
        // this.paginationWrapper = paginationWrapperId
        //     ? document.getElementById(paginationWrapperId)
        //     : null;

        this.paginationType = paginationType;
        this.enableSort = enableSort;
        this.paginationBtn = paginationBtn;
        // this.sortableColumns = sortableColumns;
        this.sortableColumns = Array.isArray(sortableColumns)
            ? sortableColumns
            : [];
        this.searchDelay = searchDelay;
        this.columnFilters = {};
        this.columns = columns;
        this.searchDebounceTimer = null;
        this.enableLoadingSpinner = loadingSpinner;
        this.LoadingSpinnerContainer =
            loadingSpinnerId || `${tableId}-loading-spinner`;
        this.loadingSpinnerDuration = loadingSpinnerDuration;

        this.columnGroups = columnGroups || [];
        this.stickyHeader = stickyHeader;

        this.enableCustomColumnFilter = enableCustomColumnFilter;

        // Button configuration
        this.buttonConfig = {
            reset: {
                id: resetBtnId || `${tableId}-reset-button`,
                enabled: resetBtn,
                icon: "fa-solid fa-rotate-left",
                text: "Reset",
            },
            reload: {
                id: reloadBtnId || `${tableId}-reload-button`,
                enabled: reloadBtn,
                icon: "fa-solid fa-rotate",
                text: "Reload",
            },
            print: {
                id: printBtnId || `${tableId}-print-button`,
                enabled: printBtn,
                icon: "fa-solid fa-print",
                text: "Print",
            },
            export: {
                id: exportBtnId || `${tableId}-export-button`,
                enabled: exportBtn,
                icon: "fa-solid fa-file-excel text-green-600",
                text: "Excel",
            },
            downloadCsv: {
                id: downloadCsvBtnId || `${tableId}-download-csv-button`,
                enabled: downloadCsvBtn,
                icon: "fa-solid fa-file-csv text-blue-600",
                text: "CSV",
            },
            pdf: {
                id: pdfBtnId || `${tableId}-download-pdf-button`,
                enabled: pdfBtn,
                icon: "fa-solid fa-file-pdf text-red-600",
                text: "PDF",
            },
            perPageSelect: {
                id: perPageSelectId || `${tableId}-per-page`,
                enabled: perPageBtn,
                text: "Perpage",
            },
            search: {
                id: searchInputId || `${tableId}-search-input`,
                enabled: searchBtn,
                text: "Search",
            },
        };

        this.paginationConfig = {
            previous: {
                id: prevBtnId || `${tableId}-prev-button`,
                text: "Previous",
            },
            next: {
                id: nextBtnId || `${tableId}-next-button`,
                text: "Next",
            },
            pageInfo: {
                id: pageInfoId || `${tableId}-page-info`,
                text: "Page Info",
            },
            infoText: {
                id: infoTextId || `${tableId}-info-text`,
                text: "Entries Info",
            },
            wrapper: {
                id: paginationWrapperId || `${tableId}-pagination`,
                text: "Pagination Controls Wrapper",
            },
        };

        this.columnFilterFields = columnFilterFields;

        // Initialize selectable features PROPERLY
        this.selectable = new Selectable(this.table, {
            selectable,
            selectMode,
            selectionClass,
            selectionBgClass,
        });
        // Public Selectable methods
        this.getSelectedIds = () => this.selectable.getSelectedIds();
        this.clearSelection = () => this.selectable.clearSelection();
        this.selectAll = () => this.selectable.selectAll();
        this.toggleRowSelection = (id, force) =>
            this.selectable.toggleRowSelection(id, force);
        this.isSelected = (id) => this.selectable.isSelected(id);
        this.onSelectionChange = (callback) =>
            this.selectable.onSelectionChange(callback);

        // Then initialize keyboard navigation if enabled
        if (keyboardNav !== false) {
            // Changed from enableKeyboardNav
            this.keyboardNav = new KeyboardNavigation(this.table, {
                selectable: this.selectable,
                getData: () => this.data,
                enabled: keyboardNav, // Changed from options.keyboardNav
            });
        }

        // Public Core Data methods
        this.loadData = loadData.bind(this);
        this.getData = getData.bind(this);
        this.getRowData = getRowData.bind(this);
        this.updateRow = updateRow.bind(this);
        this.deleteRow = deleteRow.bind(this);
        this.addRow = addRow.bind(this);
        this.findDataRows = findDataRows.bind(this);
        this.findRowsByFieldContains = findRowsByFieldContains.bind(this);
        this.getRowIndex = getRowIndex.bind(this);
        this.redraw = redraw.bind(this);

        // Public Core Sorting methods
        this.setSort = setSort.bind(this);
        this.clearSort = clearSort.bind(this);

        // Public Core Pagination methods
        this.goToPage = goToPage.bind(this);
        this.setPageSize = setPageSize.bind(this);
        this.getCurrentPage = getCurrentPage.bind(this);

        // Public Core Utility methods
        this.copyToClipboard = copyToClipboard.bind(this);

        this.init();
    }

    // Public Export methods
    exportJSON(filename = "table-data.json") {
        exportJSON(this.data, filename);
    }
    downloadSelectedJSON(filename = "selected-data.json") {
        const selectedIds = this.getSelectedIds();
        console.log("Selected IDs:", selectedIds);

        if (selectedIds.length === 0) {
            alert("Please select at least one row to export.");
            return;
        }

        const selectedData = this.data.filter((row) =>
            selectedIds.includes(String(row.id))
        );
        console.log("Selected Data:", selectedData);

        exportJSON(selectedData, filename);
    }

    init() {
        if (this.saveState) {
            this.loadState(); // Load saved state early before fetchData()
        }
        if (this.enableLoadingSpinner) this.toggleLoadingSpinner(true);

        this.addDefaultControls();

        this.initButtons();

        this.initSearch();
        if (this.enableSort) this.bindSort();
        this.fetchData();

        this.initPagination();
        this.renderTableHeader();

        this.dispatchEvent(DataTableEvents.INIT, {
            config: {
                url: this.url,
                columns: this.columns,
                features: {
                    sorting: this.enableSort,
                    pagination: this.paginationBtn,
                    search: this.search,
                },
            },
        });
    }

    dispatchEvent(name, detail = {}) {
        if (!this.table) {
            console.warn(
                `Cannot dispatch datatable:${name} - table element not found`
            );
            return false;
        }

        const event = new CustomEvent(`datatable:${name}`, {
            detail: {
                ...detail,
                tableId: this.table.id,
                timestamp: new Date().toISOString(),
            },
            bubbles: true,
            cancelable: true,
        });

        // console.log(`Dispatching datatable:${name}`, event.detail); // <--- Debug line

        return this.table.dispatchEvent(event);
    }
    /**
     * State Persistence
     * Saves the current state of the DataTable to localStorage.
     * State includes sorting, pagination, filters, and search term.
     */
    saveState() {
        if (!this.table || !this.table.id) return; // Safety check

        const state = {
            sort: this.sort,
            order: this.order,
            page: this.currentPage,
            perPage: this.rowsPerPage,
            filters: this.columnFilters,
            search: this.search,
        };
        localStorage.setItem(
            `datatable_${this.table.id}_state`,
            JSON.stringify(state)
        );
    }

    /**
     * Loads the saved state from localStorage and applies it to the DataTable.
     * Dispatches a 'stateRestored' event after loading.
     */
    loadState() {
        const saved = localStorage.getItem(`datatable_${this.table.id}_state`);
        if (!saved) return;

        const state = JSON.parse(saved);

        // Check expiration
        if (
            this.saveStateDuration &&
            Date.now() - state.timestamp > this.saveStateDuration
        ) {
            this.clearState();
            return;
        }
        this.dispatchEvent(DataTableEvents.STATE_RESTORED, { state });

        // Apply saved state
        this.sort = state.sort;
        this.order = state.order;
        this.currentPage = state.page;
        this.rowsPerPage = state.perPage;
        this.columnFilters = state.filters || {};
        this.search = state.search || "";
    }

    clearState() {
        if (!this.table || !this.table.id) return;
        localStorage.removeItem(`datatable_${this.table.id}_state`);
    }

    // Initialize all buttons
    initButtons() {
        // Keep existing binding methods if they're enabled
        if (this.buttonConfig.reset.enabled) {
            this.bindResetButton();
        }
        if (this.buttonConfig.reload.enabled) {
            this.bindReloadButton();
        }
        if (this.buttonConfig.print.enabled) {
            this.bindPrintButton();
        }
        if (this.buttonConfig.export.enabled) {
            this.bindExportButton();
        }
        if (this.buttonConfig.downloadCsv.enabled) {
            this.bindDownloadCsvButton();
        }
        if (this.buttonConfig.pdf.enabled) {
            this.bindPdfButton();
        }
        if (this.buttonConfig.perPageSelect.enabled) {
            this.bindPerPageSelect();
        }
    }

    initPagination() {
        if (!this.paginationBtn) return;

        this.paginationConfig = {
            previous: {
                id: `${this.tableId}-prev-button`,
                text: "Previous",
            },
            next: {
                id: `${this.tableId}-next-button`,
                text: "Next",
            },
            pageInfo: {
                id: `${this.tableId}-page-info`,
                text: "Page Info",
            },
            infoText: {
                id: `${this.tableId}-info-text`,
                text: "Showing X to Y of Z entries",
            },
            wrapper: {
                id: `${this.tableId}-pagination`,
            },
            container: {
                id: `${this.tableId}-pagination-container`,
            },
        };

        // Create buttons and info text
        this.prevBtn = this.getOrCreateElement(
            this.paginationConfig.previous.id,
            "button",
            "btn btn-sm join-item",
            this.paginationConfig.previous.text
        );

        this.nextBtn = this.getOrCreateElement(
            this.paginationConfig.next.id,
            "button",
            "btn btn-sm join-item",
            this.paginationConfig.next.text
        );

        this.pageInfo = this.getOrCreateElement(
            this.paginationConfig.pageInfo.id,
            "span",
            "text-sm text-gray-600",
            ""
        );

        this.infoText = this.getOrCreateElement(
            this.paginationConfig.infoText.id,
            "div",
            "text-sm text-gray-600",
            ""
        );

        // Create or get paginationWrapper
        this.paginationWrapper = document.getElementById(
            this.paginationConfig.wrapper.id
        );
        if (!this.paginationWrapper) {
            this.paginationWrapper = document.createElement("div");
            this.paginationWrapper.id = this.paginationConfig.wrapper.id;
            this.paginationWrapper.className = this.theme.paginationWrapper; // container for buttons only
        }

        // Create or get paginationContainer (outer wrapper)
        this.paginationContainer = document.getElementById(
            this.paginationConfig.container.id
        );
        if (!this.paginationContainer) {
            this.paginationContainer = document.createElement("div");
            this.paginationContainer.id = this.paginationConfig.container.id;
            this.paginationContainer.className = this.theme.paginationContainer;

            // Append infoText and paginationWrapper inside this container
            this.paginationContainer.appendChild(this.infoText);
            this.paginationContainer.appendChild(this.paginationWrapper);

            // Append container after the table
            this.table.parentNode.appendChild(this.paginationContainer);
        }

        // Append buttons inside paginationWrapper (if not already)
        if (!this.paginationWrapper.contains(this.prevBtn))
            this.paginationWrapper.appendChild(this.prevBtn);
        if (!this.paginationWrapper.contains(this.nextBtn))
            this.paginationWrapper.appendChild(this.nextBtn);

        // Bind buttons
        this.bindPaginationButtons();
    }

    getOrCreateElement(id, tag, className, text) {
        let el = document.getElementById(id);
        if (!el) {
            el = document.createElement(tag);
            el.id = id;
            el.className = className;
            if (text) el.textContent = text;
        }
        return el;
    }

    // Method to add default controls
    addDefaultControls() {
        const controlsContainer = document.createElement("div");
        controlsContainer.className = this.theme.controlsContainer || "";

        let perPageSelectHTML = "";
        let buttonsHTML = "";
        let searchHTML = "";

        for (const [key, config] of Object.entries(this.buttonConfig)) {
            if (!config.enabled || document.getElementById(config.id)) continue;

            if (key === "perPageSelect") {
                // Generate options from perPageOptions array
                const optionsHTML = this.perPageOptions
                    .map(
                        (size) =>
                            `<option value="${size}" ${
                                this.rowsPerPage == size ? "selected" : ""
                            }>${size}</option>`
                    )
                    .join("");

                perPageSelectHTML = `
                <select id="${config.id}" class="${this.theme.perPageSelect}" title="${config.text}">
                    ${optionsHTML}
                </select>
            `;
            } else if (key === "search") {
                searchHTML = `
                <div class="relative w-full max-w-xs">
                    <input type="text" id="${config.id}" placeholder="Search records..." class="${this.theme.searchInput}" />
                </div>
            `;
            } else {
                buttonsHTML += `
                <button id="${config.id}" class="${this.theme.button}" title="${
                    config.text
                }">
                    ${
                        config.icon ? `<i class="${config.icon} mr-1"></i>` : ""
                    }${config.text}
                </button>
            `;
            }
        }

        controlsContainer.innerHTML = `
        <div class="${this.theme.controlsWrapper}">
            <div class="flex items-center gap-2">
                ${perPageSelectHTML}
                <div class="flex items-center gap-2">${buttonsHTML}</div>
            </div>
            ${searchHTML}
        </div>
    `;

        const tableParent = this.table.parentNode;
        if (tableParent) {
            tableParent.insertBefore(controlsContainer, this.table);
        }
    }

    // Method to toggle the loading spinner visibility based on the `loadingSpinner` boolean
    toggleLoadingSpinner(isLoading) {
        if (!this.enableLoadingSpinner) return;

        let spinnerContainer = document.getElementById(
            this.LoadingSpinnerContainer
        );

        if (!spinnerContainer) {
            // Create overlay container
            spinnerContainer = document.createElement("div");
            spinnerContainer.id = this.LoadingSpinnerContainer;
            spinnerContainer.className =
                "absolute inset-0 flex items-center justify-center bg-base-100/70 z-50 hidden";

            // Create Daisy UI loading spinner
            const spinner = document.createElement("span");
            spinner.className = "loading loading-dots loading-lg";

            spinnerContainer.appendChild(spinner);

            // Make table container a positioning context
            if (!this.table.parentNode.classList.contains("relative")) {
                this.table.parentNode.classList.add("relative");
            }
            this.table.parentNode.appendChild(spinnerContainer);
        }

        // Clear any existing timeout
        if (this.loadingSpinnerTimeout) {
            clearTimeout(this.loadingSpinnerTimeout);
        }

        // Show/hide with optional auto-hide
        if (isLoading) {
            spinnerContainer.classList.remove("hidden");
            if (this.loadingSpinnerDuration > 0) {
                this.loadingSpinnerTimeout = setTimeout(() => {
                    this.toggleLoadingSpinner(false);
                }, this.loadingSpinnerDuration);
            }
        } else {
            spinnerContainer.classList.add("hidden");
        }
    }
    // ==============================
    // Header Download Buttons
    // ==============================

    // Binds the reset button's click event to the `resetTable` method
    // @method bindResetButton
    // @return {void}
    //
    bindResetButton() {
        const button = document.getElementById(this.buttonConfig.reset.id);
        if (button) {
            button.addEventListener("click", () => this.resetTable());
        }
    }

    /**
     * Reset the table to its initial state.
     * @method resetTable
     * @return {void}
     */
    resetTable() {
        // Reset search input
        this.search = "";

        // Reset pagination
        this.currentPage = 1;

        // Reset sorting
        this.sort = "id";
        this.order = "asc";

        // Reset column filters
        this.columnFilters = {};

        // Reset the search input
        if (this.searchInput) {
            this.searchInput.value = "";
        }

        // Clear the state
        this.clearState();

        // Reset column filters if they exist
        const filterInputs = document.querySelectorAll("[data-column-filter]");
        filterInputs.forEach((input) => {
            input.value = "";
        });

        // Dispatch the `reset` event
        this.dispatchEvent(DataTableEvents.RESET);

        // Fetch new data
        this.fetchData();
    }

    /**
     * Bind the reload button click event to the `reloadTable` method.
     * This method dispatches the `reload` event and refetches the data.
     * @method bindReloadButton
     * @return {void}
     */
    bindReloadButton() {
        const reloadButton = document.getElementById(
            this.buttonConfig.reload.id
        );
        if (!reloadButton) return;

        reloadButton.addEventListener("click", () => {
            this.dispatchEvent(DataTableEvents.RELOAD);
            this.fetchData();
        });
    }

    /**
     * Bind the export button's click event to the `exportToExcel` method.
     * @method bindExportButton
     * @return {void}
     */
    bindExportButton() {
        const button = document.getElementById(this.buttonConfig.export.id);

        if (!button) return;

        /**
         * Export the table data to an Excel spreadsheet when the button is clicked.
         * This event is typically used to trigger the export process.
         * @event export
         */
        button.addEventListener("click", () => {
            this.dispatchEvent(DataTableEvents.EXPORT);
            this.exportToExcel();
        });
    }

    /**
     * Bind the download CSV button's click event to the `downloadCSV` method.
     * This event is typically used to trigger the download process.
     * @method bindDownloadCsvButton
     * @return {void}
     */
    bindDownloadCsvButton() {
        const button = document.getElementById(
            this.buttonConfig.downloadCsv.id
        );
        if (button) {
            /**
             * Trigger the download of the table data in CSV format.
             * This event is dispatched when the button is clicked.
             * @event downloadCSV
             */
            button.addEventListener("click", () => this.downloadCSV());
        }
    }

    /**
     * Bind the print button's click event to the `printTable` method.
     * @method bindPrintButton
     * @return {void}
     */
    bindPrintButton() {
        const button = document.getElementById(this.buttonConfig.print.id);

        if (button) {
            /**
             * Trigger the printing of the table when the button is clicked.
             * This event is dispatched when the button is clicked.
             * @event print
             */
            button.addEventListener("click", () => this.printTable());
        }
    }

    /**
     * Bind the PDF button's click event to the `downloadPdf` method.
     * @method bindPdfButton
     * @return {void}
     */
    bindPdfButton() {
        const button = document.getElementById(this.buttonConfig.pdf.id);
        if (button) {
            /**
             * Trigger the download of the table data in PDF format.
             * This event is dispatched when the button is clicked.
             * @event downloadPdf
             */
            button.addEventListener("click", () => this.downloadPdf());
        }
    }

    // ==============================
    // Header Search & Filters
    // ==============================

    /**
     * Initializes the search input field and binds the search behavior to it.
     * @method initSearch
     * @return {void}
     */
    initSearch() {
        const searchInput = document.getElementById(
            this.buttonConfig.search.id
        );

        if (searchInput) {
            // If search input exists in the default controls, bind the search behavior to it
            this.searchInput = searchInput;
            this.bindSearch();

            /**
             * Input event listener for the search field.
             * @event input
             */
            this.searchInput.addEventListener("input", (e) => {
                this.search = e.target.value;
                this.currentPage = 1;

                this.dispatchEvent(DataTableEvents.SEARCH, {
                    search: this.search,
                });
            });
        }
    }

    /**
     * Binds the search input field with a debounced event handler.
     * This method listens to input events on the search field and triggers
     * a search with a delay to optimize performance.
     * @method bindSearch
     * @return {void}
     */
    bindSearch() {
        if (!this.searchInput) return;

        // Create a debounced event handler for the search input
        const debouncedHandler = this.debounce((e) => {
            // Update search term and reset to the first page
            this.search = e.target.value;
            this.currentPage = 1;

            // Dispatch a custom search event with relevant data
            this.dispatchEvent(DataTableEvents.SEARCH, {
                searchTerm: this.search,
                currentPage: this.currentPage,
                searchDelay: this.searchDelay,
            });

            // Save the current state if enabled
            if (this.enableSaveState) {
                this.saveState();
            }

            // Fetch data based on the new search term
            this.fetchData();
        }, this.searchDelay);

        // Bind the debounced handler to the input event of the search field
        this.searchInput.addEventListener("input", debouncedHandler);
    }
    /**
     * Creates a debounced function that delays invoking the provided function
     * until after the specified delay in milliseconds has elapsed since the
     * last time the debounced function was invoked.
     *
     * @param {Function} fn - The function to debounce.
     * @param {number} delay - The number of milliseconds to delay.
     * @returns {Function} - A new debounced function.
     */
    debounce(fn, delay) {
        let timer; // Timer variable to store the timeout ID

        return function (...args) {
            // Clear the existing timer to reset the delay
            clearTimeout(timer);

            // Set a new timer with the provided delay
            timer = setTimeout(() => {
                // Invoke the original function with the correct context and arguments
                fn.apply(this, args);
            }, delay);
        };
    }

    /**
     * Renders default column search input fields into the table header.
     * This function creates a row of input fields in the table header for
     * each column specified in `columnFilterFields`. These inputs allow
     * users to filter table data based on column values.
     */
    renderDefaultColumnSearchInputs() {
        const thead = this.table.querySelector("thead");
        if (!thead) return;

        // Remove existing filter row if any
        const existingRow = thead.querySelector(".column-filters");
        if (existingRow) existingRow.remove();

        // Create a new row for filter inputs
        const filterRow = document.createElement("tr");
        filterRow.className = "column-filters";

        // Extract column names for matching
        const columnNames = this.columns.map((column) => column.name);

        // Iterate through columns and append input fields if they exist in columnFilterFields
        columnNames.forEach((columnKey) => {
            const td = document.createElement("th");

            // If the column is in columnFilterFields, add a search input field
            if (this.columnFilterFields.includes(columnKey)) {
                const input = document.createElement("input");
                input.className =
                    "input input-sm input-bordered w-full column-search";
                input.placeholder = `Search ${columnKey}`;
                input.setAttribute("data-column", columnKey);
                td.appendChild(input);
            } else {
                // If the column isn't in columnFilterFields, leave the cell empty
                td.innerHTML = ""; // Explicitly setting empty cell
            }

            // Append the cell to the filter row
            filterRow.appendChild(td);
        });

        // Insert the filter row into the thead
        thead.appendChild(filterRow);

        // Bind input event listeners to the search inputs for filtering functionality
        this.bindColumnSearchInputs();
    }

    /**
     * Binds input event listeners to the column search input fields.
     * This function iterates through all the column search input fields
     * and binds an input event listener to each one. When the input
     * field value changes, this function updates the column filter
     * for the corresponding column and fetches the filtered data
     * after a short delay.
     * @method bindColumnSearchInputs
     * @return {void}
     */
    bindColumnSearchInputs() {
        const inputs = document.querySelectorAll(".column-search");

        inputs.forEach((input) => {
            const column = input.dataset.column;
            input.addEventListener("input", () => {
                // Clear the existing timer to reset the delay
                clearTimeout(this.columnSearchTimer);

                // Set a new timer with the provided delay
                this.columnSearchTimer = setTimeout(() => {
                    // Update the column filter with the new value
                    this.columnFilters[column] = input.value;

                    // Reset to the first page
                    this.currentPage = 1;

                    // Save the current state if enabled
                    if (this.enableSaveState) {
                        this.saveState();
                    }

                    // Fetch the filtered data
                    this.fetchData();
                }, this.searchDelay);
            });
        });
    }

    /**
     * Bind sort event listeners to the table headers.
     * This function iterates through all the table headers,
     * checks if the column is sortable and adds a sort icon
     * to the header. It also adds a click event listener to
     * the header, which updates the sort and order properties
     * when clicked, and fetches the sorted data.
     * @method bindSort
     * @return {void}
     */
    bindSort() {
        const headers = this.table.querySelectorAll("th[data-column]");
        headers.forEach((th) => {
            const column = th.dataset.column;
            if (!this.sortableColumns.includes(column)) return;
            const iconSpan = document.createElement("span");
            // Add a sort icon to the header
            iconSpan.className = "sort-icon ml-2";
            iconSpan.innerHTML = '<i class="fa fa-sort text-gray-400"></i>';
            th.appendChild(iconSpan);

            th.addEventListener("click", () => {
                // Bind a click event listener to the header
                this.order = th.dataset.order === "asc" ? "desc" : "asc";
                // Update the sort and order properties
                this.sort = column;

                th.dataset.order = this.order;
                // Update the sort icon

                headers.forEach((h) => {
                    // Reset all the other sort icons
                    const i = h.querySelector(".sort-icon i");
                    if (i) i.className = "fa fa-sort text-gray-400";
                });

                const icon = th.querySelector(".sort-icon i");
                // Update the current header's sort icon
                if (icon)
                    icon.className =
                        this.order === "asc"
                            ? "fa fa-sort-up text-gray-600"
                            : "fa fa-sort-down text-gray-600";

                this.fetchData();
                // Fetch the sorted data
            });
        });
    }

    /**
     * Binds the per page select element to the DataTable's rowsPerPage property
     * and the perPageChange event.
     *
     * @param {Object} config
     * @param {String} config.id The ID of the per page select element.
     * @param {Boolean} config.enabled Whether to enable the per page select element.
     * @returns {void}
     */
    bindPerPageSelect() {
        const config = this.buttonConfig.perPageSelect;
        if (!config || !config.enabled) return;

        const perPageSelect = document.getElementById(config.id);
        if (!perPageSelect) {
            console.warn(
                `Per page select element with id '${config.id}' not found.`
            );
            return;
        }

        perPageSelect.addEventListener("change", (e) => {
            this.rowsPerPage = parseInt(e.target.value);
            // console.log(`Rows per page set to: ${e.target.value}`);
            this.currentPage = 1;

            this.dispatchEvent(DataTableEvents.PER_PAGE_CHANGE, {
                perPage: this.rowsPerPage,
                currentPage: this.currentPage,
            });

            this.fetchData();
        });
    }

    //===================
    // FETCH DATA
    //===================

    // async fetchData() {
    //     // Show loading spinner before fetching data
    //     if (this.enableLoadingSpinner) {
    //         this.toggleLoadingSpinner(true);
    //     }
    //     const params = new URLSearchParams({
    //         search: this.search,
    //         sortBy: this.sort,
    //         order: this.order,
    //         page: this.currentPage,
    //         perPage: this.rowsPerPage,
    //         columnFilters: JSON.stringify(this.columnFilters), // Convert filters to a query string
    //     });
    //     // Dispatch loading event with full query string
    //     this.dispatchEvent(DataTableEvents.LOADING, {
    //         queryParams: params.toString(),
    //     });
    //     try {
    //         const res = await fetch(`${this.url}?${params.toString()}`, {
    //             method: "GET", // Use GET to send the query parameters
    //             headers: {
    //                 "Content-Type": "application/json", // No need for body in GET request
    //             },
    //         });

    //         const json = await res.json();
    //         this.data = json[this.dataSrc] || []; // Access data based on dataSrc passed in constructor

    //         // Dispatch the loaded event
    //         this.dispatchEvent(DataTableEvents.LOADED, {
    //             data: this.data,
    //             page: this.currentPage,
    //             totalItems: json.total || this.data.length,
    //             response: json,
    //         });

    //         if (this.data.length === 0) {
    //             this.showEmptyStateInTable("No records found.");
    //         } else {
    //             this.renderTable(this.data); // Render table with new data
    //         }

    //         if (this.paginationBtn) {
    //             this.updatePagination(json); // Update pagination if enabled
    //         }
    //     } catch (error) {
    //         console.error("Error fetching data:", error);
    //         this.dispatchEvent(DataTableEvents.ERROR, {
    //             error: error,
    //             requestParams: params.toString(),
    //         });
    //     } finally {
    //         if (this.enableLoadingSpinner) {
    //             this.toggleLoadingSpinner(false);
    //         }
    //     }
    // }

    async fetchData() {
        // Show loading spinner immediately when enabled
        if (this.enableLoadingSpinner) {
            this.toggleLoadingSpinner(true);
        }

        const params = new URLSearchParams({
            search: this.search,
            sortBy: this.sort,
            order: this.order,
            page: this.currentPage,
            perPage: this.rowsPerPage,
            columnFilters: JSON.stringify(this.columnFilters),
        });

        this.dispatchEvent(DataTableEvents.LOADING, {
            queryParams: params.toString(),
        });

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

            const res = await fetch(`${this.url}?${params.toString()}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

            const json = await res.json();
            this.data = json[this.dataSrc] || [];

            this.dispatchEvent(DataTableEvents.LOADED, {
                data: this.data,
                page: this.currentPage,
                totalItems: json.total || this.data.length,
                response: json,
            });

            if (this.data.length === 0) {
                this.showEmptyStateInTable("No records found.");
            } else {
                this.renderTable(this.data);
            }

            if (this.paginationBtn) {
                this.updatePagination(json);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            this.dispatchEvent(DataTableEvents.ERROR, {
                error: error,
                requestParams: params.toString(),
            });

            // Optionally show error state
            if (this.data.length === 0) {
                this.showEmptyStateInTable("Error loading data");
            }
        } finally {
            // Always hide spinner when done
            // Only auto-hide if no duration was set
            if (this.loadingSpinnerDuration <= 0) {
                this.toggleLoadingSpinner(false);
            }
        }
    }
    showEmptyStateInTable(message = "No data available.") {
        // Use a stored reference or try to find tbody under your table element
        let tableBody = null;

        // If you have the table element stored in this.table
        if (this.table) {
            tableBody = this.table.querySelector("tbody");
        }

        // Fallback if not found
        if (!tableBody) {
            tableBody = document.getElementById("table-body");
        }

        if (!tableBody) {
            console.warn("Table body element not found");
            return; // Can't show empty state if no tbody
        }

        // Get number of columns from thead inside your table, or fallback selector
        let columnCount = 0;
        if (this.table) {
            const ths = this.table.querySelectorAll("thead tr:first-child th");
            columnCount = ths.length;
        }

        if (columnCount === 0) {
            // fallback to default number if you want
            columnCount = 1;
        }

        tableBody.innerHTML = `
        <tr>
            <td colspan="${columnCount}" class="text-center text-base-content text-sm py-6">
                ${message}
            </td>
        </tr>
    `;

        // Clear pagination container safely
        let paginationContainer = null;

        if (this.paginationWrapper) {
            paginationContainer = this.paginationWrapper;
        } else {
            paginationContainer = document.getElementById("pagination");
        }

        if (paginationContainer) {
            paginationContainer.innerHTML = "";
        }
    }

    //========================
    // Table Rendering Methods
    //========================

    /**
     * Renders the table with current data.
     * This is an internal method, not meant for public use.
     * @private
     */
    _renderTable() {
        // Call the renderTable method with the current data
        this.renderTable(this.data);
    }
    /**
     * Renders the table header, including optional group headers and filter inputs.
     */
    renderTableHeader() {
        // Remove existing <thead> if it exists
        const oldThead = this.table.querySelector("thead");
        if (oldThead) oldThead.remove();

        // Create a new <thead> element
        const thead = this.table.createTHead();
        thead.className = this.theme.header || "";

        // Optionally make headers sticky
        if (this.stickyHeader) {
            thead.classList.add(...(this.theme.headerSticky?.split(" ") || []));
        }

        // Filter out columns that are not visible
        const visibleColumns = this.columns.filter((c) => c.visible !== false);
        const hasGroups = this.columnGroups?.length > 0;

        // Render group headers if applicable
        if (hasGroups) {
            this.renderGroupHeaders(thead, visibleColumns);
        }

        // Render filter inputs if applicable
        if (this.enableCustomColumnFilter) {
            this.renderFilterInputs(thead, visibleColumns);
        }

        // Always render column headers
        this.renderColumnHeaders(thead, visibleColumns, hasGroups);

        // Ensure <tbody> exists
        if (!this.table.querySelector("tbody")) {
            this.table.appendChild(document.createElement("tbody"));
        }
    }

    /**
     * Renders the group headers for the table, using the `columnGroups` option.
     * This function assumes that the `columnGroups` option is an array of objects
     * with keys `key` and `label`, where `key` is the column key and `label` is
     * the text to display in the group header.
     *
     * @param {HTMLTableSectionElement} thead - The table head element to render
     * into.
     * @param {DataColumn[]} visibleColumns - The columns to render group headers
     * for.
     */
    renderGroupHeaders(thead, visibleColumns) {
        const groupHeaderRow = thead.insertRow();
        groupHeaderRow.className = this.theme.groupHeaderRow || "";

        const groupSpans = {};
        visibleColumns.forEach((col) => {
            if (col.group) {
                groupSpans[col.group] = (groupSpans[col.group] || 0) + 1;
            }
        });

        const groupMap = {};
        this.columnGroups.forEach((g) => (groupMap[g.key] = g));

        const renderedGroups = new Set();
        let currentColIndex = 0;

        while (currentColIndex < visibleColumns.length) {
            const col = visibleColumns[currentColIndex];

            if (col.group && !renderedGroups.has(col.group)) {
                const th = document.createElement("th");
                th.colSpan = groupSpans[col.group];
                th.textContent = groupMap[col.group]?.label || col.group;

                // Merge theme default class with user override
                const defaultClass = this.theme.groupHeaderCell || "";
                const userClass = groupMap[col.group]?.headerClass || "";

                th.className = `${defaultClass} ${userClass}`.trim();

                groupHeaderRow.appendChild(th);
                renderedGroups.add(col.group);
                currentColIndex += groupSpans[col.group];
            } else {
                const th = document.createElement("th");
                th.colSpan = 1;
                groupHeaderRow.appendChild(th);
                currentColIndex++;
            }
        }
    }

    /**
     * Renders the filter inputs for the table, using the `columnFilterFields`
     * option. This function assumes that the `columnFilterFields` option is an
     * array of column keys.
     *
     * @param {HTMLTableSectionElement} thead - The table head element to render
     * into.
     * @param {DataColumn[]} visibleColumns - The columns to render filter inputs
     * for.
     */
    renderFilterInputs(thead, visibleColumns) {
        const filterRow = thead.insertRow();
        filterRow.className = this.theme.filterRow || "";
        this.columnFilters = this.columnFilters || {};

        visibleColumns.forEach((column) => {
            const th = document.createElement("th");
            th.className = this.theme.headerCell || "";

            if (this.columnFilterFields.includes(column.name)) {
                const input = document.createElement("input");
                input.type = "search";
                input.placeholder = `Filter ${column.label}`;
                input.className = this.theme.filterInput || "";

                // Debounce the input event to prevent excessive filtering
                input.addEventListener(
                    "input",
                    this.debounce((e) => {
                        this.columnFilters[column.name] = e.target.value;
                        this.dispatchEvent(DataTableEvents.FILTER, {
                            /**
                             * @prop {DataColumn} column - The column being filtered
                             * @prop {string} value - The value to filter by
                             * @prop {Object} filters - The full set of column filters
                             * @prop {string} timestamp - The timestamp of the event
                             * @prop {string} tableId - The ID of the table
                             * @prop {number} searchDelay - The debouncing delay
                             */
                            column: column,
                            value: e.target.value,
                            filters: this.columnFilters,
                            timestamp: new Date().toISOString(),
                            tableId: this.table.id || null,
                            searchDelay: this.searchDelay,
                        });
                        this.fetchData();
                    }, this.searchDelay)
                );

                th.appendChild(input);
            }

            filterRow.appendChild(th);
        });
    }

    /**
     * Renders the column headers for the table, using the `columns` option.
     * This function assumes that the `columns` option is an array of objects
     * with keys `name`, `label`, and optionally `visible`, `group`, `tooltip`.
     *
     * @param {HTMLTableSectionElement} thead - The table head element to render
     * into.
     * @param {DataColumn[]} visibleColumns - The columns to render headers for.
     * @param {boolean} hasGroups - Whether the table has column groups.
     */
    renderColumnHeaders(thead, visibleColumns, hasGroups) {
        const headerRow = thead.insertRow();

        visibleColumns.forEach((column, index) => {
            const th = document.createElement("th");
            if (this.theme.headerCell) {
                th.className = this.theme.headerCell;
            } else {
                th.classList.add("cursor-pointer");
            }

            // Mark group boundaries
            if (hasGroups) {
                const prevCol = visibleColumns[index - 1];
                const nextCol = visibleColumns[index + 1];

                if (!prevCol || prevCol.group !== column.group) {
                    th.dataset.groupStart = "true";
                }
                if (!nextCol || nextCol.group !== column.group) {
                    th.dataset.groupEnd = "true";
                }
            }

            th.dataset.columnName = column.name;

            // Tooltip
            if (column.tooltip) {
                th.title = column.tooltip;
            }

            // Label span
            const spanLabel = document.createElement("span");
            spanLabel.textContent = column.label;
            th.appendChild(spanLabel);

            // Sorting logic
            if (this.sortableColumns?.includes(column.name)) {
                th.classList.add("cursor-pointer");
                th.dataset.column = column.name;
                th.dataset.order = this.defaultOrder || "asc";

                const iconSpan = document.createElement("span");
                iconSpan.className = "sort-icon ml-2";
                iconSpan.innerHTML = '<i class="fa fa-sort text-gray-400"></i>';
                th.appendChild(iconSpan);

                th.addEventListener("click", () => {
                    /**
                     * Toggles the sort order of the column between ascending and
                     * descending.
                     */
                    const newOrder =
                        th.dataset.order === "asc" ? "desc" : "asc";
                    th.dataset.order = newOrder;
                    this.sort = column.name;
                    this.order = newOrder;

                    // Reset icons
                    thead.querySelectorAll(".sort-icon i").forEach((i) => {
                        i.className = "fa fa-sort text-gray-400";
                    });

                    // Update icon
                    const icon = th.querySelector(".sort-icon i");
                    icon.className =
                        newOrder === "asc"
                            ? "fa fa-sort-up text-gray-600"
                            : "fa fa-sort-down text-gray-600";

                    /**
                     * Dispatches the `datatable:sort` event with the following
                     * payload:
                     * {
                     *     column: string,
                     *     label: string,
                     *     index: number,
                     *     direction: string,
                     *     timestamp: string,
                     *     tableId: string
                     * }
                     */
                    this.dispatchEvent(DataTableEvents.SORT, {
                        column: column.name,
                        label: column.label,
                        index: this.columns.indexOf(column),
                        direction: newOrder,
                        timestamp: new Date().toISOString(),
                        tableId: this.table.id || null,
                    });

                    if (this.enableSaveState) {
                        this.saveState();
                    }

                    this.fetchData();
                });
            }

            headerRow.appendChild(th);
        });
    }

    /**
     * Renders the table body with the provided rows.
     * @param {Array<Object>} rows
     */
    renderTable(rows) {
        const tbody = this.table.querySelector("tbody") || this.createTBody();
        tbody.innerHTML = "";

        if (!this.columns?.length) {
            console.error("Columns configuration is missing or empty");
            return;
        }

        tbody.className = this.theme.body || ""; // Use tbody theme if provided

        rows.forEach((row, rowIndex) => {
            const tr = document.createElement("tr");
            tr.dataset.id = row.id;

            // Apply zebra striping
            // Store zebra class in dataset
            // const zebraClass = rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50";
            // tr.classList.add(zebraClass);
            // tr.dataset.zebra = zebraClass;

            this.columns.forEach((column) => {
                if (column.visible === false) return;

                const td = document.createElement("td");
                this.renderCell(td, row, column, rowIndex);
                tr.appendChild(td);
            });

            tbody.appendChild(tr);
        });
    }

    /**
     * Creates a new table body element and appends it to the table.
     * @returns {HTMLTableSectionElement} The new table body element
     */
    createTBody() {
        const tbody = document.createElement("tbody");
        tbody.id = "table-body";

        // Apply tbody theme if provided
        if (this.theme.body) {
            tbody.className = this.theme.body;
        }

        this.table.appendChild(tbody);
        return tbody;
    }
    /**
     * Renders a table cell based on the provided row, column, and rowIndex.
     * Applies column-specific classes, and custom renderers if provided.
     * @param {HTMLTableCellElement} td The table cell element to render.
     * @param {Object} row The row object containing the cell's value.
     * @param {Object} column The column object containing the cell's configuration.
     * @param {Number} rowIndex The index of the row in the table.
     * @return {void}
     */
    renderCell(td, row, column, rowIndex) {
        const value = row[column.name];
        td.dataset.column = column.name;
        td.dataset.type = column.type;

        td.className = this.theme.cell;

        // Apply column-specific classes
        // Aligns the text within the cell
        if (column.align) td.classList.add(`text-${column.align}`);
        // Apply any additional classes
        if (column.class) td.classList.add(...column.class.split(" "));
        // Set the width of the cell
        if (column.width) td.style.width = column.width;

        // Custom renderer
        // Ensure rendered is always a string
        let rendered = "";

        if (column.render && typeof column.render === "function") {
            // Run the custom renderer function and store its result in rendered
            rendered = column.render(value, row);
        } else if (value !== undefined && value !== null) {
            // If no custom renderer is provided, just use the value as a string
            rendered = String(value);
        }

        if (
            column.highlightable &&
            this.search &&
            typeof rendered === "string"
        ) {
            const highlightConfig =
                typeof column.highlightable === "object"
                    ? column.highlightable
                    : {};

            const color =
                highlightConfig.color ||
                this.theme.highlight ||
                "bg-yellow-200";

            const tag = highlightConfig.tag || "mark";

            const escapedSearch = this.search.replace(
                /[-\/\\^$*+?.()|[\]{}]/g,
                "\\$&"
            );
            const regex = new RegExp(`(${escapedSearch})`, "gi");

            rendered = rendered.replace(
                regex,
                `<${tag} class="${color}">$1</${tag}>`
            );
        }

        td.innerHTML = rendered;
    }

    //===================
    // Pagination
    //===================

    /**
     * Binds click event listeners to the previous and next pagination buttons.
     * Handles page navigation and triggers data fetching when buttons are clicked.
     * @return {void}
     */
    bindPaginationButtons() {
        if (this.prevBtn) {
            // Navigate to the previous page
            this.prevBtn.addEventListener("click", () => {
                if (this.currentPage > 1) {
                    this.currentPage--;

                    // Dispatch page change event
                    this.dispatchEvent(DataTableEvents.PAGE_CHANGE, {
                        fromPage: this.currentPage + 1,
                        toPage: this.currentPage,
                    });

                    // Refetch data for the new page
                    this.fetchData();
                }
            });
        }

        if (this.nextBtn) {
            // Navigate to the next page
            this.nextBtn.addEventListener("click", () => {
                this.currentPage++;

                // Dispatch page change event
                this.dispatchEvent(DataTableEvents.PAGE_CHANGE, {
                    fromPage: this.currentPage - 1,
                    toPage: this.currentPage,
                });

                // Refetch data for the new page
                this.fetchData();
            });
        }
    }

    /**
     * Updates all pagination UI elements based on current pagination state.
     * @param {Object} paginationInfo - Pagination metadata
     * @param {number} paginationInfo.current_page - Current page number
     * @param {number} paginationInfo.last_page - Total number of pages
     * @param {number} paginationInfo.total - Total number of records
     */
    updatePagination({ current_page, last_page, total }) {
        if (this.pageInfo) {
            // Update page info text
            this.pageInfo.textContent = `Page ${current_page} of ${last_page}`;
        }
        if (this.prevBtn) {
            // Disable previous button if we are on the first page
            this.prevBtn.disabled = current_page === 1;
        }
        if (this.nextBtn) {
            // Disable next button if we are on the last page
            this.nextBtn.disabled = current_page === last_page;
        }

        // Clear pagination wrapper content
        if (!this.paginationWrapper) return;
        this.paginationWrapper.innerHTML = "";

        // Update pagination buttons based on the type
        if (this.paginationType === "simple") {
            this.updateSimplePagination(current_page, last_page);
        } else {
            this.updateDetailedPagination(current_page, last_page);
        }

        // Update info text
        if (this.infoText) {
            this.infoText.textContent = `Showing ${
                (current_page - 1) * this.rowsPerPage + 1
            } to ${Math.min(
                current_page * this.rowsPerPage,
                total
            )} of ${total} entries`;
        }

        // Save state if enabled
        if (this.enableSaveState) {
            this.saveState();
        }
    }

    /**
     * Updates the pagination controls for a simple pagination type.
     * @param {number} current_page - The current page number.
     * @param {number} last_page - The last page number.
     * @return {void}
     */
    updateSimplePagination(current_page, last_page) {
        const prevBtn = this.createNavButton("«", current_page > 1, () => {
            const prevPage = this.currentPage;
            this.currentPage = current_page - 1;
            this.dispatchEvent(DataTableEvents.PAGE_CHANGE, {
                fromPage: prevPage,
                toPage: this.currentPage,
            });
            this.fetchData();
        });

        const nextBtn = this.createNavButton(
            "»",
            current_page < last_page,
            () => {
                const prevPage = this.currentPage;
                this.currentPage = current_page + 1;
                this.dispatchEvent(DataTableEvents.PAGE_CHANGE, {
                    fromPage: prevPage,
                    toPage: this.currentPage,
                });
                this.fetchData();
            }
        );
        this.paginationWrapper.className =
            this.theme.paginationWrapper || "join gap-1";

        this.paginationWrapper.appendChild(prevBtn);
        this.paginationWrapper.appendChild(nextBtn);
    }

    /**
     * Updates the pagination controls for a detailed pagination type.
     * @param {number} current_page - The current page number.
     * @param {number} last_page - The last page number.
     * @return {void}
     */
    updateDetailedPagination(current_page, last_page) {
        /**
         * Creates a page button with consistent styling.
         * @param {number} page - Page number
         * @returns {HTMLElement} The created button element
         */
        const addPage = (page) => {
            const btn = document.createElement("button");
            btn.className = `${
                this.theme.paginationButton || "btn btn-sm"
            } join-item ${
                page === current_page
                    ? this.theme.paginationButtonActive || "btn-active"
                    : ""
            }`;
            btn.textContent = page;
            btn.addEventListener("click", () => {
                const prevPage = this.currentPage;
                this.currentPage = page;
                this.dispatchEvent(DataTableEvents.PAGE_CHANGE, {
                    fromPage: prevPage,
                    toPage: this.currentPage,
                });
                this.fetchData();
            });
            return btn;
        };

        /**
         * Calculates the start and end page numbers for the pagination UI.
         * This is done to show at most 5 pages in the UI.
         * @param {number} current_page - The current page number.
         * @param {number} last_page - The last page number.
         * @returns {Object} An object with start and end page numbers.
         */
        const getStartAndEndPages = () => {
            const startPage = Math.max(1, current_page - 2);
            const endPage = Math.min(last_page, current_page + 2);
            return { startPage, endPage };
        };

        const { startPage, endPage } = getStartAndEndPages();

        this.paginationWrapper.className =
            this.theme.paginationWrapper || "join gap-1";

        this.paginationWrapper.appendChild(
            this.createNavButton("«", current_page > 1, () => {
                const prevPage = this.currentPage;
                this.currentPage--;
                this.dispatchEvent(DataTableEvents.PAGE_CHANGE, {
                    fromPage: prevPage,
                    toPage: this.currentPage,
                });
                this.fetchData();
            })
        );

        if (startPage > 1) {
            this.paginationWrapper.appendChild(addPage(1));
            if (startPage > 2)
                this.paginationWrapper.appendChild(this.ellipsis());
        }

        for (let i = startPage; i <= endPage; i++) {
            this.paginationWrapper.appendChild(addPage(i));
        }

        if (endPage < last_page) {
            if (endPage < last_page - 1)
                this.paginationWrapper.appendChild(this.ellipsis());
            this.paginationWrapper.appendChild(addPage(last_page));
        }

        this.paginationWrapper.appendChild(
            this.createNavButton("»", current_page < last_page, () => {
                const prevPage = this.currentPage;
                this.currentPage++;
                this.dispatchEvent(DataTableEvents.PAGE_CHANGE, {
                    fromPage: prevPage,
                    toPage: this.currentPage,
                });
                this.fetchData();
            })
        );
    }
    /**
     * Creates a navigation button with consistent styling.
     * @param {string} text - Button text/content
     * @param {boolean} enabled - Whether the button should be clickable
     * @param {Function} onClick - Click handler function
     * @returns {HTMLElement} The created button element
     */
    createNavButton(text, enabled, onClick) {
        const btn = document.createElement("button");
        btn.className = `${this.theme.paginationButton || "btn btn-sm"} ${
            enabled
                ? ""
                : this.theme.paginationButtonDisabled ||
                  "opacity-50 cursor-not-allowed"
        }`;
        btn.textContent = text;
        if (!enabled) {
            btn.disabled = true;
        } else {
            btn.addEventListener("click", onClick);
        }
        return btn;
    }
    /**
     * Creates an ellipsis element for pagination UI.
     * Used to indicate skipped pages in detailed pagination.
     * @returns {HTMLElement} The created ellipsis span
     */
    ellipsis() {
        const span = document.createElement("span");
        span.textContent = "...";
        span.className = this.theme.paginationEllipsis || "px-2";
        return span;
    }

    // ==============================
    // EXPORT FUNCTIONALITY SECTION
    // ==============================
    // This section handles exporting table data to various formats such as Excel or CSV.
    // It initializes event listeners on export-related buttons, ensuring that data can be
    // downloaded either in the currently visible form or the complete dataset (all records).
    // The actual data export logic (e.g., formatting, converting, triggering download) is
    // handled in the corresponding methods (e.g., exportToExcel, downloadCSV).
    // Make sure that export fetches all data, not just the current page, for full exports.
    // ==============================
    getChunkSize(type) {
        // Return chunk size for type or fallback to a safe default
        if (this.chunkSize && this.chunkSize[type]) {
            return this.chunkSize[type];
        }
        return 100; // fallback chunk size if not set
    }

    // ==============================
    // EXPORT TO EXCEL
    // ==============================
    // Improved exportToExcel method with chunking and streaming for better memory efficiency
    async exportToExcel() {
        try {
            const { default: ExcelJS } = await import("exceljs");
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Sheet1");

            const visibleColumns = this.columns.filter(
                (col) => col.visible !== false
            );
            worksheet.addRow(
                visibleColumns.map((col) => col.label || col.name)
            );

            let page = 1;
            const chunkSize = this.getChunkSize("excel");

            // Define the maximum records to download
            const maxExcelRecords = 1000; // Adjust based on your needs

            let totalRowsExported = 0;

            let hasMoreData = true;
            const exportParams = new URLSearchParams({
                search: this.search,
                sortBy: this.sort,
                order: this.order,
                columnFilters: JSON.stringify(this.columnFilters),
                export: "true",
            });

            while (hasMoreData && totalRowsExported < maxExcelRecords) {
                // Adjust chunkSize dynamically if near maxExcelRecords limit
                const rowsLeft = maxExcelRecords - totalRowsExported;
                const currentChunkSize = Math.min(chunkSize, rowsLeft);

                exportParams.set("page", page);
                exportParams.set("perPage", currentChunkSize);

                const response = await fetch(
                    `${this.url}?${exportParams.toString()}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "X-Requested-For": "export-chunk",
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        `Export request failed with status: ${response.status}`
                    );
                }

                const json = await response.json();
                const dataChunk = this.dataSrc
                    ? json[this.dataSrc]
                    : json.data || [];

                // Add rows to worksheet
                dataChunk.forEach((row) => {
                    if (totalRowsExported >= maxExcelRecords) {
                        hasMoreData = false; // reached max rows
                        return;
                    }

                    const excelRow = [];
                    visibleColumns.forEach((column) => {
                        let cellValue = row[column.name] || "";
                        if (column.exportRender) {
                            cellValue = column.exportRender(cellValue, row);
                        } else if (column.render && column.useRenderForExport) {
                            const tempDiv = document.createElement("div");
                            tempDiv.innerHTML = column.render(cellValue, row);
                            cellValue =
                                tempDiv.textContent || tempDiv.innerText || "";
                        }
                        excelRow.push(cellValue);
                    });
                    worksheet.addRow(excelRow);
                    totalRowsExported++;
                });

                // Check if fewer rows returned than requested or max reached
                hasMoreData =
                    hasMoreData &&
                    dataChunk.length === currentChunkSize &&
                    totalRowsExported < maxExcelRecords;
                page++;
            }

            const fileName = `table-export-${new Date()
                .toISOString()
                .slice(0, 10)}.xlsx`;
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            console.log("Excel export completed successfully");
        } catch (error) {
            console.error("Error exporting data:", error);
            alert("Error exporting data. Please try again.");
            if (typeof this.exportToExcelFallback === "function") {
                this.exportToExcelFallback();
            }
        }
    }

    // ==============================
    // EXPORT TO downloadCSV
    // ==============================

    // Improved downloadCSV method to export all data, not just visible rows
    async downloadCSV() {
        try {
            this.toggleLoadingSpinner(true);

            // Use visible columns only
            const visibleColumns = this.columns.filter(
                (col) => col.visible !== false
            );

            // Create export parameters - similar to the exportToExcel method
            const exportParams = new URLSearchParams({
                search: this.search,
                sortBy: this.sort,
                order: this.order,
                columnFilters: JSON.stringify(this.columnFilters),
                export: "true",
            });

            // Create a CSV content builder with headers
            const headers = visibleColumns.map(
                (col) => `"${(col.label || col.name).replace(/"/g, '""')}"`
            );
            let csvContent = headers.join(",") + "\r\n";

            // Process data in chunks to avoid memory issues
            let page = 1;
            // let chunkSize = 1000; // Process 1000 records at a time
            const chunkSize = this.getChunkSize("csv");

            let hasMoreData = true;
            let totalProcessed = 0;

            while (hasMoreData) {
                // Update pagination parameters for this chunk
                exportParams.set("page", page);
                exportParams.set("perPage", chunkSize);

                try {
                    // Fetch chunk
                    const response = await fetch(
                        `${this.url}?${exportParams.toString()}`,
                        {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                "X-Requested-For": "export-csv",
                            },
                        }
                    );

                    if (!response.ok) {
                        throw new Error(
                            `CSV export request failed with status: ${response.status}`
                        );
                    }

                    const json = await response.json();
                    const dataChunk = json[this.dataSrc] || [];

                    // Check if this is the last chunk
                    hasMoreData = dataChunk.length === chunkSize;
                    totalProcessed += dataChunk.length;

                    // Process and add this chunk of data to CSV content
                    if (dataChunk.length > 0) {
                        dataChunk.forEach((row) => {
                            const csvRow = [];
                            visibleColumns.forEach((column) => {
                                // Handle cell value based on column configuration
                                let cellValue = row[column.name] || "";

                                // Apply custom render function if it exists and is meant for export
                                if (column.exportRender) {
                                    cellValue = column.exportRender(
                                        cellValue,
                                        row
                                    );
                                } else if (
                                    column.render &&
                                    column.useRenderForExport
                                ) {
                                    // Extract text content from HTML if render function is used
                                    const tempDiv =
                                        document.createElement("div");
                                    tempDiv.innerHTML = column.render(
                                        cellValue,
                                        row
                                    );
                                    cellValue =
                                        tempDiv.textContent ||
                                        tempDiv.innerText ||
                                        "";
                                }

                                // Escape quotes and format for CSV
                                csvRow.push(
                                    `"${String(cellValue).replace(/"/g, '""')}"`
                                );
                            });

                            csvContent += csvRow.join(",") + "\r\n";
                        });
                    }

                    // Move to next page
                    page++;

                    // Safety check - don't process too many records to avoid memory issues
                    if (totalProcessed > 100000) {
                        console.warn(
                            "Reached maximum safe export size (100,000 records)"
                        );
                        hasMoreData = false;
                    }
                } catch (error) {
                    console.error("Error fetching data chunk:", error);
                    hasMoreData = false; // Stop on error
                }
            }

            // Create and trigger download
            const blob = new Blob([csvContent], {
                type: "text/csv;charset=utf-8;",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `table-data-${new Date()
                .toISOString()
                .slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url); // Clean up the URL object

            console.log(`CSV export completed with ${totalProcessed} records`);
        } catch (error) {
            console.error("Error downloading CSV:", error);
            alert("Error downloading CSV. Please try again.");

            // Fallback to current page only if full export fails
            this.downloadCurrentPageCSV();
        } finally {
            this.toggleLoadingSpinner(false);
        }
    }

    // Fallback method that downloads only the current page data
    downloadCurrentPageCSV() {
        try {
            if (!this.table) return;

            let csv = "";
            const headers = this.table.querySelectorAll("thead th");
            let headerRow = [];

            headers.forEach((header) => {
                const headerText = header.innerText.trim();
                headerRow.push(`"${headerText.replace(/"/g, '""')}"`);
            });

            csv += headerRow.join(",") + "\r\n";

            const rows = this.table.querySelectorAll("tbody tr");
            rows.forEach((row) => {
                let rowData = [];
                row.querySelectorAll("td").forEach((td) => {
                    // Get only text content, strip HTML
                    const cellText = td.innerText.trim();
                    rowData.push(`"${cellText.replace(/"/g, '""')}"`);
                });
                csv += rowData.join(",") + "\r\n";
            });

            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `current-page-data-${new Date()
                .toISOString()
                .slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url); // Clean up the URL object

            alert(
                "Only current page data was exported due to an error with the full export."
            );
        } catch (error) {
            console.error("Error with fallback CSV download:", error);
            alert("Unable to download data. Please try again later.");
        }
    }

    // ==============================
    // EXPORT TO print
    // ==============================

    // Add print functionality to DataTable class
    printTable() {
        try {
            this.toggleLoadingSpinner(true);

            // Get current table data and structure
            const tableId = this.table.id;
            const title =
                document.querySelector(`#${tableId} caption`)?.textContent ||
                "Table Data";
            const visibleColumns = this.columns.filter(
                (col) => col.visible !== false
            );

            // Create a new window for printing
            const printWindow = window.open(
                "",
                "_blank",
                "height=600,width=800"
            );
            if (!printWindow) {
                alert("Please allow pop-ups to use the print feature.");
                return;
            }

            // Set up the print window content with styles
            printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Print: ${title}</title>
                <style>
                    @media print {
                        @page {
                            size: landscape;
                            margin: 0.5in;
                        }
                    }
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.4;
                        color: #333;
                        margin: 20px;
                    }
                    .print-header {
                        text-align: center;
                        margin-bottom: 20px;
                    }
                    .print-title {
                        font-size: 20px;
                        font-weight: bold;
                        margin: 0;
                    }
                    .print-subtitle {
                        font-size: 14px;
                        color: #666;
                        margin: 5px 0 20px;
                    }
                    .print-meta {
                        font-size: 12px;
                        color: #777;
                        text-align: right;
                    }
                    .print-filters {
                        font-size: 12px;
                        margin-bottom: 15px;
                        padding: 10px;
                        background-color: #f5f5f5;
                        border-radius: 4px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                        page-break-inside: auto;
                    }
                    tr {
                        page-break-inside: avoid;
                        page-break-after: auto;
                    }
                    thead {
                        display: table-header-group;
                    }
                    th, td {
                        padding: 8px;
                        text-align: left;
                        border-bottom: 1px solid #ddd;
                        font-size: 12px;
                    }
                    th {
                        background-color: #f0f0f0;
                        font-weight: bold;
                    }
                    tbody tr:nth-child(even) {
                        background-color: #f9f9f9;
                    }
                    tfoot {
                        display: table-footer-group;
                    }
                    .print-footer {
                        text-align: center;
                        font-size: 12px;
                        color: #777;
                        margin-top: 30px;
                        position: fixed;
                        bottom: 20px;
                        left: 0;
                        right: 0;
                    }
                    .loading {
                        text-align: center;
                        padding: 40px;
                        font-size: 18px;
                        color: #666;
                    }
                    .no-print {
                        display: none;
                    }
                    .action-buttons {
                        text-align: center;
                        margin: 20px 0;
                    }
                    .action-buttons button {
                        padding: 8px 15px;
                        margin: 0 5px;
                        background: #4a6cf7;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                    }
                    .action-buttons button:hover {
                        background: #3a56d4;
                    }
                    @media print {
                        .no-print, .action-buttons {
                            display: none !important;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="print-header">
                    <h1 class="print-title">${title}</h1>
                    <p class="print-subtitle">Data Export</p>
                    <p class="print-meta">Generated on: ${new Date().toLocaleString()}</p>
                </div>

                <div class="print-filters">
                    <strong>Filters:</strong>
                    ${
                        this.search
                            ? `Search: "${this.search}"`
                            : "No search applied"
                    } |
                    Sorted by: ${this.sort} (${this.order}) |
                    ${
                        Object.keys(this.columnFilters).length > 0
                            ? `Column filters: ${Object.entries(
                                  this.columnFilters
                              )
                                  .map(([col, val]) => `${col}: "${val}"`)
                                  .join(", ")}`
                            : "No column filters applied"
                    }
                </div>

                <div class="loading">Loading data for printing...</div>

                <table id="print-table">
                    <thead>
                        <tr>
                            ${visibleColumns
                                .map(
                                    (col) => `<th>${col.label || col.name}</th>`
                                )
                                .join("")}
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Data will be inserted here -->
                    </tbody>
                </table>

                <div class="print-footer">
                    Page <span class="page-num"></span>
                </div>

                <div class="action-buttons no-print">
                    <button onclick="window.print();">Print</button>
                    <button onclick="window.close();">Close</button>
                </div>

                <script>
                    // Page numbering for print
                    window.onbeforeprint = function() {
                        const pageNumSpans = document.querySelectorAll('.page-num');
                        pageNumSpans.forEach(span => span.className = 'page-num-placeholder');
                    };
                </script>
            </body>
            </html>
        `);

            // Now fetch the data to display
            this.fetchDataForPrint(printWindow);
        } catch (error) {
            console.error("Error preparing print view:", error);
            alert("Error preparing print view. Please try again.");
            this.toggleLoadingSpinner(false);
        }
    }

    // Method to fetch and render data for printing
    async fetchDataForPrint(printWindow) {
        try {
            const visibleColumns = this.columns.filter(
                (col) => col.visible !== false
            );
            const printTbody =
                printWindow.document.querySelector("#print-table tbody");
            const loadingDiv = printWindow.document.querySelector(".loading");

            // Define the maximum records to print
            const maxPrintRecords = 5000; // Adjust based on your needs

            // Process data in chunks to avoid memory issues
            let page = 1;
            // let chunkSize = 1000; // Process 1000 records at a time
            const chunkSize = this.getChunkSize("print");

            let hasMoreData = true;
            let totalProcessed = 0;
            let tableContent = "";

            const exportParams = new URLSearchParams({
                search: this.search,
                sortBy: this.sort,
                order: this.order,
                columnFilters: JSON.stringify(this.columnFilters),
                export: "true",
            });

            while (hasMoreData && totalProcessed < maxPrintRecords) {
                // Update pagination parameters for this chunk
                exportParams.set("page", page);
                exportParams.set("perPage", chunkSize);

                try {
                    // Fetch chunk
                    const response = await fetch(
                        `${this.url}?${exportParams.toString()}`,
                        {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                "X-Requested-For": "print",
                            },
                        }
                    );

                    if (!response.ok) {
                        throw new Error(
                            `Print data request failed with status: ${response.status}`
                        );
                    }

                    const json = await response.json();
                    const dataChunk = json[this.dataSrc] || [];

                    // Check if this is the last chunk
                    hasMoreData = dataChunk.length === chunkSize;
                    totalProcessed += dataChunk.length;

                    // Process and add this chunk of data to table content
                    if (dataChunk.length > 0) {
                        dataChunk.forEach((row) => {
                            tableContent += "<tr>";

                            visibleColumns.forEach((column) => {
                                // Handle cell value based on column configuration
                                let cellValue = row[column.name] || "";

                                // Apply custom render function if it exists and is meant for print
                                if (column.printRender) {
                                    cellValue = column.printRender(
                                        cellValue,
                                        row
                                    );
                                } else if (
                                    column.render &&
                                    column.useRenderForPrint
                                ) {
                                    // Use the render function
                                    cellValue = column.render(cellValue, row);
                                }

                                // Add the cell to the row
                                tableContent += `<td>${cellValue}</td>`;
                            });

                            tableContent += "</tr>";
                        });
                    }

                    // Move to next page
                    page++;
                } catch (error) {
                    console.error(
                        "Error fetching data chunk for print:",
                        error
                    );
                    hasMoreData = false; // Stop on error

                    // Show error in print window
                    printWindow.document.querySelector(
                        ".loading"
                    ).innerHTML = `<div style="color:red;">Error loading data: ${error.message}</div>`;
                }
            }

            // Add warning if truncated
            if (totalProcessed >= maxPrintRecords && hasMoreData) {
                printWindow.document.querySelector(
                    ".print-subtitle"
                ).innerHTML += ` <span style="color:red;">(Limited to ${maxPrintRecords} records)</span>`;
            }

            // Update the print window with the data
            if (printTbody) {
                loadingDiv.style.display = "none";
                printTbody.innerHTML = tableContent;

                // Add record count to subtitle
                const subtitle =
                    printWindow.document.querySelector(".print-subtitle");
                subtitle.innerHTML += ` (${totalProcessed} records)`;

                // Add date range if available
                if (this.dateRangeFilter) {
                    const filters =
                        printWindow.document.querySelector(".print-filters");
                    filters.innerHTML += `<br>Date Range: ${this.dateRangeFilter}`;
                }
                // Automatically print after data is ready
                printWindow.print();
            }
        } catch (error) {
            console.error("Error preparing print data:", error);
            printWindow.document.querySelector(
                ".loading"
            ).innerHTML = `<div style="color:red;">Error preparing print data: ${error.message}</div>`;
        } finally {
            this.toggleLoadingSpinner(false);
        }
    }

    // ==============================
    // PDF Download
    // ==============================
    // The downloadPdf method using jsPDF and autoTable
    // ==============================
    // PDF Download
    // ==============================
    downloadPdf() {
        try {
            this.toggleLoadingSpinner(true);

            // Get current table data and structure
            const tableId = this.table.id;
            const title =
                document.querySelector(`#${tableId} caption`)?.textContent ||
                "Table Data";

            // Filter visible columns
            const visibleColumns = this.columns.filter(
                (col) => col.visible !== false
            );

            // Prepare PDF download parameters
            const exportParams = new URLSearchParams({
                search: this.search,
                sortBy: this.sort,
                order: this.order,
                columnFilters: JSON.stringify(this.columnFilters),
                export: "true",
            });

            // Fetch data for PDF
            this.fetchDataForPdf(title, visibleColumns, exportParams);
        } catch (error) {
            console.error("Error preparing PDF download:", error);
            alert("Error preparing PDF download. Please try again.");
            this.toggleLoadingSpinner(false);
        }
    }

    // Method to fetch and render data for PDF
    async fetchDataForPdf(title, visibleColumns, exportParams) {
        try {
            // Define the maximum records to download
            const maxPdfRecords = 1000; // Adjust based on your needs

            // Process data in chunks to avoid memory issues
            let page = 1;
            // let chunkSize = 1000; // Process 1000 records at a time
            const chunkSize = this.getChunkSize("pdf");

            let hasMoreData = true;
            let totalProcessed = 0;
            let allData = [];

            while (hasMoreData && totalProcessed < maxPdfRecords) {
                // Update pagination parameters for this chunk
                exportParams.set("page", page);
                exportParams.set("perPage", chunkSize);

                try {
                    // Fetch chunk
                    const response = await fetch(
                        `${this.url}?${exportParams.toString()}`,
                        {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                "X-Requested-For": "pdf-export",
                            },
                        }
                    );

                    if (!response.ok) {
                        throw new Error(
                            `PDF export data request failed with status: ${response.status}`
                        );
                    }

                    const json = await response.json();
                    const dataChunk = json[this.dataSrc] || [];

                    // Check if this is the last chunk
                    hasMoreData = dataChunk.length === chunkSize;
                    totalProcessed += dataChunk.length;

                    // Prepare data for PDF
                    const processedChunk = dataChunk.map((row) => {
                        const pdfRow = {};
                        visibleColumns.forEach((column) => {
                            let cellValue = row[column.name] || "";

                            // Apply custom render function if it exists and is meant for PDF
                            if (column.pdfRender) {
                                cellValue = column.pdfRender(cellValue, row);
                            } else if (
                                column.render &&
                                column.useRenderForPdf
                            ) {
                                // Use the render function
                                cellValue = column.render(cellValue, row);
                            }

                            pdfRow[column.label || column.name] = cellValue;
                        });
                        return pdfRow;
                    });

                    allData.push(...processedChunk);

                    // Move to next page
                    page++;
                } catch (error) {
                    console.error("Error fetching data chunk for PDF:", error);
                    hasMoreData = false; // Stop on error
                    throw error; // Rethrow to be caught by outer catch
                }
            }

            // Generate PDF
            this.generatePdf(
                title,
                visibleColumns,
                allData,
                totalProcessed,
                maxPdfRecords
            );
        } catch (error) {
            console.error("Error preparing PDF data:", error);
            alert("Error preparing PDF download. Please try again.");
            this.toggleLoadingSpinner(false);
        }
    }

    // Method to generate PDF using jsPDF and autoTable
    generatePdf(title, visibleColumns, data, totalProcessed, maxPdfRecords) {
        try {
            // Create a new PDF document
            const doc = new jsPDF({
                orientation: "landscape",
                unit: "mm",
                format: "a4",
            });

            // Set document properties
            doc.setProperties({
                title: title,
                subject: "Data Export",
                creator: "DataTable Export",
            });

            // Prepare table headers
            const headers = visibleColumns.map((col) => col.label || col.name);

            // Prepare table rows
            const rows = data.map((row) =>
                headers.map((header) => row[header] || "")
            );

            // Add title and metadata
            const pageWidth = doc.internal.pageSize.width;
            const pageHeight = doc.internal.pageSize.height;

            doc.setFontSize(16);
            doc.text(title, pageWidth / 2, 15, { align: "center" });

            doc.setFontSize(10);
            doc.text(
                `Generated on: ${new Date().toLocaleString()}`,
                pageWidth - 15,
                25,
                { align: "right" }
            );

            // Add filter information
            const filterInfo = [
                `Search: ${this.search || "None"}`,
                `Sorted by: ${this.sort} (${this.order})`,
                `Column Filters: ${
                    Object.entries(this.columnFilters).length > 0
                        ? Object.entries(this.columnFilters)
                              .map(([col, val]) => `${col}: "${val}"`)
                              .join(", ")
                        : "None"
                }`,
            ];

            doc.setFontSize(9);
            doc.text(filterInfo.join(" | "), 15, 35);

            // Add date range if available
            if (this.dateRangeFilter) {
                doc.text(`Date Range: ${this.dateRangeFilter}`, 15, 42);
            }

            // Generate the table
            autoTable(doc, {
                startY: this.dateRangeFilter ? 50 : 42,
                head: [headers],
                body: rows,
                theme: "striped",
                headStyles: {
                    fillColor: [68, 108, 247], // Blue header similar to print styling
                    textColor: [255, 255, 255],
                },
                styles: {
                    fontSize: 8,
                    cellPadding: 2,
                },
                columnStyles: {
                    // Optionally adjust column widths or styles
                },
            });

            // Add page numbers and total records
            const totalPages = doc.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.text(
                    `Page ${i} of ${totalPages} (${totalProcessed} records${
                        totalProcessed >= maxPdfRecords ? " - Truncated" : ""
                    })`,
                    pageWidth / 2,
                    pageHeight - 10,
                    { align: "center" }
                );
            }

            // Save the PDF
            doc.save(`${title.replace(/\s+/g, "_")}_export.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert(
                "Error generating PDF. Please ensure jsPDF libraries are loaded."
            );
        } finally {
            this.toggleLoadingSpinner(false);
        }
    }

    // ==============================
    // END EXPORT FUNCTIONALITY SECTION
    // ==============================
}
