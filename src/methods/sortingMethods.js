export function setSort(column, direction = "asc") {
    // 1. Validate direction
    if (!["asc", "desc"].includes(direction)) {
        console.warn(
            `Invalid sort direction "${direction}" - must be "asc" or "desc"`
        );
        return;
    }

    // 2. Validate column
    const columnExists = this.columns.some(
        (col) => col.data === column || col.name === column
    );
    if (!columnExists) {
        console.warn(
            `Invalid column "${column}" - not found in column definition`
        );
        return;
    }

    // 3. Apply and fetch
    this.sort = column;
    this.order = direction;
    this.fetchData();
}

export function clearSort() {
    this.sort = "";
    this.order = "";

    // Fetch data without sorting
    this.fetchData();
}
