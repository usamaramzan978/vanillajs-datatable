// datatable/datatable-theme.js

/**
 * DEFAULT_THEME
 *
 * This object defines the Tailwind CSS classes used for styling various parts of the DataTable.
 * You can override this theme by passing a custom `theme` object when initializing the DataTable.
 *
 * Theme Keys:
 * ------------------------------------------------------------------------------
 * table                → Applied to the entire <table> element.
 * header               → Applied to the <thead> wrapper.
 * headerCell           → Applied to each <th> cell in the header.
 * body                 → Applied to the <tbody> wrapper.
 * row                  → Applied to each <tr> in the body (rows).
 * cell                 → Applied to each <td> cell in the body.
 * highlight            → Applied to matched text when highlighting search terms.
 *
 * Pagination Styles:
 * ------------------------------------------------------------------------------
 * paginationContainer  → Wrapper for pagination section (info + controls).
 * paginationInfo       → Text showing "Showing X to Y of Z entries".
 * paginationWrapper    → Wrapper for pagination buttons.
 * paginationButton     → Style for each pagination button.
 * paginationButtonActive → Style for the active page button.
 * paginationButtonDisabled → Style for disabled buttons (e.g. Previous on first page).
 * paginationEllipsis   → Style for ellipsis ("...") in pagination.
 */

export const DEFAULT_THEME = {
    controlsWrapper: "flex flex-wrap items-center justify-between gap-4 p-4",
    controlsContainer: "border-base-300 border-b border-dashed",
    perPageSelect: "select select-sm select-bordered",
    searchInput: "input input-bordered w-full pl-10",
    button: "btn btn-sm btn-outline",

    // Table structure
    table: "table w-full border border-base-200 rounded-xl overflow-hidden shadow-sm",
    header: "bg-base-200 text-base-content",
    headerCell: "px-4 py-3 text-sm font-semibold tracking-wide text-left",
    headerSticky: "sticky top-0 z-10 bg-base-100 shadow-md",

    // Group headers
    groupHeaderRow:
        "column-group-headers bg-base-300 text-base-content font-semibold text-center",
    groupHeaderCell: "", // add any custom group header cell classes if needed

    // Filter row & inputs
    filterRow: "bg-base-200",
    filterInput: "input input-sm input-bordered w-full",

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
};
