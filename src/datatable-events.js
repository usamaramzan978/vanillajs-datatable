/**
 * DataTable Event Constants
 * @namespace DataTableEvents
 * @description Event names used throughout the DataTable component
 */
export const DataTableEvents = {
    /**
     * Fired when the data table is initialized
     * @event DataTable#init
     */
    INIT: "init",

    /**
     * Fired when a column sort is applied or changed
     * @event DataTable#sort
     */
    SORT: "sort",

    /**
     * Fired when a filter input is changed
     * @event DataTable#filter
     */
    FILTER: "filter",

    /**
     * Fired when the page number changes (pagination)
     * @event DataTable#pageChange
     */
    PAGE_CHANGE: "pageChange",

    /**
     * Fired when data loading starts
     * @event DataTable#loading
     */
    LOADING: "loading",

    /**
     * Fired when data loading completes successfully
     * @event DataTable#loaded
     */
    LOADED: "loaded",

    /**
     * Fired when an error occurs during data fetching or processing
     * @event DataTable#error
     */
    ERROR: "error",

    /**
     * Fired when a search term is entered or changed
     * @event DataTable#search
     */
    SEARCH: "search",

    /**
     * Fired when the number of items per page is changed
     * @event DataTable#perPageChange
     */
    PER_PAGE_CHANGE: "perPageChange",

    /**
     * Fired when the data table is reset to initial state
     * @event DataTable#reset
     */
    RESET: "reset",

    /**
     * Fired when the table data is explicitly reloaded/refreshed
     * @event DataTable#reload
     */
    RELOAD: "reload",

    /**
     * Fired when table state is restored from saved state
     * @event DataTable#stateRestored
     */
    STATE_RESTORED: "stateRestored",

    // Selection-related events
    /**
     * Fired when any selection change occurs
     * @event DataTable#selectionChanged
     */
    SELECTION_CHANGED: "selectionChanged",

    /**
     * Fired when a single row is selected
     * @event DataTable#rowSelected
     */
    ROW_SELECTED: "rowSelected",

    /**
     * Fired when a single row is deselected
     * @event DataTable#rowDeselected
     */
    ROW_DESELECTED: "rowDeselected",

    /**
     * Fired when all rows are selected
     * @event DataTable#allSelected
     */
    ALL_SELECTED: "allSelected",

    /**
     * Fired when all rows are deselected
     * @event DataTable#allDeselected
     */
    ALL_DESELECTED: "allDeselected",

    ROW_ACTIVATE: "rowActivate",
};
