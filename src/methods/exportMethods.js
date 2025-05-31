export function exportJSON(data, filename = "table-data.json") {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();

    URL.revokeObjectURL(link.href);
}

// Helper function (reused)
export function downloadJSON(data, filename = "data.json") {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();

    URL.revokeObjectURL(link.href);
}

// To be used inside DataTable class
export function downloadSelectedJSON(
    data,
    selectedIds,
    filename = "selected-data.json"
) {
    const selectedData = data.filter((row) => selectedIds.includes(row.id));
    downloadJSON(selectedData, filename);
}
