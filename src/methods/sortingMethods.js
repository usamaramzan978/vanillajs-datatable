export function setSort(column, direction = "asc") {
    if (!["asc", "desc"].includes(direction)) {
        console.warn(
            `Invalid sort direction "${direction}" - must be "asc" or "desc"`
        );
        return;
    }

    this.sort = column;
    this.order = direction;

    // Fetch data from server with new sorting applied
    this.fetchData();
}

export function clearSort() {
    this.sort = "";
    this.order = "";

    // Fetch data without sorting
    this.fetchData();
}
