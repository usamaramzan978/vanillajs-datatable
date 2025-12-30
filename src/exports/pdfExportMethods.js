/**
 * PDF Export Methods
 * Handles all PDF export functionality including data fetching, PDF generation, and image loading
 */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
    applyTextToPdf,
    applyImageToPdf,
} from "./exportCustomization.js";

/**
 * Load image as data URL (base64) for PDF generation
 * @param {string} imageSrc - Image source URL or path
 * @returns {Promise<string>} Base64 data URL
 */
export async function loadImageAsDataUrl(imageSrc) {
    return new Promise((resolve, reject) => {
        // If already a data URL, return as is
        if (imageSrc.startsWith("data:")) {
            resolve(imageSrc);
            return;
        }

        const img = new Image();
        img.crossOrigin = "anonymous"; // Handle CORS

        img.onload = () => {
            try {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                const dataUrl = canvas.toDataURL("image/png");
                resolve(dataUrl);
            } catch (error) {
                reject(
                    new Error(`Failed to convert image to data URL: ${error.message}`)
                );
            }
        };

        img.onerror = () => {
            reject(new Error(`Failed to load image: ${imageSrc}`));
        };

        img.src = imageSrc;
    });
}

/**
 * Pre-load all images from customElements before PDF generation
 * @param {Array} customElements - Array of custom elements
 * @returns {Promise<void>}
 */
export async function preloadPdfImages(customElements) {
    if (!customElements || !Array.isArray(customElements)) {
        return;
    }

    const imageElements = customElements.filter((el) => el.type === "image");

    // Pre-convert all image URLs to data URLs
    for (const element of imageElements) {
        const imageSrc = element.image || element.content;
        if (
            typeof imageSrc === "string" &&
            (imageSrc.startsWith("http://") ||
                imageSrc.startsWith("https://") ||
                imageSrc.startsWith("/") ||
                imageSrc.startsWith("./")) &&
            !imageSrc.startsWith("data:")
        ) {
            try {
                const dataUrl = await loadImageAsDataUrl(imageSrc);
                // Update element with data URL for faster rendering
                element._preloadedDataUrl = dataUrl;
            } catch (error) {
                console.warn("Failed to pre-load image:", imageSrc, error);
            }
        }
    }
}

/**
 * Fetch total record count for progress tracking
 * @param {string} url - API endpoint URL
 * @param {URLSearchParams} baseParams - Base query parameters
 * @returns {Promise<number>} Total record count
 */
export async function fetchTotalRecordCount(url, baseParams) {
    const totalCountParams = new URLSearchParams(baseParams);
    totalCountParams.set("export", "true");
    totalCountParams.set("perPage", "1");

    try {
        const countResponse = await fetch(`${url}?${totalCountParams.toString()}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "X-Requested-With": "XMLHttpRequest",
            },
        });

        if (!countResponse.ok) {
            throw new Error(`HTTP error! status: ${countResponse.status}`);
        }

        const countJson = await countResponse.json();
        return countJson.total || countJson.meta?.total || 0;
    } catch (e) {
        console.warn("Could not fetch total count, progress will be estimated");
        return 0;
    }
}

/**
 * Fetch data chunks for PDF export
 * @param {Object} context - DataTable instance context
 * @param {Object} config - Export configuration
 * @param {Array} visibleColumns - Visible columns to export
 * @param {URLSearchParams} exportParams - Export query parameters
 * @returns {Promise<Array>} Array of processed data rows
 */
export async function fetchDataForPdf(context, config, visibleColumns, exportParams) {
    const { fileName, chunkSize, footer } = config;
    const { url, dataSrc, search, sort, order, columnFilters, exportProgress } = context;

    // Get total count for progress tracking
    const totalCountParams = new URLSearchParams({
        search: search || "",
        sortBy: sort || "id",
        order: order || "asc",
        columnFilters: JSON.stringify(columnFilters || {}),
    });

    const totalRecords = await fetchTotalRecordCount(url, totalCountParams);

    // Show progress UI
    if (context.showExportProgress) {
        context.showExportProgress("pdf", totalRecords || 100000);
    }

    const allData = [];
    let page = 1;
    let totalProcessed = 0;
    let hasMoreData = true;

    while (hasMoreData) {
        // Check for cancellation
        if (exportProgress?.cancelController?.signal.aborted) {
            throw new Error("Export cancelled by user");
        }

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
                    "X-Requested-For": "pdf-export",
                },
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(
                    `PDF export data request failed with status: ${response.status}`
                );
            }

            const json = await response.json();
            const dataChunk = json[dataSrc] || [];

            if (dataChunk.length === 0) {
                break; // Stop if no more data
            }

            totalProcessed += dataChunk.length;

            // Update progress
            if (context.updateExportProgress) {
                const progressTotal = totalRecords || 100000;
                context.updateExportProgress(totalProcessed, progressTotal);
            }

            // Process data chunk
            const processedChunk = dataChunk.map((row) => {
                const pdfRow = {};
                visibleColumns.forEach((column) => {
                    let cellValue = row[column.name] || "";

                    if (column.pdfRender) {
                        cellValue = column.pdfRender(cellValue, row);
                    } else if (column.render && column.useRenderForPdf) {
                        cellValue = column.render(cellValue, row);
                    }

                    pdfRow[column.label || column.name] = cellValue;
                });
                return pdfRow;
            });

            allData.push(...processedChunk);

            // Stop if we received less than the chunk size
            hasMoreData = dataChunk.length === chunkSize;
            page++;
        } catch (error) {
            console.error("Error fetching data chunk for PDF:", error);
            hasMoreData = false;
            throw error;
        }
    }

    if (allData.length === 0) {
        if (context.hideExportProgress) {
            context.hideExportProgress();
        }
        console.warn("No data to export.");
        return [];
    }

    return {
        data: allData,
        totalProcessed,
        fileName,
        visibleColumns,
        footer,
    };
}

/**
 * Generate PDF document from data
 * @param {Object} context - DataTable instance context
 * @param {Object} config - PDF generation configuration
 * @returns {Promise<void>}
 */
export async function generatePdf(context, config) {
    const {
        fileName,
        visibleColumns,
        data,
        totalProcessed,
        footer,
    } = config;

    const { exportable, search } = context;

    const pdfExportOptions = {
        orientation: exportable.pdfOptions.orientation,
        unit: exportable.pdfOptions.unit,
        format: exportable.pdfOptions.format,
        theme: exportable.pdfOptions.theme,
    };

    const doc = new jsPDF({
        orientation: pdfExportOptions.orientation,
        unit: pdfExportOptions.unit,
        format: pdfExportOptions.format,
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Pre-load all images from customElements before PDF generation
    if (
        exportable?.customElements?.pdf &&
        Array.isArray(exportable.customElements.pdf)
    ) {
        await preloadPdfImages(exportable.customElements.pdf);
    }

    // Prepare headers and body
    const headers = [visibleColumns.map((col) => col.label || col.name)];
    const body = data.map((row) => {
        return visibleColumns.map(
            (col) => row[col.label || col.name] || ""
        );
    });

    // Apply custom elements before table (header area)
    if (
        exportable?.customElements?.pdf &&
        Array.isArray(exportable.customElements.pdf)
    ) {
        const headerElements = exportable.customElements.pdf.filter(
            (el) =>
                (el.position?.includes("top") ||
                    el.position === "center-left" ||
                    el.position === "center-right") &&
                el.repeatOnPages !== true
        );

        // Apply text elements synchronously
        headerElements
            .filter((el) => el.type === "text")
            .forEach((el) => {
                applyTextToPdf(doc, el, pageWidth, pageHeight);
            });

        // Apply image elements asynchronously (before table generation)
        const imagePromises = headerElements
            .filter((el) => el.type === "image")
            .map((el) => applyImageToPdf(doc, el, pageWidth, pageHeight));

        // Wait for all images to load before continuing
        await Promise.all(imagePromises);
    }

    // Calculate starting Y position
    const hasFilters = search;
    let startY = 25;

    if (hasFilters) {
        const filterInfo = [];
        if (search) filterInfo.push(`Search: ${search}`);
        doc.setFontSize(9);
        doc.text(filterInfo.join(" | "), 15, startY);
        startY += 10; // shift down to avoid overlap
    }

    // Generate PDF table
    autoTable(doc, {
        startY: startY + 5,
        head: headers,
        body: body,
        theme: pdfExportOptions.theme,
        styles: {
            fontSize: 10,
            cellPadding: 3,
        },
        headStyles: {
            fillColor: exportable.pdfOptions.headerStyles.fillColor,
            textColor: exportable.pdfOptions.headerStyles.textColor,
        },
        margin: { top: 20 },
        didDrawPage: (dataArg) => {
            const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;
            const totalPages = doc.internal.getNumberOfPages();

            // Apply custom elements on each page
            if (
                exportable?.customElements?.pdf &&
                Array.isArray(exportable.customElements.pdf)
            ) {
                const pageElements = exportable.customElements.pdf.filter((el) => {
                    // Apply elements that should repeat on pages, or elements positioned at bottom/center
                    return (
                        el.repeatOnPages === true ||
                        el.position?.includes("bottom") ||
                        el.position === "center" ||
                        (pageNumber === 1 &&
                            (el.position?.includes("top") ||
                                el.position === "center-left" ||
                                el.position === "center-right"))
                    );
                });

                // Apply text elements synchronously
                pageElements
                    .filter((el) => el.type === "text")
                    .forEach((el) => {
                        applyTextToPdf(doc, el, pageWidth, pageHeight);
                    });

                // Apply image elements asynchronously
                const imageElements = pageElements.filter(
                    (el) => el.type === "image"
                );
                if (imageElements.length > 0) {
                    imageElements.forEach((el) => {
                        applyImageToPdf(doc, el, pageWidth, pageHeight).catch(
                            (err) => {
                                console.warn("Failed to apply image in PDF:", err);
                            }
                        );
                    });
                }
            }

            try {
                doc.setGState(new doc.GState({ opacity: 1 }));
            } catch (e) {
                doc.setTextColor(30); // fallback: dark text
            }

            // Footer / pagination - only show if footer is enabled
            if (footer) {
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(
                    `Page ${pageNumber} of ${totalPages} (${totalProcessed} records)`,
                    pageWidth / 2,
                    pageHeight - 10,
                    { align: "center" }
                );
            }
        },
    });

    doc.save(fileName || "export.pdf");
}

/**
 * Main PDF export function - orchestrates the entire export process
 * @param {Object} context - DataTable instance context
 * @returns {Promise<void>}
 */
export async function downloadPdf(context) {
    try {
        const visibleColumns = context.getExportableColumns("pdf");

        // Prepare PDF download parameters
        const exportParams = new URLSearchParams({
            search: context.search || "",
            sortBy: context.sort || "id",
            order: context.order || "asc",
            columnFilters: JSON.stringify(context.columnFilters || {}),
            export: "true",
        });

        const exportableConfig = {
            fileName: context.exportable.fileName.pdf || "datatable.pdf",
            chunkSize: context.exportable.chunkSize.pdf || 500,
            footer: context.exportable.footer || false,
        };

        // Fetch all data
        const pdfData = await fetchDataForPdf(
            context,
            exportableConfig,
            visibleColumns,
            exportParams
        );

        if (pdfData.data.length === 0) {
            return;
        }

        // Generate PDF
        await generatePdf(context, pdfData);

        // Hide progress and call completion callback
        if (context.hideExportProgress) {
            context.hideExportProgress();
        }

        if (context.exportable.onExportComplete) {
            try {
                context.exportable.onExportComplete("pdf", pdfData.fileName);
            } catch (error) {
                console.error("Error in onExportComplete callback:", error);
            }
        }
    } catch (error) {
        if (context.hideExportProgress) {
            context.hideExportProgress();
        }

        if (context.exportable.onExportError) {
            try {
                context.exportable.onExportError(error, "pdf");
            } catch (err) {
                console.error("Error in onExportError callback:", err);
            }
        }

        if (error.message !== "Export cancelled by user") {
            console.error("PDF export failed:", error);
        }
    }
}

