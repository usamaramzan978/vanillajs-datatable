/**
 * DataTable Event Constants
 * 
 * This module exports event name constants used throughout the DataTable library.
 * All events are prefixed with "datatable:" when dispatched.
 */
export const DataTableEvents = {
    /**
     * Fired when a row is activated (e.g., via Enter key or click)
     * Event detail: { rowId, rowData, timestamp }
     */
    ROW_ACTIVATE: "row-activate",
    
    /**
     * Fired when a row is selected
     * Event detail: { rowId, rowData }
     */
    ROW_SELECT: "row-select",
    
    /**
     * Fired when a row is deselected
     * Event detail: { rowId }
     */
    ROW_DESELECT: "row-deselect",
    
    /**
     * Fired when selection changes
     * Event detail: { selectedIds, selectedCount }
     */
    SELECTION_CHANGE: "selection-change",
    
    /**
     * Fired when data is loaded
     * Event detail: { data, total }
     */
    DATA_LOADED: "data-loaded",
    
    /**
     * Fired when page changes
     * Event detail: { page, perPage }
     */
    PAGE_CHANGE: "page-change",
    
    /**
     * Fired when sorting changes
     * Event detail: { column, order }
     */
    SORT_CHANGE: "sort-change",
    
    /**
     * Fired when search/filter changes
     * Event detail: { query, filteredCount }
     */
    SEARCH_CHANGE: "search-change",
};

