/**
 * Utility API Methods
 * Public API methods for utility operations
 */

/**
 * Copy table data to clipboard
 * @param {Object} context - DataTable instance
 * @param {string} format - Format type ('csv' or 'tsv')
 */
export function copyToClipboard(context, format = "csv") {
    const visibleData = context.data; // current page data

    if (!visibleData || visibleData.length === 0) {
        alert("No data to copy.");
        return;
    }

    // Get visible columns (using API method if available)
    let visibleColumns;
    if (context.getVisibleColumns) {
        visibleColumns = context.getVisibleColumns();
    } else {
        visibleColumns = context.columns.filter(
            (col) => col.visible !== false && col.name !== "actions"
        );
    }

    const headers = visibleColumns.map((col) => col.label || col.name);

    const rows = visibleData.map((row) => {
        return visibleColumns
            .map((col) => row[col.name] ?? "")
            .join(format === "csv" ? "," : "\t");
    });

    const dataString = [
        headers.join(format === "csv" ? "," : "\t"),
        ...rows,
    ].join("\n");

    // Copy to clipboard
    navigator.clipboard
        .writeText(dataString)
        .then(() => {
            console.log("Table data copied to clipboard");
        })
        .catch((err) => {
            console.error("Failed to copy data:", err);
        });
}
