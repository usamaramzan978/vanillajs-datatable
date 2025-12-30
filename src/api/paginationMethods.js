/**
 * Pagination API Methods
 * Public API methods for pagination operations
 */

/**
 * Go to a specific page
 * @param {Object} context - DataTable instance
 * @param {number} pageNumber - Page number to navigate to
 */
export function goToPage(context, pageNumber) {
    const page = parseInt(pageNumber, 10);
    if (
        isNaN(page) ||
        page < 1 ||
        (context.totalPages && page > context.totalPages)
    ) {
        console.warn(`Invalid page number: ${pageNumber}`);
        return;
    }
    context.currentPage = page;
    if (context.fetchData) {
        context.fetchData(); // Re-fetch data for the new page
    }
}

/**
 * Set page size (rows per page)
 * @param {Object} context - DataTable instance
 * @param {number} size - Number of rows per page
 */
export function setPageSize(context, size) {
    const perPage = parseInt(size, 10);
    if (isNaN(perPage) || perPage <= 0) {
        console.warn(`Invalid page size: ${size}`);
        return;
    }

    context.rowsPerPage = perPage;
    context.currentPage = 1; // Reset to first page when page size changes
    if (context.fetchData) {
        context.fetchData();
    }
}

/**
 * Get current page number
 * @param {Object} context - DataTable instance
 * @returns {number} Current page number
 */
export function getCurrentPage(context) {
    return context.currentPage;
}

/**
 * Go to next page
 * @param {Object} context - DataTable instance
 */
export function nextPage(context) {
    return goToPage(context, context.currentPage + 1);
}

/**
 * Go to previous page
 * @param {Object} context - DataTable instance
 */
export function prevPage(context) {
    return goToPage(context, context.currentPage - 1);
}

/**
 * Go to first page
 * @param {Object} context - DataTable instance
 */
export function firstPage(context) {
    return goToPage(context, 1);
}

/**
 * Go to last page
 * @param {Object} context - DataTable instance
 */
export function lastPage(context) {
    if (!context.totalPages || context.totalPages < 1) {
        console.warn("Cannot go to last page: totalPages is not defined");
        return;
    }

    return goToPage(context, context.totalPages);
}
