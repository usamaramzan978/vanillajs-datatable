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
        this.baseTheme = options.baseTheme || "tailwind";
        this.theme = DEFAULT_THEME[this.baseTheme];

        if (this.selectable) {
            this._initializeSelection();
        }
    }

    // ======================
    // PRIVATE METHODS
    // ======================

    _initializeSelection() {
        this.table.addEventListener("click", (e) => {
            const row = e.target.closest("tr");
            if (!row || !row.dataset.id) return;
            this._handleRowSelection(row);
        });
        this._addSelectionStyles();
    }

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

    _selectRow(row) {
        const rowId = row.dataset.id;
        const zebraClass = row.dataset.zebra;

        // Remove zebra striping classes if they exist
        if (zebraClass) {
            row.classList.remove(zebraClass);
        }

        row.classList.add(
            ...this.selectionClass.split(" "),
            this.selectionBgClass
        );

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

    _deselectRow(row) {
        const rowId = row.dataset.id;
        const zebraClass = row.dataset.zebra;

        // Always remove classes
        const classesToRemove = [
            ...this.selectionClass.split(" "),
            this.selectionBgClass,
        ];
        row.classList.remove(...classesToRemove);

        // Restore zebra striping
        if (zebraClass) {
            row.classList.add(zebraClass);
        }

        if (this.baseTheme === "bootstrap") {
            row.querySelectorAll("td").forEach((td) => {
                td.classList.remove(
                    this.selectionBgClass || "bg-primary",
                    "text-white"
                );
            });
        }

        // Tailwind fallback: do it again to be safe
        if (this.baseTheme === "tailwind") {
            classesToRemove.forEach((cls) => row.classList.remove(cls));
        }

        this.selectedRows.delete(rowId);
    }

    _clearAllSelections() {
        this.table
            .querySelectorAll(`tr.${this.selectionClass}`)
            .forEach((row) => {
                this._deselectRow(row);
            });
        const selectedRows = this.table.querySelectorAll(
            `tr.${this.selectionClass}`
        );
        selectedRows.forEach((row) => {
            this._deselectRow(row);
        });
    }

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

    // ======================
    // PUBLIC API METHODS
    // ======================

    isSelected(rowId) {
        return this.selectedRows.has(rowId);
    }
    onSelectionChange(callback) {
        this.table.addEventListener("click", (e) => {
            const row = e.target.closest("tr");
            if (row && row.dataset.id) {
                // Dispatch general selection change event
                callback(this.getSelectedIds());
            }
        });
    }

    getSelectedIds() {
        return Array.from(this.selectedRows);
    }
    clearSelection() {
        const previouslySelected = this.getSelectedIds();
        this._clearAllSelections();
    }

    selectAll() {
        if (this.selectMode === "single") return;

        const allRows = this.table.querySelectorAll("tr[data-id]");
        allRows.forEach((row) => {
            this._selectRow(row);
        });
    }
    toggleRowSelection(rowId, force) {
        const row = this.table.querySelector(`tr[data-id="${rowId}"]`);
        if (!row) return false;

        const isSelected = this.selectedRows.has(rowId);
        const shouldSelect = force !== undefined ? force : !isSelected;

        // Skip if no change needed
        if (shouldSelect === isSelected) return isSelected;

        if (shouldSelect) {
            if (this.selectMode === "single") {
                this._clearAllSelections();
            }
            this._selectRow(row);
        } else {
            this._deselectRow(row);
        }

        return shouldSelect;
    }

    // ========= 1. Query helpers =========
    getSelectedRows() {
        return Array.from(
            this.table.querySelectorAll(`tr.${this.selectionClass}`)
        );
    }

    getSelectedData() {
        return this.getSelectedRows().map((tr) =>
            JSON.parse(tr.dataset.row || "{}")
        );
    }

    getSelectedCount() {
        return this.selectedRows.size;
    }

    // ========= 2. Granular selection =========
    setSelection(ids = []) {
        this.clearSelection();
        ids.forEach((id) => this.toggleRowSelection(id, true));
        return this.selectedRows.size;
    }

    invertSelection() {
        if (this.selectMode === "single") {
            const firstRow = this.table.querySelector("tr[data-id]");
            if (!firstRow) return;
            this.toggleRowSelection(firstRow.dataset.id); // let toggle do the work
            return;
        }

        // build a *single* NodeList once
        const rows = Array.from(
            this.table.querySelectorAll("tbody tr[data-id]")
        );
        rows.forEach((row) => {
            const id = row.dataset.id;
            const shouldSelect = !this.isSelected(id);

            // 1. update Set
            shouldSelect
                ? this.selectedRows.add(id)
                : this.selectedRows.delete(id);

            // 2. update visuals & events
            shouldSelect ? this._selectRow(row) : this._deselectRow(row);
        });
    }

    selectRange(fromId, toId) {
        if (this.selectMode === "single") return;

        const rows = Array.from(this.table.querySelectorAll("tr[data-id]"));
        const fromIx = rows.findIndex((r) => r.dataset.id === fromId);
        const toIx = rows.findIndex((r) => r.dataset.id === toId);

        if (fromIx === -1 || toIx === -1) return;

        const [start, end] = fromIx < toIx ? [fromIx, toIx] : [toIx, fromIx];
        for (let i = start; i <= end; i++) {
            this.toggleRowSelection(rows[i].dataset.id, true);
        }
    }

    // ========= 3. Programmatic control =========
    setSelectable(flag = true) {
        this.selectable = Boolean(flag);
    }

    setSelectMode(mode) {
        if (!["single", "multiple"].includes(mode)) return;
        this.selectMode = mode;
        if (mode === "single" && this.selectedRows.size > 1) {
            const keep = this.getSelectedIds()[0];
            this.clearSelection();
            this.toggleRowSelection(keep, true);
        }
    }

    destroy() {
        this.clearSelection();
        // remove click listener that was added in _initializeSelection
        this.table.removeEventListener("click", this._boundClickHandler);
        // optional: remove injected <style> if you kept a reference
    }
}
