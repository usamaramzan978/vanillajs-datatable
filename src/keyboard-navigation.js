import { DataTableEvents } from "./datatable-events";

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
    constructor(tableElement, { selectable, getData, enabled = true }) {
        this.table = tableElement;
        this.selectable = selectable;
        this.getData = getData;
        this.enabled = enabled;
        this.lastSelectedRow = null;

        if (this.enabled) {
            this.init();
        }
    }

    /**
     * Initialize keyboard navigation
     */
    init() {
        document.addEventListener("keydown", this.handleKeyDown.bind(this));
        return this;
    }

    /**
     * Destroy keyboard navigation
     */
    destroy() {
        document.removeEventListener("keydown", this.handleKeyDown);
        this.lastSelectedRow = null;
    }

    /**
     * Handle keyboard events
     * @param {KeyboardEvent}
     */
    handleKeyDown(e) {
        if (!this.enabled) return;
        if (this._shouldIgnoreKeyEvent(e)) return;
        console.log("Key:", e.key, "Ctrl:", e.ctrlKey, "Shift:", e.shiftKey);
        switch (e.key) {
            case "ArrowUp":
                e.preventDefault();
                this.navigateRow(-1);
                break;

            case "ArrowDown":
                e.preventDefault();
                this.navigateRow(1);
                break;

            case "Enter":
                e.preventDefault();
                this.openSelectedRow();
                break;

            case "Escape":
                e.preventDefault();
                this.selectable.clearSelection();
                break;

            case "a":
                if (e.key && this.selectable.selectMode === "multiple") {
                    e.preventDefault();
                    this.selectable.selectAll();
                    // console.log("selectMode:", this.selectable.selectMode); // should be "multiple"
                }
                break;
            case "/":
            case "f":
                if (
                    e.key === "/" ||
                    (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "f") //ctrl + shift + f
                ) {
                    e.preventDefault();
                    e.stopPropagation(); // Prevent browser from handling it
                    this._focusSearchInput();
                }
                break;
        }
    }

    /**
     * Reload table data
     */
    reloadData() {
        this.table.dispatchEvent(
            new CustomEvent("datatable:reload", {
                bubbles: true,
            })
        );
        console.log("Reloading table data...");
    }
    /**
     * Focus the search input field
     * @private
     */
    _focusSearchInput() {
        // Try multiple ways to find the search input
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
    /**
     * Navigate between rows
     * @param {number} direction - 1 for down, -1 for up
     */
    navigateRow(direction) {
        console.log(
            "Available rows:",
            this._getVisibleRows().map((r) => r.dataset.id)
        );

        const rows = this._getVisibleRows();
        if (rows.length === 0) return;

        const currentIndex = this._getCurrentRowIndex(rows);
        const newIndex = Math.max(
            0,
            Math.min(currentIndex + direction, rows.length - 1)
        );

        // Only proceed if we're actually moving to a different row
        if (currentIndex !== newIndex) {
            // Clear previous selection in single select mode
            if (
                this.selectable.selectMode === "single" &&
                this.lastSelectedRow
            ) {
                this.selectable.toggleRowSelection(
                    this.lastSelectedRow.dataset.id,
                    false
                );
            }

            // Select new row
            this._selectRow(rows[newIndex]);
        }
    }

    _selectRow(row) {
        this.selectable.toggleRowSelection(row.dataset.id, true);
        this.lastSelectedRow = row;
        this._scrollRowIntoView(row);
        console.log("Selecting row with ID:", row.dataset.id);

        // Dispatch selection event
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
            e.ctrlKey ||
            e.altKey ||
            e.metaKey
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

    // _selectRow(row) {
    //     this.selectable.toggleRowSelection(row.dataset.id, true);
    //     this.lastSelectedRow = row;
    //     this._scrollRowIntoView(row);
    // }

    _scrollRowIntoView(row) {
        row.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "nearest",
        });
    }
}
