// ------------------------------------------
//  DataTable CRUD  –  dataMethods.js
// ------------------------------------------

/* ---------- 1.  Read helpers ---------- */

/**
 * Returns a shallow copy of the current data array.
 * @returns {Array<Object>} Copy of the table data
 */
export function getData() {
  return [...this.data]; // shallow copy
}

/**
 * Returns the row object matching the given id.
 * @param {string|number} rowId - Unique identifier of the row
 * @returns {Object|null} The row object or null if not found
 */
export function getRowData(rowId) {
  return this.data.find((row) => row.id === rowId) || null;
}

/**
 * Returns the index of the row with the given id.
 * @param {string|number} rowId - Unique identifier of the row
 * @returns {number} Row index or -1 if not found
 */
export function getRowIndex(rowId) {
  return this.data.findIndex((row) => row.id === rowId);
}

/**
 * Returns every row whose exact field value matches the supplied value.
 * @param {string} field - Property name to inspect
 * @param {*} value - Exact value to match
 * @returns {Array<Object>} Array of matching rows
 */
export function getRowsBy(field, value) {
  return this.data.filter((r) => r[field] === value);
}

/**
 * Case-insensitive, partial match on a given field.
 * @param {string} field - Property name to search
 * @param {string} value - Sub-string to look for (case-insensitive)
 * @returns {Array<Object>} Array of matching rows
 */
export function findRowsByFieldContains(field, value) {
  const v = String(value).toLowerCase();
  return this.data.filter((r) =>
    String(r[field] ?? "")
      .toLowerCase()
      .includes(v)
  );
}

/* ---------- 2.  Create ---------- */

/**
 * Adds a single row to the table.
 * @param {Object} data - Row object (must contain a unique `id`)
 * @param {boolean} [silent=false] - Skip re-render and event dispatch
 * @param {boolean} [prepend=false] - Insert at the start of the array
 * @returns {Object|false} The added row object or `false` on failure
 */
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
  }

  return true;
}

/**
 * Adds multiple rows in one shot.
 * @param {Array<Object>} rows - Array of row objects
 * @param {boolean} [silent=false] - Skip re-render and event dispatch
 * @returns {Array<Object>} Array of successfully added rows
 */
export function addRows(rows, silent = false) {
  if (!Array.isArray(rows)) throw new TypeError("addRows expects an array");
  const added = rows.map((r) => this.addRow(r, true, false)); // silent single adds
  if (!silent) {
    this._renderTable();
  }
  return added;
}

/* ---------- 3.  Update ---------- */

/**
 * Updates a single row, merging the supplied fields.
 * @param {string|number} rowId - Id of the row to update
 * @param {Object} newData - Fields to merge into the existing row
 * @param {boolean} [silent=false] - Skip re-render and event dispatch
 * @returns {Object|false} Updated row object or `false` if not found
 */
export function updateRow(rowId, newData) {
  const index = this.data.findIndex((row) => row.id === rowId);
  if (index === -1) return false;

  this.data[index] = { ...this.data[index], ...newData };
  this._renderTable();
  return true;
}

/**
 * Batch-updates multiple rows.
 * @param {Array<{id:string|number}>} updates - Array of `{id, ...newFields}` objects
 * @param {boolean} [silent=false] - Skip re-render and event dispatch
 * @returns {Array<Object>} Array of updated rows
 */
export function updateRows(updates, silent = false) {
  // updates = [{id, ...newFields}, ...]
  const updated = [];
  updates.forEach(({ id, ...fields }) => {
    const row = this.updateRow(id, fields, true);
    if (row) updated.push(row);
  });
  if (!silent && updated.length) {
    this._renderTable();
  }
  return updated;
}

/* ---------- 4.  Delete ---------- */

/**
 * Removes a single row by id.
 * @param {string|number} rowId - Id of the row to delete
 * @param {boolean} [silent=false] - Skip re-render and event dispatch
 * @returns {Object|false} Deleted row object or `false` if not found
 */
export function deleteRow(rowId) {
  const index = this.data.findIndex((row) => row.id === rowId);
  if (index === -1) return false;

  this.data.splice(index, 1);
  this._renderTable();
  return true;
}

/**
 * Batch-removes multiple rows by id.
 * @param {(string|number)[]} ids - Array of ids to delete
 * @param {boolean} [silent=false] - Skip re-render and event dispatch
 * @returns {Array<Object>} Array of deleted rows
 */
export function deleteRows(ids, silent = false) {
  if (!Array.isArray(ids)) ids = [ids];
  const removed = [];
  ids.forEach((id) => {
    const row = this.deleteRow(id, true);
    if (row) removed.push(row);
  });
  if (!silent && removed.length) {
    this._renderTable();
  }
  return removed;
}

/* ---------- 5.  Redraw helpers ---------- */

/**
 * Force a full re-render of the table UI.
 * Automatically bound to the DataTable instance.
 *
 * @param {Object} dt - DataTable instance
 */
function _doRedraw(dt) {
  if (!dt || typeof dt._renderTable !== "function") {
    throw new Error("redraw(): _renderTable method not found on instance");
  }
  dt._renderTable();
}

/**
 * Full redraw — bound to the instance when attached.
 */
export function redraw() {
  _doRedraw(this);
}

/**
 * Alias for `redraw()` (jQuery-style).
 */
export function draw() {
  _doRedraw(this);
}
