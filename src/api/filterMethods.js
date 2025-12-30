/**
 * Filter API Methods
 * Public API methods for filter operations
 */

/**
 * Set a filter value
 * @param {Object} context - DataTable instance
 * @param {string} key - Filter key
 * @param {*} value - Filter value
 * @param {boolean} silent - Don't trigger data fetch
 */
export function setFilter(context, key, value, silent = false) {
    context.filters[key] = value;
    if (!silent && context.fetchData) {
        context.fetchData();
    }
}

/**
 * Remove a filter
 * @param {Object} context - DataTable instance
 * @param {string} key - Filter key to remove
 */
export function removeFilter(context, key) {
    delete context.filters[key];
}

/**
 * Clear all filters
 * @param {Object} context - DataTable instance
 */
export function clearFilters(context) {
    context.filters = {};
}

