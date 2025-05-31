import { DataTableEvents } from "../datatable-events";
/**
 * Data Methods for DataTable
 * Provides CRUD operations and data management utilities
 */
export function loadData(dataArray) {
    this.data = dataArray;
    this._renderTable();
}

export function getData() {
    return [...this.data];
}
export function getRowIndex(rowId) {
    return this.data.findIndex((row) => row.id === rowId);
}

export function getRowData(rowId) {
    return this.data.find((row) => row.id === rowId) || null;
}

export function updateRow(rowId, newData) {
    const index = this.data.findIndex((row) => row.id === rowId);
    if (index === -1) return false;

    this.data[index] = { ...this.data[index], ...newData };
    this._renderTable();
    return true;
}

export function deleteRow(rowId) {
    const index = this.data.findIndex((row) => row.id === rowId);
    if (index === -1) return false;

    this.data.splice(index, 1);
    this._renderTable();
    return true;
}

export function addRow(data, silent = false, prepend = false) {
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

export function findRowsByFieldContains(field, value) {
    return this.data.filter(
        (row) =>
            row[field] &&
            String(row[field])
                .toLowerCase()
                .includes(String(value).toLowerCase())
    );
}
export function findDataRows(predicate) {
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
export function redraw() {
    if (typeof this._renderTable === "function") {
        this._renderTable();
    } else {
        console.warn("No _renderTable method found.");
    }
}

export const draw = redraw; // jQuery-style alias
