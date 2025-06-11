'use strict';

var jsPDF = require('jspdf');
var autoTable = require('jspdf-autotable');

/**
 * DataTable Event Constants
 * @namespace DataTableEvents
 * @description Event names used throughout the DataTable component
 */
const DataTableEvents = {
    /**
     * Fired when the data table is initialized
     * @event DataTable#init
     */
    INIT: "init",

    /**
     * Fired when a column sort is applied or changed
     * @event DataTable#sort
     */
    SORT: "sort",

    /**
     * Fired when a filter input is changed
     * @event DataTable#filter
     */
    FILTER: "filter",

    /**
     * Fired when the page number changes (pagination)
     * @event DataTable#pageChange
     */
    PAGE_CHANGE: "pageChange",

    /**
     * Fired when data loading starts
     * @event DataTable#loading
     */
    LOADING: "loading",

    /**
     * Fired when data loading completes successfully
     * @event DataTable#loaded
     */
    LOADED: "loaded",

    /**
     * Fired when an error occurs during data fetching or processing
     * @event DataTable#error
     */
    ERROR: "error",

    /**
     * Fired when a search term is entered or changed
     * @event DataTable#search
     */
    SEARCH: "search",

    /**
     * Fired when the number of items per page is changed
     * @event DataTable#perPageChange
     */
    PER_PAGE_CHANGE: "perPageChange",

    /**
     * Fired when the data table is reset to initial state
     * @event DataTable#reset
     */
    RESET: "reset",

    /**
     * Fired when the table data is explicitly reloaded/refreshed
     * @event DataTable#reload
     */
    RELOAD: "reload",

    /**
     * Fired when table state is restored from saved state
     * @event DataTable#stateRestored
     */
    STATE_RESTORED: "stateRestored",

    // Selection-related events
    /**
     * Fired when any selection change occurs
     * @event DataTable#selectionChanged
     */
    SELECTION_CHANGED: "selectionChanged",

    /**
     * Fired when a single row is selected
     * @event DataTable#rowSelected
     */
    ROW_SELECTED: "rowSelected",

    /**
     * Fired when a single row is deselected
     * @event DataTable#rowDeselected
     */
    ROW_DESELECTED: "rowDeselected",

    /**
     * Fired when all rows are selected
     * @event DataTable#allSelected
     */
    ALL_SELECTED: "allSelected",

    /**
     * Fired when all rows are deselected
     * @event DataTable#allDeselected
     */
    ALL_DESELECTED: "allDeselected",

    ROW_ACTIVATE: "rowActivate",
};

// datatable/datatable-theme.js

/**
 * DEFAULT_THEME
 *
 * This object defines the Tailwind CSS classes used for styling various parts of the DataTable.
 * You can override this theme by passing a custom `theme` object when initializing the DataTable.
 *
 */

const DEFAULT_THEME = {
  daisyui: {
    controlsContainer: "border-base-300 border-b border-dashed",
    controlsWrapper: "flex flex-wrap items-center justify-between gap-4 p-4",
    controlsLeft: "flex items-center gap-2",
    buttonGroup: "flex items-center gap-2",

    perPageSelect: "select select-sm select-bordered",
    searchWrapper: "relative w-full max-w-xs",
    searchInput: "input input-bordered w-full pl-10",

    button: "btn btn-sm btn-outline",

    // Table structure
    table:
      "table w-full border border-base-200 rounded-xl overflow-hidden shadow-sm",
    header: "bg-base-200 text-base-content",
    headerCell: "px-4 py-3 text-sm font-semibold tracking-wide text-left",
    headerSticky: "sticky top-0 z-10 bg-base-100 shadow-md",

    // Group headers
    groupHeaderRow:
      "column-group-headers bg-base-300 text-base-content font-semibold text-center",
    groupHeaderCell: "", // add any custom group header cell classes if needed

    // Filter row & inputs
    filterRow: "bg-base-200 column-filters",
    filterInput: "input input-sm input-bordered w-full column-search",

    // Body and rows
    body: "bg-base-100 divide-y divide-base-200",
    row: "hover:bg-base-200 transition-colors duration-200",
    cell: "px-4 py-3 text-sm text-base-content",

    // Highlighting search results
    highlight: "bg-yellow-200 text-black font-semibold rounded-sm px-1",

    // Pagination layout
    paginationContainer:
      "flex justify-between items-center px-4 py-2 border-t border-gray-300 bg-base-200 text-base-content rounded-b-lg",
    paginationInfo: "text-sm text-gray-600",
    paginationWrapper: "join gap-1 mt-2",
    paginationButton: "btn btn-sm",
    paginationButtonActive: "btn-primary",
    paginationButtonDisabled: "opacity-50 cursor-not-allowed",
    paginationEllipsis: "px-2 text-gray-500",
  },
  tailwind: {
    // Top control bar
    controlsContainer: "border-b border-dashed border-gray-300",
    controlsWrapper: "flex flex-wrap items-center justify-between gap-4 p-4",
    controlsLeft: "flex items-center gap-2",
    buttonGroup: "flex items-center gap-2 cursor-pointer",

    perPageSelect:
      "w-auto text-sm border rounded px-2 py-1 bg-white shadow-sm cursor-pointer",
    searchWrapper: "relative w-full max-w-sm",
    searchInput:
      "w-full pl-10 pr-4 text-sm border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300",

    // Buttons like Reset, Reload, Excel, etc.
    button:
      "text-sm px-3 py-1.5 border rounded bg-white hover:bg-gray-100 shadow-sm transition cursor-pointer",

    // Table container
    table:
      "min-w-full table-auto border border-gray-200 rounded-lg overflow-hidden shadow-sm",
    header: "bg-gray-100 text-gray-700",
    headerCell:
      "px-4 py-3 text-sm font-semibold text-left tracking-wide whitespace-nowrap",
    headerSticky: "sticky top-0 z-10 bg-white shadow",

    // Group header (optional use)
    groupHeaderRow: "bg-gray-200 text-gray-800 font-semibold text-center",
    groupHeaderCell: "",

    // Filters
    filterRow: "bg-gray-50 column-filters",
    filterInput:
      "w-full text-sm border px-2 py-1 rounded column-search bg-white",

    // Table rows
    body: "bg-white divide-y divide-gray-200",
    row: "hover:bg-blue-50 hover:shadow-sm hover:cursor-pointer transition-colors duration-150",
    cell: "px-4 py-3 text-sm text-gray-800 whitespace-nowrap",

    // Highlighting
    highlight: "bg-yellow-200 text-black font-semibold rounded px-1",

    // Pagination
    paginationContainer:
      "flex justify-between items-center px-4 py-3 border-t border-gray-300 bg-gray-100 text-gray-800 rounded-b-lg",
    paginationInfo: "text-sm text-gray-600",
    paginationWrapper: "flex gap-1 mt-2",
    paginationButton:
      "px-3 py-1.5 text-sm border rounded hover:bg-gray-200 transition cursor-pointer",
    paginationButtonActive:
      "bg-blue-600 text-white border-blue-600 cursor-pointer",
    paginationButtonDisabled: "opacity-50 cursor-not-allowed",
    paginationEllipsis: "px-2 text-gray-500 cursor-default",
  },
  bootstrap: {
    //  Controls section (top)
    controlsContainer: "border-bottom border-light-subtle py-3 mb-3",
    controlsWrapper:
      "d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3",

    controlsLeft: "d-flex align-items-center flex-wrap gap-2",
    buttonGroup: "btn-group",
    perPageSelect: "form-select form-select-sm w-auto",

    // 🔍 Search input
    searchWrapper: "position-relative",
    searchInput: "form-control form-control-sm ps-4 rounded",

    // ⬆ Action buttons (Reset, CSV, etc.)
    button: "btn btn-secondary btn-sm",

    // 🧾 Table
    table: "table table-striped  table-hover align-middle mb-0",
    header: "table-light",
    headerCell: "text-nowrap",
    headerSticky: "sticky-top bg-light z-1",
    groupHeaderRow: "bg-dark text-white text-center fw-bold",
    groupHeaderCell: "",

    filterRow: "bg-light-subtle column-filters",
    filterInput: "form-control form-control-sm column-search",

    body: "",
    row: "align-middle",
    cell: "text-nowrap",

    highlight: "bg-warning text-dark fw-semibold px-1 rounded",

    // 📄 Pagination (bottom)
    paginationContainer:
      "d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 pt-3 mt-3 border-top",
    paginationInfo: "text-muted small mb-0",
    paginationWrapper: "btn-group",
    paginationButton: "btn btn-sm btn-outline-secondary",
    paginationButtonActive: "btn btn-sm btn-primary active",
    paginationButtonDisabled: "disabled",
    paginationEllipsis: "px-2 text-muted",
  },
};

class Selectable {
    /**
     * @class Selectable
     * @classdesc Handles row selection functionality for HTML tables
     *
     * @param {HTMLElement} tableElement - The table DOM element
     * @param {Object} options - Configuration options
     * @param {boolean} [options.selectable=false] - Enable/disable selection
     * @param {string} [options.selectMode="single"] - Selection mode ("single" or "multiple")
     * @param {string} [options.selectionClass="selected"] - CSS class for selected rows
     * @param {string} [options.selectionBgClass="bg-red-100"] - Background class for selected rows
     */
    constructor(tableElement, options = {}) {
        this.table = tableElement;
        this.selectable = options.selectable || false;
        this.selectMode = options.selectMode || "single";
        this.selectedRows = new Set();
        this.selectionClass = options.selectionClass || "selected";
        this.selectionBgClass = options.selectionBgClass || "bg-red-100";

        this.baseTheme = options.baseTheme || "daisyui"; // <== Add this
        this.theme = DEFAULT_THEME[this.baseTheme];

        if (this.selectable) {
            this._initializeSelection();
        }
    }

    // ======================
    // PRIVATE METHODS
    // ======================

    /**
     * Dispatch selection events following DataTable pattern
     * @private
     * @param {string} name - Event name without prefix
     * @param {Object} [detail={}] - Additional event details
     */
    _dispatchEvent(name, detail = {}) {
        if (!this.table) {
            console.warn(
                `Cannot dispatch selectable:${name} - table element not found`
            );
            return false;
        }

        const event = new CustomEvent(`selectable:${name}`, {
            detail: {
                ...detail,
                selectedIds: this.getSelectedIds(),
                tableId: this.table.id,
                timestamp: new Date().toISOString(),
                selectionMode: this.selectMode,
            },
            bubbles: true,
            cancelable: true,
        });

        return this.table.dispatchEvent(event);
    }

    /**
     * Dispatch deselection events when needed
     * @private
     */
    _dispatchDeselectedEvents() {
        if (this.selectedRows.size === 0) {
            this._dispatchEvent(DataTableEvents.ALL_DESELECTED);
        }
        this._dispatchEvent(DataTableEvents.SELECTION_CHANGED);
    }
    /**
     * @private
     * Initializes selection event listeners
     */
    _initializeSelection() {
        this.table.addEventListener("click", (e) => {
            const row = e.target.closest("tr");
            if (!row || !row.dataset.id) return;
            this._handleRowSelection(row);
        });
        this._addSelectionStyles();
    }
    /**
     * @private
     * Handles row selection logic
     * @param {HTMLElement} row - The row element
     */
    _handleRowSelection(row) {
        row.dataset.id;
        const isSelected = row.classList.contains(this.selectionClass);

        if (this.selectMode === "single") {
            this._clearAllSelections();
        }

        if (isSelected) {
            this._deselectRow(row);
        } else {
            this._selectRow(row);
        }
    }
    /**
     * @private
     * Selects a single row
     * @param {HTMLElement} row - The row element
     */
    _selectRow(row) {
        const rowId = row.dataset.id;
        const zebraClass = row.dataset.zebra;

        // Remove zebra striping classes if they exist
        if (zebraClass) {
            row.classList.remove(zebraClass);
        }

        row.classList.add(this.selectionClass, this.selectionBgClass);

        if (this.baseTheme === "bootstrap") {
            row.querySelectorAll("td").forEach((td) => {
                td.classList.add(
                    this.selectionBgClass || "bg-primary",
                    "text-white"
                );
            });
        }

        this.selectedRows.add(rowId);
    }

    /**
     * @private
     * Deselects a single row
     * @param {HTMLElement} row - The row element
     */
    _deselectRow(row) {
        const rowId = row.dataset.id;
        const zebraClass = row.dataset.zebra;

        row.classList.remove(this.selectionClass, this.selectionBgClass);

        // Restore zebra striping if it exists
        if (zebraClass) {
            row.classList.add(zebraClass);
        }

        if (this.baseTheme === "bootstrap") {
            row.querySelectorAll("td").forEach((td) => {
                // Remove these classes on deselect, not add
                td.classList.remove(
                    this.selectionBgClass || "bg-primary",
                    "text-white"
                );
            });
        }

        this.selectedRows.delete(rowId);
    }
    /**
     * @private
     * Clears all selections
     */
    _clearAllSelections() {
        this.table
            .querySelectorAll(`tr.${this.selectionClass}`)
            .forEach((row) => {
                this._deselectRow(row);
            });
    }
    /**
     * @private
     * Adds required CSS styles for selection
     */
    _addSelectionStyles() {
        if (!document.getElementById("selectable-table-styles")) {
            const style = document.createElement("style");
            style.id = "selectable-table-styles";
            style.textContent = `
                tr.${this.selectionClass} {
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // ======================
    // PUBLIC API METHODS
    // ======================
    /**
     * Gets array of currently selected row IDs
     * @method getSelectedIds
     * @memberof Selectable
     * @instance
     * @returns {Array<string>} Array of selected row IDs
     * @example
     * const selectedIds = table.getSelectedIds();
     * console.log('Selected rows:', selectedIds);
     */
    getSelectedIds() {
        return Array.from(this.selectedRows);
    }

    /**
     * Clears all current selections
     * @method clearSelection
     * @memberof Selectable
     * @instance
     * @example
     * table.clearSelection();
     */
    clearSelection() {
        const previouslySelected = this.getSelectedIds();
        this._clearAllSelections();
        this._dispatchEvent(DataTableEvents.ALL_DESELECTED, {
            previouslySelected,
            count: previouslySelected.length,
        });
    }

    /**
     * Selects all rows in the table (only works in "multiple" mode)
     * @method selectAll
     * @memberof Selectable
     * @instance
     * @example
     * // Only works when selectMode = "multiple"
     * table.selectAll();
     */
    selectAll() {
        if (this.selectMode === "single") return;

        const allRows = this.table.querySelectorAll("tr[data-id]");
        allRows.forEach((row) => {
            this._selectRow(row);
        });
        this._dispatchEvent(DataTableEvents.ALL_SELECTED, {
            count: allRows.length,
        });
    }

    /**
     * Toggles selection state of a specific row
     * @method toggleRowSelection
     * @memberof Selectable
     * @instance
     * @param {string} rowId - The ID of the row to toggle
     * @param {boolean} [force] - Optional: force select (true) or deselect (false)
     * @returns {boolean} New selection state (true = selected, false = deselected)
     * @example
     * // Toggle row with ID "row-123"
     * table.toggleRowSelection("row-123");
     *
     * // Force select row
     * table.toggleRowSelection("row-123", true);
     *
     * // Force deselect row
     * table.toggleRowSelection("row-123", false);
     */

    // In your Selectable class, update the toggleRowSelection method:
    // In Selectable class
    toggleRowSelection(rowId, force) {
        const row = this.table.querySelector(`tr[data-id="${rowId}"]`);
        if (!row) return false;

        const wasSelected = this.isSelected(rowId);
        let newSelected = force !== undefined ? force : !wasSelected;

        // Skip if no change needed
        if (newSelected === wasSelected) return newSelected;

        // Always update visual state first
        this._updateRowVisualState(row, newSelected);

        // Then update selection set
        if (newSelected) {
            this.selectedRows.add(rowId);
        } else {
            this.selectedRows.delete(rowId);
        }

        return newSelected;
    }

    /**
     * @private
     * Ensures visual state matches selection state
     */
    _updateRowVisualState(row, shouldBeSelected) {
        if (shouldBeSelected) {
            // Add selection classes
            row.classList.add(this.selectionClass, this.selectionBgClass);
            // Remove zebra striping if exists
            if (row.dataset.zebra) {
                row.classList.remove(row.dataset.zebra);
            }
        } else {
            // Remove selection classes
            row.classList.remove(this.selectionClass, this.selectionBgClass);
            // Restore zebra striping if exists
            if (row.dataset.zebra) {
                row.classList.add(row.dataset.zebra);
            }
        }
    }
    /**
     * Checks if a specific row is currently selected
     * @method isSelected
     * @memberof Selectable
     * @instance
     * @param {string} rowId - The ID of the row to check
     * @returns {boolean} True if row is selected, false otherwise
     * @example
     * if (table.isSelected("row-123")) {
     *     console.log("Row is selected");
     * }
     */
    isSelected(rowId) {
        return this.selectedRows.has(rowId);
    }

    /**
     * Registers a callback for selection change events
     * @method onSelectionChange
     * @memberof Selectable
     * @instance
     * @param {function(Array<string>):void} callback - Function to call when selection changes
     * @example
     * table.onSelectionChange((selectedIds) => {
     *     console.log("New selection:", selectedIds);
     *     document.getElementById("count").textContent = selectedIds.length;
     * });
     */
    onSelectionChange(callback) {
        this.table.addEventListener("click", (e) => {
            const row = e.target.closest("tr");
            if (row && row.dataset.id) {
                // Dispatch general selection change event
                callback(this.getSelectedIds());
            }
        });
    }
}

// Navigation Keys
// | Key           | Action                             |
// | ------------- | ---------------------------------- |
// | `ArrowUp`     | Select previous row                |
// | `ArrowDown`   | Select next row                    |
// | `ArrowLeft`   | Go to previous page (calls method) |
// | `ArrowRight`  | Go to next page (calls method)     |
// | `Home`        | Go to first row                    |
// | `Ctrl + Home` | Go to first page (calls method)    |
// | `End`         | Go to last row                     |
// | `Ctrl + End`  | Go to last page (calls method)     |

// Action Keys (with modifier)
// | Shortcut   | Action             |
// | ---------- | ------------------ |
// | `Ctrl + P` | Print              |
// | `Ctrl + S` | Focus search input |
// | `Ctrl + E` | Export to Excel    |
// | `Ctrl + C` | Export to CSV      |
// | `Ctrl + D` | Export to PDF      |
// | `Ctrl + R` | Reload data        |
// | `Ctrl + F` | Focus search input |
// | `Ctrl + Z` | Reset table        |

// Action Keys (no modifier)
// | Key      | Action                                |
// | -------- | ------------------------------------- |
// | `/`      | Focus search input                    |
// | `a`      | Select all rows (if in multiple mode) |
// | `Space`  | Toggle selection of current row       |
// | `Enter`  | Trigger row activation (open row)     |
// | `Escape` | Clear all selected rows               |

class KeyboardNavigation {
    /**
     * @class KeyboardNavigation
     * @classdesc Handles keyboard navigation for DataTable
     *
     * @param {HTMLElement} tableElement - The table DOM element
     * @param {Object} options - Configuration options
     * @param {Selectable} options.selectable - The Selectable instance
     * @param {Function} options.getData - Function to get current table data
     * @param {boolean} [options.enabled=true] - Enable/disable keyboard nav
     */
    constructor(tableElement, { selectable, getData, enabled = true, main }) {
        this.table = tableElement;
        this.selectable = selectable;
        this.getData = getData;
        this.enabled = enabled;
        this.lastSelectedRow = null;
        this._boundKeyHandler = this.handleKeyDown.bind(this);
        this.main = main;

        if (this.enabled) {
            this.init();
        }
    }

    /**
     * Initialize keyboard navigation
     */
    init() {
        document.addEventListener("keydown", this._boundKeyHandler);
        return this;
    }

    /**
     * Destroy keyboard navigation
     */
    destroy() {
        document.removeEventListener("keydown", this._boundKeyHandler);
        this.lastSelectedRow = null;
    }

    /**
     * Handle keyboard events
     * @param {KeyboardEvent} e
     */
    handleKeyDown(e) {
        if (!this.enabled) return;
        if (this._shouldIgnoreKeyEvent(e)) return;

        // Navigation keys
        switch (e.key) {
            case "ArrowUp":
                e.preventDefault();
                this.navigateRow(-1);
                break;

            case "ArrowDown":
                e.preventDefault();
                this.navigateRow(1);
                break;

            case "ArrowLeft":
                e.preventDefault();
                this._navigatePage(-1);
                break;

            case "ArrowRight":
                e.preventDefault();
                this._navigatePage(1);
                break;

            case "Home":
                e.preventDefault();
                if (e.ctrlKey) {
                    this._goToFirstPage();
                } else {
                    this._goToFirstRow();
                }
                break;

            case "Enter":
                e.preventDefault();
                this.openSelectedRow();
                break;

            case "Escape":
                e.preventDefault();
                this.selectable.clearSelection();
                break;
        }

        // Action keys (with modifiers)
        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case "p":
                    e.preventDefault();
                    this._triggerPrint();
                    break;
                case "s":
                    e.preventDefault();
                    this._triggerSearch();
                    break;
                case "e":
                    e.preventDefault();
                    this._triggerExport("excel");
                    break;
                case "c":
                    e.preventDefault();
                    this._triggerExport("csv");
                    break;
                case "d":
                    e.preventDefault();
                    this._triggerExport("pdf");
                    break;
                case "r":
                    e.preventDefault();
                    this.reloadData();
                    break;
                case "f":
                    e.preventDefault();
                    this._focusSearchInput();
                    break;
                case "z":
                    e.preventDefault();
                    this._triggerReset();
                    break;
            }
        }

        // Single key shortcuts (without modifiers)
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
            switch (e.key) {
                case "/":
                    e.preventDefault();
                    this._focusSearchInput();
                    break;
                case "a":
                    if (this.selectable.selectMode === "multiple") {
                        e.preventDefault();
                        this.selectable.selectAll();
                    }
                    break;
                case " ":
                    e.preventDefault();
                    this._toggleRowSelection();
                    break;
            }
        }
    }

    /**
     * Reload table data
     */

    /**
     * Navigate between rows
     * @param {number} direction - 1 for down, -1 for up
     */
    navigateRow(direction) {
        const rows = this._getVisibleRows();
        if (rows.length === 0) return;

        const currentIndex = this._getCurrentRowIndex(rows);
        const newIndex = Math.max(
            0,
            Math.min(currentIndex + direction, rows.length - 1)
        );

        if (currentIndex !== newIndex) {
            if (
                this.selectable.selectMode === "single" &&
                this.lastSelectedRow
            ) {
                this.selectable.toggleRowSelection(
                    this.lastSelectedRow.dataset.id,
                    false
                );
            }

            this._selectRow(rows[newIndex]);
        }
    }

    /**
     * Open the currently selected row
     */
    openSelectedRow() {
        const selectedIds = this.selectable.getSelectedIds();
        if (selectedIds.length === 0) return;

        this.table.dispatchEvent(
            new CustomEvent(`datatable:${DataTableEvents.ROW_ACTIVATE}`, {
                detail: {
                    rowId: selectedIds[0],
                    rowData: this.getData().find(
                        (item) => item.id === selectedIds[0]
                    ),
                    timestamp: new Date().toISOString(),
                },
                bubbles: true,
            })
        );
    }

    // ======================
    // PRIVATE METHODS
    // ======================

    _shouldIgnoreKeyEvent(e) {
        return (
            ["INPUT", "TEXTAREA", "SELECT"].includes(
                document.activeElement.tagName
            ) ||
            (e.ctrlKey && e.key.toLowerCase() === "c") || // Allow Ctrl+C for copy
            e.altKey
        );
    }

    _getVisibleRows() {
        return Array.from(this.table.querySelectorAll("tbody tr[data-id]"));
    }

    _getCurrentRowIndex(rows) {
        if (this.lastSelectedRow) {
            return rows.indexOf(this.lastSelectedRow);
        }

        const selectedIds = this.selectable.getSelectedIds();
        if (selectedIds.length > 0) {
            this.lastSelectedRow = this.table.querySelector(
                `tr[data-id="${selectedIds[0]}"]`
            );
            return rows.indexOf(this.lastSelectedRow);
        }

        return -1;
    }

    _selectRow(row) {
        this.selectable.toggleRowSelection(row.dataset.id, true);
        this.lastSelectedRow = row;
        this._scrollRowIntoView(row);

        this.table.dispatchEvent(
            new CustomEvent(`datatable:${DataTableEvents.ROW_ACTIVATE}`, {
                detail: {
                    rowId: row.dataset.id,
                    rowData: this.getData().find(
                        (item) => item.id === row.dataset.id
                    ),
                    timestamp: new Date().toISOString(),
                },
                bubbles: true,
            })
        );
    }

    _scrollRowIntoView(row) {
        row.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "nearest",
        });
    }

    _focusSearchInput() {
        const searchInput =
            document.getElementById(`${this.table.id}-search-input`) ||
            this.table.querySelector(".datatable-search-input") ||
            document.querySelector("input[data-datatable-search]");

        if (searchInput) {
            searchInput.focus();
            searchInput.select();
            return true;
        }

        console.warn("Search input not found for table:", this.table.id);
        return false;
    }

    _toggleRowSelection() {
        const rows = this._getVisibleRows();
        if (rows.length === 0) return;

        const currentIndex = this._getCurrentRowIndex(rows);
        if (currentIndex >= 0) {
            const row = rows[currentIndex];
            const isSelected = this.selectable
                .getSelectedIds()
                .includes(row.dataset.id);
            this.selectable.toggleRowSelection(row.dataset.id, !isSelected);
        }
    }

    _goToFirstRow() {
        const rows = this._getVisibleRows();
        if (rows.length > 0) {
            this._selectRow(rows[0]);
        }
    }

    _goToLastRow() {
        const rows = this._getVisibleRows();
        if (rows.length > 0) {
            this._selectRow(rows[rows.length - 1]);
        }
    }

    // Ctrl + Home
    _goToFirstPage() {
        if (this.main?.goToFirstPage) {
            this.main.goToFirstPage();
        }
    }
    // Ctrl + F , Ctrl + S , /
    _triggerSearch() {
        this._focusSearchInput();
    }

    _triggerExport(format) {
        if (!this.main || !this.main.buttonConfig) return;

        const config = this.main.buttonConfig;

        if (format === "csv" && config.downloadCsv?.enabled !== false) {
            // Ctrl + C
            this.main.downloadCSV();
        } else if (format === "pdf" && config.downloadPdf?.enabled !== false) {
            // Ctrl + D
            this.main.downloadPdf();
        } else if (
            // Ctrl + E
            format === "excel" &&
            config.exportExcel?.enabled !== false
        ) {
            this.main.exportToExcel();
        } else {
            console.warn(
                `Export format "${format}" is disabled or unsupported.`
            );
        }
    }

    // Ctrl + P
    _triggerPrint() {
        if (
            this.main.printTable &&
            this.main.buttonConfig?.print?.enabled !== false
        ) {
            this.main.printTable();
        }
    }

    // Ctrl + Z
    _triggerReset() {
        if (
            this.main.resetTable &&
            this.main.buttonConfig?.reset?.enabled !== false
        ) {
            this.main.resetTable();
        }
    }

    // Ctrl + R
    reloadData() {
        this.main.fetchData();
    }
}

/**
 * Data Methods for DataTable
 * Provides CRUD operations and data management utilities
 */
function loadData(dataArray) {
    this.data = dataArray;
    this._renderTable();
}

function getData() {
    return [...this.data];
}
function getRowIndex(rowId) {
    return this.data.findIndex((row) => row.id === rowId);
}

function getRowData(rowId) {
    return this.data.find((row) => row.id === rowId) || null;
}

function updateRow(rowId, newData) {
    const index = this.data.findIndex((row) => row.id === rowId);
    if (index === -1) return false;

    this.data[index] = { ...this.data[index], ...newData };
    this._renderTable();
    return true;
}

function deleteRow(rowId) {
    const index = this.data.findIndex((row) => row.id === rowId);
    if (index === -1) return false;

    this.data.splice(index, 1);
    this._renderTable();
    return true;
}

function addRow(data, silent = false, prepend = false) {
    if (!data.id) {
        console.warn("Each row must have a unique `id`.");
        return false;
    }

    if (this.getRowData(data.id)) {
        console.warn(`Row with id ${data.id} already exists`);
        return false;
    }

    prepend ? this.data.unshift(data) : this.data.push(data);

    if (!silent) {
        this._renderTable();
        this.dispatchEvent(DataTableEvents.ROW_ADDED, {
            id: data.id,
            data,
            index: prepend ? 0 : this.data.length - 1,
        });
    }

    return true;
}

function findRowsByFieldContains(field, value) {
    return this.data.filter(
        (row) =>
            row[field] &&
            String(row[field])
                .toLowerCase()
                .includes(String(value).toLowerCase())
    );
}
function findDataRows(predicate) {
    if (typeof predicate !== "function") {
        console.error("Predicate must be a function");
        return [];
    }

    if (!Array.isArray(this.data)) {
        console.error("Table data is not an array");
        return [];
    }

    // console.log("Searching in data:", this.data); // Debug log

    const result = this.data.filter(predicate);
    // console.log("Filter results:", result); // Debug log

    return result;
}

/**
 * Force re-rendering of the DataTable UI
 * Useful for manual refresh after internal state changes
 */
function redraw() {
    if (typeof this._renderTable === "function") {
        this._renderTable();
    } else {
        console.warn("No _renderTable method found.");
    }
}

function exportJSON(data, filename = "table-data.json") {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();

    URL.revokeObjectURL(link.href);
}

function setSort(column, direction = "asc") {
    if (!["asc", "desc"].includes(direction)) {
        console.warn(
            `Invalid sort direction "${direction}" - must be "asc" or "desc"`
        );
        return;
    }

    this.sort = column;
    this.order = direction;

    // Fetch data from server with new sorting applied
    this.fetchData();
}

function clearSort() {
    this.sort = "";
    this.order = "";

    // Fetch data without sorting
    this.fetchData();
}

function copyToClipboard(format = "csv") {
    const visibleData = this.data; // current page data

    if (!visibleData || visibleData.length === 0) {
        alert("No data to copy.");
        return;
    }

    const headers = this.columns
        .filter((col) => col.visible !== false && col.name !== "actions") // exclude non-visible or action columns
        .map((col) => col.label || col.name);

    const rows = visibleData.map((row) => {
        return this.columns
            .filter((col) => col.visible !== false && col.name !== "actions")
            .map((col) => row[col.name] ?? "")
            .join(format === "csv" ? "," : "\t");
    });

    const dataString = [
        headers.join(format === "csv" ? "," : "\t"),
        ...rows,
    ].join("\n");

    // Copy to clipboard
    navigator.clipboard
        .writeText(dataString)
        .then(() => {
            console.log("Table data copied to clipboard");
        })
        .catch((err) => {
            console.error("Failed to copy data:", err);
        });
}

function goToPage(pageNumber) {
    const page = parseInt(pageNumber, 10);
    if (
        isNaN(page) ||
        page < 1 ||
        (this.totalPages && page > this.totalPages)
    ) {
        console.warn(`Invalid page number: ${pageNumber}`);
        return;
    }
    this.currentPage = page;
    this.fetchData(); // Re-fetch data for the new page
}

function setPageSize(size) {
    const perPage = parseInt(size, 10);
    if (isNaN(perPage) || perPage <= 0) {
        console.warn(`Invalid page size: ${size}`);
        return;
    }

    this.rowsPerPage = perPage;
    this.currentPage = 1; // Reset to first page when page size changes
    this.fetchData();
}

function getCurrentPage() {
    return this.currentPage;
}

class DataTable {
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

    theme = {}, // default to empty object
    baseTheme = "daisyui",
  }) {
    // this.theme = {
    //     ...DEFAULT_THEME,
    //     ...theme,
    // };
    const selectedTheme = DEFAULT_THEME[baseTheme] || DEFAULT_THEME.daisyui;

    this.theme = {
      ...selectedTheme,
      ...theme, // override specific classes
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
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rotate-ccw-icon lucide-rotate-ccw"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`,
        text: "Reset",
      },
      reload: {
        id: reloadBtnId || `${tableId}-reload-button`,
        enabled: reloadBtn,
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-refresh-ccw-icon lucide-refresh-ccw"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>`,
        text: "Reload",
      },
      print: {
        id: printBtnId || `${tableId}-print-button`,
        enabled: printBtn,
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-printer-check-icon lucide-printer-check"><path d="M13.5 22H7a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v.5"/><path d="m16 19 2 2 4-4"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/></svg>`,
        text: "Print",
      },
      export: {
        id: exportBtnId || `${tableId}-export-button`,
        enabled: exportBtn,
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-squares-exclude-icon lucide-squares-exclude"><path d="M16 12v2a2 2 0 0 1-2 2H9a1 1 0 0 0-1 1v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h0"/><path d="M4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3a1 1 0 0 1-1 1h-5a2 2 0 0 0-2 2v2"/></svg>`,
        text: "Excel",
      },
      downloadCsv: {
        id: downloadCsvBtnId || `${tableId}-download-csv-button`,
        enabled: downloadCsvBtn,
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-check2-icon lucide-file-check-2"><path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m3 15 2 2 4-4"/></svg>`,
        text: "CSV",
      },
      pdf: {
        id: pdfBtnId || `${tableId}-download-pdf-button`,
        enabled: pdfBtn,
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text-icon lucide-file-text"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>`,
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
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search-icon lucide-search"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>`,
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
      baseTheme,
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

    if (selectedIds.length === 0) {
      alert("Please select at least one row to export.");
      return;
    }

    const selectedData = this.data.filter((row) =>
      selectedIds.includes(String(row.id))
    );

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
    console.log("Loading state" + this.table);
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
    const reloadButton = document.getElementById(this.buttonConfig.reload.id);
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
    const button = document.getElementById(this.buttonConfig.downloadCsv.id);
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
    const searchInput = document.getElementById(this.buttonConfig.search.id);

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

          // Dispatch sort event
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
  getNeutralSortIcon() {
    return `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
             xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round" style="color: #9ca3af;">
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
             stroke-linecap="round" stroke-linejoin="round" style="color: #4b5563;">
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
             stroke-linecap="round" stroke-linejoin="round" style="color: #4b5563;">
            <path d="m3 16 4 4 4-4" />
            <path d="M7 20V4" />
            <path d="M11 4h4" />
            <path d="M11 8h7" />
            <path d="M11 12h10" />
        </svg>
    `;
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

      // Apply row(theme) classes
      tr.className = this.theme.row || "";
      if (typeof this.theme.rowClass === "function") {
        tr.classList.add(...this.theme.rowClass(row, rowIndex).split(" "));
      } else if (typeof this.theme.rowClass === "string") {
        tr.classList.add(...this.theme.rowClass.split(" "));
      }

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
  goToPage(page) {
    const prevPage = this.currentPage;
    this.currentPage = page;
    this.dispatchEvent(DataTableEvents.PAGE_CHANGE, {
      fromPage: prevPage,
      toPage: this.currentPage,
    });
    this.fetchData();
  }

  /**
   * Navigates to first page
   */
  goToFirstPage() {
    this.goToPage(1);
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
      const { default: ExcelJS } = await import('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sheet1");

      const visibleColumns = this.columns.filter(
        (col) => col.visible !== false
      );
      worksheet.addRow(visibleColumns.map((col) => col.label || col.name));

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

// Optional: global binding for browser usage
if (typeof window !== "undefined") {
  window.TailwindDataTable = DataTable;
}

// import DataTable from 'tailwind-datatable';

module.exports = DataTable;
