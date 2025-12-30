
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

export class KeyboardNavigation {
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
            new CustomEvent(`datatable:row-activate`, {
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
            new CustomEvent(`datatable:row-activate`, {
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
