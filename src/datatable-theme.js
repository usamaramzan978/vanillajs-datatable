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
        controlsWrapper:
            "flex flex-wrap items-center justify-between gap-4 p-4",
        controlsLeft: "flex items-center gap-2",
        buttonGroup: "flex items-center gap-2",

        perPageSelect: "select select-sm select-bordered",
        searchWrapper: "relative w-full max-w-xs",
        searchIcon: "absolute left-3 top-1/2 transform -translate-y-1/2",
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

        // Advanced Filters UI Wrapper
        advancedFilterToggle:
            "px-4 py-3 flex justify-between items-center cursor-pointer bg-base-200 text-sm font-medium gap-2 hover:bg-base-300 transition-colors duration-200",
        advancedFilterArrow:
            "transition-transform duration-300 text-base-content",
        advancedFilterRow:
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-0 px-2 bg-base-100 rounded-box transition-all duration-500 max-h-0 opacity-0 overflow-hidden",
        advancedFilterDiv: "form-control",
        advancedFilterLabel: "label-text text-sm mb-1",
        advancedFilterInputs: "flex gap-2",
        advancedFilterInput: "input input-sm input-bordered w-full",
        advancedFilterButtonContainer: "flex items-center justify-start mt-5",
        advancedFilterButton: "btn btn-primary btn-sm w-40 h-10",

        scrollWrapperClass: "overflow-y-auto",
        scrollLoaderClass: "text-center py-2 text-sm text-base-content",

        editableInput: "input input-bordered input-sm w-full",
        editableSelect: "select select-bordered select-sm w-full",
        borderSuccess: "border-success",
        borderError: "border-error",
        borderLoading: "border-warning",

        // Column Visibility Dropdown
        columnVisibilityDropdown:
            "dropdown-content menu bg-base-100 rounded-box shadow-lg absolute min-w-[200px] max-h-[300px] overflow-y-auto z-[1000]",
        columnVisibilityList: "p-2",
        columnVisibilityItem:
            "flex items-center py-2 px-2 cursor-pointer hover:bg-base-200 rounded",
        columnVisibilityCheckbox: "checkbox checkbox-sm mr-2 cursor-pointer",
        columnVisibilityLabel: "cursor-pointer flex-1 select-none text-sm",
        columnVisibilityLabelRequired:
            "cursor-pointer flex-1 select-none text-sm opacity-60 italic",
        columnVisibilityActions:
            "border-t border-base-300 pt-2 mt-2 px-2 flex gap-2",
        columnVisibilityActionButton: "btn btn-sm flex-1",

        // Export Progress Indicator
        exportProgressOverlay:
            "fixed inset-0 flex items-center justify-center z-[9999]",
        exportProgressModal:
            "bg-base-100 rounded-lg p-6 shadow-xl w-full max-w-md mx-4 border border-base-300",
        exportProgressTitle: "text-xl font-semibold mb-4 text-base-content",
        exportProgressBarContainer:
            "w-full bg-base-300 rounded-full h-2.5 mb-3",
        exportProgressBarFill:
            "bg-primary h-2.5 rounded-full transition-all duration-300",
        exportProgressText: "text-center text-sm mb-2 text-base-content",
        exportProgressTime: "text-center text-xs text-base-content/70 mb-3",
        exportProgressNote: "text-center text-xs mb-3",
        exportProgressCancel: "btn btn-sm btn-outline w-full",
    },
    tailwind: {
        controlsContainer:
            "border-b border-dashed border-gray-300 bg-white dark:bg-gray-900 dark:border-gray-700 rounded-t-lg",
        controlsWrapper:
            "flex flex-wrap items-center justify-between gap-4 py-4 px-1.5",

        controlsLeft:
            "flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2",
        buttonGroup: "flex flex-wrap items-center gap-2",

        perPageSelect:
            "text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md px-3 py-1.5 focus:ring focus:ring-primary",

        searchWrapper: "relative w-full max-w-xs",
        searchIcon:
            "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500",
        searchInput:
            "w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary",

        button: "cursor-pointer rounded-md flex items-center gap-1 text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 transition shadow-sm",

        table: "min-w-full table-auto border border-gray-300 dark:border-gray-700 overflow-hidden",
        header: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white",
        headerCell:
            "px-4 py-3 text-sm font-medium text-left tracking-wide whitespace-nowrap",
        headerSticky: "sticky top-0 z-10 bg-white dark:bg-gray-900 shadow",

        groupHeaderRow:
            "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-semibold text-center",
        groupHeaderCell: "",

        filterRow: "bg-gray-50 dark:bg-gray-800 column-filters",
        filterInput:
            "w-full pl-3 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary",

        body: "bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700",
        row: "hover:bg-blue-50 dark:hover:bg-gray-700 hover:shadow-sm transition-colors duration-150",
        cell: "px-4 py-3 text-sm text-gray-800 dark:text-gray-100 whitespace-nowrap",

        highlight:
            "bg-yellow-200 dark:bg-yellow-500 text-black dark:text-gray-900 font-semibold rounded px-1",

        paginationContainer:
            "flex flex-col sm:flex-row justify-between sm:items-center items-start px-4 py-3 border-t border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-b-lg",
        paginationInfo: "text-sm text-gray-600 dark:text-gray-400",
        paginationWrapper: "flex gap-1 mt-2",
        paginationButton:
            "px-3 py-1.5 text-sm border rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white",
        paginationButtonActive:
            "bg-blue-600 text-white border-blue-600 cursor-pointer",
        paginationButtonDisabled: "opacity-50 cursor-not-allowed",
        paginationEllipsis:
            "px-2 text-gray-500 dark:text-gray-400 cursor-default",

        // Advanced Filters UI Wrapper
        advancedFilterToggle:
            "px-4 py-3 flex justify-between items-center cursor-pointer bg-gray-200 dark:bg-gray-900 text-sm font-medium gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200",
        advancedFilterArrow:
            "transform transition-transform duration-300 text-gray-600 dark:text-white",
        advancedFilterRow:
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-0 px-2 bg-gray-100 dark:bg-gray-900 rounded-lg transition-all duration-500 max-h-0 opacity-0 overflow-hidden",
        advancedFilterDiv: "flex flex-col items-start",
        advancedFilterLabel:
            "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1",
        advancedFilterInputs: "flex gap-2",
        advancedFilterInput:
            "w-full pl-3 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary placeholder:font-normal",
        advancedFilterButtonContainer: "flex items-center justify-start mt-5",
        advancedFilterButton:
            "w-40 h-10 cursor-pointer px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md",

        scrollWrapperClass: "overflow-y-auto",
        scrollLoaderClass: "text-center py-2 text-sm text-gray-500",

        editableInput:
            "border px-2 py-1 w-full rounded focus:outline-none focus:ring-2 focus:ring-primary",
        editableSelect:
            "border px-2 py-1 w-full rounded focus:outline-none focus:ring-2 focus:ring-primary",
        borderSuccess: "border-green-500",
        borderError: "border-red-500",
        borderLoading: "border-yellow-500",

        // Column Visibility Dropdown
        columnVisibilityDropdown:
            "absolute bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-2 min-w-[200px] max-h-[300px] overflow-y-auto z-[1000]",
        columnVisibilityList: "space-y-1",
        columnVisibilityItem:
            "flex items-center py-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2",
        columnVisibilityCheckbox: "mr-2 cursor-pointer",
        columnVisibilityLabel:
            "cursor-pointer flex-1 select-none text-sm text-gray-700 dark:text-gray-300",
        columnVisibilityLabelRequired:
            "cursor-pointer flex-1 select-none text-sm text-gray-500 dark:text-gray-400 italic",
        columnVisibilityActions:
            "border-t border-gray-200 dark:border-gray-700 pt-2 mt-2 flex gap-2",
        columnVisibilityActionButton: "flex-1 text-xs py-1.5",

        // Export Progress Indicator
        exportProgressOverlay:
            "fixed inset-0 flex items-center justify-center bg-black/50 z-[9999]",
        exportProgressModal:
            "bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl w-full max-w-md mx-4 border border-gray-200 dark:border-gray-700",
        exportProgressTitle:
            "text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100",
        exportProgressBarContainer:
            "w-full bg-gray-200 rounded-full h-2.5 mb-3",
        exportProgressBarFill:
            "bg-blue-600 h-2.5 rounded-full transition-all duration-300",
        exportProgressText:
            "text-center text-sm mb-2 text-gray-700 dark:text-gray-300",
        exportProgressTime:
            "text-center text-xs text-gray-500 dark:text-gray-400 mb-3",
        exportProgressNote: "text-center text-xs mb-3",
        exportProgressCancel:
            "px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-sm w-full text-gray-800 dark:text-gray-200",
    },
    tailwindLight: {
        controlsContainer: "border-b border-dashed border-gray-300 bg-white",
        controlsWrapper:
            "flex flex-wrap items-center justify-between gap-4 py-4",
        controlsLeft:
            "flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2",
        buttonGroup: "flex flex-wrap items-center gap-2",

        perPageSelect:
            "text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:ring focus:ring-primary",

        searchWrapper: "relative w-full max-w-xs",
        searchIcon:
            "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400",
        searchInput:
            "w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary",

        button: "cursor-pointer rounded-md flex items-center gap-1 text-sm px-3 py-1.5 border border-gray-300 bg-white text-gray-800 hover:bg-gray-100 active:bg-gray-200 transition shadow-sm",

        table: "min-w-full table-auto border border-gray-300 rounded-lg overflow-hidden",
        header: "bg-gray-100 text-gray-700",
        headerCell:
            "px-4 py-3 text-sm font-medium text-left tracking-wide whitespace-nowrap",
        headerSticky: "sticky top-0 z-10 bg-white shadow",

        groupHeaderRow: "bg-gray-200 text-gray-800 font-semibold text-center",

        filterRow: "bg-gray-50 column-filters",
        filterInput:
            "w-full pl-3 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary",

        body: "bg-white divide-y divide-gray-200",
        row: "hover:bg-blue-50 hover:shadow-sm transition-colors duration-150",
        cell: "px-4 py-3 text-sm text-gray-800 whitespace-nowrap",

        highlight: "bg-yellow-200 text-black font-semibold rounded px-1",

        paginationContainer:
            "flex flex-col sm:flex-row justify-between sm:items-center items-start px-4 py-3 border-t border-gray-300 bg-gray-100 text-gray-800 rounded-b-lg",
        paginationInfo: "text-sm text-gray-600",
        paginationWrapper: "flex gap-1 mt-2",
        paginationButton:
            "px-3 py-1.5 text-sm border rounded hover:bg-gray-200 transition cursor-pointer border-gray-300 text-gray-800",
        paginationButtonActive:
            "bg-blue-600 text-white border-blue-600 cursor-pointer",
        paginationButtonDisabled: "opacity-50 cursor-not-allowed",
        paginationEllipsis: "px-2 text-gray-500 cursor-default",

        // Advanced Filters UI
        advancedFilterToggle:
            "px-4 py-3 flex justify-between items-center cursor-pointer bg-gray-200 text-sm font-medium gap-2 hover:bg-gray-200 transition-colors duration-200",
        advancedFilterArrow:
            "transform transition-transform duration-300 text-gray-600",
        advancedFilterRow:
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-0 px-2 bg-gray-100 rounded-lg transition-all duration-500 max-h-0 opacity-0 overflow-hidden",
        advancedFilterDiv: "flex flex-col items-start",
        advancedFilterLabel: "block text-sm font-medium text-gray-700 mb-1",
        advancedFilterInputs: "flex gap-2",
        advancedFilterInput:
            "w-full pl-3 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary placeholder:font-normal",
        advancedFilterButtonContainer: "flex items-center justify-start mt-5",
        advancedFilterButton:
            "w-40 h-10 cursor-pointer px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md",

        scrollWrapperClass: "overflow-y-auto",
        scrollLoaderClass: "text-center py-2 text-sm text-gray-500",

        editableInput:
            "border px-2 py-1 w-full rounded focus:outline-none focus:ring-2 focus:ring-primary",
        editableSelect:
            "border px-2 py-1 w-full rounded focus:outline-none focus:ring-2 focus:ring-primary",
        borderSuccess: "border-green-500",
        borderError: "border-red-500",
        borderLoading: "border-yellow-500",

        // Column Visibility Dropdown
        columnVisibilityDropdown:
            "absolute bg-white border border-gray-300 rounded-lg shadow-lg p-2 min-w-[200px] max-h-[300px] overflow-y-auto z-[1000]",
        columnVisibilityList: "space-y-1",
        columnVisibilityItem:
            "flex items-center py-1.5 cursor-pointer hover:bg-gray-100 rounded px-2",
        columnVisibilityCheckbox: "mr-2 cursor-pointer",
        columnVisibilityLabel:
            "cursor-pointer flex-1 select-none text-sm text-gray-700",
        columnVisibilityLabelRequired:
            "cursor-pointer flex-1 select-none text-sm text-gray-500 italic",
        columnVisibilityActions:
            "border-t border-gray-200 pt-2 mt-2 flex gap-2",
        columnVisibilityActionButton: "flex-1 text-xs py-1.5",

        // Export Progress Indicator
        exportProgressOverlay:
            "fixed inset-0 flex items-center justify-center bg-black/50 z-[9999]",
        exportProgressModal:
            "bg-white rounded-lg p-6 shadow-xl w-full max-w-md mx-4",
        exportProgressTitle: "text-xl font-semibold mb-4 text-gray-800",
        exportProgressBarContainer:
            "w-full bg-gray-200 rounded-full h-2.5 mb-3",
        exportProgressBarFill:
            "bg-blue-600 h-2.5 rounded-full transition-all duration-300",
        exportProgressText: "text-center text-sm mb-2 text-gray-700",
        exportProgressTime: "text-center text-xs text-gray-500 mb-3",
        exportProgressNote: "text-center text-xs mb-3",
        exportProgressCancel:
            "px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm w-full text-gray-800",
    },
    bootstrap: {
        // Container with padding but no fixed background color
        controlsContainer: "py-3 border-bottom",

        controlsWrapper:
            "d-flex flex-wrap justify-content-between align-items-center gap-3",
        controlsLeft: "d-flex flex-wrap align-items-center gap-3",
        buttonGroup: "btn-group flex-wrap",

        perPageSelect: "form-select form-select-sm w-auto",

        searchWrapper: "position-relative w-md-auto",
        searchIcon:
            "position-absolute top-50 start-0 translate-middle-y ps-3 text-muted",
        searchInput: "form-control form-control-sm ps-5 rounded p-2",

        button: "btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1",

        table: "table table-hover align-middle mb-0 border",
        header: "", // Remove "table-light" to let dark mode work
        headerCell: "text-nowrap",
        headerSticky: "sticky-top bg-body-tertiary z-1 shadow-sm", // Use context-aware bg

        groupHeaderRow: "bg-secondary text-white text-center fw-bold", // bg-secondary is better than hardcoded bg-dark
        groupHeaderCell: "",

        filterRow: "bg-body-secondary column-filters", // auto-adapts to dark/light
        filterInput: "form-control form-control-sm column-search",

        body: "",
        row: "align-middle",
        cell: "text-nowrap",

        highlight: "bg-warning text-dark fw-semibold px-1 rounded",

        paginationContainer:
            "d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 pt-3 mt-3 px-3",
        paginationInfo: "text-muted small mb-0",
        paginationWrapper: "btn-group flex-wrap",
        paginationButton: "btn btn-sm btn-outline-primary",
        paginationButtonActive: "page-item active",
        paginationButtonDisabled: "disabled",
        paginationEllipsis:
            "px-2 text-muted btn btn-sm btn-outline-primary join-item disabled",

        // Advanced Filters UI Wrapper
        advancedFilterToggle:
            "cursor-pointer d-flex justify-content-between align-items-center px-3 py-3 cursor-pointer bg-body-primary fw-medium hover-bg-secondary-subtle transition",
        advancedFilterArrow: "transition-transform duration-300",
        advancedFilterRow:
            "row gy-3 gx-2 py-3 px-3 bg-body-tertiary rounded shadow-sm",
        advancedFilterDiv: "col-12 col-md-6 col-lg-4 d-flex flex-column",
        advancedFilterLabel: "form-label mb-1 fw-medium text-body",
        advancedFilterInputs: "d-flex gap-2",
        advancedFilterInput: "form-control form-control-sm",
        advancedFilterButtonContainer: "px-3 mt-4 d-flex justify-content-start",
        advancedFilterButton: "btn btn-primary btn-sm px-4 py-2 fw-semibold",

        scrollWrapperClass: "overflow-y-auto",
        scrollLoaderClass: "text-center py-2 small text-muted",

        editableInput: "form-control",
        editableSelect: "form-select",
        borderSuccess: "border-success",
        borderError: "border-danger",
        borderLoading: "border-warning",

        // Column Visibility Dropdown
        columnVisibilityDropdown:
            "dropdown-menu show position-absolute border rounded shadow-lg p-0 min-w-[200px] max-h-[300px] overflow-y-auto z-[1050]",
        columnVisibilityList: "p-2",
        columnVisibilityItem:
            "d-flex align-items-center py-2 px-2 cursor-pointer hover-bg-light rounded",
        columnVisibilityCheckbox: "form-check-input me-2 cursor-pointer",
        columnVisibilityLabel:
            "cursor-pointer flex-grow-1 user-select-none text-sm",
        columnVisibilityLabelRequired:
            "cursor-pointer flex-grow-1 user-select-none text-sm text-muted fst-italic",
        columnVisibilityActions: "border-top pt-2 my-2 px-2 d-flex gap-2",
        columnVisibilityActionButton: "btn btn-sm flex-fill",

        // Export Progress Indicator
        exportProgressOverlay:
            "position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center z-[9999]",
        exportProgressModal: "bg-body rounded p-4 shadow-lg w-100 mx-3 border",
        exportProgressTitle: "h5 mb-3 text-body",
        exportProgressBarContainer: "progress mb-3",
        exportProgressBarFill:
            "progress-bar progress-bar-striped progress-bar-animated bg-primary",
        exportProgressText: "text-center mb-2 text-body",
        exportProgressTime: "text-center text-body-secondary mb-3",
        exportProgressNote: "text-center mb-3",
        exportProgressCancel: "btn btn-secondary w-100",
    },
};
