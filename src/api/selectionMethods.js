/**
 * Selection API Methods
 * Public API methods for row selection operations
 */

/**
 * Get selected row IDs
 * @param {Object} context - DataTable instance
 * @returns {Array} Array of selected row IDs
 */
export function getSelectedIds(context) {
    if (!context.selectable) return [];
    return context.selectable.getSelectedIds();
}

/**
 * Clear all selections
 * @param {Object} context - DataTable instance
 */
export function clearSelection(context) {
    if (!context.selectable) return;
    context.selectable.clearSelection();
}

/**
 * Select all rows
 * @param {Object} context - DataTable instance
 */
export function selectAll(context) {
    if (!context.selectable) return;
    context.selectable.selectAll();
}

/**
 * Toggle row selection
 * @param {Object} context - DataTable instance
 * @param {string|number} id - Row ID
 * @param {boolean} force - Force selection state (optional)
 */
export function toggleRowSelection(context, id, force) {
    if (!context.selectable) return;
    context.selectable.toggleRowSelection(id, force);
}

/**
 * Check if row is selected
 * @param {Object} context - DataTable instance
 * @param {string|number} id - Row ID
 * @returns {boolean} True if selected
 */
export function isSelected(context, id) {
    if (!context.selectable) return false;
    return context.selectable.isSelected(id);
}

/**
 * Register selection change callback
 * @param {Object} context - DataTable instance
 * @param {Function} callback - Callback function
 */
export function onSelectionChange(context, callback) {
    if (!context.selectable) return;
    context.selectable.onSelectionChange(callback);
}

/**
 * Get selected row elements
 * @param {Object} context - DataTable instance
 * @returns {Array} Array of selected row DOM elements
 */
export function getSelectedRows(context) {
    if (!context.selectable) return [];
    return context.selectable.getSelectedRows();
}

/**
 * Get selected row data
 * @param {Object} context - DataTable instance
 * @returns {Array} Array of selected row data objects
 */
export function getSelectedData(context) {
    if (!context.selectable) return [];
    return context.selectable.getSelectedData();
}

/**
 * Get count of selected rows
 * @param {Object} context - DataTable instance
 * @returns {number} Number of selected rows
 */
export function getSelectedCount(context) {
    if (!context.selectable) return 0;
    return context.selectable.getSelectedCount();
}

/**
 * Set selection programmatically
 * @param {Object} context - DataTable instance
 * @param {Array} ids - Array of row IDs to select
 */
export function setSelection(context, ids) {
    if (!context.selectable) return;
    context.selectable.setSelection(ids);
}

/**
 * Invert current selection
 * @param {Object} context - DataTable instance
 */
export function invertSelection(context) {
    if (!context.selectable) return;
    context.selectable.invertSelection();
}

/**
 * Select range of rows
 * @param {Object} context - DataTable instance
 * @param {string|number} from - Starting row ID
 * @param {string|number} to - Ending row ID
 */
export function selectRange(context, from, to) {
    if (!context.selectable) return;
    context.selectable.selectRange(from, to);
}

/**
 * Enable/disable selection feature
 * @param {Object} context - DataTable instance
 * @param {boolean} flag - Enable/disable flag
 */
export function setSelectable(context, flag) {
    if (!context.selectable) return;
    context.selectable.setSelectable(flag);
}

/**
 * Set selection mode
 * @param {Object} context - DataTable instance
 * @param {string} mode - Selection mode ('single' or 'multiple')
 */
export function setSelectMode(context, mode) {
    if (!context.selectable) return;
    context.selectable.setSelectMode(mode);
}

/**
 * Destroy selection feature
 * @param {Object} context - DataTable instance
 */
export function destroySelectable(context) {
    if (!context.selectable) return;
    context.selectable.destroy();
}

