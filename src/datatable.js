import { Selectable } from "./selectable";
import { KeyboardNavigation } from "./keyboard-navigation";
import { DEFAULT_THEME } from "./datatable-theme";
import { downloadPdf as exportPdf } from "./exports/pdfExportMethods.js";
import { printTable as exportPrint } from "./exports/printExportMethods.js";
import {
    downloadCSV as exportCsv,
    downloadCurrentPageCSV as exportCurrentPageCsv,
} from "./exports/csvExportMethods.js";
import { exportToExcel as exportExcel } from "./exports/excelExportMethods.js";
import {
    getData as apiGetData,
    getRowData as apiGetRowData,
    getRowIndex as apiGetRowIndex,
    getRowsBy as apiGetRowsBy,
    findRowsByFieldContains as apiFindRowsByFieldContains,
    addRow as apiAddRow,
    addRows as apiAddRows,
    updateRow as apiUpdateRow,
    updateRows as apiUpdateRows,
    deleteRow as apiDeleteRow,
    deleteRows as apiDeleteRows,
    redraw as apiRedraw,
    draw as apiDraw,
} from "./api/dataMethods.js";

import {
    exportJSON as exportJson,
    downloadSelectedJSON,
    exportCurrentPageJSON,
} from "./exports/jsonExportMethods.js";
import {
    setSort as apiSetSort,
    clearSort as apiClearSort,
} from "./api/sortingMethods.js";
import { copyToClipboard as apiCopyToClipboard } from "./api/utilityMethods.js";
import {
    showExportProgress as internalShowExportProgress,
    updateExportProgress as internalUpdateExportProgress,
    hideExportProgress as internalHideExportProgress,
    hideProgressModal as internalHideProgressModal,
    showProgressModal as internalShowProgressModal,
    cancelExport as internalCancelExport,
} from "./methods/exportProgressMethods.js";
import {
    initInfiniteScroll as internalInitInfiniteScroll,
    appendRows as internalAppendRows,
    hasMorePages as internalHasMorePages,
    resetScrollPosition as internalResetScrollPosition,
    destroyInfiniteScroll as internalDestroyInfiniteScroll,
} from "./methods/infiniteScrollMethods.js";
import {
    initPagination as internalInitPagination,
    bindPaginationButtons as internalBindPaginationButtons,
    updatePagination as internalUpdatePagination,
} from "./methods/paginationMethods.js";
import {
    toggleLoadingSpinner as internalToggleLoadingSpinner,
    destroyLoadingSpinner as internalDestroyLoadingSpinner,
} from "./methods/loadingSpinnerMethods.js";
import {
    goToPage as apiGoToPage,
    setPageSize as apiSetPageSize,
    getCurrentPage as apiGetCurrentPage,
    nextPage as apiNextPage,
    prevPage as apiPrevPage,
    firstPage as apiFirstPage,
    lastPage as apiLastPage,
} from "./api/paginationMethods.js";
import {
    setFilter as apiSetFilter,
    removeFilter as apiRemoveFilter,
    clearFilters as apiClearFilters,
} from "./api/filterMethods.js";
import {
    saveState as apiSaveState,
    loadState as apiLoadState,
    clearState as apiClearState,
    resetTable as apiResetTable,
} from "./api/stateMethods.js";
import {
    getSelectedIds as apiGetSelectedIds,
    clearSelection as apiClearSelection,
    selectAll as apiSelectAll,
    toggleRowSelection as apiToggleRowSelection,
    isSelected as apiIsSelected,
    onSelectionChange as apiOnSelectionChange,
    getSelectedRows as apiGetSelectedRows,
    getSelectedData as apiGetSelectedData,
    getSelectedCount as apiGetSelectedCount,
    setSelection as apiSetSelection,
    invertSelection as apiInvertSelection,
    selectRange as apiSelectRange,
    setSelectable as apiSetSelectable,
    setSelectMode as apiSetSelectMode,
    destroySelectable as apiDestroySelectable,
} from "./api/selectionMethods.js";
import {
    getVisibleColumns as apiGetVisibleColumns,
    isColumnVisible as apiIsColumnVisible,
    toggleColumnVisibility as apiToggleColumnVisibility,
    showColumn as apiShowColumn,
    hideColumn as apiHideColumn,
    showAllColumns as apiShowAllColumns,
    hideAllColumns as apiHideAllColumns,
    resetColumnVisibility as apiResetColumnVisibility,
    bindColumnVisibilityButton as apiBindColumnVisibilityButton,
} from "./api/columnVisibilityMethods.js";
import {
    onRowClick as apiOnRowClick,
    onCellClick as apiOnCellClick,
    onRowHover as apiOnRowHover,
} from "./api/eventHandlerMethods.js";

export default class DataTable {
    constructor({
        tableId,
        url,
        perPage = 10,
        perPageOptions = [10, 25, 50],
        defaultSort = "id",
        defaultOrder = "asc", // Order direction must be "asc" or "desc".
        columns = [], // Add default empty array here
        dataSrc = null,
        saveState = false,
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
        sortable = true,
        sortableColumns = [],
        searchDelay = 300, // new

        reset = true,
        reload = true,

        perPageSelector = true,
        searchable = true,
        pagination = true,

        filterableColumns = null, // Array of column names to filter (for default inputs)
        columnGroups = [], // Add default empty array here
        stickyHeader = false,

        columnFiltering = false,
        saveStateDuration = 60 * 60 * 1000, // 1 hour

        theme = {}, // default to empty object
        baseTheme = "tailwind",

        filters = {},
        loading = {
            show: false,
            elementId: null,
            delay: 1000,
        },
        selection = {
            enabled: false,
            mode: "single", // 'single'|'multiple'
            rowClass: "row-selected",
            backgroundClass: "bg-blue-100",
        },
        infiniteScroll = {
            enabled: false,
            scrollOffset: 10,
            hidePaginationOnScroll: true,
            maxScrollPages: 1000,
            scrollWrapperHeight: "80vh",
        },
        columnVisibility = {
            enabled: false,
            showButton: true,
            persistState: true,
        },
        exportable = {
            enabled: true,
            buttons: {
                print: true,
                excel: true,
                csv: true,
                pdf: true,
            },
            chunkSize: {
                print: 50,
                pdf: 50,
                excel: 50,
                csv: 50,
            },
            pdfOptions: {
                orientation: "portrait",
                unit: "mm",
                format: "a4",
                theme: "grid",
            },
            fileName: {
                print: "print_report",
                pdf: "pdf_export",
                excel: "excel_export",
                csv: "csv_export",
            },
            footer: true,
        },
    }) {
        const infiniteScrollConfig = {
            enabled: infiniteScroll?.enabled !== false,
            scrollOffset: infiniteScroll?.scrollOffset || 10,
            hidePaginationOnScroll:
                infiniteScroll?.hidePaginationOnScroll !== false,
            maxScrollPages: infiniteScroll?.maxScrollPages,
            scrollWrapperHeight: infiniteScroll?.scrollWrapperHeight,
        };
        this.infiniteScroll = infiniteScrollConfig.enabled;
        this.scrollOffset = infiniteScrollConfig.scrollOffset;
        this.hidePaginationOnScroll =
            infiniteScrollConfig.hidePaginationOnScroll;
        this.maxScrollPages = infiniteScrollConfig.maxScrollPages;
        this.scrollWrapperHeight = infiniteScrollConfig.scrollWrapperHeight;

        this.filters = filters;

        const selectedTheme = DEFAULT_THEME[baseTheme] || DEFAULT_THEME.daisyui;
        this.theme = {
            ...selectedTheme,
            ...theme, // override specific classes
            framework: baseTheme.includes("bootstrap")
                ? "bootstrap"
                : baseTheme.includes("daisyui")
                ? "daisyui"
                : "tailwind",
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
        // this.chunkSize = chunkSize;
        this.currentPage = 1;
        this.dataSrc = dataSrc || "data"; // Default to 'data' if not provided
        this.enableSaveState = saveState;
        this.saveStateDuration = saveStateDuration;

        this.paginationType = paginationType;
        this.sortable = sortable;
        this.pagination = pagination;
        // this.sortableColumns = sortableColumns;
        this.sortableColumns = Array.isArray(sortableColumns)
            ? sortableColumns
            : [];
        this.searchDelay = searchDelay;
        this.columnFilters = {};
        this.columns = columns;
        this.searchDebounceTimer = null;

        const loadingConfig = {
            show: loading?.show !== false,
            elementId: loading?.elementId,
            delay: loading?.delay,
        };
        this.enableLoadingSpinner = loadingConfig.show;
        this.LoadingSpinnerContainer =
            loadingConfig.elementId || `${tableId}-loading-spinner`;
        this.loadingDelay = loadingConfig.delay;

        this.columnGroups = columnGroups || [];
        this.stickyHeader = stickyHeader;

        this.columnFiltering = columnFiltering;
        this.filters = filters;

        // Column Visibility Configuration
        this.columnVisibility = {
            enabled: columnVisibility?.enabled !== false,
            showButton: columnVisibility?.showButton !== false,
            persistState: columnVisibility?.persistState !== false,
        };

        // Initialize column visibility state
        // Store visibility state: { columnName: true/false }
        this.columnVisibilityState = {};
        this.columns.forEach((col) => {
            // Initialize with column's visible property, default to true
            this.columnVisibilityState[col.name] = col.visible !== false;
        });

        // Button configuration
        this.exportable = {
            enabled: exportable.enabled !== false, // default true unless explicitly false
            buttons: {
                print: exportable.buttons?.print !== false,
                excel: exportable.buttons?.excel !== false,
                csv: exportable.buttons?.csv !== false,
                pdf: exportable.buttons?.pdf === true, // default false unless explicitly true
                ...exportable.buttons,
            },
            chunkSize: {
                print: exportable.chunkSize?.print || 100,
                pdf: exportable.chunkSize?.pdf || 100,
                excel: exportable.chunkSize?.excel || 100,
                csv: exportable.chunkSize?.csv || 100,
                ...exportable.chunkSize,
            },
            fileName: {
                print: exportable.fileName?.print || "report",
                pdf: exportable.fileName?.pdf || "pdf_export",
                excel: exportable.fileName?.excel || "excel_export",
                csv: exportable.fileName?.csv || "csv_export",
                ...exportable.fileName,
            },
            pdfOptions: {
                orientation: exportable.pdfOptions?.orientation || "portrait",
                unit: exportable.pdfOptions?.unit || "mm",
                format: exportable.pdfOptions?.format || "a4",
                theme: exportable.pdfOptions?.theme || "grid",
                // Header styling options - merge defaults with user config
                headerStyles: {
                    fillColor: [41, 128, 185], // Default blue [R, G, B]
                    textColor: 255, // Default white (0-255)
                    ...exportable.pdfOptions?.headerStyles,
                },
                // Spread other pdfOptions after headerStyles to allow overrides
                ...Object.fromEntries(
                    Object.entries(exportable.pdfOptions || {}).filter(
                        ([key]) => key !== "headerStyles"
                    )
                ),
            },
            footer: exportable.footer !== false, // default true unless explicitly false
            // Store custom elements for exports
            customElements: exportable.customElements || {
                pdf: [],
                print: [],
                excel: [],
            },
            // Progress callbacks
            onExportProgress: exportable.onExportProgress || null,
            onExportComplete: exportable.onExportComplete || null,
            onExportError: exportable.onExportError || null,
        };
        this.chunkSize = this.exportable.chunkSize;

        // Export progress tracking
        this.exportProgress = {
            isActive: false,
            type: null, // 'excel', 'csv', 'pdf', 'print'
            current: 0,
            total: 0,
            startTime: null,
            cancelController: null,
            progressElement: null,
            isModalVisible: false, // Track if modal is visible
            toggleButton: null, // Floating toggle button
        };

        this.buttonConfig = {
            reset: {
                id: resetBtnId || `${tableId}-reset-button`,
                enabled: reset,
                icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rotate-ccw-icon lucide-rotate-ccw"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`,
                text: "Reset",
            },
            reload: {
                id: reloadBtnId || `${tableId}-reload-button`,
                enabled: reload,
                icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-refresh-ccw-icon lucide-refresh-ccw"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>`,
                text: "Reload",
            },
            print: {
                id: printBtnId || `${tableId}-print-button`,
                enabled:
                    this.exportable.enabled && this.exportable.buttons.print,
                icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-printer-check-icon lucide-printer-check"><path d="M13.5 22H7a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v.5"/><path d="m16 19 2 2 4-4"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/></svg>`,
                text: "Print",
            },
            export: {
                id: exportBtnId || `${tableId}-export-button`,
                enabled:
                    this.exportable.enabled && this.exportable.buttons.excel,
                icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-squares-exclude-icon lucide-squares-exclude"><path d="M16 12v2a2 2 0 0 1-2 2H9a1 1 0 0 0-1 1v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h0"/><path d="M4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3a1 1 0 0 1-1 1h-5a2 2 0 0 0-2 2v2"/></svg>`,
                text: "Excel",
            },
            downloadCsv: {
                id: downloadCsvBtnId || `${tableId}-download-csv-button`,
                enabled: this.exportable.enabled && this.exportable.buttons.csv,

                icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-check2-icon lucide-file-check-2"><path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m3 15 2 2 4-4"/></svg>`,
                text: "CSV",
            },
            pdf: {
                id: pdfBtnId || `${tableId}-download-pdf-button`,
                enabled: this.exportable.enabled && this.exportable.buttons.pdf,
                icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text-icon lucide-file-text"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>`,
                text: "PDF",
            },
            perPageSelect: {
                id: perPageSelectId || `${tableId}-per-page`,
                enabled: perPageSelector,
                text: "Perpage",
            },
            search: {
                id: searchInputId || `${tableId}-search-input`,
                enabled: searchable,
                icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search-icon lucide-search"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>`,
                text: "Search",
            },
            columnVisibility: {
                id: `${tableId}-column-visibility-button`,
                enabled:
                    this.columnVisibility.enabled &&
                    this.columnVisibility.showButton,
                icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-columns-icon lucide-columns"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 3v18"/></svg>`,
                text: "Columns",
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

        this.filterableColumns = filterableColumns;

        const selectionConfig = {
            selectable: selection?.enabled !== false,
            selectMode: selection?.mode || "single",
            selectionClass: selection?.rowClass || "row-selected",
            selectionBgClass: selection?.backgroundClass || "bg-blue-100",
        };
        // Then initialize keyboard navigation if enabled
        if (this.keyboardNav) {
            this.keyboardNav.destroy();
            this.keyboardNav = null;
        }

        if (keyboardNav !== false) {
            this.keyboardNav = new KeyboardNavigation(this.table, {
                selectable: this.selectable,
                selectionClass: this.selectionClass,
                selectionBgClass: this.selectionBgClass,
                getData: () => this.data,
                enabled: keyboardNav,
                main: this,
            });
        }

        // Public Core Utility methods
        this.copyToClipboard = (format) => apiCopyToClipboard(this, format);

        // ---------- JSON Export helpers ----------
        this.exportJSON = () => {
            // Export all records from server with filters/search
            exportJson({
                search: this.search,
                sort: this.sort,
                order: this.order,
                columnFilters: this.columnFilters,
                url: this.url,
                dataSrc: this.dataSrc,
                exportable: this.exportable,
                exportProgress: this.exportProgress,
                showExportProgress: (type, total) =>
                    internalShowExportProgress(this, type, total),
                updateExportProgress: (current, total) =>
                    internalUpdateExportProgress(this, current, total),
                hideExportProgress: () => internalHideExportProgress(this),
            });
        };
        this.downloadSelectedJSON = () => {
            // Export selected records from current data
            const selectedIds = this.getSelectedIds();
            downloadSelectedJSON(this.data, selectedIds);
        };
        this.exportCurrentPageJSON = () => {
            // Export current page data only
            exportCurrentPageJSON(this.data);
        };

        // ---------- Data CRUD API ----------
        this.getData = () => apiGetData(this);
        this.getRowData = (rowId) => apiGetRowData(this, rowId);
        this.getRowIndex = (rowId) => apiGetRowIndex(this, rowId);
        this.getRowsBy = (field, value) => apiGetRowsBy(this, field, value);
        this.findRowsByFieldContains = (field, value) =>
            apiFindRowsByFieldContains(this, field, value);
        this.addRow = (rowData, silent) => apiAddRow(this, rowData, silent);
        this.addRows = (rowsData, silent) => apiAddRows(this, rowsData, silent);
        this.updateRow = (rowId, updates, silent) =>
            apiUpdateRow(this, rowId, updates, silent);
        this.updateRows = (updates, silent) =>
            apiUpdateRows(this, updates, silent);
        this.deleteRow = (rowId, silent) => apiDeleteRow(this, rowId, silent);
        this.deleteRows = (ids, silent) => apiDeleteRows(this, ids, silent);
        this.redraw = () => apiRedraw(this);
        this.draw = () => apiDraw(this);

        // ---------- Sorting API ----------
        this.setSort = (column, direction) =>
            apiSetSort(this, column, direction);
        this.clearSort = () => apiClearSort(this);

        // ---------- Pagination API ----------
        this.goToPage = (pageNumber) => apiGoToPage(this, pageNumber);
        this.setPageSize = (size) => apiSetPageSize(this, size);
        this.getCurrentPage = () => apiGetCurrentPage(this);
        this.nextPage = () => apiNextPage(this);
        this.prevPage = () => apiPrevPage(this);
        this.firstPage = () => apiFirstPage(this);
        this.lastPage = () => apiLastPage(this);

        // ---------- Filter API ----------
        this.setFilter = (key, value, silent) =>
            apiSetFilter(this, key, value, silent);
        this.removeFilter = (key) => apiRemoveFilter(this, key);
        this.clearFilters = () => apiClearFilters(this);

        // ---------- State API ----------
        this.saveState = () => apiSaveState(this);
        this.loadState = () => apiLoadState(this);
        this.clearState = () => apiClearState(this);
        this.resetTable = () => apiResetTable(this);

        // ---------- Selectable API ----------
        this.selectable = new Selectable(this.table, {
            selectable: selectionConfig.selectable,
            selectMode: selectionConfig.selectMode,
            selectionClass: selectionConfig.selectionClass,
            selectionBgClass: selectionConfig.selectionBgClass,
            baseTheme,
        });
        this.getSelectedIds = () => apiGetSelectedIds(this);
        this.clearSelection = () => apiClearSelection(this);
        this.selectAll = () => apiSelectAll(this);
        this.toggleRowSelection = (id, force) =>
            apiToggleRowSelection(this, id, force);
        this.isSelected = (id) => apiIsSelected(this, id);
        this.onSelectionChange = (callback) =>
            apiOnSelectionChange(this, callback);
        this.getSelectedRows = () => apiGetSelectedRows(this);
        this.getSelectedData = () => apiGetSelectedData(this);
        this.getSelectedCount = () => apiGetSelectedCount(this);
        this.setSelection = (ids) => apiSetSelection(this, ids);
        this.invertSelection = () => apiInvertSelection(this);
        this.selectRange = (from, to) => apiSelectRange(this, from, to);
        this.setSelectable = (flag) => apiSetSelectable(this, flag);
        this.setSelectMode = (mode) => apiSetSelectMode(this, mode);
        this.destroySelectable = () => apiDestroySelectable(this);

        // ---------- Event Handler API ----------
        // Row and Cell Click handlers are now in api/eventHandlerMethods.js
        this._rowClickCallbacks = [];
        this._cellClickCallbacks = [];
        this._rowHoverCallbacks = [];

        this.onRowClick = (callback) => apiOnRowClick(this, callback);
        this.onCellClick = (callback) => apiOnCellClick(this, callback);
        this.onRowHover = (callback) => apiOnRowHover(this, callback);

        this.init();
    }

    init() {
        if (this.enableSaveState) this.loadState(); // Load saved state early before fetchData()
        if (this.enableLoadingSpinner) internalToggleLoadingSpinner(this, true);
        this.addDefaultControls();
        this.initButtons();
        this.initSearch();
        if (this.url) this.fetchData();
        internalInitPagination(this);
        this.initInfiniteScroll();
        this.renderTableHeader();
    }

    // ==============================
    // STATE MANAGEMENT
    // ==============================
    // State management functionality extracted to api/stateMethods.js
    // Methods: saveState(), loadState(), clearState() are now API methods

    // Initialize all buttons
    initButtons() {
        // Keep existing binding methods if they're enabled
        if (this.buttonConfig.reset.enabled) {
            this.bindResetButton();
        }
        if (this.buttonConfig.reload.enabled) {
            this.bindReloadButton();
        }
        // Update these to check both exportable.enabled and specific button enabled state
        if (this.exportable.enabled && this.buttonConfig.print.enabled) {
            this.bindPrintButton();
        }
        if (this.exportable.enabled && this.buttonConfig.export.enabled) {
            this.bindExportButton();
        }
        if (this.exportable.enabled && this.buttonConfig.downloadCsv.enabled) {
            this.bindDownloadCsvButton();
        }
        if (this.exportable.enabled && this.buttonConfig.pdf.enabled) {
            this.bindPdfButton();
        }
        if (this.buttonConfig.perPageSelect.enabled) {
            this.bindPerPageSelect();
        }
        if (
            this.columnVisibility.enabled &&
            this.buttonConfig.columnVisibility.enabled
        ) {
            this.bindColumnVisibilityButton();
        }
    }

    // ==============================
    // Pagination
    // ==============================
    // Pagination functionality extracted to methods/paginationMethods.js (internal)
    // Public API methods are in api/paginationMethods.js

    initPagination() {
        internalInitPagination(this);
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
                <div class="${this.theme.searchWrapper}">
                    <span class="${this.theme.searchIcon}">${config.icon}</span>
                    <input type="text" id="${config.id}" placeholder="Search records..." class="${this.theme.searchInput}" />
                </div>
            `;
            } else {
                buttonsHTML += `
                <button id="${config.id}" class="${this.theme.button}" title="${
                    config.text
                }">
                    ${config.icon ? `<span>${config.icon}</span>` : ""}<span>${
                    config.text
                }</span>

                </button>
            `;
            }
        }

        controlsContainer.innerHTML = `
        <div class="${this.theme.controlsWrapper}">
            <div class="${this.theme.controlsLeft}">
                ${perPageSelectHTML}
                <div class="${this.theme.buttonGroup}">${buttonsHTML}</div>
            </div>
            ${searchHTML}
        </div>
    `;

        const tableParent = this.table.parentNode;
        if (tableParent) {
            tableParent.insertBefore(controlsContainer, this.table);
        }
    }

    // Method to toggle the loading spinner visibility based on the `showLoading` boolean
    // ==============================
    // Loading Spinner
    // ==============================
    // Loading spinner functionality extracted to methods/loadingSpinnerMethods.js (internal)

    toggleLoadingSpinner(isLoading) {
        internalToggleLoadingSpinner(this, isLoading);
    }

    //===================
    // ==============================
    // Export Progress Indicator
    // ==============================
    // Export progress functionality extracted to methods/exportProgressMethods.js (internal)

    showExportProgress(type, total = 0) {
        internalShowExportProgress(this, type, total);
    }

    updateExportProgress(current, total) {
        internalUpdateExportProgress(this, current, total);
    }

    hideExportProgress() {
        internalHideExportProgress(this);
    }

    hideProgressModal() {
        internalHideProgressModal(this);
    }

    showProgressModal() {
        internalShowProgressModal(this);
    }

    cancelExport() {
        internalCancelExport(this);
    }

    // ==============================
    // Binds Header Buttons
    // ==============================

    bindResetButton() {
        const button = document.getElementById(this.buttonConfig.reset.id);
        if (button) {
            button.addEventListener("click", () => this.resetTable());
        }
    }

    // resetTable() is now an API method in api/stateMethods.js

    bindReloadButton() {
        const reloadButton = document.getElementById(
            this.buttonConfig.reload.id
        );
        if (!reloadButton) return;

        reloadButton.addEventListener("click", () => {
            this.fetchData();
        });
    }

    bindExportButton() {
        const button = document.getElementById(this.buttonConfig.export.id);
        if (!button) return;

        button.addEventListener("click", () => {
            this.exportToExcel();
        });
    }

    bindDownloadCsvButton() {
        const button = document.getElementById(
            this.buttonConfig.downloadCsv.id
        );
        if (button) {
            button.addEventListener("click", () => this.downloadCSV());
        }
    }

    bindPrintButton() {
        const button = document.getElementById(this.buttonConfig.print.id);
        if (button) {
            button.addEventListener("click", () => this.printTable());
        }
    }

    bindPdfButton() {
        const button = document.getElementById(this.buttonConfig.pdf.id);
        if (button) {
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

            this.searchInput.addEventListener("input", (e) => {
                this.search = e.target.value;
                this.currentPage = 1;
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
            this.fetchData();
        });
    }

    // ==============================
    // COLUMN VISIBILITY METHODS
    // ==============================
    // Column visibility functionality extracted to api/columnVisibilityMethods.js

    getVisibleColumns() {
        return apiGetVisibleColumns(this);
    }

    isColumnVisible(columnName) {
        return apiIsColumnVisible(this, columnName);
    }

    toggleColumnVisibility(columnName, visible = null) {
        return apiToggleColumnVisibility(this, columnName, visible);
    }

    showColumn(columnName) {
        return apiShowColumn(this, columnName);
    }

    hideColumn(columnName) {
        return apiHideColumn(this, columnName);
    }

    showAllColumns() {
        apiShowAllColumns(this);
    }

    hideAllColumns() {
        apiHideAllColumns(this);
    }

    resetColumnVisibility() {
        apiResetColumnVisibility(this);
    }

    bindColumnVisibilityButton() {
        apiBindColumnVisibilityButton(this);
    }

    //===================
    // FETCH DATA
    //===================

    async fetchData() {
        // Show loading spinner immediately when enabled
        if (this.enableLoadingSpinner) {
            internalToggleLoadingSpinner(this, true);
        }
        const params = new URLSearchParams({
            search: this.search,
            sortBy: this.sort,
            order: this.order,
            page: this.currentPage,
            perPage: this.rowsPerPage,
            columnFilters: JSON.stringify(this.columnFilters),
        });

        // Attach normal filters
        for (const [key, value] of Object.entries(this.filters)) {
            if (value !== "" && value != null) {
                params.append(key, value); // not inside "filters"
            }
        }

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
            const newData = json[this.dataSrc] || [];

            // For infinite scroll, append data instead of replacing
            if (this.infiniteScroll && this.currentPage > 1) {
                this.data = [...(this.data || []), ...newData];
            } else {
                this.data = newData;
            }

            if (this.data.length === 0) {
                this.showEmptyStateInTable("No records found.");
            } else {
                // For infinite scroll, only render new rows if not first page
                if (this.infiniteScroll && this.currentPage > 1) {
                    internalAppendRows(this, newData);
                } else {
                    this.renderTable(this.data);
                }
            }

            if (this.pagination) {
                internalUpdatePagination(this, json);
            }
        } catch (error) {
            console.error("Error fetching data:", error);

            // Optionally show error state
            if (this.data.length === 0) {
                this.showEmptyStateInTable("Error loading data");
            }
        } finally {
            // Always hide spinner when done
            // Only auto-hide if no duration was set
            if (this.loadingDelay <= 0) {
                internalToggleLoadingSpinner(this, false);
            }
        }
    }

    showEmptyStateInTable(message = "No data available.") {
        if (!this.table) {
            console.warn("DataTable: this.table is undefined");
            return;
        }

        let tableBody = this.table.querySelector("tbody");

        if (!tableBody) {
            console.warn("DataTable: <tbody> not found in table");
            tableBody = document.createElement("tbody");
            this.table.appendChild(tableBody);
        }

        const columnCount =
            this.table.querySelectorAll("thead tr:first-child th").length || 1;

        tableBody.innerHTML = `
        <tr>
            <td colspan="${columnCount}" class="text-center text-base-content text-sm py-6">
                ${message}
            </td>
        </tr>
    `;

        const paginationContainer =
            this.paginationWrapper || document.getElementById("pagination");

        if (paginationContainer) {
            paginationContainer.innerHTML = "";
        }
    }

    _renderTable() {
        // Call the renderTable method with the current data
        this.renderTable(this.data);
    }
    renderTableHeader() {
        if (this.theme?.table) {
            this.table.className = this.theme.table;
        }

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

        // Filter out columns that are not visible (respect column visibility state)
        const visibleColumns = this.getVisibleColumns();

        const hasGroups = this.columnGroups?.length > 0;

        // Render group headers if applicable
        if (hasGroups) {
            this.renderGroupHeaders(thead, visibleColumns);
        }

        // Always render column headers
        this.renderColumnHeaders(thead, visibleColumns, hasGroups);

        // Ensure <tbody> exists
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

    // Filter methods are now API methods in api/filterMethods.js
    // Methods: setFilter(), removeFilter(), clearFilters()

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

            // Label
            const spanLabel = document.createElement("span");
            spanLabel.textContent = column.label;
            th.appendChild(spanLabel);

            // Sortable
            if (this.sortableColumns?.includes(column.name)) {
                th.classList.add("cursor-pointer");
                th.dataset.column = column.name;
                th.dataset.order = this.defaultOrder || "asc";

                // Add default sort icon (neutral)
                const iconSpan = document.createElement("span");
                iconSpan.className = "sort-icon ml-2";
                // Fixed width to prevent layout shifts when icon changes
                iconSpan.style.cssText =
                    "margin-left: 4px; display: inline-flex; align-items: center; width: 20px; height: 20px; flex-shrink: 0;";
                iconSpan.setAttribute("role", "button");
                iconSpan.setAttribute("tabindex", "0");
                iconSpan.innerHTML = this.getNeutralSortIcon();
                th.appendChild(iconSpan);

                th.addEventListener("click", () => {
                    const newOrder =
                        th.dataset.order === "asc" ? "desc" : "asc";
                    th.dataset.order = newOrder;
                    this.sort = column.name;
                    this.order = newOrder;

                    // Reset all icons
                    thead.querySelectorAll(".sort-icon").forEach((el) => {
                        el.innerHTML = this.getNeutralSortIcon();
                    });

                    // Update current header's icon
                    const currentIconSpan = th.querySelector(".sort-icon");
                    if (currentIconSpan) {
                        currentIconSpan.innerHTML =
                            newOrder === "asc"
                                ? this.getAscSortIcon()
                                : this.getDescSortIcon();
                    }

                    if (this.enableSaveState) {
                        this.saveState();
                    }

                    this.fetchData();
                });
            }

            headerRow.appendChild(th);
        });

        // Render column filter row if columnFiltering is enabled
        if (
            this.columnFiltering &&
            this.filterableColumns &&
            Array.isArray(this.filterableColumns) &&
            this.filterableColumns.length > 0
        ) {
            const filterRow = thead.insertRow();
            filterRow.className = this.theme.filterRow || "";

            // Use getVisibleColumns() to respect column visibility
            const visibleCols = this.getVisibleColumns();
            visibleCols.forEach((column) => {
                const td = document.createElement("td");
                td.className = this.theme.headerCell || ""; // Use headerCell styling for filter cells

                // Check if this column should have a filter input
                if (this.filterableColumns.includes(column.name)) {
                    const filterInput = document.createElement("input");
                    filterInput.type = "text";
                    filterInput.className =
                        this.theme.filterInput ||
                        "column-search form-control form-control-sm";
                    filterInput.placeholder = `Filter ${
                        column.label || column.name
                    }...`;
                    filterInput.dataset.column = column.name;
                    filterInput.dataset.columnFilter = column.name; // For reset functionality

                    // Set initial value if filter already exists
                    if (this.columnFilters[column.name]) {
                        filterInput.value = this.columnFilters[column.name];
                    }

                    td.appendChild(filterInput);
                }

                filterRow.appendChild(td);
            });

            // Bind filter inputs after creating them
            this.bindColumnSearchInputs();
        }
    }
    getNeutralSortIcon() {
        return `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
             xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round" style="color: #9ca3af; display: block; flex-shrink: 0;">
            <path d="m3 16 4 4 4-4" />
            <path d="M7 20V4" />
            <path d="m21 8-4-4-4 4" />
            <path d="M17 4v16" />
        </svg>
    `;
    }

    getAscSortIcon() {
        return `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
             xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round" style="color: #4b5563; display: block; flex-shrink: 0;">
            <path d="m3 8 4-4 4 4" />
            <path d="M7 4v16" />
            <path d="M11 12h4" />
            <path d="M11 16h7" />
            <path d="M11 20h10" />
        </svg>
    `;
    }

    getDescSortIcon() {
        return `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
             xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round" style="color: #4b5563; display: block; flex-shrink: 0;">
            <path d="m3 16 4 4 4-4" />
            <path d="M7 20V4" />
            <path d="M11 4h4" />
            <path d="M11 8h7" />
            <path d="M11 12h10" />
        </svg>
    `;
    }

    renderTable(rows) {
        const tbody = this.table.querySelector("tbody") || this.createTBody();
        tbody.innerHTML = "";

        if (!this.columns?.length) {
            console.error("Columns configuration is missing or empty");
            return;
        }

        tbody.className = this.theme.body || "";

        const isTailwind = this.theme.framework === "tailwind";
        const isBootstrap = this.theme.framework === "bootstrap";
        const isDaisyUI = this.theme.framework === "daisyui";

        rows.forEach((row, rowIndex) => {
            const tr = document.createElement("tr");
            tr.dataset.id = row.id;

            // Apply row(theme) classes
            tr.className = this.theme.row || "";
            if (typeof this.theme.rowClass === "function") {
                tr.classList.add(
                    ...this.theme.rowClass(row, rowIndex).split(" ")
                );
            } else if (typeof this.theme.rowClass === "string") {
                tr.classList.add(...this.theme.rowClass.split(" "));
            }

            // Add initial hidden/fade classes
            // Tailwind: fade & move
            if (isTailwind) {
                tr.classList.add(
                    "opacity-0",
                    "translate-y-2",
                    "transition-all",
                    "duration-300"
                );
            }

            // Bootstrap: fade only (no translate)
            if (isBootstrap) {
                tr.classList.add("opacity-0", "transition", "duration-300");
            }

            // Create and append <td>s (only for visible columns)
            this.columns.forEach((column) => {
                if (!this.isColumnVisible(column.name)) return;

                const td = document.createElement("td");
                this.renderCell(td, row, column, rowIndex);
                tr.appendChild(td);
            });

            tbody.appendChild(tr);

            // Animate row with stagger
            const delay = rowIndex * 50;

            if (isTailwind) {
                setTimeout(() => {
                    tr.classList.remove("opacity-0", "translate-y-2");
                    tr.classList.add("opacity-100", "translate-y-0");
                }, delay);
            }

            if (isBootstrap) {
                setTimeout(() => {
                    tr.classList.remove("opacity-0");
                    tr.classList.add("opacity-100");
                }, delay);
            }
        });
    }

    // appendRows() is now in methods/infiniteScrollMethods.js
    appendRows(rows) {
        internalAppendRows(this, rows);
    }

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

        // ========= INLINE EDITING ==========
        if (column.editable) {
            td.classList.add("cursor-pointer");

            td.addEventListener("dblclick", () => {
                const input = this.createEditableInput(column, value);

                input.addEventListener("blur", () => {
                    this.handleInlineEditSave(input, td, row, column);
                });

                input.addEventListener("keydown", (e) => {
                    if (e.key === "Enter") {
                        input.blur();
                    }
                });

                td.innerHTML = "";
                td.appendChild(input);
                input.focus();

                const originalValue = row[column.name];

                input.addEventListener("keydown", (e) => {
                    if (e.key === "Escape") {
                        td.innerHTML = column.render
                            ? column.render(originalValue, row)
                            : originalValue;

                        td.classList.remove(
                            "border",
                            "border-yellow-500",
                            "border-red-500",
                            "border-green-500"
                        );
                    }
                });
            });
        }
        // ===================================

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
    createEditableInput(column, value) {
        let input;
        const inputClass =
            column.type === "select"
                ? this.theme.editableSelect
                : this.theme.editableInput;

        switch (column.type) {
            case "select":
                input = document.createElement("select");
                (column.options || []).forEach((opt) => {
                    const option = document.createElement("option");
                    option.value = opt;
                    option.textContent = opt;
                    if (opt == value) option.selected = true;
                    input.appendChild(option);
                });
                break;

            case "number":
            case "datetime-local":
            case "date":
            case "time":
            case "text":
            default:
                input = document.createElement("input");
                input.type = column.type || "text";
                input.value = value ?? "";
        }

        input.className = inputClass;
        return input;
    }

    async handleInlineEditSave(input, td, row, column, rowIndex) {
        const newValue = input.value;
        const oldValue = row[column.name];

        if (newValue === oldValue) {
            td.innerHTML = column.render
                ? column.render(oldValue, row)
                : oldValue;
            return;
        }

        // Reset previous feedback states
        td.classList.remove(
            this.theme.borderSuccess,
            this.theme.borderError,
            this.theme.borderLoading
        );

        // Show loading state
        td.classList.add("border", this.theme.borderLoading);

        const editHandler = column.onCellEdit || this.options.onCellEdit;
        if (typeof editHandler !== "function") return;

        try {
            const result = await editHandler({
                id: row.id,
                rowIndex,
                column,
                newValue,
                oldValue,
                rowData: row,
            });

            td.innerHTML = column.render
                ? column.render(newValue, row)
                : newValue;
            row[column.name] = newValue;

            td.classList.remove(this.theme.borderLoading);
            td.classList.add(this.theme.borderSuccess);

            setTimeout(
                () => td.classList.remove(this.theme.borderSuccess),
                1500
            );
        } catch (err) {
            td.innerHTML = column.render
                ? column.render(oldValue, row)
                : oldValue;

            td.classList.remove(this.theme.borderLoading);
            td.classList.add(this.theme.borderError);

            console.error("Inline edit error:", err);

            setTimeout(() => td.classList.remove(this.theme.borderError), 2000);
        }
    }

    //===================
    // Pagination
    //===================

    bindPaginationButtons() {
        internalBindPaginationButtons(this);
    }

    updatePagination(paginationData) {
        internalUpdatePagination(this, paginationData);
    }

    goToFirstPage() {
        this.goToPage(1);
    }

    //===================
    // Infinite Scroll Pagination
    //===================

    // ==============================
    // Infinite Scroll
    // ==============================
    // Infinite scroll functionality extracted to methods/infiniteScrollMethods.js (internal)

    initInfiniteScroll() {
        internalInitInfiniteScroll(this);
    }

    hasMorePages() {
        return internalHasMorePages(this);
    }

    resetScrollPosition() {
        internalResetScrollPosition(this);
    }

    destroyInfiniteScroll() {
        internalDestroyInfiniteScroll(this);
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

    getExportableColumns(type = "all") {
        return this.columns.filter((col) => {
            // Check column visibility state first
            if (!this.isColumnVisible(col.name)) return false;

            // If per-export-type control is defined (object like { print: false, csv: true })
            if (col.export && typeof col.export === "object") {
                return col.export[type] !== false;
            }

            // Respect individual type flags
            if (type === "print" && col.printable === false) return false;
            if (
                ["csv", "excel", "pdf"].includes(type) &&
                col.exportable === false
            )
                return false;

            return true; // default: exportable
        });
    }

    // ==============================
    // EXPORT TO EXCEL
    // ==============================
    // Excel functionality extracted to methods/excelExportMethods.js

    async exportToExcel() {
        // Pass context to the extracted Excel export method
        await exportExcel({
            getExportableColumns: (type) => this.getExportableColumns(type),
            search: this.search,
            sort: this.sort,
            order: this.order,
            columnFilters: this.columnFilters,
            url: this.url,
            dataSrc: this.dataSrc,
            exportable: this.exportable,
            exportProgress: this.exportProgress,
            showExportProgress: (type, total) =>
                this.showExportProgress(type, total),
            updateExportProgress: (current, total) =>
                this.updateExportProgress(current, total),
            hideExportProgress: () => this.hideExportProgress(),
        });
    }

    // ==============================
    // EXPORT TO downloadCSV
    // ==============================
    // CSV functionality extracted to methods/csvExportMethods.js

    async downloadCSV() {
        // Pass context to the extracted CSV export method
        await exportCsv({
            getExportableColumns: (type) => this.getExportableColumns(type),
            search: this.search,
            sort: this.sort,
            order: this.order,
            columnFilters: this.columnFilters,
            url: this.url,
            dataSrc: this.dataSrc,
            exportable: this.exportable,
            exportProgress: this.exportProgress,
            showExportProgress: (type, total) =>
                this.showExportProgress(type, total),
            updateExportProgress: (current, total) =>
                this.updateExportProgress(current, total),
            hideExportProgress: () => this.hideExportProgress(),
            table: this.table,
        });
    }

    downloadCurrentPageCSV() {
        // Pass context to the extracted fallback CSV export method
        exportCurrentPageCsv(this.table);
    }

    // ==============================
    // EXPORT TO print
    // ==============================
    // Print functionality extracted to methods/printExportMethods.js

    printTable() {
        // Pass context to the extracted print export method
        exportPrint({
            getExportableColumns: (type) => this.getExportableColumns(type),
            search: this.search,
            sort: this.sort,
            order: this.order,
            columnFilters: this.columnFilters,
            url: this.url,
            dataSrc: this.dataSrc,
            exportable: this.exportable,
            toggleLoadingSpinner: (isLoading) =>
                internalToggleLoadingSpinner(this, isLoading),
        });
    }

    // ==============================
    // PDF Download
    // The downloadPdf method using jsPDF and autoTable
    // ==============================

    downloadPdf() {
        // Pass context to the extracted PDF export method
        exportPdf({
            getExportableColumns: (type) => this.getExportableColumns(type),
            search: this.search,
            sort: this.sort,
            order: this.order,
            columnFilters: this.columnFilters,
            url: this.url,
            dataSrc: this.dataSrc,
            exportable: this.exportable,
            exportProgress: this.exportProgress,
            showExportProgress: (type, total) =>
                this.showExportProgress(type, total),
            updateExportProgress: (current, total) =>
                this.updateExportProgress(current, total),
            hideExportProgress: () => this.hideExportProgress(),
        });
    }
}
