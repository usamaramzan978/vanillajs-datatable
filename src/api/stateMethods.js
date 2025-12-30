/**
 * State API Methods
 * Public API methods for state management
 */

/**
 * Save current table state to localStorage
 * @param {Object} context - DataTable instance
 */
export function saveState(context) {
    if (!context.table || !context.table.id) return;

    const state = {
        sort: context.sort,
        order: context.order,
        page: context.currentPage,
        perPage: context.rowsPerPage,
        filters: context.columnFilters,
        search: context.search,
        columnVisibility: context.columnVisibility.persistState
            ? context.columnVisibilityState
            : undefined,
        timestamp: Date.now(),
    };
    localStorage.setItem(
        `vanillajs_datatable_${context.table.id}_state`,
        JSON.stringify(state)
    );
}

/**
 * Load saved state from localStorage
 * @param {Object} context - DataTable instance
 */
export function loadState(context) {
    const saved = localStorage.getItem(
        `vanillajs_datatable_${context.table.id}_state`
    );
    if (!saved) return;

    const state = JSON.parse(saved);

    // Check expiration
    if (
        context.saveStateDuration &&
        Date.now() - state.timestamp > context.saveStateDuration
    ) {
        clearState(context);
        return;
    }

    // Apply saved state
    context.sort = state.sort;
    context.order = state.order;
    context.currentPage = state.page;
    context.rowsPerPage = state.perPage;
    context.columnFilters = state.filters || {};
    context.search = state.search || "";

    // Restore column visibility if persisted
    if (
        context.columnVisibility.persistState &&
        state.columnVisibility &&
        typeof state.columnVisibility === "object"
    ) {
        context.columnVisibilityState = {
            ...context.columnVisibilityState,
            ...state.columnVisibility,
        };
    }
}

/**
 * Clear saved state from localStorage
 * @param {Object} context - DataTable instance
 */
export function clearState(context) {
    if (!context.table || !context.table.id) return;
    localStorage.removeItem(`vanillajs_datatable_${context.table.id}_state`);
}

/**
 * Reset table to initial state
 * @param {Object} context - DataTable instance
 */
export function resetTable(context) {
    // Reset search input
    context.search = "";

    // Reset pagination
    context.currentPage = 1;

    // Reset sorting
    context.sort = "id";
    context.order = "asc";

    // Reset column filters
    context.columnFilters = {};

    // Reset the search input
    if (context.searchInput) {
        context.searchInput.value = "";
    }

    // Clear the state
    clearState(context);

    // Reset column filters if they exist
    const filterInputs = document.querySelectorAll("[data-column-filter]");
    filterInputs.forEach((input) => {
        input.value = "";
    });

    // Fetch new data
    if (context.fetchData) {
        context.fetchData();
    }
}
