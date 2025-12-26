/**
 * Export Customization Module
 * Allows users to add custom text or images to exports (PDF, Print, Excel) with flexible positioning
 */

/**
 * Calculate position coordinates based on position string and page dimensions
 * @param {string} position - Position string (e.g., 'top-left', 'center', 'bottom-right', or 'custom')
 * @param {number} pageWidth - Page width
 * @param {number} pageHeight - Page height
 * @param {Object} customPosition - Custom x, y coordinates (when position is 'custom')
 * @param {Object} margin - Margin object with top, right, bottom, left
 * @returns {Object} {x, y} coordinates
 */
export function calculatePosition(
    position,
    pageWidth,
    pageHeight,
    customPosition = {},
    margin = { top: 10, right: 10, bottom: 10, left: 10 }
) {
    const { top = 10, right = 10, bottom = 10, left = 10 } = margin;

    switch (position) {
        case "top-left":
            return { x: left, y: top };
        case "top-center":
            return { x: pageWidth / 2, y: top };
        case "top-right":
            return { x: pageWidth - right, y: top };
        case "center-left":
            return { x: left, y: pageHeight / 2 };
        case "center":
            return { x: pageWidth / 2, y: pageHeight / 2 };
        case "center-right":
            return { x: pageWidth - right, y: pageHeight / 2 };
        case "bottom-left":
            return { x: left, y: pageHeight - bottom };
        case "bottom-center":
            return { x: pageWidth / 2, y: pageHeight - bottom };
        case "bottom-right":
            return { x: pageWidth - right, y: pageHeight - bottom };
        case "custom":
            return {
                x: customPosition.x || left,
                y: customPosition.y || top,
            };
        default:
            return { x: pageWidth / 2, y: top };
    }
}

/**
 * Get text alignment based on position
 * @param {string} position - Position string
 * @returns {string} Alignment ('left', 'center', 'right')
 */
export function getTextAlign(position) {
    if (position.includes("left")) return "left";
    if (position.includes("right")) return "right";
    if (position.includes("center") || position === "center") return "center";
    return "left";
}

/**
 * Apply text element to PDF document
 * @param {Object} doc - jsPDF document instance
 * @param {Object} element - Element configuration
 * @param {number} pageWidth - Page width
 * @param {number} pageHeight - Page height
 */
export function applyTextToPdf(doc, element, pageWidth, pageHeight) {
    const {
        text,
        content, // Support both 'text' and 'content' for flexibility
        position = "top-center",
        customPosition = {},
        margin = {},
        fontSize = 12,
        fontStyle = "normal", // 'normal', 'bold', 'italic', 'bolditalic'
        color = [0, 0, 0], // RGB array
        opacity = 1,
        angle = 0,
        align = null, // Override auto-alignment
    } = element;

    // Support both 'text' and 'content' properties
    const textContent = text || content;
    if (!textContent) return;

    const { x, y } = calculatePosition(
        position,
        pageWidth,
        pageHeight,
        customPosition,
        margin
    );
    const textAlign = align || getTextAlign(position);

    // Save graphics state for opacity
    doc.saveGraphicsState?.();

    try {
        if (opacity < 1) {
            doc.setGState?.(new doc.GState({ opacity }));
        }
    } catch (e) {
        // Fallback if setGState not available
    }

    // Set font properties
    doc.setFontSize(fontSize);
    doc.setFont(undefined, fontStyle);
    doc.setTextColor(...color);

    // Draw text
    doc.text(textContent, x, y, {
        align: textAlign,
        baseline: "top",
        angle: angle,
    });

    // Restore graphics state
    doc.restoreGraphicsState?.();
}

/**
 * Apply image element to PDF document
 * @param {Object} doc - jsPDF document instance
 * @param {Object} element - Element configuration
 * @param {number} pageWidth - Page width
 * @param {number} pageHeight - Page height
 * @returns {Promise} Promise that resolves when image is added
 */
export async function applyImageToPdf(doc, element, pageWidth, pageHeight) {
    const {
        image, // URL, base64, or File
        content, // Support both 'image' and 'content' for flexibility
        position = "top-left",
        customPosition = {},
        margin = {},
        width = null, // Auto if null
        height = null, // Auto if null
        opacity = 1,
        angle = 0,
    } = element;

    // Support both 'image' and 'content' properties
    // Check if image was pre-loaded (for faster rendering)
    const imageSrc = element._preloadedDataUrl || image || content;
    if (!imageSrc) return;

    return new Promise((resolve, reject) => {
        try {
            const { x, y } = calculatePosition(
                position,
                pageWidth,
                pageHeight,
                customPosition,
                margin
            );

            // Handle different image sources
            let finalImageSrc = imageSrc;

            // If it's a File or Blob, convert to data URL
            if (imageSrc instanceof File || imageSrc instanceof Blob) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    finalImageSrc = e.target.result;
                    addImageToDoc();
                };
                reader.onerror = reject;
                reader.readAsDataURL(imageSrc);
            }
            // If it's a URL (string starting with http://, https://, or /), load it first
            else if (
                typeof imageSrc === "string" &&
                (imageSrc.startsWith("http://") ||
                    imageSrc.startsWith("https://") ||
                    imageSrc.startsWith("/") ||
                    imageSrc.startsWith("./"))
            ) {
                const img = new Image();
                img.crossOrigin = "anonymous"; // Handle CORS if needed
                img.onload = () => {
                    // Convert image to canvas then to data URL
                    try {
                        const canvas = document.createElement("canvas");
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext("2d");
                        ctx.drawImage(img, 0, 0);
                        finalImageSrc = canvas.toDataURL("image/png");
                        addImageToDoc();
                    } catch (error) {
                        // Fallback: try direct URL (may fail with CORS)
                        console.warn(
                            "Could not convert image to data URL, trying direct URL:",
                            error
                        );
                        finalImageSrc = imageSrc;
                        addImageToDoc();
                    }
                };
                img.onerror = () => {
                    console.error("Failed to load image:", imageSrc);
                    reject(new Error(`Failed to load image: ${imageSrc}`));
                };
                img.src = imageSrc;
            }
            // If it's already a data URL (base64), use it directly
            else {
                addImageToDoc();
            }

            function addImageToDoc() {
                try {
                    doc.saveGraphicsState?.();

                    if (opacity < 1) {
                        try {
                            doc.setGState?.(new doc.GState({ opacity }));
                        } catch (e) {
                            // Fallback
                        }
                    }

                    // Add image with optional rotation
                    if (angle !== 0) {
                        doc.save();
                        doc.translate(x, y);
                        doc.rotate((angle * Math.PI) / 180);
                        doc.addImage(
                            finalImageSrc,
                            x - (width || 50) / 2,
                            y - (height || 50) / 2,
                            width || 50,
                            height || 50
                        );
                        doc.restore();
                    } else {
                        doc.addImage(
                            finalImageSrc,
                            x,
                            y,
                            width || 50,
                            height || 50
                        );
                    }

                    doc.restoreGraphicsState?.();
                    resolve();
                } catch (error) {
                    reject(error);
                }
            }
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Apply text element to print window
 * @param {Object} printWindow - Print window document
 * @param {Object} element - Element configuration
 */
export function applyTextToPrint(printWindow, element) {
    const {
        text,
        content, // Support both 'text' and 'content' for flexibility
        position = "top-center",
        fontSize = 12,
        fontStyle = "normal",
        color = "#000000",
        className = "",
        style = {},
    } = element;

    // Support both 'text' and 'content' properties
    const textContent = text || content;
    if (!textContent || !printWindow || !printWindow.document) return;

    const textElement = printWindow.document.createElement("div");
    textElement.textContent = textContent;
    textElement.style.position = "absolute";
    textElement.style.fontSize = `${fontSize}px`;
    textElement.style.fontWeight = fontStyle.includes("bold")
        ? "bold"
        : "normal";
    textElement.style.fontStyle = fontStyle.includes("italic")
        ? "italic"
        : "normal";
    textElement.style.color = color;
    textElement.className = className;

    // Apply position
    const positionMap = {
        "top-left": { top: "10px", left: "10px" },
        "top-center": {
            top: "10px",
            left: "50%",
            transform: "translateX(-50%)",
        },
        "top-right": { top: "10px", right: "10px" },
        "center-left": {
            top: "50%",
            left: "10px",
            transform: "translateY(-50%)",
        },
        center: { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
        "center-right": {
            top: "50%",
            right: "10px",
            transform: "translateY(-50%)",
        },
        "bottom-left": { bottom: "10px", left: "10px" },
        "bottom-center": {
            bottom: "10px",
            left: "50%",
            transform: "translateX(-50%)",
        },
        "bottom-right": { bottom: "10px", right: "10px" },
    };

    const pos = positionMap[position] || positionMap["top-center"];
    Object.assign(textElement.style, pos, style);

    printWindow.document.body.appendChild(textElement);
}

/**
 * Apply image element to print window
 * @param {Object} printWindow - Print window document
 * @param {Object} element - Element configuration
 */
export function applyImageToPrint(printWindow, element) {
    const {
        image,
        content, // Support both 'image' and 'content' for flexibility
        position = "top-left",
        width = "auto",
        height = "auto",
        className = "",
        style = {},
    } = element;

    // Support both 'image' and 'content' properties
    const imageSrc = image || content;
    if (!imageSrc || !printWindow || !printWindow.document) return;

    const imgElement = printWindow.document.createElement("img");
    imgElement.src = imageSrc;
    imgElement.style.position = "absolute";
    imgElement.style.width = width === "auto" ? "auto" : `${width}px`;
    imgElement.style.height = height === "auto" ? "auto" : `${height}px`;
    imgElement.className = className;

    // Apply position (same as text)
    const positionMap = {
        "top-left": { top: "10px", left: "10px" },
        "top-center": {
            top: "10px",
            left: "50%",
            transform: "translateX(-50%)",
        },
        "top-right": { top: "10px", right: "10px" },
        "center-left": {
            top: "50%",
            left: "10px",
            transform: "translateY(-50%)",
        },
        center: { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
        "center-right": {
            top: "50%",
            right: "10px",
            transform: "translateY(-50%)",
        },
        "bottom-left": { bottom: "10px", left: "10px" },
        "bottom-center": {
            bottom: "10px",
            left: "50%",
            transform: "translateX(-50%)",
        },
        "bottom-right": { bottom: "10px", right: "10px" },
    };

    const pos = positionMap[position] || positionMap["top-left"];
    Object.assign(imgElement.style, pos, style);

    printWindow.document.body.appendChild(imgElement);
}

/**
 * Process all custom elements for PDF export
 * @param {Object} doc - jsPDF document instance
 * @param {Array} elements - Array of element configurations
 * @param {number} pageWidth - Page width
 * @param {number} pageHeight - Page height
 * @returns {Promise} Promise that resolves when all elements are applied
 */
export async function applyElementsToPdf(doc, elements, pageWidth, pageHeight) {
    if (!Array.isArray(elements) || elements.length === 0) return;

    const promises = [];

    for (const element of elements) {
        if (element.type === "text") {
            applyTextToPdf(doc, element, pageWidth, pageHeight);
        } else if (element.type === "image") {
            promises.push(applyImageToPdf(doc, element, pageWidth, pageHeight));
        }
    }

    await Promise.all(promises);
}

/**
 * Process all custom elements for print export
 * @param {Object} printWindow - Print window document
 * @param {Array} elements - Array of element configurations
 */
export function applyElementsToPrint(printWindow, elements) {
    if (!Array.isArray(elements) || elements.length === 0) return;

    for (const element of elements) {
        if (element.type === "text") {
            applyTextToPrint(printWindow, element);
        } else if (element.type === "image") {
            applyImageToPrint(printWindow, element);
        }
    }
}

/**
 * Validate element configuration
 * @param {Object} element - Element configuration
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateElement(element) {
    const errors = [];

    if (!element.type) {
        errors.push("Element type is required (text or image)");
    } else if (!["text", "image"].includes(element.type)) {
        errors.push('Element type must be "text" or "image"');
    }

    if (element.type === "text" && !element.text) {
        errors.push('Text element requires "text" property');
    }

    if (element.type === "image" && !element.image) {
        errors.push(
            'Image element requires "image" property (URL, base64, or File)'
        );
    }

    const validPositions = [
        "top-left",
        "top-center",
        "top-right",
        "center-left",
        "center",
        "center-right",
        "bottom-left",
        "bottom-center",
        "bottom-right",
        "custom",
    ];

    if (element.position && !validPositions.includes(element.position)) {
        errors.push(
            `Invalid position. Must be one of: ${validPositions.join(", ")}`
        );
    }

    if (
        element.position === "custom" &&
        (!element.customPosition ||
            (!element.customPosition.x && !element.customPosition.y))
    ) {
        errors.push(
            "Custom position requires customPosition object with x and y properties"
        );
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}
