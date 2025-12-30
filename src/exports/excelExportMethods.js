/**
 * Excel Export Methods
 * Handles all Excel export functionality including data fetching, Excel generation, and download
 */

import { fetchTotalRecordCount } from "./pdfExportMethods.js";

/**
 * Process row data for Excel export
 * @param {Object} row - Row data object
 * @param {Array} visibleColumns - Visible columns configuration
 * @returns {Array} Array of cell values
 */
export function processRowForExcel(row, visibleColumns) {
    const excelRow = [];
    visibleColumns.forEach((column) => {
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

        excelRow.push(cellValue);
    });
    return excelRow;
}

/**
 * Fetch data chunks for Excel export
 * @param {Object} context - DataTable instance context
 * @param {Object} config - Export configuration
 * @param {Array} visibleColumns - Visible columns to export
 * @param {Object} worksheet - ExcelJS worksheet instance
 * @param {URLSearchParams} exportParams - Export query parameters
 * @returns {Promise<number>} Total rows exported
 */
export async function fetchDataForExcel(
    context,
    config,
    visibleColumns,
    worksheet,
    exportParams
) {
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
        context.showExportProgress("excel", totalRecords || 100000);
    }

    let page = 1;
    const maxExcelRecords = 100000;
    let totalRowsExported = 0;
    let hasMoreData = true;

    while (hasMoreData && totalRowsExported < maxExcelRecords) {
        // Check for cancellation
        if (exportProgress?.cancelController?.signal.aborted) {
            throw new Error("Export cancelled by user");
        }

        // Adjust chunkSize dynamically if near maxExcelRecords limit
        const rowsLeft = maxExcelRecords - totalRowsExported;
        const currentChunkSize = Math.min(chunkSize, rowsLeft);

        exportParams.set("page", page);
        exportParams.set("perPage", currentChunkSize);

        // Use the cancel controller for fetch
        const controller =
            exportProgress?.cancelController || new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

        const response = await fetch(`${url}?${exportParams.toString()}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "X-Requested-With": "XMLHttpRequest",
                "X-Requested-For": "export-chunk",
            },
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(
                `Excel export data request failed with status: ${response.status}`
            );
        }

        const json = await response.json();
        const dataChunk = dataSrc ? json[dataSrc] : json.data || [];

        // Add rows to worksheet
        dataChunk.forEach((row) => {
            if (totalRowsExported >= maxExcelRecords) {
                hasMoreData = false; // reached max rows
                return;
            }

            const excelRow = processRowForExcel(row, visibleColumns);
            worksheet.addRow(excelRow);
            totalRowsExported++;
        });

        // Update progress
        if (context.updateExportProgress) {
            const progressTotal = totalRecords || maxExcelRecords;
            context.updateExportProgress(totalRowsExported, progressTotal);
        }

        // Check if fewer rows returned than requested or max reached
        hasMoreData =
            hasMoreData &&
            dataChunk.length === currentChunkSize &&
            totalRowsExported < maxExcelRecords;
        page++;
    }

    return totalRowsExported;
}

/**
 * Download Excel file
 * @param {Object} workbook - ExcelJS workbook instance
 * @param {string} fileName - File name (without extension)
 */
export async function downloadExcelFile(workbook, fileName) {
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${fileName}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

/**
 * Main Excel export function - orchestrates the entire export process
 * @param {Object} context - DataTable instance context
 * @returns {Promise<void>}
 */
export async function exportToExcel(context) {
    try {
        // Dynamically import ExcelJS
        const { default: ExcelJS } = await import("exceljs");
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");

        const visibleColumns = context.getExportableColumns("excel");

        // Add header row
        worksheet.addRow(
            visibleColumns.map((col) => col.label || col.name)
        );

        const exportableExcelConfig = {
            fileName: context.exportable.fileName.excel,
            chunkSize: context.exportable.chunkSize.excel,
        };

        // Prepare export parameters
        const exportParams = new URLSearchParams({
            search: context.search || "",
            sortBy: context.sort || "id",
            order: context.order || "asc",
            columnFilters: JSON.stringify(context.columnFilters || {}),
            export: "true",
        });

        // Fetch all data and build Excel workbook
        const totalRowsExported = await fetchDataForExcel(
            context,
            exportableExcelConfig,
            visibleColumns,
            worksheet,
            exportParams
        );

        // Download Excel file
        await downloadExcelFile(workbook, exportableExcelConfig.fileName);

        // Hide progress and call completion callback
        if (context.hideExportProgress) {
            context.hideExportProgress();
        }

        if (context.exportable.onExportComplete) {
            try {
                context.exportable.onExportComplete(
                    "excel",
                    `${exportableExcelConfig.fileName}.xlsx`
                );
            } catch (error) {
                console.error("Error in onExportComplete callback:", error);
            }
        }

        console.log("Excel export completed successfully");
    } catch (error) {
        if (context.hideExportProgress) {
            context.hideExportProgress();
        }

        if (context.exportable.onExportError) {
            try {
                context.exportable.onExportError(error, "excel");
            } catch (err) {
                console.error("Error in onExportError callback:", err);
            }
        }

        if (error.message !== "Export cancelled by user") {
            console.error("Error exporting data:", error);
        }
    }
}

