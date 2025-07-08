// datatable/datatable-theme.js

/**
 * DEFAULT_THEME
 *
 * This object defines the Tailwind CSS classes used for styling various parts of the DataTable.
 * You can override this theme by passing a custom `theme` object when initializing the DataTable.
 *
 */

export const DEFAULT_THEME = {
  daisyui: {
    controlsContainer: "border-base-300 border-b border-dashed",
    controlsWrapper: "flex flex-wrap items-center justify-between gap-4 p-4",
    controlsLeft: "flex items-center gap-2",
    buttonGroup: "flex items-center gap-2",

    perPageSelect: "select select-sm select-bordered",
    searchWrapper: "relative w-full max-w-xs",
    searchIcon: "absolute left-3 top-1/2 transform -translate-y-1/2",
    searchInput: "input input-bordered w-full pl-10",

    button: "btn btn-sm btn-outline",

    // Table structure
    table:
      "table w-full border border-base-200 rounded-xl overflow-hidden shadow-sm",
    header: "bg-base-200 text-base-content",
    headerCell: "px-4 py-3 text-sm font-semibold tracking-wide text-left",
    headerSticky: "sticky top-0 z-10 bg-base-100 shadow-md",

    // Group headers
    groupHeaderRow:
      "column-group-headers bg-base-300 text-base-content font-semibold text-center",
    groupHeaderCell: "", // add any custom group header cell classes if needed

    // Filter row & inputs
    filterRow: "bg-base-200 column-filters",
    filterInput: "input input-sm input-bordered w-full column-search",

    // Body and rows
    body: "bg-base-100 divide-y divide-base-200",
    row: "hover:bg-base-200 transition-colors duration-200",
    cell: "px-4 py-3 text-sm text-base-content",

    // Highlighting search results
    highlight: "bg-yellow-200 text-black font-semibold rounded-sm px-1",

    // Pagination layout
    paginationContainer:
      "flex justify-between items-center px-4 py-2 border-t border-gray-300 bg-base-200 text-base-content rounded-b-lg",
    paginationInfo: "text-sm text-gray-600",
    paginationWrapper: "join gap-1 mt-2",
    paginationButton: "btn btn-sm",
    paginationButtonActive: "btn-primary",
    paginationButtonDisabled: "opacity-50 cursor-not-allowed",
    paginationEllipsis: "px-2 text-gray-500",
  },
  tailwind: {
    controlsContainer: "border-b border-dashed border-gray-300 bg-white",
    controlsWrapper: "flex flex-wrap items-center justify-between gap-4 p-4",

    controlsLeft: "flex items-center gap-4",
    buttonGroup: "flex flex-wrap items-center gap-2",

    perPageSelect:
      "text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:ring focus:ring-primary",

    searchWrapper: "relative w-full max-w-xs",
    searchIcon:
      "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400",
    searchInput:
      "w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary",

    button:
      "cursor-pointer flex items-center gap-1 text-sm px-3 py-1.5 border border-gray-300 rounded-md bg-white hover:bg-gray-100 active:bg-gray-200 transition shadow-sm",

    // Table container
    table:
      "min-w-full table-auto border border-gray-300 rounded-lg overflow-hidden",
    header: "bg-gray-100 text-gray-700",
    headerCell:
      "px-4 py-3 text-sm font-semibold text-left tracking-wide whitespace-nowrap",
    headerSticky: "sticky top-0 z-10 bg-white shadow",

    // Group header (optional use)
    groupHeaderRow: "bg-gray-200 text-gray-800 font-semibold text-center",
    groupHeaderCell: "",

    // Filters
    filterRow: "bg-gray-50 column-filters",
    filterInput:
      "w-full text-sm border px-2 py-1 rounded column-search bg-white",

    // Table rows
    body: "bg-white divide-y divide-gray-200",
    row: "hover:bg-blue-50 hover:shadow-sm hover:cursor-pointer transition-colors duration-150",
    cell: "px-4 py-3 text-sm text-gray-800 whitespace-nowrap",

    // Highlighting
    highlight: "bg-yellow-200 text-black font-semibold rounded px-1",

    // Pagination
    paginationContainer:
      "flex justify-between items-center px-4 py-3 border-t border-gray-300 bg-gray-100 text-gray-800 rounded-b-lg",
    paginationInfo: "text-sm text-gray-600",
    paginationWrapper: "flex gap-1 mt-2",
    paginationButton:
      "px-3 py-1.5 text-sm border rounded hover:bg-gray-200 transition cursor-pointer",
    paginationButtonActive:
      "bg-blue-600 text-white border-blue-600 cursor-pointer",
    paginationButtonDisabled: "opacity-50 cursor-not-allowed",
    paginationEllipsis: "px-2 text-gray-500 cursor-default",
  },

  bootstrap: {
    controlsContainer: "py-3 border-bottom bg-white px-3",
    controlsWrapper:
      "d-flex flex-wrap justify-content-between align-items-center gap-3",

    controlsLeft: "d-flex flex-wrap align-items-center gap-3",
    buttonGroup: "btn-group flex-wrap gap-2",

    perPageSelect: "form-select form-select-sm w-auto",

    searchWrapper: "position-relative w-md-auto",
    searchIcon:
      "position-absolute top-50 start-0 translate-middle-y ps-3 text-muted",
    searchInput: "form-control form-control-sm ps-5 rounded p-2",

    button:
      "btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1 rounded",

    table: "table table-striped table-hover align-middle mb-0 border",
    header: "table-light",
    headerCell: "text-nowrap",
    headerSticky: "sticky-top bg-light z-1 shadow-sm",

    groupHeaderRow: "bg-dark text-white text-center fw-bold",
    groupHeaderCell: "",

    filterRow: "bg-light-subtle column-filters",
    filterInput: "form-control form-control-sm column-search",

    body: "",
    row: "align-middle",
    cell: "text-nowrap",

    highlight: "bg-warning text-dark fw-semibold px-1 rounded",

    paginationContainer:
      "d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 pt-3 mt-3 border-top px-3",
    paginationInfo: "text-muted small mb-0",
    paginationWrapper: "btn-group flex-wrap gap-2",
    paginationButton: "btn btn-sm btn-outline-secondary rounded",
    paginationButtonActive: "btn btn-sm btn-primary active",
    paginationButtonDisabled: "disabled",
    paginationEllipsis: "px-2 text-muted",
  },
};
