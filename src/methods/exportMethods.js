// Reusable download function
export function downloadJSON(data, filename = "data.json") {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();

    // Delay revoking the URL to ensure the download completes
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// For exporting all rows
export function exportJSON(data, filename = "table-data.json") {
    downloadJSON(data, filename);
}

// For exporting selected rows by ID
export function downloadSelectedJSON(
    data,
    selectedIds,
    filename = "selected-data.json"
) {
    const selectedData = data.filter((row) => selectedIds.includes(row.id));
    downloadJSON(selectedData, filename);
}
