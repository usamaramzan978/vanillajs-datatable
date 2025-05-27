import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Selectable } from "./selectable";
import { DataTableEvents } from "./datatable-events";
import { KeyboardNavigation } from "./keyboard-navigation";
import { DEFAULT_THEME } from "./datatable-theme";

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

    // Features
    paginationType = "detailed",
    enableSort = true,
    sortableColumns = [],
    searchDelay = 300, // new

    loadingSpinnerId = null, // Default loading spinner ID
    loadingSpinner = true, // Whether to show the loading spinner by default

    // Button IDs and visibility flags
    resetBtnId = null,
    reloadBtnId = null,
    exportBtnId = null,
    downloadCsvBtnId = null,
    printBtnId = null,
    pdfBtnId = null,

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
    this.currentPage = 1;
    this.dataSrc = dataSrc || "data"; // Default to 'data' if not provided
    this.enableSaveState = saveState;
    this.updatePagination = this.updatePagination.bind(this);

    this.prevBtn = prevBtnId ? document.getElementById(prevBtnId) : null;
    this.nextBtn = nextBtnId ? document.getElementById(nextBtnId) : null;
    this.pageInfo = pageInfoId ? document.getElementById(pageInfoId) : null;
    this.infoText = infoTextId ? document.getElementById(infoTextId) : null;
    this.paginationWrapper = paginationWrapperId
      ? document.getElementById(paginationWrapperId)
      : null;

    this.paginationType = paginationType;
    this.enableSort = enableSort;
    this.paginationBtn = paginationBtn;
    this.sortableColumns = sortableColumns;
    this.searchDelay = searchDelay;
    this.columnFilters = {};
    this.columns = columns;
    this.searchDebounceTimer = null;
    this.enableLoadingSpinner = loadingSpinner;
    this.LoadingSpinnerContainer =
      loadingSpinnerId || `${tableId}-loading-spinner`;

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
    // Proxy the public methods ,Expose Selectable methods
    this.getSelectedIds = () => this.selectable.getSelectedIds();
    this.clearSelection = () => this.selectable.clearSelection();
    this.selectAll = () => this.selectable.selectAll();
    this.toggleRowSelection = (id, force) =>
      this.selectable.toggleRowSelection(id, force);
    this.isSelected = (id) => this.selectable.isSelected(id);
    this.onSelectionChange = (callback) =>
      this.selectable.onSelectionChange(callback);

    // this.onRowClick = (callback) => this.selectable.onRowClick(callback);

    // this.onRowDoubleClick = (callback) =>
    //     this.selectable.onRowDoubleClick(callback);

    // Then initialize keyboard navigation if enabled
    if (keyboardNav !== false) {
      // Changed from enableKeyboardNav
      this.keyboardNav = new KeyboardNavigation(this.table, {
        selectable: this.selectable,
        getData: () => this.data,
        enabled: keyboardNav, // Changed from options.keyboardNav
      });
    }

    this.columnGroups = columnGroups || [];
    this.stickyHeader = stickyHeader;

    this.chunkSize = chunkSize;

    this.init();
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

    if (this.columnFilterFields && Array.isArray(this.columnFilterFields)) {
      this.renderDefaultColumnSearchInputs();
    } else if (this.enableCustomColumnFilter) {
      this.bindColumnSearchInputs(); // Just bind if inputs already exist
    }
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
    if (!this.table || !this.table.id) return; // Safety check

    const saved = localStorage.getItem(`datatable_${this.table.id}_state`);
    if (saved) {
      const state = JSON.parse(saved);
      Object.assign(this, {
        sort: state.sort,
        order: state.order,
        currentPage: state.page,
        rowsPerPage: state.perPage,
        columnFilters: state.filters,
        search: state.search,
      });

      // Use the event name constant for consistency
      this.dispatchEvent(DataTableEvents.STATE_RESTORED, { state });
    }
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
        id: this.prevBtnId || `${this.tableId}-prev-button`,
        text: "Previous",
      },
      next: {
        id: this.nextBtnId || `${this.tableId}-next-button`,
        text: "Next",
      },
      pageInfo: {
        id: this.pageInfoId || `${this.tableId}-page-info`,
        text: "Page Info",
      },
      infoText: {
        id: this.infoTextId || `${this.tableId}-info-text`,
        text: "Showing X to Y of Z entries",
      },
      wrapper: {
        id: this.paginationWrapperId || `${this.tableId}-pagination`,
      },
      container: {
        id:
          this.paginationContainerId || `${this.tableId}-pagination-container`,
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
    if (this.enableLoadingSpinner) {
      let spinner = document.getElementById(this.LoadingSpinnerContainer);

      // If spinner does not exist, create default one
      if (!spinner) {
        spinner = document.createElement("span");
        spinner.id = this.LoadingSpinnerContainer;
        spinner.className = "loading loading-dots loading-xl hidden";
        this.table.parentNode.insertBefore(spinner, this.table); // You can change position
      }

      // Show or hide
      spinner.classList.toggle("hidden", !isLoading);
    }
  }

  // ==============================
  // RESET FUNCTIONALITY SECTION
  // ==============================
  //
  // Individual button binding methods that call your existing implementation

  bindResetButton() {
    const button = document.getElementById(this.buttonConfig.reset.id);
    if (button) {
      button.addEventListener("click", () => this.resetTable());
    }
  }

  // Reset the table
  resetTable() {
    this.search = "";
    this.currentPage = 1;
    // this.sort = this.defaultSort;
    // this.order = this.defaultOrder;
    this.sort = "id";
    this.order = "asc";
    this.columnFilters = {};

    // Reset the search input
    if (this.searchInput) {
      this.searchInput.value = "";
    }
    this.clearState();
    // console.log("Clearing state");
    // Reset column filters if they exist
    const filterInputs = document.querySelectorAll("[data-column-filter]");
    filterInputs.forEach((input) => {
      input.value = "";
    });

    this.dispatchEvent(DataTableEvents.RESET);

    this.fetchData();
  }

  // ==============================
  // RELOAD FUNCTIONALITY SECTION
  // ==============================
  //

  bindReloadButton() {
    const reloadButton = document.getElementById(this.buttonConfig.reload.id);
    if (!reloadButton) return;

    reloadButton.addEventListener("click", () => {
      this.dispatchEvent(DataTableEvents.RELOAD);
      this.fetchData();
    });
  }

  // ==============================
  // EXPORT FUNCTIONALITY SECTION
  // ==============================

  bindExportButton() {
    const button = document.getElementById(this.buttonConfig.export.id);
    if (button) {
      button.addEventListener("click", () => this.exportToExcel());
    }
  }

  // ==============================
  // CSV FUNCTIONALITY SECTION
  // ==============================
  bindDownloadCsvButton() {
    const button = document.getElementById(this.buttonConfig.downloadCsv.id);
    if (button) {
      button.addEventListener("click", () => this.downloadCSV());
    }
  }

  // ==============================
  // PRINT FUNCTIONALITY SECTION
  // ==============================
  bindPrintButton() {
    const button = document.getElementById(this.buttonConfig.print.id);

    if (button) {
      button.addEventListener("click", () => this.printTable());
    }
  }
  // ==============================
  // PDF FUNCTIONALITY SECTION
  // ==============================
  bindPdfButton() {
    const button = document.getElementById(this.buttonConfig.pdf.id);
    if (button) {
      button.addEventListener("click", () => this.downloadPdf());
    }
  }
  initSearch() {
    const searchInput = document.getElementById(this.buttonConfig.search.id);

    if (searchInput) {
      // If search input exists in the default controls, bind the search behavior to it
      this.searchInput = searchInput;
      this.bindSearch();
    }
  }

  bindSearch() {
    if (!this.searchInput) return;

    // Wrap the event handler with debounce
    const debouncedHandler = this.debounce((e) => {
      this.search = e.target.value;
      this.currentPage = 1;

      this.dispatchEvent(DataTableEvents.SEARCH, {
        searchTerm: this.search,
        currentPage: this.currentPage,
        searchDelay: this.searchDelay,
      });

      if (this.enableSaveState) {
        this.saveState();
      }
      this.fetchData();
    }, this.searchDelay);

    this.searchInput.addEventListener("input", debouncedHandler);
  }

  renderDefaultColumnSearchInputs() {
    const thead = this.table.querySelector("thead");
    if (!thead) return;

    // Remove existing filter row if any
    const existingRow = thead.querySelector(".column-filters");
    if (existingRow) existingRow.remove();

    const filterRow = document.createElement("tr");
    filterRow.className = "column-filters";

    // If columns are objects, extract just the name/key for matching
    const columnNames = this.columns.map((column) => column.name); // Extract column names

    // console.log("Column Names:", columnNames);
    // console.log("Column Filter Fields:", this.columnFilterFields);

    // Iterate through columns and append input fields if they exist in columnFilterFields
    columnNames.forEach((columnKey) => {
      const td = document.createElement("th");

      // If the column is in columnFilterFields, add a search input field
      if (this.columnFilterFields.includes(columnKey)) {
        const input = document.createElement("input");
        input.className = "input input-sm input-bordered w-full column-search";
        input.placeholder = `Search ${columnKey}`;
        input.setAttribute("data-column", columnKey);
        td.appendChild(input);
      } else {
        // If the column isn't in columnFilterFields, we add an empty <th>
        td.innerHTML = ""; // This is just to be explicit
      }

      filterRow.appendChild(td);
    });

    // Insert the filter row into the thead
    thead.appendChild(filterRow);
    // Bind the input event listeners to the search inputs
    this.bindColumnSearchInputs();
  }

  bindColumnSearchInputs() {
    const inputs = document.querySelectorAll(".column-search");

    inputs.forEach((input) => {
      const column = input.dataset.column;
      input.addEventListener("input", () => {
        clearTimeout(this.columnSearchTimer);
        this.columnSearchTimer = setTimeout(() => {
          this.columnFilters[column] = input.value;
          this.currentPage = 1; // Reset to first page

          if (this.enableSaveState) {
            this.saveState();
          }
          this.fetchData(); // Fetch filtered data
        }, this.searchDelay);
      });
    });
  }

  bindSort() {
    const headers = this.table.querySelectorAll("th[data-column]");
    headers.forEach((th) => {
      const column = th.dataset.column;
      if (!this.sortableColumns.includes(column)) return;

      const iconSpan = document.createElement("span");
      iconSpan.className = "sort-icon ml-2";
      iconSpan.innerHTML = '<i class="fa fa-sort text-gray-400"></i>';
      th.appendChild(iconSpan);

      th.addEventListener("click", () => {
        this.order = th.dataset.order === "asc" ? "desc" : "asc";
        this.sort = column;

        th.dataset.order = this.order;

        headers.forEach((h) => {
          const i = h.querySelector(".sort-icon i");
          if (i) i.className = "fa fa-sort text-gray-400";
        });

        const icon = th.querySelector(".sort-icon i");
        if (icon)
          icon.className =
            this.order === "asc"
              ? "fa fa-sort-up text-gray-600"
              : "fa fa-sort-down text-gray-600";

        this.fetchData();
      });
    });
  }

  bindPaginationButtons() {
    if (this.prevBtn)
      this.prevBtn.addEventListener("click", () => {
        if (this.currentPage > 1) {
          this.currentPage--;

          this.dispatchEvent(DataTableEvents.PAGE_CHANGE, {
            fromPage: this.currentPage + 1,
            toPage: this.currentPage,
          });

          this.fetchData();
        }
      });

    if (this.nextBtn)
      this.nextBtn.addEventListener("click", () => {
        this.currentPage++;

        this.dispatchEvent(DataTableEvents.PAGE_CHANGE, {
          fromPage: this.currentPage - 1,
          toPage: this.currentPage,
        });

        this.fetchData();
      });
  }

  updatePagination({ current_page, last_page, total }) {
    if (this.pageInfo)
      this.pageInfo.textContent = `Page ${current_page} of ${last_page}`;
    if (this.prevBtn) this.prevBtn.disabled = current_page === 1;
    if (this.nextBtn) this.nextBtn.disabled = current_page === last_page;

    if (!this.paginationWrapper) return;
    this.paginationWrapper.innerHTML = "";

    if (this.paginationType === "simple") {
      this.updateSimplePagination(current_page, last_page);
    } else {
      this.updateDetailedPagination(current_page, last_page);
    }

    if (this.infoText) {
      this.infoText.textContent = `Showing ${
        (current_page - 1) * this.rowsPerPage + 1
      } to ${Math.min(
        current_page * this.rowsPerPage,
        total
      )} of ${total} entries`;
    }
    if (this.enableSaveState) {
      this.saveState();
    }
  }

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

    const nextBtn = this.createNavButton("»", current_page < last_page, () => {
      const prevPage = this.currentPage;
      this.currentPage = current_page + 1;
      this.dispatchEvent(DataTableEvents.PAGE_CHANGE, {
        fromPage: prevPage,
        toPage: this.currentPage,
      });
      this.fetchData();
    });
    this.paginationWrapper.className =
      this.theme.paginationWrapper || "join gap-1";

    this.paginationWrapper.appendChild(prevBtn);
    this.paginationWrapper.appendChild(nextBtn);
  }

  updateDetailedPagination(current_page, last_page) {
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

    const startPage = Math.max(1, current_page - 2);
    const endPage = Math.min(last_page, current_page + 2);

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
      if (startPage > 2) this.paginationWrapper.appendChild(this.ellipsis());
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

  createNavButton(text, enabled, onClick) {
    const btn = document.createElement("button");
    btn.className = `${this.theme.paginationButton || "btn btn-sm"} ${
      enabled
        ? ""
        : this.theme.paginationButtonDisabled || "opacity-50 cursor-not-allowed"
    }`;
    btn.textContent = text;
    if (!enabled) {
      btn.disabled = true;
    } else {
      btn.addEventListener("click", onClick);
    }
    return btn;
  }

  ellipsis() {
    const span = document.createElement("span");
    span.textContent = "...";
    span.className = this.theme.paginationEllipsis || "px-2";
    return span;
  }

  bindPerPageSelect() {
    const config = this.buttonConfig.perPageSelect;
    if (!config || !config.enabled) return;

    const perPageSelect = document.getElementById(config.id);
    if (!perPageSelect) {
      console.warn(`Per page select element with id '${config.id}' not found.`);
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

  async fetchData() {
    // Show loading spinner before fetching data
    if (this.enableLoadingSpinner) {
      this.toggleLoadingSpinner(true);
    }
    const params = new URLSearchParams({
      search: this.search,
      sortBy: this.sort,
      order: this.order,
      page: this.currentPage,
      perPage: this.rowsPerPage,
      columnFilters: JSON.stringify(this.columnFilters), // Convert filters to a query string
    });
    // Dispatch loading event with full query string
    this.dispatchEvent(DataTableEvents.LOADING, {
      queryParams: params.toString(),
    });
    try {
      const res = await fetch(`${this.url}?${params.toString()}`, {
        method: "GET", // Use GET to send the query parameters
        headers: {
          "Content-Type": "application/json", // No need for body in GET request
        },
      });

      const json = await res.json();
      this.data = json[this.dataSrc] || []; // Access data based on dataSrc passed in constructor

      // Dispatch the loaded event
      this.dispatchEvent(DataTableEvents.LOADED, {
        data: this.data,
        page: this.currentPage,
        totalItems: json.total || this.data.length,
        response: json,
      });

      if (this.data.length === 0) {
        this.showEmptyStateInTable("No records found.");
      } else {
        this.renderTable(this.data); // Render table with new data
      }

      if (this.paginationBtn) {
        this.updatePagination(json); // Update pagination if enabled
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      this.dispatchEvent(DataTableEvents.ERROR, {
        error: error,
        requestParams: params.toString(),
      });
    } finally {
      if (this.enableLoadingSpinner) {
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

  // renderTableHeader() {
  //     // Remove existing thead
  //     const oldThead = this.table.querySelector("thead");
  //     if (oldThead) oldThead.remove();

  //     const thead = this.table.createTHead();
  //     thead.className = this.theme.header || ""; // Proper use for the whole thead

  //     // Optional: render column filters first if enabled
  //     if (this.columnFilterFields && Array.isArray(this.columnFilterFields)) {
  //         const filterRow = thead.insertRow();
  //         // Ensure that filters is initialized in the constructor or before use
  //         this.columnFilters = this.columnFilters || {}; // Initializes filters as an empty object if not already initialized

  //         this.columns.forEach((column) => {
  //             if (column.visible === false) return;

  //             const th = document.createElement("th");

  //             th.className = this.theme.headerCell || "";

  //             if (this.columnFilterFields.includes(column.name)) {
  //                 const input = document.createElement("input");
  //                 input.type = "search";
  //                 input.placeholder = `Filter ${column.label}`;
  //                 input.className = "input input-sm input-bordered w-full";

  //                 input.addEventListener(
  //                     "input",
  //                     this.debounce((e) => {
  //                         this.columnFilters[column.name] = e.target.value;

  //                         this.dispatchEvent(DataTableEvents.FILTER, {
  //                             column: column,
  //                             value: e.target.value,
  //                             filters: this.columnFilters,
  //                             timestamp: new Date().toISOString(),
  //                             tableId: this.table.id || null,
  //                             searchDelay: this.searchDelay,
  //                         });

  //                         this.fetchData();
  //                     }, this.searchDelay)
  //                 );

  //                 th.appendChild(input);
  //             }

  //             filterRow.appendChild(th);
  //         });
  //     }

  //     // Render header row
  //     const headerRow = thead.insertRow();
  //     this.columns.forEach((column) => {
  //         if (column.visible === false) return;

  //         const th = document.createElement("th");
  //         th.classList.add("cursor-pointer");

  //         const spanLabel = document.createElement("span");
  //         spanLabel.textContent = column.label;
  //         th.appendChild(spanLabel);

  //         if (this.sortableColumns.includes(column.name)) {
  //             th.dataset.column = column.name;
  //             th.dataset.order = this.defaultOrder || "asc";

  //             const iconSpan = document.createElement("span");
  //             iconSpan.className = "sort-icon ml-2";
  //             iconSpan.innerHTML = '<i class="fa fa-sort text-gray-400"></i>';
  //             th.appendChild(iconSpan);

  //             th.addEventListener("click", () => {
  //                 const newOrder =
  //                     th.dataset.order === "asc" ? "desc" : "asc";
  //                 th.dataset.order = newOrder;
  //                 this.sort = column.name;
  //                 this.order = newOrder;

  //                 // Reset icons
  //                 thead.querySelectorAll(".sort-icon i").forEach((i) => {
  //                     i.className = "fa fa-sort text-gray-400";
  //                 });

  //                 // Update icon
  //                 const icon = th.querySelector(".sort-icon i");
  //                 icon.className =
  //                     newOrder === "asc"
  //                         ? "fa fa-sort-up text-gray-600"
  //                         : "fa fa-sort-down text-gray-600";

  //                 this.dispatchEvent(DataTableEvents.SORT, {
  //                     column: column.name,
  //                     label: column.label,
  //                     index: this.columns.indexOf(column),
  //                     direction: newOrder,
  //                     timestamp: new Date().toISOString(),
  //                     tableId: this.table.id || null,
  //                 });
  //                 if (this.enableSaveState) {
  //                     this.saveState();
  //                 }
  //                 this.fetchData();
  //             });
  //         }

  //         headerRow.appendChild(th);
  //     });

  //     // Ensure tbody exists
  //     if (!this.table.querySelector("tbody")) {
  //         const tbody = document.createElement("tbody");
  //         tbody.id = "table-body";
  //         this.table.appendChild(tbody);
  //     }
  // }

  renderTableHeader() {
    const oldThead = this.table.querySelector("thead");
    if (oldThead) oldThead.remove();

    const thead = this.table.createTHead();
    thead.className = this.theme.header || "";

    // Optional: make headers sticky
    if (this.stickyHeader) {
      thead.classList.add(...(this.theme.headerSticky?.split(" ") || []));
    }

    const visibleColumns = this.columns.filter((c) => c.visible !== false);
    const hasGroups = this.columnGroups?.length > 0;

    // 1. Render Group Headers if applicable
    if (hasGroups) {
      this.renderGroupHeaders(thead, visibleColumns);
    }

    // 2. Render Filter Inputs if applicable
    if (this.columnFilterFields?.length > 0) {
      this.renderFilterInputs(thead, visibleColumns);
    }

    // 3. Always render Column Headers
    this.renderColumnHeaders(thead, visibleColumns, hasGroups);

    // Ensure tbody exists
    if (!this.table.querySelector("tbody")) {
      this.table.appendChild(document.createElement("tbody"));
    }
  }

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

        input.addEventListener(
          "input",
          this.debounce((e) => {
            this.columnFilters[column.name] = e.target.value;
            this.dispatchEvent(DataTableEvents.FILTER, {
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
          const newOrder = th.dataset.order === "asc" ? "desc" : "asc";
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

  debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

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

  createTBody() {
    const tbody = document.createElement("tbody");
    tbody.id = "table-body";
    tbody.className = this.theme.body || ""; // Use tbody theme if provided
    this.table.appendChild(tbody);
    return tbody;
  }
  renderCell(td, row, column, rowIndex) {
    const value = row[column.name];
    td.dataset.column = column.name;
    td.dataset.type = column.type;

    td.className = this.theme.cell;

    // Apply column-specific classes
    if (column.align) td.classList.add(`text-${column.align}`);
    if (column.class) td.classList.add(...column.class.split(" "));
    if (column.width) td.style.width = column.width;

    // Custom renderer
    // Ensure rendered is always a string
    let rendered = "";

    if (column.render && typeof column.render === "function") {
      rendered = column.render(value, row);
    } else if (value !== undefined && value !== null) {
      rendered = String(value);
    }

    if (column.highlightable && this.search && typeof rendered === "string") {
      const highlightConfig =
        typeof column.highlightable === "object" ? column.highlightable : {};

      const color =
        highlightConfig.color || this.theme.highlight || "bg-yellow-200";

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
    return 1000; // fallback chunk size if not set
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
      worksheet.addRow(visibleColumns.map((col) => col.label || col.name));

      let page = 1;
      const chunkSize = this.getChunkSize("excel");

      // Define the maximum records to download
      const maxExcelRecords = 5000; // Adjust based on your needs

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

        const response = await fetch(`${this.url}?${exportParams.toString()}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-For": "export-chunk",
          },
        });

        if (!response.ok) {
          throw new Error(
            `Export request failed with status: ${response.status}`
          );
        }

        const json = await response.json();
        const dataChunk = this.dataSrc ? json[this.dataSrc] : json.data || [];

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
              cellValue = tempDiv.textContent || tempDiv.innerText || "";
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
                  cellValue = column.exportRender(cellValue, row);
                } else if (column.render && column.useRenderForExport) {
                  // Extract text content from HTML if render function is used
                  const tempDiv = document.createElement("div");
                  tempDiv.innerHTML = column.render(cellValue, row);
                  cellValue = tempDiv.textContent || tempDiv.innerText || "";
                }

                // Escape quotes and format for CSV
                csvRow.push(`"${String(cellValue).replace(/"/g, '""')}"`);
              });

              csvContent += csvRow.join(",") + "\r\n";
            });
          }

          // Move to next page
          page++;

          // Safety check - don't process too many records to avoid memory issues
          if (totalProcessed > 100000) {
            console.warn("Reached maximum safe export size (100,000 records)");
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
      a.download = `table-data-${new Date().toISOString().slice(0, 10)}.csv`;
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
      const printWindow = window.open("", "_blank", "height=600,width=800");
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
                        ? `Column filters: ${Object.entries(this.columnFilters)
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
                              .map((col) => `<th>${col.label || col.name}</th>`)
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
                  cellValue = column.printRender(cellValue, row);
                } else if (column.render && column.useRenderForPrint) {
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
          console.error("Error fetching data chunk for print:", error);
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
        const subtitle = printWindow.document.querySelector(".print-subtitle");
        subtitle.innerHTML += ` (${totalProcessed} records)`;

        // Add date range if available
        if (this.dateRangeFilter) {
          const filters = printWindow.document.querySelector(".print-filters");
          filters.innerHTML += `<br>Date Range: ${this.dateRangeFilter}`;
        }
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
      const maxPdfRecords = 5000; // Adjust based on your needs

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
              } else if (column.render && column.useRenderForPdf) {
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
      alert("Error generating PDF. Please ensure jsPDF libraries are loaded.");
    } finally {
      this.toggleLoadingSpinner(false);
    }
  }

  // ==============================
  // END EXPORT FUNCTIONALITY SECTION
  // ==============================
}
