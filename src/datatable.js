import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Selectable } from "./selectable";
import { KeyboardNavigation } from "./keyboard-navigation";
import { DataTableEvents } from "./datatable-events";
import { DEFAULT_THEME } from "./datatable-theme";
import {
  getData,
  getRowData,
  getRowIndex,
  getRowsBy, // new
  findRowsByFieldContains,
  addRow,
  addRows, // new
  updateRow,
  updateRows, // new
  deleteRow,
  deleteRows, // new
  redraw,
  draw,
} from "./methods/dataMethods.js";

import { exportJSON, downloadSelectedJSON } from "./methods/exportMethods.js";
import { setSort, clearSort } from "./methods/sortingMethods.js";
import { copyToClipboard } from "./methods/utiilityMethods.js";
import {
  applyElementsToPdf,
  applyElementsToPrint,
  validateElement,
  applyTextToPdf,
  applyImageToPdf,
} from "./methods/exportCustomization.js";
import {
  goToPage,
  setPageSize,
  getCurrentPage,
  nextPage,
  prevPage,
  firstPage,
  lastPage,
} from "./methods/paginationMethods.js";

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
      hidePaginationOnScroll: infiniteScroll?.hidePaginationOnScroll !== false,
      maxScrollPages: infiniteScroll?.maxScrollPages,
      scrollWrapperHeight: infiniteScroll?.scrollWrapperHeight,
    };
    this.infiniteScroll = infiniteScrollConfig.enabled;
    this.scrollOffset = infiniteScrollConfig.scrollOffset;
    this.hidePaginationOnScroll = infiniteScrollConfig.hidePaginationOnScroll;
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
    this.updatePagination = this.updatePagination.bind(this);

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
        enabled: this.exportable.enabled && this.exportable.buttons.print,
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-printer-check-icon lucide-printer-check"><path d="M13.5 22H7a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v.5"/><path d="m16 19 2 2 4-4"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/></svg>`,
        text: "Print",
      },
      export: {
        id: exportBtnId || `${tableId}-export-button`,
        enabled: this.exportable.enabled && this.exportable.buttons.excel,
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
          this.columnVisibility.enabled && this.columnVisibility.showButton,
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
    this.copyToClipboard = copyToClipboard.bind(this);

    // ---------- Json Export helpers ----------
    this.exportJSON = () => {
      exportJSON(this.data);
    };
    this.downloadSelectedJSON = () => {
      const selectedIds = this.getSelectedIds();
      if (selectedIds.length === 0) {
        console.error("Please select at least one row to export.");
        return;
      }
      const selectedData = this.data.filter((row) =>
        selectedIds.includes(String(row.id))
      );

      exportJSON(selectedData);
    };

    // ---------- Data CRUD helpers ----------
    this.getData = getData.bind(this);
    this.getRowData = getRowData.bind(this);
    this.getRowIndex = getRowIndex.bind(this);
    this.getRowsBy = getRowsBy.bind(this);
    this.findRowsByFieldContains = findRowsByFieldContains.bind(this);
    this.addRow = addRow.bind(this);
    this.addRows = addRows.bind(this);
    this.updateRow = updateRow.bind(this);
    this.updateRows = updateRows.bind(this);
    this.deleteRow = deleteRow.bind(this);
    this.deleteRows = deleteRows.bind(this);
    this.redraw = redraw.bind(this);
    this.draw = draw.bind(this);

    // ---------- Sorting helpers ----------
    this.setSort = setSort.bind(this);
    this.clearSort = clearSort.bind(this);

    // ---------- Pagination helpers ----------
    this.goToPage = goToPage.bind(this);
    this.setPageSize = setPageSize.bind(this);
    this.getCurrentPage = getCurrentPage.bind(this);
    this.nextPage = nextPage.bind(this);
    this.prevPage = prevPage.bind(this);
    this.firstPage = firstPage.bind(this); // if you added it
    this.lastPage = lastPage.bind(this); // if you added it

    // ---------- Selectable helpers ----------
    this.selectable = new Selectable(this.table, {
      selectable: selectionConfig.selectable,
      selectMode: selectionConfig.selectMode,
      selectionClass: selectionConfig.selectionClass,
      selectionBgClass: selectionConfig.selectionBgClass,
      baseTheme,
    });
    this.getSelectedIds = () => this.selectable.getSelectedIds();
    this.clearSelection = () => this.selectable.clearSelection();
    this.selectAll = () => this.selectable.selectAll();
    this.toggleRowSelection = (id, force) =>
      this.selectable.toggleRowSelection(id, force);
    this.isSelected = (id) => this.selectable.isSelected(id);
    this.onSelectionChange = (callback) =>
      this.selectable.onSelectionChange(callback);

    // 1. Query helpers
    this.getSelectedRows = () => this.selectable.getSelectedRows();
    this.getSelectedData = () => this.selectable.getSelectedData();
    this.getSelectedCount = () => this.selectable.getSelectedCount();

    // 2. Granular selection
    this.setSelection = (ids) => this.selectable.setSelection(ids);
    this.invertSelection = () => this.selectable.invertSelection();
    this.selectRange = (from, to) => this.selectable.selectRange(from, to);

    // 3. Programmatic control
    this.setSelectable = (flag) => this.selectable.setSelectable(flag);
    this.setSelectMode = (mode) => this.selectable.setSelectMode(mode);
    this.destroySelectable = () => this.selectable.destroy();

    // ---------- Row and Cell Click handlers ----------
    this._rowClickCallbacks = [];
    this._cellClickCallbacks = [];
    this._rowHoverCallbacks = [];

    // Simple row click handler
    this.onRowClick = (callback) => {
      if (typeof callback !== "function") {
        console.warn("onRowClick requires a function callback");
        return;
      }
      this._rowClickCallbacks.push(callback);

      // Add event listener if first callback
      if (this._rowClickCallbacks.length === 1) {
        this.table.addEventListener("click", (event) => {
          const row = event.target.closest("tr");
          if (!row || !row.dataset.id) return;

          // Ignore clicks on buttons, links, inputs
          if (
            event.target.closest(
              "button, a, input, select, textarea, [role='button']"
            )
          ) {
            return;
          }

          const rowId = row.dataset.id;
          let rowData = {};
          try {
            if (row.dataset.row) {
              rowData = JSON.parse(row.dataset.row);
            } else {
              // Fallback: extract from cells
              const cells = row.querySelectorAll("td");
              cells.forEach((cell, index) => {
                const columnName = cell.dataset.column || `column_${index}`;
                rowData[columnName] = cell.textContent.trim();
              });
            }
          } catch (error) {
            console.warn("Failed to parse row data:", error);
          }

          // Call all registered callbacks
          this._rowClickCallbacks.forEach((cb) => {
            cb(rowId, rowData, row, event);
          });
        });
      }
    };

    // Simple cell click handler
    this.onCellClick = (callback) => {
      if (typeof callback !== "function") {
        console.warn("onCellClick requires a function callback");
        return;
      }
      this._cellClickCallbacks.push(callback);

      // Add event listener if first callback
      if (this._cellClickCallbacks.length === 1) {
        this.table.addEventListener("click", (event) => {
          const cell = event.target.closest("td");
          if (!cell) return;

          const row = cell.closest("tr");
          if (!row || !row.dataset.id) return;

          const rowId = row.dataset.id;
          const columnName = cell.dataset.column || "";
          const cellValue = cell.textContent.trim();

          let rowData = {};
          try {
            if (row.dataset.row) {
              rowData = JSON.parse(row.dataset.row);
            }
          } catch (error) {
            console.warn("Failed to parse row data:", error);
          }

          // Call all registered callbacks
          this._cellClickCallbacks.forEach((cb) => {
            cb(rowId, columnName, cellValue, cell, row, rowData, event);
          });
        });
      }
    };

    // Simple row hover handler
    this.onRowHover = (callback) => {
      if (typeof callback !== "function") {
        console.warn("onRowHover requires a function callback");
        return;
      }
      this._rowHoverCallbacks.push(callback);

      // Add event listener if first callback
      if (this._rowHoverCallbacks.length === 1) {
        this.table.addEventListener(
          "mouseenter",
          (event) => {
            const row = event.target.closest("tr");
            if (!row || !row.dataset.id) return;

            const rowId = row.dataset.id;
            let rowData = {};
            try {
              if (row.dataset.row) {
                rowData = JSON.parse(row.dataset.row);
              }
            } catch (error) {
              console.warn("Failed to parse row data:", error);
            }

            // Call all registered callbacks
            this._rowHoverCallbacks.forEach((cb) => {
              cb(rowId, rowData, row, event);
            });
          },
          true
        );
      }
    };

    this.init();
  }

  init() {
    if (this.saveState) this.loadState(); // Load saved state early before fetchData()
    if (this.enableLoadingSpinner) this.toggleLoadingSpinner(true);
    this.addDefaultControls();
    this.initButtons();
    this.initSearch();
    if (this.url) this.fetchData();
    this.initPagination();
    this.initInfiniteScroll();
    this.renderTableHeader();
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
      columnVisibility: this.columnVisibility.persistState
        ? this.columnVisibilityState
        : undefined,
    };
    localStorage.setItem(
      `vanillajs_datatable_${this.table.id}_state`,
      JSON.stringify(state)
    );
  }

  /**
   * Loads the saved state from localStorage and applies it to the DataTable.
   * Dispatches a 'stateRestored' event after loading.
   */
  loadState() {
    // console.log("Loading state" + this.table);
    const saved = localStorage.getItem(
      `vanillajs_datatable_${this.table.id}_state`
    );
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

    // Apply saved state
    this.sort = state.sort;
    this.order = state.order;
    this.currentPage = state.page;
    this.rowsPerPage = state.perPage;
    this.columnFilters = state.filters || {};
    this.search = state.search || "";

    // Restore column visibility if persisted
    if (
      this.columnVisibility.persistState &&
      state.columnVisibility &&
      typeof state.columnVisibility === "object"
    ) {
      this.columnVisibilityState = {
        ...this.columnVisibilityState,
        ...state.columnVisibility,
      };
    }
  }

  clearState() {
    if (!this.table || !this.table.id) return;
    localStorage.removeItem(`vanillajs_datatable_${this.table.id}_state`);
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

  initPagination() {
    if (!this.pagination) return;

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

    // Use theme classes instead of hardcoded ones
    this.prevBtn = this.getOrCreateElement(
      this.paginationConfig.previous.id,
      "button",
      this.theme.paginationButton + " join-item",
      this.paginationConfig.previous.text
    );

    this.nextBtn = this.getOrCreateElement(
      this.paginationConfig.next.id,
      "button",
      this.theme.paginationButton + " join-item",
      this.paginationConfig.next.text
    );

    this.pageInfo = this.getOrCreateElement(
      this.paginationConfig.pageInfo.id,
      "span",
      this.theme.paginationInfo,
      ""
    );

    this.infoText = this.getOrCreateElement(
      this.paginationConfig.infoText.id,
      "div",
      this.theme.paginationInfo,
      ""
    );

    // Create or get paginationWrapper
    this.paginationWrapper = document.getElementById(
      this.paginationConfig.wrapper.id
    );
    if (!this.paginationWrapper) {
      this.paginationWrapper = document.createElement("div");
      this.paginationWrapper.id = this.paginationConfig.wrapper.id;
      this.paginationWrapper.className = this.theme.paginationWrapper;
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

    // Append buttons inside paginationWrapper
    if (!this.paginationWrapper.contains(this.prevBtn)) {
      this.paginationWrapper.appendChild(this.prevBtn);
    }
    if (!this.paginationWrapper.contains(this.nextBtn)) {
      this.paginationWrapper.appendChild(this.nextBtn);
    }

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
  toggleLoadingSpinner(isLoading) {
    if (!this.enableLoadingSpinner || !this.tableId) return;

    const table = document.getElementById(this.tableId);
    if (!table) return;

    const tbody = table.querySelector("tbody");
    if (!tbody) return;

    let spinnerContainer = document.getElementById(
      this.LoadingSpinnerContainer
    );
    const isTailwind = this.theme.framework === "tailwind";
    const isBootstrap = this.theme.framework === "bootstrap";
    const isDaisyUI = this.theme.framework === "daisyui";

    if (!spinnerContainer) {
      // Create overlay container

      spinnerContainer = document.createElement("div");
      spinnerContainer.id = this.LoadingSpinnerContainer;

      let spinner;

      if (isBootstrap) {
        spinnerContainer.className =
          "position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75  d-none";
        spinner = document.createElement("div");
        spinner.className = "spinner-border text-primary";
      } else if (isDaisyUI) {
        spinnerContainer.className =
          "absolute inset-0 flex items-center justify-center bg-base-100/70 z-50 hidden";
        spinner = document.createElement("span");
        spinner.className = "loading loading-dots loading-lg"; // DaisyUI spinner class
      } else {
        spinnerContainer.className =
          "absolute inset-0 flex items-center justify-center bg-white/70 z-50 hidden";
        // Create Tailwind/DaisyUI CSS spinner
        spinner = document.createElement("div");
        spinner.className =
          "w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin";
      }

      spinnerContainer.appendChild(spinner);

      const tbodyWrapper = tbody.parentNode;
      if (!tbodyWrapper.classList.contains("relative")) {
        tbodyWrapper.classList.add("relative");
      }

      tbodyWrapper.appendChild(spinnerContainer);
    }

    if (this.loadingSpinnerTimeout) {
      clearTimeout(this.loadingSpinnerTimeout);
    }

    // Show/hide with optional auto-hide
    if (isLoading) {
      if (isBootstrap) {
        spinnerContainer.classList.remove("d-none");
      } else {
        spinnerContainer.classList.remove("hidden");
      }

      if (this.loadingDelay > 0) {
        this.loadingSpinnerTimeout = setTimeout(() => {
          this.toggleLoadingSpinner(false);
        }, this.loadingDelay);
      }
    } else {
      if (isBootstrap) {
        spinnerContainer.classList.add("d-none");
      } else {
        spinnerContainer.classList.add("hidden");
      }
    }
  }

  //===================
  // Export Progress Indicator
  //===================

  /**
   * Show export progress UI
   * @param {string} type - Export type: 'excel', 'csv', 'pdf', 'print'
   * @param {number} total - Total records/pages to process
   */
  showExportProgress(type, total = 0) {
    this.exportProgress.isActive = true;
    this.exportProgress.type = type;
    this.exportProgress.current = 0;
    this.exportProgress.total = total;
    this.exportProgress.startTime = Date.now();
    this.exportProgress.cancelController = new AbortController();

    // Create or get progress element
    let progressElement = document.getElementById(
      `${this.tableId}-export-progress`
    );

    if (!progressElement) {
      progressElement = document.createElement("div");
      progressElement.id = `${this.tableId}-export-progress`;
      progressElement.className = this.theme.exportProgressOverlay || "";
      progressElement.innerHTML = this._buildProgressHTML(type);
      document.body.appendChild(progressElement);

      // Bind cancel button
      const cancelBtn = progressElement.querySelector(
        ".export-progress-cancel"
      );
      if (cancelBtn) {
        cancelBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.cancelExport();
        });
      }

      // Allow closing the modal by clicking outside (backdrop)
      // Add click handler to the overlay container itself
      const handleBackdropClick = (e) => {
        // Only close if clicking the overlay/backdrop, not the modal content
        const modal = progressElement.querySelector(".export-progress-modal");
        const backdrop = progressElement.querySelector(
          ".export-progress-overlay-backdrop"
        );

        // Check if click is on backdrop or overlay itself (not on modal)
        const isBackdropClick =
          backdrop && (e.target === backdrop || backdrop.contains(e.target));
        const isOverlayClick = e.target === progressElement;
        const isModalClick = modal && modal.contains(e.target);

        if ((isBackdropClick || isOverlayClick) && !isModalClick) {
          e.preventDefault();
          e.stopPropagation();
          this.hideProgressModal(); // Hide modal but keep export running
        }
      };

      progressElement.addEventListener("click", handleBackdropClick);
      this.exportProgress.backdropClickHandler = handleBackdropClick;
    } else {
      // Reset existing element for new export
      progressElement.classList.remove("hidden");

      // Reset display style - use !important to override previous hide
      const isBootstrap = this.theme.framework === "bootstrap";
      if (isBootstrap) {
        progressElement.style.setProperty("display", "", "important");
      } else {
        progressElement.style.setProperty("display", "flex", "important");
      }

      // Update title
      const titleEl = progressElement.querySelector(".export-progress-title");
      if (titleEl) {
        titleEl.textContent = `Exporting ${type.toUpperCase()}...`;
      }

      // Reset progress bar
      const progressBar = progressElement.querySelector(
        ".export-progress-bar-fill"
      );
      if (progressBar) {
        progressBar.style.width = "0%";
      }

      // Reset progress text
      const progressText = progressElement.querySelector(
        ".export-progress-text"
      );
      if (progressText) {
        progressText.textContent = "0% (0/0 records)";
      }

      // Reset time remaining
      const timeRemaining = progressElement.querySelector(
        ".export-progress-time"
      );
      if (timeRemaining) {
        timeRemaining.textContent = "";
      }
    }

    this.exportProgress.progressElement = progressElement;

    // Focus the modal for accessibility
    const modal = progressElement.querySelector(".export-progress-modal");
    if (modal) {
      modal.focus();
    }

    this.exportProgress.isModalVisible = true;
    this._createToggleButton(); // Create floating toggle button
  }

  /**
   * Update export progress
   * @param {number} current - Current progress
   * @param {number} total - Total to process
   */
  updateExportProgress(current, total) {
    if (!this.exportProgress.isActive || !this.exportProgress.progressElement)
      return;

    this.exportProgress.current = current;
    this.exportProgress.total = total;

    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
    const progressBar = this.exportProgress.progressElement.querySelector(
      ".export-progress-bar-fill"
    );
    const progressText = this.exportProgress.progressElement.querySelector(
      ".export-progress-text"
    );
    const timeRemaining = this.exportProgress.progressElement.querySelector(
      ".export-progress-time"
    );

    if (progressBar) {
      progressBar.style.width = `${percentage}%`;
    }

    if (progressText) {
      progressText.textContent = `${percentage}% (${current}/${total} records)`;
    }

    // Calculate estimated time remaining
    if (timeRemaining && this.exportProgress.startTime && current > 0) {
      const elapsed = Date.now() - this.exportProgress.startTime;
      const avgTimePerRecord = elapsed / current;
      const remaining = Math.max(0, (total - current) * avgTimePerRecord);
      const seconds = Math.ceil(remaining / 1000);
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;

      if (minutes > 0) {
        timeRemaining.textContent = `Estimated time remaining: ${minutes}m ${remainingSeconds}s`;
      } else {
        timeRemaining.textContent = `Estimated time remaining: ${seconds}s`;
      }
    }

    // Update toggle button text if it exists
    this._updateToggleButton();

    // Call user callback
    if (this.exportable.onExportProgress) {
      try {
        this.exportable.onExportProgress(
          current,
          total,
          this.exportProgress.type
        );
      } catch (error) {
        console.error("Error in onExportProgress callback:", error);
      }
    }
  }

  /**
   * Create floating toggle button
   * @private
   */
  _createToggleButton() {
    // Remove existing button if any
    this._removeToggleButton();

    const isBootstrap = this.theme.framework === "bootstrap";
    const isDaisyUI = this.theme.framework === "daisyui";

    const button = document.createElement("button");
    button.id = `${this.tableId}-export-progress-toggle`;
    button.type = "button";
    button.className = isBootstrap
      ? "btn btn-primary position-fixed bottom-0 end-0 m-3 shadow-lg rounded-circle"
      : isDaisyUI
      ? "btn btn-primary fixed bottom-4 right-4 shadow-lg rounded-full w-14 h-14"
      : "fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center z-[9998]";

    button.innerHTML = isBootstrap
      ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>'
      : '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>';

    button.title = `Exporting ${
      this.exportProgress.type?.toUpperCase() || ""
    } - Click to view progress`;
    button.setAttribute("aria-label", "View export progress");

    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.showProgressModal();
    });

    document.body.appendChild(button);
    this.exportProgress.toggleButton = button;
    this._updateToggleButton();
  }

  /**
   * Update toggle button visibility and text
   * @private
   */
  _updateToggleButton() {
    if (!this.exportProgress.toggleButton) return;

    const button = this.exportProgress.toggleButton;
    const isActive = this.exportProgress.isActive;
    const isVisible = this.exportProgress.isModalVisible;

    if (isActive && !isVisible) {
      // Show button when export is active but modal is hidden
      button.style.display = "flex";
      const percentage =
        this.exportProgress.total > 0
          ? Math.round(
              (this.exportProgress.current / this.exportProgress.total) * 100
            )
          : 0;
      button.title = `Exporting ${
        this.exportProgress.type?.toUpperCase() || ""
      } - ${percentage}% - Click to view progress`;
    } else {
      // Hide button when modal is visible or export is not active
      button.style.display = "none";
    }
  }

  /**
   * Remove toggle button
   * @private
   */
  _removeToggleButton() {
    if (this.exportProgress.toggleButton) {
      this.exportProgress.toggleButton.remove();
      this.exportProgress.toggleButton = null;
    }
  }

  /**
   * Hide progress modal (but keep export running)
   */
  hideProgressModal() {
    if (this.exportProgress.progressElement) {
      this.exportProgress.progressElement.classList.add("hidden");
      this.exportProgress.progressElement.style.setProperty(
        "display",
        "none",
        "important"
      );
    }
    this.exportProgress.isModalVisible = false;
    this._updateToggleButton(); // Update toggle button visibility
  }

  /**
   * Show progress modal
   */
  showProgressModal() {
    if (this.exportProgress.progressElement) {
      this.exportProgress.progressElement.classList.remove("hidden");
      // Set display based on framework - use !important to override any inline styles
      const isBootstrap = this.theme.framework === "bootstrap";
      if (isBootstrap) {
        this.exportProgress.progressElement.style.setProperty(
          "display",
          "",
          "important"
        );
        // Bootstrap uses d-flex class, so we just remove hidden
      } else {
        this.exportProgress.progressElement.style.setProperty(
          "display",
          "flex",
          "important"
        );
      }
    }
    this.exportProgress.isModalVisible = true;
    this._updateToggleButton(); // Update toggle button visibility

    // Focus the modal for accessibility
    const modal = this.exportProgress.progressElement?.querySelector(
      ".export-progress-modal"
    );
    if (modal) {
      modal.focus();
    }
  }

  /**
   * Hide export progress UI completely (export finished or cancelled)
   */
  hideExportProgress() {
    if (this.exportProgress.progressElement) {
      this.exportProgress.progressElement.classList.add("hidden");
      this.exportProgress.progressElement.style.setProperty(
        "display",
        "none",
        "important"
      );
      // Also try removing from DOM as fallback
      setTimeout(() => {
        if (
          this.exportProgress.progressElement &&
          this.exportProgress.progressElement.parentNode
        ) {
          this.exportProgress.progressElement.style.setProperty(
            "display",
            "none",
            "important"
          );
        }
      }, 0);
    }
    this._removeToggleButton(); // Remove toggle button
    this.exportProgress.isActive = false;
    this.exportProgress.isModalVisible = false;
    this.exportProgress.type = null;
    this.exportProgress.current = 0;
    this.exportProgress.total = 0;
    this.exportProgress.startTime = null;
    this.exportProgress.cancelController = null;
  }

  /**
   * Cancel current export
   */
  cancelExport() {
    if (this.exportProgress.cancelController) {
      this.exportProgress.cancelController.abort();
    }
    this.hideExportProgress();

    // Call error callback
    if (this.exportable.onExportError) {
      try {
        this.exportable.onExportError(
          new Error("Export cancelled by user"),
          this.exportProgress.type
        );
      } catch (error) {
        console.error("Error in onExportError callback:", error);
      }
    }
  }

  /**
   * Build progress HTML structure
   * @private
   */
  _buildProgressHTML(type) {
    const isBootstrap = this.theme.framework === "bootstrap";
    const isDaisyUI = this.theme.framework === "daisyui";
    const isTailwind = this.theme.framework === "tailwind";

    // Use theme classes, fallback to defaults that use theme colors
    const overlayClass =
      this.theme.exportProgressOverlay ||
      (isBootstrap
        ? "position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center z-[9999]"
        : "fixed inset-0 flex items-center justify-content-center z-[9999]");

    const modalClass =
      this.theme.exportProgressModal ||
      (isBootstrap
        ? "rounded p-4 shadow-lg w-100 mx-3"
        : isDaisyUI
        ? "bg-base-100 rounded-lg p-6 shadow-xl w-full max-w-md mx-4"
        : "bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl w-full max-w-md mx-4");

    const titleClass =
      this.theme.exportProgressTitle ||
      (isBootstrap ? "h5 mb-3" : "text-xl font-semibold mb-4");

    const barContainerClass =
      this.theme.exportProgressBarContainer ||
      (isBootstrap ? "progress mb-3" : "w-full rounded-full h-2.5 mb-3");

    const barFillClass =
      this.theme.exportProgressBarFill ||
      (isBootstrap
        ? "progress-bar progress-bar-striped progress-bar-animated"
        : "h-2.5 rounded-full transition-all duration-300");

    const textClass =
      this.theme.exportProgressText ||
      (isBootstrap ? "text-center mb-2" : "text-center text-sm mb-2");

    const timeClass =
      this.theme.exportProgressTime ||
      (isBootstrap ? "text-center mb-3" : "text-center text-xs mb-3");

    const noteClass =
      this.theme.exportProgressNote ||
      (isBootstrap ? "text-center mb-3" : "text-center text-xs mb-3");

    const cancelBtnClass =
      this.theme.exportProgressCancel ||
      (isBootstrap
        ? "btn btn-secondary w-100"
        : isDaisyUI
        ? "btn btn-sm btn-outline w-full"
        : "px-4 py-2 rounded text-sm w-full");

    // Build backdrop with theme-aware background
    const backdropClass = isBootstrap
      ? "position-absolute top-0 start-0 w-100 h-100 export-progress-overlay-backdrop"
      : "absolute inset-0 export-progress-overlay-backdrop";

    return `
            <div class="${overlayClass}" style="backdrop-filter: blur(2px);">
                <div class="${backdropClass} export-progress-overlay-backdrop" style="background-color: rgba(0, 0, 0, 0.5);"></div>
                <div class="${modalClass} export-progress-modal position-relative z-10" tabindex="-1" style="outline: none; max-width: 500px;">
                    <h3 class="${titleClass} export-progress-title text-center">Exporting ${type.toUpperCase()}...</h3>
                    <div class="${barContainerClass}">
                        <div class="${barFillClass} export-progress-bar-fill" style="width: 0%;"></div>
                    </div>
                    <div class="${textClass} export-progress-text">0% (0/0 records)</div>
                    <div class="${timeClass} export-progress-time"></div>
                    <div class="${noteClass} export-progress-note" style="color: rgba(239, 68, 68, 0.9); font-weight: 500; padding: 8px; background-color: rgba(239, 68, 68, 0.1); border-radius: 4px; margin-bottom: 12px;">
                        <svg style="display: inline-block; width: 16px; height: 16px; vertical-align: middle; margin-right: 6px;" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                        </svg>
                        Please do not close this window while export is in progress
                    </div>
                    <button type="button" class="${cancelBtnClass} export-progress-cancel">Cancel Export</button>
                </div>
            </div>
        `;
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

    // Fetch new data
    this.fetchData();
  }

  bindReloadButton() {
    const reloadButton = document.getElementById(this.buttonConfig.reload.id);
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
    const button = document.getElementById(this.buttonConfig.downloadCsv.id);
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
    const searchInput = document.getElementById(this.buttonConfig.search.id);

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
      console.warn(`Per page select element with id '${config.id}' not found.`);
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

  /**
   * Get all visible columns based on visibility state
   * @returns {Array} Array of visible column objects
   */
  getVisibleColumns() {
    return this.columns.filter((col) => this.isColumnVisible(col.name));
  }

  /**
   * Check if a column is visible
   * @param {string} columnName - Name of the column
   * @returns {boolean} True if column is visible
   */
  isColumnVisible(columnName) {
    // Check visibility state first, then fall back to column.visible property
    if (this.columnVisibilityState.hasOwnProperty(columnName)) {
      return this.columnVisibilityState[columnName] !== false;
    }
    // Fallback to column's visible property
    const column = this.columns.find((col) => col.name === columnName);
    return column ? column.visible !== false : true;
  }

  /**
   * Toggle column visibility
   * @param {string} columnName - Name of the column to toggle
   * @param {boolean} [visible] - Optional: force visibility state (true/false)
   * @returns {boolean} New visibility state
   */
  toggleColumnVisibility(columnName, visible = null) {
    if (!this.columnVisibility.enabled) {
      console.warn("Column visibility is not enabled");
      return false;
    }

    const column = this.columns.find((col) => col.name === columnName);
    if (!column) {
      console.warn(`Column "${columnName}" not found`);
      return false;
    }

    // If column has exportable: false or is required, prevent hiding
    if (visible === false && column.required) {
      console.warn(`Column "${columnName}" is required and cannot be hidden`);
      return true;
    }

    // Toggle or set visibility
    const newVisibility =
      visible !== null ? visible : !this.columnVisibilityState[columnName];

    this.columnVisibilityState[columnName] = newVisibility;

    // Save state if enabled
    if (this.enableSaveState && this.columnVisibility.persistState) {
      this.saveState();
    }

    // Re-render table header and body
    this.renderTableHeader();
    this.renderTable(this.data);

    return newVisibility;
  }

  /**
   * Show a column
   * @param {string} columnName - Name of the column to show
   */
  showColumn(columnName) {
    return this.toggleColumnVisibility(columnName, true);
  }

  /**
   * Hide a column
   * @param {string} columnName - Name of the column to hide
   */
  hideColumn(columnName) {
    return this.toggleColumnVisibility(columnName, false);
  }

  /**
   * Show all columns
   */
  showAllColumns() {
    if (!this.columnVisibility.enabled) return;

    this.columns.forEach((col) => {
      if (!col.required) {
        this.columnVisibilityState[col.name] = true;
      }
    });

    if (this.enableSaveState && this.columnVisibility.persistState) {
      this.saveState();
    }

    this.renderTableHeader();
    this.renderTable(this.data);
  }

  /**
   * Hide all columns (except required ones)
   */
  hideAllColumns() {
    if (!this.columnVisibility.enabled) return;

    this.columns.forEach((col) => {
      if (!col.required) {
        this.columnVisibilityState[col.name] = false;
      }
    });

    if (this.enableSaveState && this.columnVisibility.persistState) {
      this.saveState();
    }

    this.renderTableHeader();
    this.renderTable(this.data);
  }

  /**
   * Reset column visibility to initial state
   */
  resetColumnVisibility() {
    if (!this.columnVisibility.enabled) return;

    this.columns.forEach((col) => {
      this.columnVisibilityState[col.name] = col.visible !== false;
    });

    if (this.enableSaveState && this.columnVisibility.persistState) {
      this.saveState();
    }

    this.renderTableHeader();
    this.renderTable(this.data);
  }

  /**
   * Bind column visibility button and create dropdown
   */
  bindColumnVisibilityButton() {
    const button = document.getElementById(
      this.buttonConfig.columnVisibility.id
    );
    if (!button) {
      console.warn(
        `Column visibility button with id '${this.buttonConfig.columnVisibility.id}' not found. Make sure columnVisibility.enabled and columnVisibility.showButton are both true.`
      );
      return;
    }

    // Create dropdown menu
    const dropdown = document.createElement("div");
    dropdown.id = `${this.tableId}-column-visibility-dropdown`;
    dropdown.className =
      this.theme.columnVisibilityDropdown || "column-visibility-dropdown";
    dropdown.style.display = "none";

    // Add column checkboxes
    const columnsList = document.createElement("div");
    columnsList.className =
      this.theme.columnVisibilityList || "column-visibility-list";

    this.columns.forEach((column) => {
      const isRequired = column.required === true;
      const isVisible = this.isColumnVisible(column.name);

      const item = document.createElement("div");
      item.className =
        this.theme.columnVisibilityItem || "column-visibility-item";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = `col-vis-${column.name}`;
      checkbox.checked = isVisible;
      checkbox.disabled = isRequired;
      checkbox.className =
        this.theme.columnVisibilityCheckbox || "column-visibility-checkbox";

      const label = document.createElement("label");
      label.htmlFor = `col-vis-${column.name}`;
      label.textContent = column.label || column.name;
      label.className = isRequired
        ? this.theme.columnVisibilityLabelRequired ||
          "column-visibility-label-required"
        : this.theme.columnVisibilityLabel || "column-visibility-label";

      if (isRequired) {
        label.textContent += " (required)";
      }

      item.appendChild(checkbox);
      item.appendChild(label);
      columnsList.appendChild(item);

      // Handle checkbox change - this fires when checkbox is clicked directly
      checkbox.addEventListener("change", (e) => {
        e.stopPropagation();
        if (!isRequired) {
          this.toggleColumnVisibility(column.name, checkbox.checked);
          // Update checkbox state after toggle (in case it was prevented)
          checkbox.checked = this.isColumnVisible(column.name);
        } else {
          // Prevent unchecking required columns
          checkbox.checked = true;
        }
      });

      // Handle checkbox click - prevent item click from interfering, but allow default
      checkbox.addEventListener("click", (e) => {
        e.stopPropagation();
        // Allow default checkbox behavior - it will fire change event
      });

      // Handle label click - manually toggle to ensure it works
      label.addEventListener("click", (e) => {
        // Stop propagation to prevent item click handler
        e.stopPropagation();

        if (isRequired) {
          // Prevent toggling required columns
          e.preventDefault();
          return;
        }

        // Prevent default htmlFor behavior to avoid double-toggling
        // We'll handle the toggle manually
        e.preventDefault();

        // Manually toggle checkbox
        checkbox.checked = !checkbox.checked;

        // Trigger change event to ensure our handler fires
        const changeEvent = new Event("change", {
          bubbles: true,
          cancelable: true,
        });
        checkbox.dispatchEvent(changeEvent);
      });

      // Handle item click - only if clicking on the item itself (not checkbox or label)
      item.addEventListener("click", (e) => {
        // If clicking directly on checkbox or label, let their handlers deal with it
        if (
          e.target === checkbox ||
          e.target === label ||
          checkbox.contains(e.target) ||
          label.contains(e.target)
        ) {
          return;
        }
        // If clicking on the item container, toggle the checkbox
        if (!isRequired) {
          checkbox.checked = !checkbox.checked;
          checkbox.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
    });

    // Add action buttons
    const actions = document.createElement("div");
    actions.className =
      this.theme.columnVisibilityActions || "column-visibility-actions";

    const showAllBtn = document.createElement("button");
    showAllBtn.textContent = "Show All";
    const actionButtonClass =
      this.theme.columnVisibilityActionButton ||
      "column-visibility-action-button";
    showAllBtn.className = `${
      this.theme.button || "btn btn-sm"
    } ${actionButtonClass}`;
    showAllBtn.addEventListener("click", () => {
      this.showAllColumns();
      // Update all checkboxes
      this.columns.forEach((col) => {
        const cb = document.getElementById(`col-vis-${col.name}`);
        if (cb) cb.checked = this.isColumnVisible(col.name);
      });
    });

    const hideAllBtn = document.createElement("button");
    hideAllBtn.textContent = "Hide All";
    hideAllBtn.className = `${
      this.theme.button || "btn btn-sm"
    } ${actionButtonClass}`;
    hideAllBtn.addEventListener("click", () => {
      this.hideAllColumns();
      // Update all checkboxes
      this.columns.forEach((col) => {
        const cb = document.getElementById(`col-vis-${col.name}`);
        if (cb) cb.checked = this.isColumnVisible(col.name);
      });
    });

    const resetBtn = document.createElement("button");
    resetBtn.textContent = "Reset";
    resetBtn.className = `${
      this.theme.button || "btn btn-sm"
    } ${actionButtonClass}`;
    resetBtn.addEventListener("click", () => {
      this.resetColumnVisibility();
      // Update all checkboxes
      this.columns.forEach((col) => {
        const cb = document.getElementById(`col-vis-${col.name}`);
        if (cb) cb.checked = this.isColumnVisible(col.name);
      });
    });

    actions.appendChild(showAllBtn);
    actions.appendChild(hideAllBtn);
    actions.appendChild(resetBtn);

    dropdown.appendChild(columnsList);
    dropdown.appendChild(actions);

    // Find the button's parent container (controls container) for positioning
    // Try to find controls container, fallback to button's parent
    let buttonParent =
      button.closest('[class*="controls"]') ||
      button.closest(".controls-container") ||
      button.parentElement;

    // Ensure parent has relative positioning for absolute dropdown
    const parentStyle = getComputedStyle(buttonParent);
    if (parentStyle.position === "static") {
      buttonParent.style.position = "relative";
    }

    // Append dropdown to button's parent container for relative positioning
    buttonParent.appendChild(dropdown);

    // Function to update dropdown position
    const updateDropdownPosition = () => {
      if (!buttonParent) return;

      const rect = button.getBoundingClientRect();
      const parentRect = buttonParent.getBoundingClientRect();

      // Use absolute positioning relative to parent
      dropdown.style.position = "absolute";
      dropdown.style.top = `${rect.bottom - parentRect.top + 4}px`;
      dropdown.style.left = `${rect.left - parentRect.left}px`;

      // Ensure dropdown doesn't go off-screen to the right
      const dropdownWidth = dropdown.offsetWidth || 200;
      const rightEdge = rect.left - parentRect.left + dropdownWidth;
      const parentWidth = buttonParent.offsetWidth;

      if (rightEdge > parentWidth) {
        // Align to right edge of button instead
        dropdown.style.left = `${
          rect.right - parentRect.left - dropdownWidth
        }px`;
      }
    };

    // Toggle dropdown on button click
    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isVisible =
        dropdown.style.display !== "none" && dropdown.style.display !== "";

      if (isVisible) {
        dropdown.style.display = "none";
      } else {
        // Update position before showing
        updateDropdownPosition();
        dropdown.style.display = "block";

        // Update checkbox states
        this.columns.forEach((col) => {
          const cb = document.getElementById(`col-vis-${col.name}`);
          if (cb) {
            cb.checked = this.isColumnVisible(col.name);
          }
        });
      }
    });

    // Update position on scroll (if dropdown is visible)
    const handleScroll = () => {
      if (dropdown.style.display !== "none" && dropdown.style.display !== "") {
        updateDropdownPosition();
      }
    };

    // Listen to scroll events on window and scrollable parents
    window.addEventListener("scroll", handleScroll, true);
    if (buttonParent) {
      buttonParent.addEventListener("scroll", handleScroll, true);
    }

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target) && !button.contains(e.target)) {
        dropdown.style.display = "none";
      }
    });
  }

  //===================
  // FETCH DATA
  //===================

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
          this.appendRows(newData);
        } else {
          this.renderTable(this.data);
        }
      }

      if (this.pagination) {
        this.updatePagination(json);
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
        this.toggleLoadingSpinner(false);
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

  setFilter(key, value, silent = false) {
    this.filters[key] = value;
    if (!silent) {
      this.fetchData();
    }
  }

  removeFilter(key) {
    delete this.filters[key];
  }

  clearFilters() {
    this.filters = {};
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
          const newOrder = th.dataset.order === "asc" ? "desc" : "asc";
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
          filterInput.placeholder = `Filter ${column.label || column.name}...`;
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
        tr.classList.add(...this.theme.rowClass(row, rowIndex).split(" "));
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

  appendRows(rows) {
    const tbody = this.table.querySelector("tbody");
    if (!tbody) {
      console.error("DataTable: tbody not found");
      return;
    }

    if (!this.columns?.length) {
      console.error("Columns configuration is missing or empty");
      return;
    }

    const isTailwind = this.theme.framework === "tailwind";
    const isBootstrap = this.theme.framework === "bootstrap";
    const isDaisyUI = this.theme.framework === "daisyui";

    // Get current row count for animation delay
    const existingRowCount = tbody.querySelectorAll("tr").length;

    rows.forEach((row, rowIndex) => {
      const tr = document.createElement("tr");
      tr.dataset.id = row.id;

      // Apply row(theme) classes
      tr.className = this.theme.row || "";
      if (typeof this.theme.rowClass === "function") {
        tr.classList.add(
          ...this.theme.rowClass(row, existingRowCount + rowIndex).split(" ")
        );
      } else if (typeof this.theme.rowClass === "string") {
        tr.classList.add(...this.theme.rowClass.split(" "));
      }

      // Add initial hidden/fade classes
      if (isTailwind) {
        tr.classList.add(
          "opacity-0",
          "translate-y-2",
          "transition-all",
          "duration-300"
        );
      }

      if (isBootstrap) {
        tr.classList.add("opacity-0", "transition", "duration-300");
      }

      // Create and append <td>s (only for visible columns)
      this.columns.forEach((column) => {
        if (!this.isColumnVisible(column.name)) return;

        const td = document.createElement("td");
        this.renderCell(td, row, column, existingRowCount + rowIndex);
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
      td.innerHTML = column.render ? column.render(oldValue, row) : oldValue;
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

      td.innerHTML = column.render ? column.render(newValue, row) : newValue;
      row[column.name] = newValue;

      td.classList.remove(this.theme.borderLoading);
      td.classList.add(this.theme.borderSuccess);

      setTimeout(() => td.classList.remove(this.theme.borderSuccess), 1500);
    } catch (err) {
      td.innerHTML = column.render ? column.render(oldValue, row) : oldValue;

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
    if (this.prevBtn) {
      // Navigate to the previous page
      this.prevBtn.addEventListener("click", () => {
        if (this.currentPage > 1) {
          this.currentPage--;

          // Refetch data for the new page
          this.fetchData();
        }
      });
    }

    if (this.nextBtn) {
      // Navigate to the next page
      this.nextBtn.addEventListener("click", () => {
        this.currentPage++;

        // Refetch data for the new page
        this.fetchData();
      });
    }
  }

  updatePagination({ current_page, last_page, total }) {
    // Store totalPages for infinite scroll
    this.totalPages = last_page;

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

  updateSimplePagination(current_page, last_page) {
    const prevBtn = this.createNavButton("«", current_page > 1, () => {
      const prevPage = this.currentPage;
      this.currentPage = current_page - 1;

      this.fetchData();
    });

    const nextBtn = this.createNavButton("»", current_page < last_page, () => {
      const prevPage = this.currentPage;
      this.currentPage = current_page + 1;

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

      // Only attach click if it's not the current page
      if (page !== this.currentPage) {
        btn.addEventListener("click", () => {
          const prevPage = this.currentPage;
          this.currentPage = page;

          this.fetchData();
        });
      } else {
        btn.disabled = true; // optional: disable active page button
      }

      return btn;
    };

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
  goToPage(page) {
    const prevPage = this.currentPage;
    this.currentPage = page;

    this.fetchData();
  }

  goToFirstPage() {
    this.goToPage(1);
  }

  //===================
  // Infinite Scroll Pagination
  //===================

  initInfiniteScroll() {
    if (!this.infiniteScroll) return;

    this.infiniteScrollPageCount = 1;
    this.lastScrollTop = 0;
    this.infiniteScrollFetching = false;

    // Wrap table in scrollable container if not already
    this.scrollWrapper = document.createElement("div");
    this.scrollWrapper.className = this.theme.scrollWrapperClass;
    this.scrollWrapper.style.height = this.scrollWrapperHeight;
    this.scrollWrapper.id = `${this.tableId}-scroll-wrapper`;

    // Create loading indicator
    this.scrollLoader = document.createElement("div");
    this.scrollLoader.className =
      this.theme.scrollLoaderClass || "text-center py-2 text-sm text-gray-500";
    this.scrollLoader.textContent = "Loading more...";
    this.scrollLoader.style.display = "none";

    // Insert scroll wrapper and loader
    this.table.parentNode.insertBefore(this.scrollWrapper, this.table);
    this.scrollWrapper.appendChild(this.table);
    this.scrollWrapper.appendChild(this.scrollLoader);

    const container = this.scrollWrapper || window;
    const scrollTarget =
      container === window ? document.documentElement : container;

    const onScroll = () => {
      if (!this.hasMorePages()) {
        this.scrollLoader.style.display = "none";
        if (typeof this.onScrollEnd === "function") this.onScrollEnd();
        return;
      }

      const scrollTop =
        container === window
          ? window.scrollY || window.pageYOffset
          : container.scrollTop;

      const scrollHeight = scrollTarget.scrollHeight;
      const clientHeight = scrollTarget.clientHeight;

      const isScrollingDown = scrollTop > this.lastScrollTop;
      this.lastScrollTop = scrollTop;

      if (
        scrollHeight - scrollTop - clientHeight <= this.scrollOffset &&
        isScrollingDown &&
        !this.infiniteScrollFetching
      ) {
        this.infiniteScrollFetching = true;
        this.infiniteScrollPageCount++;

        // Stop if max pages reached
        if (
          this.maxScrollPages &&
          this.infiniteScrollPageCount > this.maxScrollPages
        ) {
          container.removeEventListener("scroll", onScroll);
          return;
        }

        this.scrollLoader.style.display = "block";

        this.currentPage++;

        this.fetchData().finally(() => {
          this.infiniteScrollFetching = false;
          this.scrollLoader.style.display = "none";
        });
      }
    };

    container.addEventListener("scroll", onScroll);

    // Hide pagination UI if configured
    // Use setTimeout to ensure pagination is initialized first (initPagination runs before initInfiniteScroll)
    setTimeout(() => {
      if (this.hidePaginationOnScroll && this.pagination) {
        // Try to find pagination container by multiple methods
        let paginationEl = this.paginationContainer;

        if (!paginationEl && this.paginationConfig?.container?.id) {
          paginationEl = document.getElementById(
            this.paginationConfig.container.id
          );
        }

        if (!paginationEl) {
          // Fallback: try common pagination container IDs
          paginationEl =
            document.getElementById(`${this.tableId}-pagination-container`) ||
            document.getElementById(`${this.tableId}-pagination`);
        }

        if (paginationEl) {
          paginationEl.style.display = "none";
        } else if (this.paginationWrapper) {
          // If container not found, hide wrapper directly
          this.paginationWrapper.style.display = "none";
        }
      }
    }, 100); // Small delay to ensure DOM is ready
  }
  hasMorePages() {
    return !this.totalPages || this.currentPage < this.totalPages;
  }
  resetScrollPosition() {
    if (this.scrollWrapper) {
      this.scrollWrapper.scrollTop = 0;
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
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
      if (["csv", "excel", "pdf"].includes(type) && col.exportable === false)
        return false;

      return true; // default: exportable
    });
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

      const visibleColumns = this.getExportableColumns("excel");

      worksheet.addRow(visibleColumns.map((col) => col.label || col.name));

      const exportableExcelConfig = {
        fileName: this.exportable.fileName.excel,
        chunkSize: this.exportable.chunkSize.excel,
      };

      // Get total count for progress tracking
      const totalCountParams = new URLSearchParams({
        search: this.search,
        sortBy: this.sort,
        order: this.order,
        columnFilters: JSON.stringify(this.columnFilters),
        export: "true",
        perPage: "1", // Just to get total count
      });

      let totalRecords = 0;
      try {
        const countResponse = await fetch(
          `${this.url}?${totalCountParams.toString()}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "X-Requested-With": "XMLHttpRequest",
            },
          }
        );
        const countJson = await countResponse.json();
        totalRecords = countJson.total || countJson.meta?.total || 0;
      } catch (e) {
        console.warn("Could not fetch total count, progress will be estimated");
      }

      // Show progress UI
      this.showExportProgress("excel", totalRecords || 100000);

      let page = 1;
      const chunkSize = exportableExcelConfig.chunkSize;
      const maxExcelRecords = 100000;
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
        // Check for cancellation
        if (this.exportProgress.cancelController?.signal.aborted) {
          throw new Error("Export cancelled by user");
        }

        // Adjust chunkSize dynamically if near maxExcelRecords limit
        const rowsLeft = maxExcelRecords - totalRowsExported;
        const currentChunkSize = Math.min(chunkSize, rowsLeft);

        exportParams.set("page", page);
        exportParams.set("perPage", currentChunkSize);

        // Use the cancel controller for fetch
        const controller =
          this.exportProgress.cancelController || new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

        const response = await fetch(`${this.url}?${exportParams.toString()}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest", // Laravel expects this
            "X-Requested-For": "export-chunk",
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(
            `Excel export data request failed with status: ${response.status}`
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

        // Update progress
        const progressTotal = totalRecords || maxExcelRecords;
        this.updateExportProgress(totalRowsExported, progressTotal);

        // Check if fewer rows returned than requested or max reached
        hasMoreData =
          hasMoreData &&
          dataChunk.length === currentChunkSize &&
          totalRowsExported < maxExcelRecords;
        page++;
      }

      const fileName = `${exportableExcelConfig.fileName}.xlsx`;
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

      // Hide progress and call completion callback
      this.hideExportProgress();
      if (this.exportable.onExportComplete) {
        try {
          this.exportable.onExportComplete("excel", fileName);
        } catch (error) {
          console.error("Error in onExportComplete callback:", error);
        }
      }

      console.log("Excel export completed successfully");
    } catch (error) {
      this.hideExportProgress();
      if (this.exportable.onExportError) {
        try {
          this.exportable.onExportError(error, "excel");
        } catch (err) {
          console.error("Error in onExportError callback:", err);
        }
      }
      if (error.message !== "Export cancelled by user") {
        console.error("Error exporting data:", error);
      }
    }
  }

  // ==============================
  // EXPORT TO downloadCSV
  // This method is called by the downloadCSV method to export all data
  // ==============================

  async downloadCSV() {
    try {
      const visibleColumns = this.getExportableColumns("csv");

      const exportParams = new URLSearchParams({
        search: this.search,
        sortBy: this.sort,
        order: this.order,
        columnFilters: JSON.stringify(this.columnFilters),
        export: "true",
      });

      // Get total count for progress tracking
      const totalCountParams = new URLSearchParams({
        search: this.search,
        sortBy: this.sort,
        order: this.order,
        columnFilters: JSON.stringify(this.columnFilters),
        export: "true",
        perPage: "1",
      });

      let totalRecords = 0;
      try {
        const countResponse = await fetch(
          `${this.url}?${totalCountParams.toString()}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "X-Requested-With": "XMLHttpRequest",
            },
          }
        );
        const countJson = await countResponse.json();
        totalRecords = countJson.total || countJson.meta?.total || 0;
      } catch (e) {
        console.warn("Could not fetch total count, progress will be estimated");
      }

      // Show progress UI
      this.showExportProgress("csv", totalRecords || 100000);

      // Create a CSV content builder with headers
      const headers = visibleColumns.map(
        (col) => `"${(col.name || col.label).replace(/"/g, '""')}"`
      );

      const exportableCsvConfig = {
        fileName: this.exportable.fileName.csv,
        chunkSize: this.exportable.chunkSize.csv,
      };

      let csvContent = headers.join(",") + "\r\n";
      let page = 1;
      const chunkSize = exportableCsvConfig.chunkSize;
      let hasMoreData = true;
      let totalProcessed = 0;

      while (hasMoreData) {
        // Check for cancellation
        if (this.exportProgress.cancelController?.signal.aborted) {
          throw new Error("Export cancelled by user");
        }

        // Update pagination parameters for this chunk
        exportParams.set("page", page);
        exportParams.set("perPage", chunkSize);

        try {
          const controller =
            this.exportProgress.cancelController || new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

          const response = await fetch(
            `${this.url}?${exportParams.toString()}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "X-Requested-With": "XMLHttpRequest", // Laravel expects this
                "X-Requested-For": "export-csv",
              },
              signal: controller.signal,
            }
          );

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(
              `CSV export data request failed with status: ${response.status}`
            );
          }

          const json = await response.json();
          const dataChunk = json[this.dataSrc] || [];

          // Check if this is the last chunk
          hasMoreData = dataChunk.length === chunkSize;
          totalProcessed += dataChunk.length;

          // Update progress
          const progressTotal = totalRecords || 100000;
          this.updateExportProgress(totalProcessed, progressTotal);

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
      const fileName = `${exportableCsvConfig.fileName}.csv`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url); // Clean up the URL object

      // Hide progress and call completion callback
      this.hideExportProgress();
      if (this.exportable.onExportComplete) {
        try {
          this.exportable.onExportComplete("csv", fileName);
        } catch (error) {
          console.error("Error in onExportComplete callback:", error);
        }
      }

      console.log(`CSV export completed with ${totalProcessed} records`);
    } catch (error) {
      this.hideExportProgress();
      if (this.exportable.onExportError) {
        try {
          this.exportable.onExportError(error, "csv");
        } catch (err) {
          console.error("Error in onExportError callback:", err);
        }
      }
      if (error.message !== "Export cancelled by user") {
        console.error("Error downloading CSV:", error);
        alert("Error downloading CSV. Please try again.");

        // Fallback to current page only if full export fails
        this.downloadCurrentPageCSV();
      }
    }
  }
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
      // Don't show progress modal for print - it opens in a new window
      this.toggleLoadingSpinner(true);

      const visibleColumns = this.getExportableColumns("print");

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
                <title>Print Report</title>
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
                <!-- Title and metadata removed - use customElements instead -->
                <!-- Users can add titles via customElements.print if needed -->

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

                ${
                  this.exportable.footer
                    ? `<div class="print-footer">
                    Page <span class="page-num"></span>
                </div>`
                    : ""
                }

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
  async fetchDataForPrint(printWindow) {
    try {
      const visibleColumns = this.getExportableColumns("print");

      const printTbody =
        printWindow.document.querySelector("#print-table tbody");
      const loadingDiv = printWindow.document.querySelector(".loading");

      const exportablePrintConfig = {
        fileName: this.exportable.fileName.print,
        chunkSize: this.exportable.chunkSize.print,
        footer: this.exportable.footer,
      };

      // Define the maximum records to print
      let page = 1;
      const chunkSize = exportablePrintConfig.chunkSize;
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

      while (hasMoreData) {
        // Update pagination parameters for this chunk
        exportParams.set("page", page);
        exportParams.set("perPage", chunkSize);

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

          const response = await fetch(
            `${this.url}?${exportParams.toString()}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "X-Requested-With": "XMLHttpRequest",
                "X-Requested-For": "print",
              },
              signal: controller.signal,
            }
          );

          clearTimeout(timeoutId);

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

      // Update the print window with the data
      if (printTbody) {
        loadingDiv.style.display = "none";
        printTbody.innerHTML = tableContent;

        // Apply custom elements to print window
        if (
          this.exportable?.customElements?.print &&
          Array.isArray(this.exportable.customElements.print)
        ) {
          applyElementsToPrint(
            printWindow,
            this.exportable.customElements.print
          );
        }

        // Automatically print after data is ready
        printWindow.print();

        // Call completion callback (no progress modal for print)
        if (this.exportable.onExportComplete) {
          try {
            this.exportable.onExportComplete(
              "print",
              this.exportable.fileName.print
            );
          } catch (error) {
            console.error("Error in onExportComplete callback:", error);
          }
        }
      }

      this.toggleLoadingSpinner(false);
    } catch (error) {
      // Call error callback (no progress modal for print)
      if (this.exportable.onExportError) {
        try {
          this.exportable.onExportError(error, "print");
        } catch (err) {
          console.error("Error in onExportError callback:", err);
        }
      }
      if (error.message !== "Export cancelled by user") {
        console.error("Error preparing print data:", error);
        if (printWindow && printWindow.document) {
          printWindow.document.querySelector(
            ".loading"
          ).innerHTML = `<div style="color:red;">Error preparing print data: ${error.message}</div>`;
        }
      }
    }
  }

  // ==============================
  // PDF Download
  // The downloadPdf method using jsPDF and autoTable
  // ==============================

  downloadPdf() {
    try {
      const visibleColumns = this.getExportableColumns("pdf");

      // Prepare PDF download parameters
      const exportParams = new URLSearchParams({
        search: this.search,
        sortBy: this.sort,
        order: this.order,
        columnFilters: JSON.stringify(this.columnFilters),
        export: "true",
      });

      const exportableConfig = {
        fileName: this.exportable.fileName.pdf || "datatable.pdf",
        chunkSize: this.exportable.chunkSize.pdf || 500,
        footer: this.exportable.footer || false,
      };

      // Call fetchDataForPdf with single config object
      this.fetchDataForPdf(exportableConfig, visibleColumns, exportParams);
    } catch (error) {
      console.error("Error preparing PDF download:", error);
      alert("Error preparing PDF download. Please try again.");
    }
  }
  async fetchDataForPdf(config, visibleColumns, exportParams) {
    try {
      const { fileName, chunkSize, footer } = config;

      // Get total count for progress tracking
      const totalCountParams = new URLSearchParams({
        search: this.search,
        sortBy: this.sort,
        order: this.order,
        columnFilters: JSON.stringify(this.columnFilters),
        export: "true",
        perPage: "1",
      });

      let totalRecords = 0;
      try {
        const countResponse = await fetch(
          `${this.url}?${totalCountParams.toString()}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "X-Requested-With": "XMLHttpRequest",
            },
          }
        );
        const countJson = await countResponse.json();
        totalRecords = countJson.total || countJson.meta?.total || 0;
      } catch (e) {
        console.warn("Could not fetch total count, progress will be estimated");
      }

      // Show progress UI
      this.showExportProgress("pdf", totalRecords || 100000);

      const allData = [];
      let page = 1;
      let totalProcessed = 0;
      let hasMoreData = true;

      while (hasMoreData) {
        // Check for cancellation
        if (this.exportProgress.cancelController?.signal.aborted) {
          throw new Error("Export cancelled by user");
        }

        exportParams.set("page", page);
        exportParams.set("perPage", chunkSize);

        try {
          const controller =
            this.exportProgress.cancelController || new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

          const response = await fetch(
            `${this.url}?${exportParams.toString()}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "X-Requested-With": "XMLHttpRequest", // Laravel expects this
                "X-Requested-For": "pdf-export", // Optional custom header
              },
              signal: controller.signal,
            }
          );

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(
              `PDF export data request failed with status: ${response.status}`
            );
          }

          const json = await response.json();
          const dataChunk = json[this.dataSrc] || [];

          if (dataChunk.length === 0) {
            break; // Stop if no more data
          }

          totalProcessed += dataChunk.length;

          // Update progress
          const progressTotal = totalRecords || 100000;
          this.updateExportProgress(totalProcessed, progressTotal);

          const processedChunk = dataChunk.map((row) => {
            const pdfRow = {};
            visibleColumns.forEach((column) => {
              let cellValue = row[column.name] || "";

              if (column.pdfRender) {
                cellValue = column.pdfRender(cellValue, row);
              } else if (column.render && column.useRenderForPdf) {
                cellValue = column.render(cellValue, row);
              }

              pdfRow[column.label || column.name] = cellValue;
            });
            return pdfRow;
          });

          allData.push(...processedChunk);
          // Stop if we received less than the chunk size
          hasMoreData = dataChunk.length === chunkSize;
          page++;
        } catch (error) {
          console.error("Error fetching data chunk for PDF:", error);
          hasMoreData = false;
          throw error;
        }
      }

      if (allData.length === 0) {
        this.hideExportProgress();
        console.warn("No data to export.");
        return;
      }

      await this.generatePdf({
        fileName,
        visibleColumns,
        data: allData,
        totalProcessed,
        footer,
      });

      // Hide progress and call completion callback
      this.hideExportProgress();
      if (this.exportable.onExportComplete) {
        try {
          this.exportable.onExportComplete("pdf", fileName);
        } catch (error) {
          console.error("Error in onExportComplete callback:", error);
        }
      }
    } catch (error) {
      this.hideExportProgress();
      if (this.exportable.onExportError) {
        try {
          this.exportable.onExportError(error, "pdf");
        } catch (err) {
          console.error("Error in onExportError callback:", err);
        }
      }
      if (error.message !== "Export cancelled by user") {
        console.error("PDF export failed:", error);
      }
    }
  }
  async generatePdf(config) {
    const { fileName, visibleColumns, data, totalProcessed, footer } = config;

    const pdfExportOptions = {
      orientation: this.exportable.pdfOptions.orientation,
      unit: this.exportable.pdfOptions.unit,
      format: this.exportable.pdfOptions.format,
      theme: this.exportable.pdfOptions.theme,
    };

    const doc = new jsPDF({
      orientation: pdfExportOptions.orientation, //"portrait" or "landscape" (or shortcuts "p" or "l")
      unit: pdfExportOptions.unit, //"pt" (points), "mm", "cm", "m", "in" or "px".
      format: pdfExportOptions.format, // a0 - a10, b0 - b10, c0 - c10, dl, letter, government-letter, legal, junior-legal, ledger, tabloid,credit-card
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Pre-load all images from customElements before PDF generation
    if (
      this.exportable?.customElements?.pdf &&
      Array.isArray(this.exportable.customElements.pdf)
    ) {
      const imageElements = this.exportable.customElements.pdf.filter(
        (el) => el.type === "image"
      );

      // Pre-convert all image URLs to data URLs
      for (const element of imageElements) {
        const imageSrc = element.image || element.content;
        if (
          typeof imageSrc === "string" &&
          (imageSrc.startsWith("http://") ||
            imageSrc.startsWith("https://") ||
            imageSrc.startsWith("/") ||
            imageSrc.startsWith("./")) &&
          !imageSrc.startsWith("data:")
        ) {
          try {
            const dataUrl = await this._loadImageAsDataUrl(imageSrc);
            // Update element with data URL for faster rendering
            element._preloadedDataUrl = dataUrl;
          } catch (error) {
            console.warn("Failed to pre-load image:", imageSrc, error);
          }
        }
      }
    }

    // const body = data.map((row) => {
    //     return visibleColumns.map((col) => {
    //         const key = col.name;
    //         return (
    //             row[key] ??
    //             row[col.label] ??
    //             row[key.toLowerCase().replace(/\s+/g, "_")] ??
    //             ""
    //         );
    //     });
    // });

    const headers = [visibleColumns.map((col) => col.label || col.name)];
    const body = data.map((row) => {
      return visibleColumns.map((col) => row[col.label || col.name] || "");
    });

    // Title and metadata are now handled via customElements
    // Remove default title and metadata - users can add them via customElements if needed

    // Add metadata
    // doc.setFontSize(10);
    // doc.text(
    //     `Generated on: ${new Date().toLocaleString()}`,
    //     pageWidth - 15,
    //     25,
    //     { align: "right" }
    // );

    // Apply custom elements before table (header area)
    // Apply text elements synchronously, images will be handled separately
    if (
      this.exportable?.customElements?.pdf &&
      Array.isArray(this.exportable.customElements.pdf)
    ) {
      const headerElements = this.exportable.customElements.pdf.filter(
        (el) =>
          (el.position?.includes("top") ||
            el.position === "center-left" ||
            el.position === "center-right") &&
          el.repeatOnPages !== true
      );

      // Apply text elements synchronously
      headerElements
        .filter((el) => el.type === "text")
        .forEach((el) => {
          applyTextToPdf(doc, el, pageWidth, pageHeight);
        });

      // Apply image elements asynchronously (before table generation)
      const imagePromises = headerElements
        .filter((el) => el.type === "image")
        .map((el) => applyImageToPdf(doc, el, pageWidth, pageHeight));

      // Wait for all images to load before continuing
      await Promise.all(imagePromises);
    }

    const hasFilters = this.search;
    let startY = 25;

    if (hasFilters) {
      const filterInfo = [];
      if (this.search) filterInfo.push(`Search: ${this.search}`);
      doc.setFontSize(9);
      doc.text(filterInfo.join(" | "), 15, startY);
      startY += 10; // shift down to avoid overlap
    }

    autoTable(doc, {
      startY: startY + 5,
      head: headers,
      body: body,
      theme: pdfExportOptions.theme,
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: this.exportable.pdfOptions.headerStyles.fillColor,
        textColor: this.exportable.pdfOptions.headerStyles.textColor,
      },
      margin: { top: 20 },
      didDrawPage: (dataArg) => {
        const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;
        const totalPages = doc.internal.getNumberOfPages();

        // Apply custom elements on each page
        if (
          this.exportable?.customElements?.pdf &&
          Array.isArray(this.exportable.customElements.pdf)
        ) {
          const pageElements = this.exportable.customElements.pdf.filter(
            (el) => {
              // Apply elements that should repeat on pages, or elements positioned at bottom/center
              return (
                el.repeatOnPages === true ||
                el.position?.includes("bottom") ||
                el.position === "center" ||
                (pageNumber === 1 &&
                  (el.position?.includes("top") ||
                    el.position === "center-left" ||
                    el.position === "center-right"))
              );
            }
          );

          // Apply text elements synchronously
          pageElements
            .filter((el) => el.type === "text")
            .forEach((el) => {
              applyTextToPdf(doc, el, pageWidth, pageHeight);
            });

          // Apply image elements asynchronously
          // Note: Images in didDrawPage need to be handled carefully
          // We'll apply them but they may need to be pre-loaded
          const imageElements = pageElements.filter(
            (el) => el.type === "image"
          );
          if (imageElements.length > 0) {
            // Apply images - they will be loaded asynchronously
            imageElements.forEach((el) => {
              applyImageToPdf(doc, el, pageWidth, pageHeight).catch((err) => {
                console.warn("Failed to apply image in PDF:", err);
              });
            });
          }
        }

        try {
          doc.setGState(new doc.GState({ opacity: 1 })); // default everywhere else
        } catch (e) {
          doc.setTextColor(30); // fallback: dark text
        }

        // Footer / pagination - only show if footer is enabled
        if (footer) {
          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text(
            `Page ${pageNumber} of ${totalPages} (${totalProcessed} records)`,
            pageWidth / 2,
            pageHeight - 10,
            { align: "center" }
          );
        }
      },
    });

    doc.save(fileName || "export.pdf");
  }
}
