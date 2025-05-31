export function copyToClipboard(format = "csv") {
    const visibleData = this.data; // current page data

    if (!visibleData || visibleData.length === 0) {
        alert("No data to copy.");
        return;
    }

    const headers = this.columns
        .filter((col) => col.visible !== false && col.name !== "actions") // exclude non-visible or action columns
        .map((col) => col.label || col.name);

    const rows = visibleData.map((row) => {
        return this.columns
            .filter((col) => col.visible !== false && col.name !== "actions")
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
