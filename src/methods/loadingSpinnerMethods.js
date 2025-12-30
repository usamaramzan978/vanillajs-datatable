/**
 * Loading Spinner Methods
 * Internal methods for loading spinner functionality (not public API)
 */

/**
 * Toggle loading spinner visibility
 * @param {Object} context - DataTable instance
 * @param {boolean} isLoading - Whether to show or hide the spinner
 */
export function toggleLoadingSpinner(context, isLoading) {
    if (!context.enableLoadingSpinner || !context.tableId) return;

    const table = document.getElementById(context.tableId);
    if (!table) return;

    const tbody = table.querySelector("tbody");
    if (!tbody) return;

    let spinnerContainer = document.getElementById(
        context.LoadingSpinnerContainer
    );

    // Create spinner if it doesn't exist
    if (!spinnerContainer) {
        spinnerContainer = createSpinnerContainer(context, tbody);
    }

    if (!spinnerContainer) return;

    // Clear existing timeout
    if (context.loadingSpinnerTimeout) {
        clearTimeout(context.loadingSpinnerTimeout);
        context.loadingSpinnerTimeout = null;
    }

    // Show/hide spinner with optional auto-hide
    if (isLoading) {
        showSpinner(context, spinnerContainer);
    } else {
        hideSpinner(context, spinnerContainer);
    }
}

/**
 * Create spinner container element
 * @param {Object} context - DataTable instance
 * @param {HTMLElement} tbody - Table body element
 * @returns {HTMLElement|null} Spinner container element
 * @private
 */
function createSpinnerContainer(context, tbody) {
    const isTailwind = context.theme.framework === "tailwind";
    const isBootstrap = context.theme.framework === "bootstrap";
    const isDaisyUI = context.theme.framework === "daisyui";

    const spinnerContainer = document.createElement("div");
    spinnerContainer.id = context.LoadingSpinnerContainer;

    let spinner;

    if (isBootstrap) {
        spinnerContainer.className =
            "position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75 d-none";
        spinner = document.createElement("div");
        spinner.className = "spinner-border text-primary";
        spinner.setAttribute("role", "status");
        spinner.innerHTML = '<span class="visually-hidden">Loading...</span>';
    } else if (isDaisyUI) {
        spinnerContainer.className =
            "absolute inset-0 flex items-center justify-center bg-base-100/70 z-50 hidden";
        spinner = document.createElement("span");
        spinner.className = "loading loading-dots loading-lg";
        spinner.setAttribute("aria-label", "Loading");
    } else {
        // Tailwind
        spinnerContainer.className =
            "absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-gray-900/70 z-50 hidden";
        spinner = document.createElement("div");
        spinner.className =
            "w-10 h-10 border-4 border-gray-300 dark:border-gray-600 border-t-blue-500 dark:border-t-blue-400 rounded-full animate-spin";
        spinner.setAttribute("aria-label", "Loading");
        spinner.setAttribute("role", "status");
    }

    spinnerContainer.appendChild(spinner);

    // Ensure parent has relative positioning
    const tbodyWrapper = tbody.parentNode;
    if (tbodyWrapper && !tbodyWrapper.classList.contains("relative")) {
        tbodyWrapper.classList.add("relative");
    }

    // Append to tbody wrapper
    if (tbodyWrapper) {
        tbodyWrapper.appendChild(spinnerContainer);
    }

    return spinnerContainer;
}

/**
 * Show spinner
 * @param {Object} context - DataTable instance
 * @param {HTMLElement} spinnerContainer - Spinner container element
 * @private
 */
function showSpinner(context, spinnerContainer) {
    const isBootstrap = context.theme.framework === "bootstrap";

    if (isBootstrap) {
        spinnerContainer.classList.remove("d-none");
    } else {
        spinnerContainer.classList.remove("hidden");
    }

    // Auto-hide after delay if configured
    if (context.loadingDelay > 0) {
        context.loadingSpinnerTimeout = setTimeout(() => {
            toggleLoadingSpinner(context, false);
        }, context.loadingDelay);
    }
}

/**
 * Hide spinner
 * @param {Object} context - DataTable instance
 * @param {HTMLElement} spinnerContainer - Spinner container element
 * @private
 */
function hideSpinner(context, spinnerContainer) {
    const isBootstrap = context.theme.framework === "bootstrap";

    if (isBootstrap) {
        spinnerContainer.classList.add("d-none");
    } else {
        spinnerContainer.classList.add("hidden");
    }
}

/**
 * Destroy loading spinner (cleanup)
 * @param {Object} context - DataTable instance
 */
export function destroyLoadingSpinner(context) {
    // Clear timeout
    if (context.loadingSpinnerTimeout) {
        clearTimeout(context.loadingSpinnerTimeout);
        context.loadingSpinnerTimeout = null;
    }

    // Remove spinner container
    const spinnerContainer = document.getElementById(
        context.LoadingSpinnerContainer
    );
    if (spinnerContainer && spinnerContainer.parentNode) {
        spinnerContainer.parentNode.removeChild(spinnerContainer);
    }
}
