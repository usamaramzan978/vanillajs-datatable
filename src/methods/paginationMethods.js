/**
 * Pagination Methods
 * Internal methods for pagination functionality (not public API)
 * Public API methods are in api/paginationMethods.js
 */

/**
 * Initialize pagination
 * @param {Object} context - DataTable instance
 */
export function initPagination(context) {
    if (!context.pagination) return;

    // Setup pagination configuration
    setupPaginationConfig(context);

    // Create pagination elements
    createPaginationElements(context);

    // Create pagination wrapper and container
    createPaginationWrapper(context);

    // Bind pagination buttons
    bindPaginationButtons(context);
}

/**
 * Setup pagination configuration
 * @param {Object} context - DataTable instance
 */
function setupPaginationConfig(context) {
    context.paginationConfig = {
        previous: {
            id: `${context.tableId}-prev-button`,
            text: "Previous",
        },
        next: {
            id: `${context.tableId}-next-button`,
            text: "Next",
        },
        pageInfo: {
            id: `${context.tableId}-page-info`,
            text: "Page Info",
        },
        infoText: {
            id: `${context.tableId}-info-text`,
            text: "Showing X to Y of Z entries",
        },
        wrapper: {
            id: `${context.tableId}-pagination`,
        },
        container: {
            id: `${context.tableId}-pagination-container`,
        },
    };
}

/**
 * Create pagination elements (buttons, info)
 * @param {Object} context - DataTable instance
 */
function createPaginationElements(context) {
    // Use theme classes instead of hardcoded ones
    context.prevBtn = getOrCreateElement(
        context,
        context.paginationConfig.previous.id,
        "button",
        context.theme.paginationButton + " join-item",
        context.paginationConfig.previous.text
    );

    context.nextBtn = getOrCreateElement(
        context,
        context.paginationConfig.next.id,
        "button",
        context.theme.paginationButton + " join-item",
        context.paginationConfig.next.text
    );

    context.pageInfo = getOrCreateElement(
        context,
        context.paginationConfig.pageInfo.id,
        "span",
        context.theme.paginationInfo,
        ""
    );

    context.infoText = getOrCreateElement(
        context,
        context.paginationConfig.infoText.id,
        "div",
        context.theme.paginationInfo,
        ""
    );
}

/**
 * Create pagination wrapper and container
 * @param {Object} context - DataTable instance
 */
function createPaginationWrapper(context) {
    // Create or get paginationWrapper
    context.paginationWrapper = document.getElementById(
        context.paginationConfig.wrapper.id
    );
    if (!context.paginationWrapper) {
        context.paginationWrapper = document.createElement("div");
        context.paginationWrapper.id = context.paginationConfig.wrapper.id;
        context.paginationWrapper.className = context.theme.paginationWrapper;
    }

    // Create or get paginationContainer (outer wrapper)
    context.paginationContainer = document.getElementById(
        context.paginationConfig.container.id
    );
    if (!context.paginationContainer) {
        context.paginationContainer = document.createElement("div");
        context.paginationContainer.id = context.paginationConfig.container.id;
        context.paginationContainer.className = context.theme.paginationContainer;

        // Append infoText and paginationWrapper inside this container
        context.paginationContainer.appendChild(context.infoText);
        context.paginationContainer.appendChild(context.paginationWrapper);

        // Append container after the table
        if (context.table && context.table.parentNode) {
            context.table.parentNode.appendChild(context.paginationContainer);
        }
    }

    // Append buttons inside paginationWrapper
    if (!context.paginationWrapper.contains(context.prevBtn)) {
        context.paginationWrapper.appendChild(context.prevBtn);
    }
    if (!context.paginationWrapper.contains(context.nextBtn)) {
        context.paginationWrapper.appendChild(context.nextBtn);
    }
}

/**
 * Get or create element helper
 * @param {Object} context - DataTable instance
 * @param {string} id - Element ID
 * @param {string} tag - HTML tag name
 * @param {string} className - CSS class name
 * @param {string} text - Text content
 * @returns {HTMLElement} Element
 */
function getOrCreateElement(context, id, tag, className, text) {
    let el = document.getElementById(id);
    if (!el) {
        el = document.createElement(tag);
        el.id = id;
        el.className = className;
        if (text) el.textContent = text;
    }
    return el;
}

/**
 * Bind pagination buttons
 * @param {Object} context - DataTable instance
 */
export function bindPaginationButtons(context) {
    if (context.prevBtn) {
        // Remove existing listeners to avoid duplicates
        const newPrevBtn = context.prevBtn.cloneNode(true);
        context.prevBtn.parentNode?.replaceChild(newPrevBtn, context.prevBtn);
        context.prevBtn = newPrevBtn;

        // Navigate to the previous page
        context.prevBtn.addEventListener("click", () => {
            if (context.currentPage > 1) {
                context.currentPage--;
                if (context.fetchData) {
                    context.fetchData();
                }
            }
        });
    }

    if (context.nextBtn) {
        // Remove existing listeners to avoid duplicates
        const newNextBtn = context.nextBtn.cloneNode(true);
        context.nextBtn.parentNode?.replaceChild(newNextBtn, context.nextBtn);
        context.nextBtn = newNextBtn;

        // Navigate to the next page
        context.nextBtn.addEventListener("click", () => {
            if (context.totalPages && context.currentPage < context.totalPages) {
                context.currentPage++;
                if (context.fetchData) {
                    context.fetchData();
                }
            }
        });
    }
}

/**
 * Update pagination UI
 * @param {Object} context - DataTable instance
 * @param {Object} paginationData - Pagination data from server
 * @param {number} paginationData.current_page - Current page number
 * @param {number} paginationData.last_page - Last page number
 * @param {number} paginationData.total - Total records
 */
export function updatePagination(context, { current_page, last_page, total }) {
    // Store totalPages for infinite scroll
    context.totalPages = last_page;

    // Update page info text
    if (context.pageInfo) {
        context.pageInfo.textContent = `Page ${current_page} of ${last_page}`;
    }

    // Update button states
    if (context.prevBtn) {
        context.prevBtn.disabled = current_page === 1;
    }
    if (context.nextBtn) {
        context.nextBtn.disabled = current_page === last_page;
    }

    // Clear pagination wrapper content
    if (!context.paginationWrapper) return;
    context.paginationWrapper.innerHTML = "";

    // Update pagination buttons based on the type
    if (context.paginationType === "simple") {
        updateSimplePagination(context, current_page, last_page);
    } else {
        updateDetailedPagination(context, current_page, last_page);
    }

    // Update info text
    if (context.infoText) {
        const start = (current_page - 1) * context.rowsPerPage + 1;
        const end = Math.min(current_page * context.rowsPerPage, total);
        context.infoText.textContent = `Showing ${start} to ${end} of ${total} entries`;
    }

    // Save state if enabled
    if (context.enableSaveState && context.saveState) {
        context.saveState();
    }
}

/**
 * Update simple pagination (prev/next only)
 * @param {Object} context - DataTable instance
 * @param {number} current_page - Current page number
 * @param {number} last_page - Last page number
 */
function updateSimplePagination(context, current_page, last_page) {
    const prevBtn = createNavButton(
        context,
        "«",
        current_page > 1,
        () => {
            if (context.currentPage > 1) {
                context.currentPage = current_page - 1;
                if (context.fetchData) {
                    context.fetchData();
                }
            }
        }
    );

    const nextBtn = createNavButton(
        context,
        "»",
        current_page < last_page,
        () => {
            if (context.currentPage < last_page) {
                context.currentPage = current_page + 1;
                if (context.fetchData) {
                    context.fetchData();
                }
            }
        }
    );

    context.paginationWrapper.className =
        context.theme.paginationWrapper || "join gap-1";

    context.paginationWrapper.appendChild(prevBtn);
    context.paginationWrapper.appendChild(nextBtn);
}

/**
 * Update detailed pagination (with page numbers)
 * @param {Object} context - DataTable instance
 * @param {number} current_page - Current page number
 * @param {number} last_page - Last page number
 */
function updateDetailedPagination(context, current_page, last_page) {
    const addPage = (page) => {
        const btn = document.createElement("button");
        btn.className = `${
            context.theme.paginationButton || "btn btn-sm"
        } join-item ${
            page === current_page
                ? context.theme.paginationButtonActive || "btn-active"
                : ""
        }`;
        btn.textContent = page;

        // Only attach click if it's not the current page
        if (page !== context.currentPage) {
            btn.addEventListener("click", () => {
                context.currentPage = page;
                if (context.fetchData) {
                    context.fetchData();
                }
            });
        } else {
            btn.disabled = true; // Disable active page button
        }

        return btn;
    };

    const getStartAndEndPages = () => {
        const startPage = Math.max(1, current_page - 2);
        const endPage = Math.min(last_page, current_page + 2);
        return { startPage, endPage };
    };

    const { startPage, endPage } = getStartAndEndPages();

    context.paginationWrapper.className =
        context.theme.paginationWrapper || "join gap-1";

    // Previous button
    context.paginationWrapper.appendChild(
        createNavButton(context, "«", current_page > 1, () => {
            if (context.currentPage > 1) {
                context.currentPage--;
                if (context.fetchData) {
                    context.fetchData();
                }
            }
        })
    );

    // First page and ellipsis
    if (startPage > 1) {
        context.paginationWrapper.appendChild(addPage(1));
        if (startPage > 2) {
            context.paginationWrapper.appendChild(createEllipsis(context));
        }
    }

    // Page range
    for (let i = startPage; i <= endPage; i++) {
        context.paginationWrapper.appendChild(addPage(i));
    }

    // Last page and ellipsis
    if (endPage < last_page) {
        if (endPage < last_page - 1) {
            context.paginationWrapper.appendChild(createEllipsis(context));
        }
        context.paginationWrapper.appendChild(addPage(last_page));
    }

    // Next button
    context.paginationWrapper.appendChild(
        createNavButton(context, "»", current_page < last_page, () => {
            if (context.currentPage < last_page) {
                context.currentPage++;
                if (context.fetchData) {
                    context.fetchData();
                }
            }
        })
    );
}

/**
 * Create navigation button
 * @param {Object} context - DataTable instance
 * @param {string} text - Button text
 * @param {boolean} enabled - Whether button is enabled
 * @param {Function} onClick - Click handler
 * @returns {HTMLButtonElement} Button element
 */
function createNavButton(context, text, enabled, onClick) {
    const btn = document.createElement("button");
    btn.className = `${context.theme.paginationButton || "btn btn-sm"} ${
        enabled
            ? ""
            : context.theme.paginationButtonDisabled ||
              "opacity-50 cursor-not-allowed"
    }`;
    btn.textContent = text;
    if (!enabled) {
        btn.disabled = true;
    } else {
        btn.addEventListener("click", onClick);
    }
    return btn;
}

/**
 * Create ellipsis element
 * @param {Object} context - DataTable instance
 * @returns {HTMLSpanElement} Ellipsis element
 */
function createEllipsis(context) {
    const span = document.createElement("span");
    span.textContent = "...";
    span.className = context.theme.paginationEllipsis || "px-2";
    return span;
}

