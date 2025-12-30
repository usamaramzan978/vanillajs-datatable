/**
 * Infinite Scroll Methods
 * Internal methods for infinite scroll functionality (not public API)
 */

/**
 * Initialize infinite scroll
 * @param {Object} context - DataTable instance
 */
export function initInfiniteScroll(context) {
    if (!context.infiniteScroll) return;

    context.infiniteScrollPageCount = 1;
    context.lastScrollTop = 0;
    context.infiniteScrollFetching = false;

    // Create scroll wrapper
    createScrollWrapper(context);

    // Create loading indicator
    createScrollLoader(context);

    // Setup scroll event listener with throttling
    setupScrollListener(context);

    // Hide pagination UI if configured
    hidePaginationIfNeeded(context);
}

/**
 * Create scrollable wrapper container
 * @param {Object} context - DataTable instance
 */
function createScrollWrapper(context) {
    context.scrollWrapper = document.createElement("div");
    context.scrollWrapper.className = context.theme.scrollWrapperClass || "";
    context.scrollWrapper.style.height = context.scrollWrapperHeight || "80vh";
    context.scrollWrapper.style.overflowY = "auto";
    context.scrollWrapper.id = `${context.tableId}-scroll-wrapper`;

    // Insert wrapper before table and move table inside
    if (context.table && context.table.parentNode) {
        context.table.parentNode.insertBefore(
            context.scrollWrapper,
            context.table
        );
        context.scrollWrapper.appendChild(context.table);
    }
}

/**
 * Create loading indicator
 * @param {Object} context - DataTable instance
 */
function createScrollLoader(context) {
    context.scrollLoader = document.createElement("div");
    context.scrollLoader.className =
        context.theme.scrollLoaderClass ||
        "text-center py-2 text-sm text-gray-500";
    context.scrollLoader.textContent = "Loading more...";
    context.scrollLoader.style.display = "none";
    context.scrollLoader.id = `${context.tableId}-scroll-loader`;

    if (context.scrollWrapper) {
        context.scrollWrapper.appendChild(context.scrollLoader);
    }
}

/**
 * Setup scroll event listener with throttling for performance
 * @param {Object} context - DataTable instance
 */
function setupScrollListener(context) {
    const container = context.scrollWrapper || window;
    const scrollTarget =
        container === window ? document.documentElement : container;

    // Throttle scroll handler for better performance
    let scrollTimeout = null;
    const throttleDelay = 100; // ms

    const onScroll = () => {
        // Clear existing timeout
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }

        // Throttle scroll handler
        scrollTimeout = setTimeout(() => {
            handleScroll(context, container, scrollTarget);
        }, throttleDelay);
    };

    // Use passive listener for better performance
    const options = { passive: true };
    container.addEventListener("scroll", onScroll, options);

    // Store cleanup function
    context._infiniteScrollCleanup = () => {
        container.removeEventListener("scroll", onScroll, options);
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
    };
}

/**
 * Handle scroll event
 * @param {Object} context - DataTable instance
 * @param {HTMLElement|Window} container - Scroll container
 * @param {HTMLElement} scrollTarget - Scroll target element
 */
function handleScroll(context, container, scrollTarget) {
    // Check if more pages available
    if (!hasMorePages(context)) {
        hideScrollLoader(context);
        if (typeof context.onScrollEnd === "function") {
            context.onScrollEnd();
        }
        return;
    }

    // Get scroll position
    const scrollTop =
        container === window
            ? window.scrollY || window.pageYOffset
            : container.scrollTop;

    const scrollHeight = scrollTarget.scrollHeight;
    const clientHeight = scrollTarget.clientHeight;

    // Calculate distance from bottom
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    // Check if scrolling down
    const isScrollingDown = scrollTop > context.lastScrollTop;
    context.lastScrollTop = scrollTop;

    // Trigger load if near bottom, scrolling down, and not already fetching
    if (
        distanceFromBottom <= context.scrollOffset &&
        isScrollingDown &&
        !context.infiniteScrollFetching
    ) {
        loadNextPage(context);
    }
}

/**
 * Load next page of data
 * @param {Object} context - DataTable instance
 */
async function loadNextPage(context) {
    context.infiniteScrollFetching = true;
    context.infiniteScrollPageCount++;

    // Check max pages limit
    if (
        context.maxScrollPages &&
        context.infiniteScrollPageCount > context.maxScrollPages
    ) {
        hideScrollLoader(context);
        context.infiniteScrollFetching = false;
        if (context._infiniteScrollCleanup) {
            context._infiniteScrollCleanup();
        }
        return;
    }

    // Show loading indicator
    showScrollLoader(context);

    try {
        // Increment page and fetch data
        context.currentPage++;

        if (context.fetchData) {
            await context.fetchData();
        }
    } catch (error) {
        console.error("Error loading next page in infinite scroll:", error);
        // Revert page increment on error
        context.currentPage--;
        context.infiniteScrollPageCount--;
    } finally {
        context.infiniteScrollFetching = false;
        hideScrollLoader(context);
    }
}

/**
 * Check if more pages are available
 * @param {Object} context - DataTable instance
 * @returns {boolean} True if more pages available
 */
export function hasMorePages(context) {
    return !context.totalPages || context.currentPage < context.totalPages;
}

/**
 * Show scroll loader
 * @param {Object} context - DataTable instance
 */
function showScrollLoader(context) {
    if (context.scrollLoader) {
        context.scrollLoader.style.display = "block";
    }
}

/**
 * Hide scroll loader
 * @param {Object} context - DataTable instance
 */
function hideScrollLoader(context) {
    if (context.scrollLoader) {
        context.scrollLoader.style.display = "none";
    }
}

/**
 * Hide pagination UI if configured
 * @param {Object} context - DataTable instance
 */
function hidePaginationIfNeeded(context) {
    if (!context.hidePaginationOnScroll || !context.pagination) {
        return;
    }

    // Use requestAnimationFrame for better timing
    requestAnimationFrame(() => {
        let paginationEl = context.paginationContainer;

        if (!paginationEl && context.paginationConfig?.container?.id) {
            paginationEl = document.getElementById(
                context.paginationConfig.container.id
            );
        }

        if (!paginationEl) {
            // Fallback: try common pagination container IDs
            paginationEl =
                document.getElementById(
                    `${context.tableId}-pagination-container`
                ) ||
                document.getElementById(`${context.tableId}-pagination`);
        }

        if (paginationEl) {
            paginationEl.style.display = "none";
        } else if (context.paginationWrapper) {
            context.paginationWrapper.style.display = "none";
        }
    });
}

/**
 * Append rows to table (for infinite scroll)
 * @param {Object} context - DataTable instance
 * @param {Array} rows - Array of row data objects
 */
export function appendRows(context, rows) {
    const tbody = context.table?.querySelector("tbody");
    if (!tbody) {
        console.error("DataTable: tbody not found");
        return;
    }

    if (!context.columns?.length) {
        console.error("Columns configuration is missing or empty");
        return;
    }

    const isTailwind = context.theme.framework === "tailwind";
    const isBootstrap = context.theme.framework === "bootstrap";

    // Get current row count for animation delay
    const existingRowCount = tbody.querySelectorAll("tr").length;

    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();

    rows.forEach((row, rowIndex) => {
        const tr = document.createElement("tr");
        tr.dataset.id = row.id;

        // Apply row theme classes
        tr.className = context.theme.row || "";
        if (typeof context.theme.rowClass === "function") {
            tr.classList.add(
                ...context.theme
                    .rowClass(row, existingRowCount + rowIndex)
                    .split(" ")
            );
        } else if (typeof context.theme.rowClass === "string") {
            tr.classList.add(...context.theme.rowClass.split(" "));
        }

        // Add initial hidden/fade classes for animation
        if (isTailwind) {
            tr.classList.add(
                "opacity-0",
                "translate-y-2",
                "transition-all",
                "duration-300"
            );
        } else if (isBootstrap) {
            tr.classList.add("opacity-0", "transition", "duration-300");
        }

        // Create and append cells (only for visible columns)
        context.columns.forEach((column) => {
            if (!context.isColumnVisible(column.name)) return;

            const td = document.createElement("td");
            if (context.renderCell) {
                context.renderCell(
                    td,
                    row,
                    column,
                    existingRowCount + rowIndex
                );
            }
            tr.appendChild(td);
        });

        fragment.appendChild(tr);

        // Animate row with stagger effect
        const delay = rowIndex * 50;
        if (isTailwind) {
            setTimeout(() => {
                tr.classList.remove("opacity-0", "translate-y-2");
                tr.classList.add("opacity-100", "translate-y-0");
            }, delay);
        } else if (isBootstrap) {
            setTimeout(() => {
                tr.classList.remove("opacity-0");
                tr.classList.add("opacity-100");
            }, delay);
        }
    });

    // Append all rows at once for better performance
    tbody.appendChild(fragment);
}

/**
 * Reset scroll position to top
 * @param {Object} context - DataTable instance
 */
export function resetScrollPosition(context) {
    if (context.scrollWrapper) {
        context.scrollWrapper.scrollTop = 0;
    } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
}

/**
 * Destroy infinite scroll (cleanup)
 * @param {Object} context - DataTable instance
 */
export function destroyInfiniteScroll(context) {
    // Remove scroll listener
    if (context._infiniteScrollCleanup) {
        context._infiniteScrollCleanup();
        context._infiniteScrollCleanup = null;
    }

    // Remove scroll wrapper and restore table to original position
    if (context.scrollWrapper && context.table) {
        const parent = context.scrollWrapper.parentNode;
        if (parent) {
            parent.insertBefore(context.table, context.scrollWrapper);
            context.scrollWrapper.remove();
        }
    }

    // Clean up references
    context.scrollWrapper = null;
    context.scrollLoader = null;
    context.infiniteScrollPageCount = 1;
    context.infiniteScrollFetching = false;
    context.lastScrollTop = 0;
}

