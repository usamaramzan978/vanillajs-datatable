/**
 * Data API Methods
 * Public API methods for data operations (CRUD)
 */

/**
 * Get all table data
 * @param {Object} context - DataTable instance
 * @returns {Array} Copy of table data
 */
export function getData(context) {
    return [...context.data]; // shallow copy
}

/**
 * Get row data by ID
 * @param {Object} context - DataTable instance
 * @param {string|number} rowId - Row ID
 * @returns {Object|null} Row data or null
 */
export function getRowData(context, rowId) {
    return context.data.find((row) => row.id === rowId) || null;
}

/**
 * Get row index by ID
 * @param {Object} context - DataTable instance
 * @param {string|number} rowId - Row ID
 * @returns {number} Row index or -1
 */
export function getRowIndex(context, rowId) {
    return context.data.findIndex((row) => row.id === rowId);
}

/**
 * Get rows by field value
 * @param {Object} context - DataTable instance
 * @param {string} field - Field name
 * @param {*} value - Field value
 * @returns {Array} Matching rows
 */
export function getRowsBy(context, field, value) {
    return context.data.filter((r) => r[field] === value);
}

/**
 * Find rows where field contains value
 * @param {Object} context - DataTable instance
 * @param {string} field - Field name
 * @param {*} value - Value to search for
 * @returns {Array} Matching rows
 */
export function findRowsByFieldContains(context, field, value) {
    const v = String(value).toLowerCase();
    return context.data.filter((r) =>
        String(r[field] ?? "").toLowerCase().includes(v)
    );
}

/**
 * Add a single row
 * @param {Object} context - DataTable instance
 * @param {Object} rowData - Row data object
 * @param {boolean} silent - Don't trigger redraw
 * @returns {boolean} Success status
 */
export function addRow(context, rowData, silent = false) {
    if (!rowData.id) {
        console.warn("Each row must have a unique `id`.");
        return false;
    }

    if (getRowData(context, rowData.id)) {
        console.warn(`Row with id ${rowData.id} already exists`);
        return false;
    }

    context.data.push(rowData);

    if (!silent && context.renderTable) {
        context.renderTable(context.data);
    }

    return true;
}

/**
 * Add multiple rows
 * @param {Object} context - DataTable instance
 * @param {Array} rowsData - Array of row data objects
 * @param {boolean} silent - Don't trigger redraw
 * @returns {boolean} Success status
 */
export function addRows(context, rowsData, silent = false) {
    if (!Array.isArray(rowsData)) {
        throw new TypeError("addRows expects an array");
    }

    const added = rowsData.map((r) => addRow(context, r, true)); // silent single adds

    if (!silent && context.renderTable && added.length) {
        context.renderTable(context.data);
    }

    return added.length > 0;
}

/**
 * Update a row by ID
 * @param {Object} context - DataTable instance
 * @param {string|number} rowId - Row ID
 * @param {Object} updates - Object with fields to update
 * @param {boolean} silent - Don't trigger redraw
 * @returns {boolean} Success status
 */
export function updateRow(context, rowId, updates, silent = false) {
    const index = context.data.findIndex((row) => row.id === rowId);
    if (index === -1) return false;

    context.data[index] = { ...context.data[index], ...updates };

    if (!silent && context.renderTable) {
        context.renderTable(context.data);
    }

    return true;
}

/**
 * Update multiple rows
 * @param {Object} context - DataTable instance
 * @param {Array} updates - Array of {id, ...updates}
 * @param {boolean} silent - Don't trigger redraw
 * @returns {boolean} Success status
 */
export function updateRows(context, updates, silent = false) {
    const updated = [];
    updates.forEach(({ id, ...fields }) => {
        const result = updateRow(context, id, fields, true);
        if (result) updated.push(result);
    });

    if (!silent && context.renderTable && updated.length) {
        context.renderTable(context.data);
    }

    return updated.length > 0;
}

/**
 * Delete a row by ID
 * @param {Object} context - DataTable instance
 * @param {string|number} rowId - Row ID
 * @param {boolean} silent - Don't trigger redraw
 * @returns {boolean} Success status
 */
export function deleteRow(context, rowId, silent = false) {
    const index = context.data.findIndex((row) => row.id === rowId);
    if (index === -1) return false;

    context.data.splice(index, 1);

    if (!silent && context.renderTable) {
        context.renderTable(context.data);
    }

    return true;
}

/**
 * Delete multiple rows by IDs
 * @param {Object} context - DataTable instance
 * @param {Array} ids - Array of row IDs
 * @param {boolean} silent - Don't trigger redraw
 * @returns {boolean} Success status
 */
export function deleteRows(context, ids, silent = false) {
    if (!Array.isArray(ids)) ids = [ids];

    const removed = [];
    ids.forEach((id) => {
        const result = deleteRow(context, id, true);
        if (result) removed.push(result);
    });

    if (!silent && context.renderTable && removed.length) {
        context.renderTable(context.data);
    }

    return removed.length > 0;
}

/**
 * Redraw the table
 * @param {Object} context - DataTable instance
 */
export function redraw(context) {
    if (!context || typeof context.renderTable !== "function") {
        throw new Error("redraw(): renderTable method not found on instance");
    }
    context.renderTable(context.data);
}

/**
 * Draw/render the table
 * @param {Object} context - DataTable instance
 */
export function draw(context) {
    return redraw(context);
}
