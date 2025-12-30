/**
 * Event Handler API Methods
 * Public API methods for handling row and cell events
 */

/**
 * Register a callback for row click events
 * @param {Object} context - DataTable instance
 * @param {Function} callback - Callback function (rowId, rowData, rowElement, event)
 * @returns {void}
 */
export function onRowClick(context, callback) {
    if (typeof callback !== "function") {
        console.warn("onRowClick requires a function callback");
        return;
    }

    // Initialize callbacks array if not exists
    if (!context._rowClickCallbacks) {
        context._rowClickCallbacks = [];
    }

    context._rowClickCallbacks.push(callback);

    // Add event listener if first callback
    if (context._rowClickCallbacks.length === 1) {
        setupRowClickListener(context);
    }
}

/**
 * Register a callback for cell click events
 * @param {Object} context - DataTable instance
 * @param {Function} callback - Callback function (rowId, columnName, cellValue, cellElement, rowElement, rowData, event)
 * @returns {void}
 */
export function onCellClick(context, callback) {
    if (typeof callback !== "function") {
        console.warn("onCellClick requires a function callback");
        return;
    }

    // Initialize callbacks array if not exists
    if (!context._cellClickCallbacks) {
        context._cellClickCallbacks = [];
    }

    context._cellClickCallbacks.push(callback);

    // Add event listener if first callback
    if (context._cellClickCallbacks.length === 1) {
        setupCellClickListener(context);
    }
}

/**
 * Register a callback for row hover events
 * @param {Object} context - DataTable instance
 * @param {Function} callback - Callback function (rowId, rowData, rowElement, event)
 * @returns {void}
 */
export function onRowHover(context, callback) {
    if (typeof callback !== "function") {
        console.warn("onRowHover requires a function callback");
        return;
    }

    // Initialize callbacks array if not exists
    if (!context._rowHoverCallbacks) {
        context._rowHoverCallbacks = [];
    }

    context._rowHoverCallbacks.push(callback);

    // Add event listener if first callback
    if (context._rowHoverCallbacks.length === 1) {
        setupRowHoverListener(context);
    }
}

/**
 * Remove all row click callbacks
 * @param {Object} context - DataTable instance
 * @returns {void}
 */
export function removeRowClickHandlers(context) {
    if (context._rowClickCallbacks) {
        context._rowClickCallbacks = [];
    }
    // Note: Event listener remains but won't trigger any callbacks
}

/**
 * Remove all cell click callbacks
 * @param {Object} context - DataTable instance
 * @returns {void}
 */
export function removeCellClickHandlers(context) {
    if (context._cellClickCallbacks) {
        context._cellClickCallbacks = [];
    }
    // Note: Event listener remains but won't trigger any callbacks
}

/**
 * Remove all row hover callbacks
 * @param {Object} context - DataTable instance
 * @returns {void}
 */
export function removeRowHoverHandlers(context) {
    if (context._rowHoverCallbacks) {
        context._rowHoverCallbacks = [];
    }
    // Note: Event listener remains but won't trigger any callbacks
}

/**
 * Setup row click event listener
 * @param {Object} context - DataTable instance
 * @private
 */
function setupRowClickListener(context) {
    if (!context.table) return;

    context.table.addEventListener("click", (event) => {
        const row = event.target.closest("tr");
        if (!row || !row.dataset.id) return;

        // Ignore clicks on interactive elements
        if (
            event.target.closest(
                "button, a, input, select, textarea, [role='button']"
            )
        ) {
            return;
        }

        const rowId = row.dataset.id;
        const rowData = extractRowData(row);

        // Call all registered callbacks
        if (context._rowClickCallbacks) {
            context._rowClickCallbacks.forEach((cb) => {
                try {
                    cb(rowId, rowData, row, event);
                } catch (error) {
                    console.error("Error in row click callback:", error);
                }
            });
        }
    });
}

/**
 * Setup cell click event listener
 * @param {Object} context - DataTable instance
 * @private
 */
function setupCellClickListener(context) {
    if (!context.table) return;

    context.table.addEventListener("click", (event) => {
        const cell = event.target.closest("td");
        if (!cell) return;

        const row = cell.closest("tr");
        if (!row || !row.dataset.id) return;

        const rowId = row.dataset.id;
        const columnName = cell.dataset.column || "";
        const cellValue = cell.textContent.trim();
        const rowData = extractRowData(row);

        // Call all registered callbacks
        if (context._cellClickCallbacks) {
            context._cellClickCallbacks.forEach((cb) => {
                try {
                    cb(rowId, columnName, cellValue, cell, row, rowData, event);
                } catch (error) {
                    console.error("Error in cell click callback:", error);
                }
            });
        }
    });
}

/**
 * Setup row hover event listener
 * @param {Object} context - DataTable instance
 * @private
 */
function setupRowHoverListener(context) {
    if (!context.table) return;

    context.table.addEventListener(
        "mouseenter",
        (event) => {
            const row = event.target.closest("tr");
            if (!row || !row.dataset.id) return;

            const rowId = row.dataset.id;
            const rowData = extractRowData(row);

            // Call all registered callbacks
            if (context._rowHoverCallbacks) {
                context._rowHoverCallbacks.forEach((cb) => {
                    try {
                        cb(rowId, rowData, row, event);
                    } catch (error) {
                        console.error("Error in row hover callback:", error);
                    }
                });
            }
        },
        true // Use capture phase for better performance
    );
}

/**
 * Extract row data from DOM element
 * @param {HTMLElement} row - Row element
 * @returns {Object} Row data object
 * @private
 */
function extractRowData(row) {
    let rowData = {};

    try {
        // Try to parse from data attribute
        if (row.dataset.row) {
            rowData = JSON.parse(row.dataset.row);
        } else {
            // Fallback: extract from cells
            const cells = row.querySelectorAll("td");
            cells.forEach((cell, index) => {
                const columnName = cell.dataset.column || `column_${index}`;
                rowData[columnName] = cell.textContent.trim();
            });
        }
    } catch (error) {
        console.warn("Failed to parse row data:", error);
    }

    return rowData;
}
