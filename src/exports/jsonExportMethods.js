/**
 * JSON Export Methods
 * Handles all JSON export functionality including data fetching and download
 */

import { fetchTotalRecordCount } from "./pdfExportMethods.js";

/**
 * Download JSON file
 * @param {Object|Array} data - Data to export
 * @param {string} fileName - File name (without extension)
 */
export function downloadJSONFile(data, fileName = "data.json") {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName.endsWith(".json") ? fileName : `${fileName}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Delay revoking the URL to ensure the download completes
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Fetch data chunks for JSON export
 * @param {Object} context - DataTable instance context
 * @param {Object} config - Export configuration
 * @param {URLSearchParams} exportParams - Export query parameters
 * @returns {Promise<Array>} Array of all records
 */
export async function fetchDataForJson(context, config, exportParams) {
    const { chunkSize } = config;
    const { url, dataSrc, search, sort, order, columnFilters, exportProgress } =
        context;

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
        console.warn("Could not fetch total count, progress will be estimated");
    }

    // Show progress UI
    if (context.showExportProgress) {
        context.showExportProgress("json", totalRecords || 100000);
    }

    let page = 1;
    let hasMoreData = true;
    let totalProcessed = 0;
    let allData = [];

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
                    "X-Requested-For": "export-json",
                },
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(
                    `JSON export data request failed with status: ${response.status}`
                );
            }

            const json = await response.json();
            const dataChunk = dataSrc ? json[dataSrc] : json.data || [];

            // Check if this is the last chunk
            hasMoreData = dataChunk.length === chunkSize;
            totalProcessed += dataChunk.length;

            // Add chunk to all data
            allData = allData.concat(dataChunk);

            // Update progress
            if (context.updateExportProgress) {
                const progressTotal = totalRecords || 100000;
                context.updateExportProgress(totalProcessed, progressTotal);
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

    return allData;
}

/**
 * Export all records as JSON (fetches from server with filters/search)
 * @param {Object} context - DataTable instance context
 * @returns {Promise<void>}
 */
export async function exportJSON(context) {
    try {
        const exportableJsonConfig = {
            fileName: context.exportable?.fileName?.json || "table-data",
            chunkSize: context.exportable?.chunkSize?.json || 100,
        };

        // Prepare export parameters
        const exportParams = new URLSearchParams({
            search: context.search || "",
            sortBy: context.sort || "id",
            order: context.order || "asc",
            columnFilters: JSON.stringify(context.columnFilters || {}),
            export: "true",
        });

        // Fetch all data
        const allData = await fetchDataForJson(
            context,
            exportableJsonConfig,
            exportParams
        );

        // Download JSON file
        downloadJSONFile(allData, exportableJsonConfig.fileName);

        // Hide progress and call completion callback
        if (context.hideExportProgress) {
            context.hideExportProgress();
        }

        if (context.exportable?.onExportComplete) {
            try {
                context.exportable.onExportComplete(
                    "json",
                    `${exportableJsonConfig.fileName}.json`
                );
            } catch (error) {
                console.error("Error in onExportComplete callback:", error);
            }
        }

        console.log(`JSON export completed with ${allData.length} records`);
    } catch (error) {
        if (context.hideExportProgress) {
            context.hideExportProgress();
        }

        if (context.exportable?.onExportError) {
            try {
                context.exportable.onExportError(error, "json");
            } catch (err) {
                console.error("Error in onExportError callback:", err);
            }
        }

        if (error.message !== "Export cancelled by user") {
            console.error("Error exporting JSON:", error);
            alert("Error exporting JSON. Please try again.");
        }
    }
}

/**
 * Export selected records as JSON (from current data)
 * @param {Array} data - Current table data
 * @param {Array<string|number>} selectedIds - Array of selected row IDs
 * @param {string} fileName - File name (optional)
 * @returns {void}
 */
export function downloadSelectedJSON(
    data,
    selectedIds,
    fileName = "selected-data.json"
) {
    if (!selectedIds || selectedIds.length === 0) {
        console.error("Please select at least one row to export.");
        return;
    }

    // Filter selected data
    const selectedData = data.filter(
        (row) =>
            selectedIds.includes(String(row.id)) || selectedIds.includes(row.id)
    );

    if (selectedData.length === 0) {
        console.error("No matching records found for selected IDs.");
        return;
    }

    // Download JSON file
    downloadJSONFile(selectedData, fileName);

    console.log(
        `JSON export completed with ${selectedData.length} selected records`
    );
}

/**
 * Export current page data as JSON (simple export without server fetch)
 * @param {Array} data - Current table data
 * @param {string} fileName - File name (optional)
 * @returns {void}
 */
export function exportCurrentPageJSON(
    data,
    fileName = "current-page-data.json"
) {
    if (!data || data.length === 0) {
        console.error("No data available to export.");
        return;
    }

    downloadJSONFile(data, fileName);
    console.log(
        `JSON export completed with ${data.length} records from current page`
    );
}
