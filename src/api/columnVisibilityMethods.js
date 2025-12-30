/**
 * Column Visibility API Methods
 * Public API methods for managing column visibility in DataTable
 */

/**
 * Get all visible columns based on visibility state
 * @param {Object} context - DataTable instance context
 * @returns {Array} Array of visible column objects
 */
export function getVisibleColumns(context) {
    return context.columns.filter((col) => isColumnVisible(context, col.name));
}

/**
 * Check if a column is visible
 * @param {Object} context - DataTable instance context
 * @param {string} columnName - Name of the column
 * @returns {boolean} True if column is visible
 */
export function isColumnVisible(context, columnName) {
    // Check visibility state first, then fall back to column.visible property
    if (context.columnVisibilityState.hasOwnProperty(columnName)) {
        return context.columnVisibilityState[columnName] !== false;
    }
    // Fallback to column's visible property
    const column = context.columns.find((col) => col.name === columnName);
    return column ? column.visible !== false : true;
}

/**
 * Toggle column visibility
 * @param {Object} context - DataTable instance context
 * @param {string} columnName - Name of the column to toggle
 * @param {boolean} [visible] - Optional: force visibility state (true/false)
 * @returns {boolean} New visibility state
 */
export function toggleColumnVisibility(context, columnName, visible = null) {
    if (!context.columnVisibility.enabled) {
        console.warn("Column visibility is not enabled");
        return false;
    }

    const column = context.columns.find((col) => col.name === columnName);
    if (!column) {
        console.warn(`Column "${columnName}" not found`);
        return false;
    }

    // If column has exportable: false or is required, prevent hiding
    if (visible === false && column.required) {
        console.warn(`Column "${columnName}" is required and cannot be hidden`);
        return true;
    }

    // Toggle or set visibility
    const newVisibility =
        visible !== null ? visible : !context.columnVisibilityState[columnName];

    context.columnVisibilityState[columnName] = newVisibility;

    // Save state if enabled
    if (context.enableSaveState && context.columnVisibility.persistState) {
        if (context.saveState) {
            context.saveState();
        }
    }

    // Re-render table header and body
    if (context.renderTableHeader) {
        context.renderTableHeader();
    }
    if (context.renderTable && context.data) {
        context.renderTable(context.data);
    }

    return newVisibility;
}

/**
 * Show a column
 * @param {Object} context - DataTable instance context
 * @param {string} columnName - Name of the column to show
 * @returns {boolean} New visibility state
 */
export function showColumn(context, columnName) {
    return toggleColumnVisibility(context, columnName, true);
}

/**
 * Hide a column
 * @param {Object} context - DataTable instance context
 * @param {string} columnName - Name of the column to hide
 * @returns {boolean} New visibility state
 */
export function hideColumn(context, columnName) {
    return toggleColumnVisibility(context, columnName, false);
}

/**
 * Show all columns
 * @param {Object} context - DataTable instance context
 */
export function showAllColumns(context) {
    if (!context.columnVisibility.enabled) return;

    context.columns.forEach((col) => {
        if (!col.required) {
            context.columnVisibilityState[col.name] = true;
        }
    });

    if (context.enableSaveState && context.columnVisibility.persistState) {
        if (context.saveState) {
            context.saveState();
        }
    }

    if (context.renderTableHeader) {
        context.renderTableHeader();
    }
    if (context.renderTable && context.data) {
        context.renderTable(context.data);
    }
}

/**
 * Hide all columns (except required ones)
 * @param {Object} context - DataTable instance context
 */
export function hideAllColumns(context) {
    if (!context.columnVisibility.enabled) return;

    context.columns.forEach((col) => {
        if (!col.required) {
            context.columnVisibilityState[col.name] = false;
        }
    });

    if (context.enableSaveState && context.columnVisibility.persistState) {
        if (context.saveState) {
            context.saveState();
        }
    }

    if (context.renderTableHeader) {
        context.renderTableHeader();
    }
    if (context.renderTable && context.data) {
        context.renderTable(context.data);
    }
}

/**
 * Reset column visibility to initial state
 * @param {Object} context - DataTable instance context
 */
export function resetColumnVisibility(context) {
    if (!context.columnVisibility.enabled) return;

    context.columns.forEach((col) => {
        context.columnVisibilityState[col.name] = col.visible !== false;
    });

    if (context.enableSaveState && context.columnVisibility.persistState) {
        if (context.saveState) {
            context.saveState();
        }
    }

    if (context.renderTableHeader) {
        context.renderTableHeader();
    }
    if (context.renderTable && context.data) {
        context.renderTable(context.data);
    }
}

/**
 * Bind column visibility button and create dropdown
 * @param {Object} context - DataTable instance context
 */
export function bindColumnVisibilityButton(context) {
    const button = document.getElementById(
        context.buttonConfig.columnVisibility.id
    );
    if (!button) {
        console.warn(
            `Column visibility button with id '${context.buttonConfig.columnVisibility.id}' not found. Make sure columnVisibility.enabled and columnVisibility.showButton are both true.`
        );
        return;
    }

    // Create dropdown menu
    const dropdown = document.createElement("div");
    dropdown.id = `${context.tableId}-column-visibility-dropdown`;
    dropdown.className =
        context.theme.columnVisibilityDropdown || "column-visibility-dropdown";
    dropdown.style.display = "none";

    // Add column checkboxes
    const columnsList = document.createElement("div");
    columnsList.className =
        context.theme.columnVisibilityList || "column-visibility-list";

    context.columns.forEach((column) => {
        const isRequired = column.required === true;
        const isVisible = isColumnVisible(context, column.name);

        const item = document.createElement("div");
        item.className =
            context.theme.columnVisibilityItem || "column-visibility-item";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = `col-vis-${column.name}`;
        checkbox.checked = isVisible;
        checkbox.disabled = isRequired;
        checkbox.className =
            context.theme.columnVisibilityCheckbox ||
            "column-visibility-checkbox";

        const label = document.createElement("label");
        label.htmlFor = `col-vis-${column.name}`;
        label.textContent = column.label || column.name;
        label.className = isRequired
            ? context.theme.columnVisibilityLabelRequired ||
              "column-visibility-label-required"
            : context.theme.columnVisibilityLabel || "column-visibility-label";

        if (isRequired) {
            label.textContent += " (required)";
        }

        item.appendChild(checkbox);
        item.appendChild(label);
        columnsList.appendChild(item);

        // Handle checkbox change - this fires when checkbox is clicked directly
        checkbox.addEventListener("change", (e) => {
            e.stopPropagation();
            if (!isRequired) {
                toggleColumnVisibility(context, column.name, checkbox.checked);
                // Update checkbox state after toggle (in case it was prevented)
                checkbox.checked = isColumnVisible(context, column.name);
            } else {
                // Prevent unchecking required columns
                checkbox.checked = true;
            }
        });

        // Handle checkbox click - prevent item click from interfering, but allow default
        checkbox.addEventListener("click", (e) => {
            e.stopPropagation();
            // Allow default checkbox behavior - it will fire change event
        });

        // Handle label click - manually toggle to ensure it works
        label.addEventListener("click", (e) => {
            // Stop propagation to prevent item click handler
            e.stopPropagation();

            if (isRequired) {
                // Prevent toggling required columns
                e.preventDefault();
                return;
            }

            // Prevent default htmlFor behavior to avoid double-toggling
            // We'll handle the toggle manually
            e.preventDefault();

            // Manually toggle checkbox
            checkbox.checked = !checkbox.checked;

            // Trigger change event to ensure our handler fires
            const changeEvent = new Event("change", {
                bubbles: true,
                cancelable: true,
            });
            checkbox.dispatchEvent(changeEvent);
        });

        // Handle item click - only if clicking on the item itself (not checkbox or label)
        item.addEventListener("click", (e) => {
            // If clicking directly on checkbox or label, let their handlers deal with it
            if (
                e.target === checkbox ||
                e.target === label ||
                checkbox.contains(e.target) ||
                label.contains(e.target)
            ) {
                return;
            }
            // If clicking on the item container, toggle the checkbox
            if (!isRequired) {
                checkbox.checked = !checkbox.checked;
                checkbox.dispatchEvent(new Event("change", { bubbles: true }));
            }
        });
    });

    // Add action buttons
    const actions = document.createElement("div");
    actions.className =
        context.theme.columnVisibilityActions || "column-visibility-actions";

    const showAllBtn = document.createElement("button");
    showAllBtn.textContent = "Show All";
    const actionButtonClass =
        context.theme.columnVisibilityActionButton ||
        "column-visibility-action-button";
    showAllBtn.className = `${
        context.theme.button || "btn btn-sm"
    } ${actionButtonClass}`;
    showAllBtn.addEventListener("click", () => {
        showAllColumns(context);
        // Update all checkboxes
        context.columns.forEach((col) => {
            const cb = document.getElementById(`col-vis-${col.name}`);
            if (cb) cb.checked = isColumnVisible(context, col.name);
        });
    });

    const hideAllBtn = document.createElement("button");
    hideAllBtn.textContent = "Hide All";
    hideAllBtn.className = `${
        context.theme.button || "btn btn-sm"
    } ${actionButtonClass}`;
    hideAllBtn.addEventListener("click", () => {
        hideAllColumns(context);
        // Update all checkboxes
        context.columns.forEach((col) => {
            const cb = document.getElementById(`col-vis-${col.name}`);
            if (cb) cb.checked = isColumnVisible(context, col.name);
        });
    });

    const resetBtn = document.createElement("button");
    resetBtn.textContent = "Reset";
    resetBtn.className = `${
        context.theme.button || "btn btn-sm"
    } ${actionButtonClass}`;
    resetBtn.addEventListener("click", () => {
        resetColumnVisibility(context);
        // Update all checkboxes
        context.columns.forEach((col) => {
            const cb = document.getElementById(`col-vis-${col.name}`);
            if (cb) cb.checked = isColumnVisible(context, col.name);
        });
    });

    actions.appendChild(showAllBtn);
    actions.appendChild(hideAllBtn);
    actions.appendChild(resetBtn);

    dropdown.appendChild(columnsList);
    dropdown.appendChild(actions);

    // Find the button's parent container (controls container) for positioning
    // Try to find controls container, fallback to button's parent
    let buttonParent =
        button.closest('[class*="controls"]') ||
        button.closest(".controls-container") ||
        button.parentElement;

    // Ensure parent has relative positioning for absolute dropdown
    const parentStyle = getComputedStyle(buttonParent);
    if (parentStyle.position === "static") {
        buttonParent.style.position = "relative";
    }

    // Append dropdown to button's parent container for relative positioning
    buttonParent.appendChild(dropdown);

    // Function to update dropdown position
    const updateDropdownPosition = () => {
        if (!buttonParent) return;

        const rect = button.getBoundingClientRect();
        const parentRect = buttonParent.getBoundingClientRect();

        // Use absolute positioning relative to parent
        dropdown.style.position = "absolute";
        dropdown.style.top = `${rect.bottom - parentRect.top + 4}px`;
        dropdown.style.left = `${rect.left - parentRect.left}px`;

        // Ensure dropdown doesn't go off-screen to the right
        const dropdownWidth = dropdown.offsetWidth || 200;
        const rightEdge = rect.left - parentRect.left + dropdownWidth;
        const parentWidth = buttonParent.offsetWidth;

        if (rightEdge > parentWidth) {
            // Align to right edge of button instead
            dropdown.style.left = `${
                rect.right - parentRect.left - dropdownWidth
            }px`;
        }
    };

    // Toggle dropdown on button click
    button.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isVisible =
            dropdown.style.display !== "none" && dropdown.style.display !== "";

        if (isVisible) {
            dropdown.style.display = "none";
        } else {
            // Update position before showing
            updateDropdownPosition();
            dropdown.style.display = "block";

            // Update checkbox states
            context.columns.forEach((col) => {
                const cb = document.getElementById(`col-vis-${col.name}`);
                if (cb) {
                    cb.checked = isColumnVisible(context, col.name);
                }
            });
        }
    });

    // Update position on scroll (if dropdown is visible)
    const handleScroll = () => {
        if (
            dropdown.style.display !== "none" &&
            dropdown.style.display !== ""
        ) {
            updateDropdownPosition();
        }
    };

    // Listen to scroll events on window and scrollable parents
    window.addEventListener("scroll", handleScroll, true);
    if (buttonParent) {
        buttonParent.addEventListener("scroll", handleScroll, true);
    }

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
        if (!dropdown.contains(e.target) && !button.contains(e.target)) {
            dropdown.style.display = "none";
        }
    });
}
