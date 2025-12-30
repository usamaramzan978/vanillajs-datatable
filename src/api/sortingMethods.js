/**
 * Sorting API Methods
 * Public API methods for sorting operations
 */

/**
 * Set sort column and direction
 * @param {Object} context - DataTable instance
 * @param {string} column - Column name to sort by
 * @param {string} direction - Sort direction ('asc' or 'desc')
 */
export function setSort(context, column, direction = "asc") {
    // 1. Validate direction
    if (!["asc", "desc"].includes(direction)) {
        console.warn(
            `Invalid sort direction "${direction}" - must be "asc" or "desc"`
        );
        return;
    }

    // 2. Validate column
    const columnExists = context.columns.some(
        (col) => col.data === column || col.name === column
    );
    if (!columnExists) {
        console.warn(
            `Invalid column "${column}" - not found in column definition`
        );
        return;
    }

    // 3. Apply and fetch
    context.sort = column;
    context.order = direction;
    if (context.fetchData) {
        context.fetchData();
    }
}

/**
 * Clear current sort
 * @param {Object} context - DataTable instance
 */
export function clearSort(context) {
    context.sort = "";
    context.order = "";

    // Fetch data without sorting
    if (context.fetchData) {
        context.fetchData();
    }
}
