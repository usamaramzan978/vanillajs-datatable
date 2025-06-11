import { DataTableEvents } from "./datatable-events";
import { DEFAULT_THEME } from "./datatable-theme";

export class Selectable {
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
        const rowId = row.dataset.id;
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
