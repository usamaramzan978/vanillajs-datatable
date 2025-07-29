export function goToPage(pageNumber) {
    const page = parseInt(pageNumber, 10);
    if (
        isNaN(page) ||
        page < 1 ||
        (this.totalPages && page > this.totalPages)
    ) {
        console.warn(`Invalid page number: ${pageNumber}`);
        return;
    }
    this.currentPage = page;
    this.fetchData(); // Re-fetch data for the new page
}

export function setPageSize(size) {
    const perPage = parseInt(size, 10);
    if (isNaN(perPage) || perPage <= 0) {
        console.warn(`Invalid page size: ${size}`);
        return;
    }

    this.rowsPerPage = perPage;
    this.currentPage = 1; // Reset to first page when page size changes
    this.fetchData();
}

export function getCurrentPage() {
    return this.currentPage;
}

// ----------  Navigation ----------
export function nextPage() {
    return this.goToPage(this.currentPage + 1);
}
export function prevPage() {
    return this.goToPage(this.currentPage - 1);
}
export function firstPage() {
    return this.goToPage(1);
}
export function lastPage() {
    if (!this.totalPages || this.totalPages < 1) {
        console.warn("Cannot go to last page: totalPages is not defined");
        return;
    }

    return this.goToPage(this.totalPages);
}
