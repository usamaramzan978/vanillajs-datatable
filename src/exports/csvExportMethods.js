/**
 * CSV Export Methods
 * Handles all CSV export functionality including data fetching, CSV generation, and download
 */

import { fetchTotalRecordCount } from "./pdfExportMethods.js";

/**
 * Escape CSV value (handles quotes and special characters)
 * @param {*} value - Value to escape
 * @returns {string} Escaped CSV value
 */
export function escapeCsvValue(value) {
    return `"${String(value).replace(/"/g, '""')}"`;
}

/**
 * Process row data for CSV export
 * @param {Object} row - Row data object
 * @param {Array} visibleColumns - Visible columns configuration
 * @returns {Array<string>} Array of escaped CSV cell values
 */
export function processRowForCsv(row, visibleColumns) {
    const csvRow = [];
    visibleColumns.forEach((column) => {
        // Handle cell value based on column configuration
        let cellValue = row[column.name] || "";

        // Apply custom render function if it exists and is meant for export
        if (column.exportRender) {
            cellValue = column.exportRender(cellValue, row);
        } else if (column.render && column.useRenderForExport) {
            // Extract text content from HTML if render function is used
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = column.render(cellValue, row);
            cellValue = tempDiv.textContent || tempDiv.innerText || "";
        }

        // Escape quotes and format for CSV
        csvRow.push(escapeCsvValue(cellValue));
    });
    return csvRow;
}

/**
 * Fetch data chunks for CSV export
 * @param {Object} context - DataTable instance context
 * @param {Object} config - Export configuration
 * @param {Array} visibleColumns - Visible columns to export
 * @param {URLSearchParams} exportParams - Export query parameters
 * @returns {Promise<Object>} Object with csvContent and totalProcessed
 */
export async function fetchDataForCsv(context, config, visibleColumns, exportParams) {
    const { chunkSize } = config;
    const { url, dataSrc, search, sort, order, columnFilters, exportProgress } = context;

    // Get total count for progress tracking
    const totalCountParams = new URLSearchParams({
        search: search || "",
        sortBy: sort || "id",
        order: order || "asc",
        columnFilters: JSON.stringify(columnFilters || {}),
    });

    let totalRecords = 0;
    try {
        totalRecords = await fetchTotalRecordCount(url, totalCountParams);
    } catch (e) {
        console.warn(
            "Could not fetch total count, progress will be estimated"
        );
    }

    // Show progress UI
    if (context.showExportProgress) {
        context.showExportProgress("csv", totalRecords || 100000);
    }

    // Create CSV headers
    const headers = visibleColumns.map((col) =>
        escapeCsvValue(col.name || col.label)
    );

    let csvContent = headers.join(",") + "\r\n";
    let page = 1;
    let hasMoreData = true;
    let totalProcessed = 0;

    while (hasMoreData) {
        // Check for cancellation
        if (exportProgress?.cancelController?.signal.aborted) {
            throw new Error("Export cancelled by user");
        }

        // Update pagination parameters for this chunk
        exportParams.set("page", page);
        exportParams.set("perPage", chunkSize);

        try {
            const controller =
                exportProgress?.cancelController || new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

            const response = await fetch(`${url}?${exportParams.toString()}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-Requested-For": "export-csv",
                },
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(
                    `CSV export data request failed with status: ${response.status}`
                );
            }

            const json = await response.json();
            const dataChunk = json[dataSrc] || [];

            // Check if this is the last chunk
            hasMoreData = dataChunk.length === chunkSize;
            totalProcessed += dataChunk.length;

            // Update progress
            if (context.updateExportProgress) {
                const progressTotal = totalRecords || 100000;
                context.updateExportProgress(totalProcessed, progressTotal);
            }

            // Process and add this chunk of data to CSV content
            if (dataChunk.length > 0) {
                dataChunk.forEach((row) => {
                    const csvRow = processRowForCsv(row, visibleColumns);
                    csvContent += csvRow.join(",") + "\r\n";
                });
            }

            // Move to next page
            page++;

            // Safety check - don't process too many records to avoid memory issues
            if (totalProcessed > 100000) {
                console.warn(
                    "Reached maximum safe export size (100,000 records)"
                );
                hasMoreData = false;
            }
        } catch (error) {
            console.error("Error fetching data chunk:", error);
            hasMoreData = false; // Stop on error
            throw error;
        }
    }

    return {
        csvContent,
        totalProcessed,
        fileName: config.fileName,
    };
}

/**
 * Download CSV file
 * @param {string} csvContent - CSV content string
 * @param {string} fileName - File name (without extension)
 */
export function downloadCsvFile(csvContent, fileName) {
    const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // Clean up the URL object
}

/**
 * Download current page CSV (fallback method)
 * @param {HTMLElement} table - Table DOM element
 * @returns {boolean} Success status
 */
export function downloadCurrentPageCSV(table) {
    try {
        if (!table) return false;

        let csv = "";
        const headers = table.querySelectorAll("thead th");
        let headerRow = [];

        headers.forEach((header) => {
            const headerText = header.innerText.trim();
            headerRow.push(escapeCsvValue(headerText));
        });

        csv += headerRow.join(",") + "\r\n";

        const rows = table.querySelectorAll("tbody tr");
        rows.forEach((row) => {
            let rowData = [];
            row.querySelectorAll("td").forEach((td) => {
                // Get only text content, strip HTML
                const cellText = td.innerText.trim();
                rowData.push(escapeCsvValue(cellText));
            });
            csv += rowData.join(",") + "\r\n";
        });

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `current-page-data-${new Date()
            .toISOString()
            .slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        alert(
            "Only current page data was exported due to an error with the full export."
        );
        return true;
    } catch (error) {
        console.error("Error with fallback CSV download:", error);
        alert("Unable to download data. Please try again later.");
        return false;
    }
}

/**
 * Main CSV export function - orchestrates the entire export process
 * @param {Object} context - DataTable instance context
 * @returns {Promise<void>}
 */
export async function downloadCSV(context) {
    try {
        const visibleColumns = context.getExportableColumns("csv");

        // Prepare CSV download parameters
        const exportParams = new URLSearchParams({
            search: context.search || "",
            sortBy: context.sort || "id",
            order: context.order || "asc",
            columnFilters: JSON.stringify(context.columnFilters || {}),
            export: "true",
        });

        const exportableCsvConfig = {
            fileName: context.exportable.fileName.csv,
            chunkSize: context.exportable.chunkSize.csv,
        };

        // Fetch all data and build CSV content
        const csvData = await fetchDataForCsv(
            context,
            exportableCsvConfig,
            visibleColumns,
            exportParams
        );

        // Download CSV file
        downloadCsvFile(csvData.csvContent, csvData.fileName);

        // Hide progress and call completion callback
        if (context.hideExportProgress) {
            context.hideExportProgress();
        }

        if (context.exportable.onExportComplete) {
            try {
                context.exportable.onExportComplete(
                    "csv",
                    `${csvData.fileName}.csv`
                );
            } catch (error) {
                console.error("Error in onExportComplete callback:", error);
            }
        }

        console.log(
            `CSV export completed with ${csvData.totalProcessed} records`
        );
    } catch (error) {
        if (context.hideExportProgress) {
            context.hideExportProgress();
        }

        if (context.exportable.onExportError) {
            try {
                context.exportable.onExportError(error, "csv");
            } catch (err) {
                console.error("Error in onExportError callback:", err);
            }
        }

        if (error.message !== "Export cancelled by user") {
            console.error("Error downloading CSV:", error);
            alert("Error downloading CSV. Please try again.");

            // Fallback to current page only if full export fails
            if (context.table) {
                downloadCurrentPageCSV(context.table);
            }
        }
    }
}

