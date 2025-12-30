/**
 * Print Export Methods
 * Handles all print export functionality including window creation, data fetching, and rendering
 */

import { applyElementsToPrint } from "./exportCustomization.js";

/**
 * Generate print window HTML template
 * @param {Array} visibleColumns - Visible columns to print
 * @param {boolean} footer - Whether to show footer
 * @returns {string} HTML string for print window
 */
export function generatePrintWindowHTML(visibleColumns, footer) {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Print Report</title>
            <style>
                @media print {
                    @page {
                        size: landscape;
                        margin: 0.5in;
                    }
                }
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.4;
                    color: #333;
                    margin: 20px;
                }
                .print-header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .print-title {
                    font-size: 20px;
                    font-weight: bold;
                    margin: 0;
                }
                .print-subtitle {
                    font-size: 14px;
                    color: #666;
                    margin: 5px 0 20px;
                }
                .print-meta {
                    font-size: 12px;
                    color: #777;
                    text-align: right;
                }
                .print-filters {
                    font-size: 12px;
                    margin-bottom: 15px;
                    padding: 10px;
                    background-color: #f5f5f5;
                    border-radius: 4px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                    page-break-inside: auto;
                }
                tr {
                    page-break-inside: avoid;
                    page-break-after: auto;
                }
                thead {
                    display: table-header-group;
                }
                th, td {
                    padding: 8px;
                    text-align: left;
                    border-bottom: 1px solid #ddd;
                    font-size: 12px;
                }
                th {
                    background-color: #f0f0f0;
                    font-weight: bold;
                }
                tbody tr:nth-child(even) {
                    background-color: #f9f9f9;
                }
                tfoot {
                    display: table-footer-group;
                }
                .print-footer {
                    text-align: center;
                    font-size: 12px;
                    color: #777;
                    margin-top: 30px;
                    position: fixed;
                    bottom: 20px;
                    left: 0;
                    right: 0;
                }
                .loading {
                    text-align: center;
                    padding: 40px;
                    font-size: 18px;
                    color: #666;
                }
                .no-print {
                    display: none;
                }
                .action-buttons {
                    text-align: center;
                    margin: 20px 0;
                }
                .action-buttons button {
                    padding: 8px 15px;
                    margin: 0 5px;
                    background: #4a6cf7;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                .action-buttons button:hover {
                    background: #3a56d4;
                }
                @media print {
                    .no-print, .action-buttons {
                        display: none !important;
                    }
                }
            </style>
        </head>
        <body>
            <!-- Title and metadata removed - use customElements instead -->
            <!-- Users can add titles via customElements.print if needed -->

            <div class="loading">Loading data for printing...</div>

            <table id="print-table">
                <thead>
                    <tr>
                        ${visibleColumns
                            .map(
                                (col) => `<th>${col.label || col.name}</th>`
                            )
                            .join("")}
                    </tr>
                </thead>
                <tbody>
                    <!-- Data will be inserted here -->
                </tbody>
            </table>

            ${
                footer
                    ? `<div class="print-footer">
                Page <span class="page-num"></span>
            </div>`
                    : ""
            }

            <div class="action-buttons no-print">
                <button onclick="window.print();">Print</button>
                <button onclick="window.close();">Close</button>
            </div>

            <script>
                // Page numbering for print
                window.onbeforeprint = function() {
                    const pageNumSpans = document.querySelectorAll('.page-num');
                    pageNumSpans.forEach(span => span.className = 'page-num-placeholder');
                };
            </script>
        </body>
        </html>
    `;
}

/**
 * Create and open print window
 * @param {Array} visibleColumns - Visible columns to print
 * @param {boolean} footer - Whether to show footer
 * @returns {Window|null} Print window instance or null if blocked
 */
export function createPrintWindow(visibleColumns, footer) {
    const printWindow = window.open("", "_blank", "height=600,width=800");
    
    if (!printWindow) {
        alert("Please allow pop-ups to use the print feature.");
        return null;
    }

    const html = generatePrintWindowHTML(visibleColumns, footer);
    printWindow.document.write(html);
    printWindow.document.close();

    return printWindow;
}

/**
 * Fetch data chunks for print export
 * @param {Object} context - DataTable instance context
 * @param {Object} config - Export configuration
 * @param {Array} visibleColumns - Visible columns to export
 * @param {Window} printWindow - Print window instance
 * @returns {Promise<string>} HTML table content string
 */
export async function fetchDataForPrint(context, config, visibleColumns, printWindow) {
    const { chunkSize } = config;
    const { url, dataSrc, search, sort, order, columnFilters } = context;

    const exportParams = new URLSearchParams({
        search: search || "",
        sortBy: sort || "id",
        order: order || "asc",
        columnFilters: JSON.stringify(columnFilters || {}),
        export: "true",
    });

    let page = 1;
    let hasMoreData = true;
    let totalProcessed = 0;
    let tableContent = "";

    while (hasMoreData) {
        // Update pagination parameters for this chunk
        exportParams.set("page", page);
        exportParams.set("perPage", chunkSize);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

            const response = await fetch(`${url}?${exportParams.toString()}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-Requested-For": "print",
                },
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(
                    `Print export data request failed with status: ${response.status}`
                );
            }

            const json = await response.json();
            const dataChunk = json[dataSrc] || [];

            // Check if this is the last chunk
            hasMoreData = dataChunk.length === chunkSize;
            totalProcessed += dataChunk.length;

            // Process and add this chunk of data to table content
            if (dataChunk.length > 0) {
                dataChunk.forEach((row) => {
                    tableContent += "<tr>";

                    visibleColumns.forEach((column) => {
                        // Handle cell value based on column configuration
                        let cellValue = row[column.name] || "";

                        // Apply custom render function if it exists and is meant for print
                        if (column.printRender) {
                            cellValue = column.printRender(cellValue, row);
                        } else if (column.render && column.useRenderForPrint) {
                            // Use the render function
                            cellValue = column.render(cellValue, row);
                        }

                        // Add the cell to the row
                        tableContent += `<td>${cellValue}</td>`;
                    });

                    tableContent += "</tr>";
                });
            }

            // Move to next page
            page++;
        } catch (error) {
            console.error("Error fetching data chunk for print:", error);
            hasMoreData = false; // Stop on error

            // Show error in print window
            if (printWindow && printWindow.document) {
                const loadingDiv = printWindow.document.querySelector(".loading");
                if (loadingDiv) {
                    loadingDiv.innerHTML = `<div style="color:red;">Error loading data: ${error.message}</div>`;
                }
            }
        }
    }

    return tableContent;
}

/**
 * Render print window with data and apply custom elements
 * @param {Window} printWindow - Print window instance
 * @param {string} tableContent - HTML table content
 * @param {Object} context - DataTable instance context
 */
export function renderPrintWindow(printWindow, tableContent, context) {
    if (!printWindow || !printWindow.document) {
        return;
    }

    const printTbody = printWindow.document.querySelector("#print-table tbody");
    const loadingDiv = printWindow.document.querySelector(".loading");

    if (printTbody) {
        if (loadingDiv) {
            loadingDiv.style.display = "none";
        }
        printTbody.innerHTML = tableContent;

        // Apply custom elements to print window
        if (
            context.exportable?.customElements?.print &&
            Array.isArray(context.exportable.customElements.print)
        ) {
            applyElementsToPrint(
                printWindow,
                context.exportable.customElements.print
            );
        }

        // Automatically print after data is ready
        printWindow.print();

        // Call completion callback (no progress modal for print)
        if (context.exportable.onExportComplete) {
            try {
                context.exportable.onExportComplete(
                    "print",
                    context.exportable.fileName.print
                );
            } catch (error) {
                console.error("Error in onExportComplete callback:", error);
            }
        }
    }
}

/**
 * Main print export function - orchestrates the entire print process
 * @param {Object} context - DataTable instance context
 * @returns {Promise<void>}
 */
export async function printTable(context) {
    try {
        // Don't show progress modal for print - it opens in a new window
        if (context.toggleLoadingSpinner) {
            context.toggleLoadingSpinner(true);
        }

        const visibleColumns = context.getExportableColumns("print");

        // Create print window
        const printWindow = createPrintWindow(
            visibleColumns,
            context.exportable.footer || false
        );

        if (!printWindow) {
            if (context.toggleLoadingSpinner) {
                context.toggleLoadingSpinner(false);
            }
            return;
        }

        const exportablePrintConfig = {
            fileName: context.exportable.fileName.print,
            chunkSize: context.exportable.chunkSize.print,
            footer: context.exportable.footer,
        };

        // Fetch all data
        const tableContent = await fetchDataForPrint(
            context,
            exportablePrintConfig,
            visibleColumns,
            printWindow
        );

        // Render print window
        renderPrintWindow(printWindow, tableContent, context);

        // Hide loading spinner
        if (context.toggleLoadingSpinner) {
            context.toggleLoadingSpinner(false);
        }
    } catch (error) {
        // Hide loading spinner
        if (context.toggleLoadingSpinner) {
            context.toggleLoadingSpinner(false);
        }

        // Call error callback (no progress modal for print)
        if (context.exportable.onExportError) {
            try {
                context.exportable.onExportError(error, "print");
            } catch (err) {
                console.error("Error in onExportError callback:", err);
            }
        }

        if (error.message !== "Export cancelled by user") {
            console.error("Error preparing print data:", error);
        }
    }
}

