/**
 * Export Progress Methods
 * Internal methods for managing export progress UI (not public API)
 */

/**
 * Show export progress modal
 * @param {Object} context - DataTable instance
 * @param {string} type - Export type
 * @param {number} total - Total records
 */
export function showExportProgress(context, type, total = 0) {
    context.exportProgress.isActive = true;
    context.exportProgress.type = type;
    context.exportProgress.current = 0;
    context.exportProgress.total = total;
    context.exportProgress.startTime = Date.now();
    context.exportProgress.cancelController = new AbortController();

    // Create or get progress element
    let progressElement = document.getElementById(
        `${context.tableId}-export-progress`
    );

    if (!progressElement) {
        progressElement = document.createElement("div");
        progressElement.id = `${context.tableId}-export-progress`;
        progressElement.className = context.theme.exportProgressOverlay || "";
        progressElement.innerHTML = buildProgressHTML(context, type);
        document.body.appendChild(progressElement);

        // Bind cancel button
        const cancelBtn = progressElement.querySelector(
            ".export-progress-cancel"
        );
        if (cancelBtn) {
            cancelBtn.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                cancelExport(context);
            });
        }

        // Allow closing the modal by clicking outside (backdrop)
        const handleBackdropClick = (e) => {
            const modal = progressElement.querySelector(
                ".export-progress-modal"
            );
            const backdrop = progressElement.querySelector(
                ".export-progress-overlay-backdrop"
            );

            const isBackdropClick =
                backdrop &&
                (e.target === backdrop || backdrop.contains(e.target));
            const isOverlayClick = e.target === progressElement;
            const isModalClick = modal && modal.contains(e.target);

            if ((isBackdropClick || isOverlayClick) && !isModalClick) {
                e.preventDefault();
                e.stopPropagation();
                hideProgressModal(context);
            }
        };

        progressElement.addEventListener("click", handleBackdropClick);
        context.exportProgress.backdropClickHandler = handleBackdropClick;
    } else {
        // Reset existing element for new export
        progressElement.classList.remove("hidden");

        const isBootstrap = context.theme.framework === "bootstrap";
        if (isBootstrap) {
            progressElement.style.setProperty("display", "", "important");
        } else {
            progressElement.style.setProperty("display", "flex", "important");
        }

        // Update title
        const titleEl = progressElement.querySelector(".export-progress-title");
        if (titleEl) {
            titleEl.textContent = `Exporting ${type.toUpperCase()}...`;
        }

        // Reset progress bar
        const progressBar = progressElement.querySelector(
            ".export-progress-bar-fill"
        );
        if (progressBar) {
            progressBar.style.width = "0%";
        }

        // Reset progress text
        const progressText = progressElement.querySelector(
            ".export-progress-text"
        );
        if (progressText) {
            progressText.textContent = "0% (0/0 records)";
        }

        // Reset time remaining
        const timeRemaining = progressElement.querySelector(
            ".export-progress-time"
        );
        if (timeRemaining) {
            timeRemaining.textContent = "";
        }
    }

    context.exportProgress.progressElement = progressElement;

    // Focus the modal for accessibility
    const modal = progressElement.querySelector(".export-progress-modal");
    if (modal) {
        modal.focus();
    }

    context.exportProgress.isModalVisible = true;
    createToggleButton(context);
}

/**
 * Update export progress
 * @param {Object} context - DataTable instance
 * @param {number} current - Current progress
 * @param {number} total - Total to process
 */
export function updateExportProgress(context, current, total) {
    if (
        !context.exportProgress.isActive ||
        !context.exportProgress.progressElement
    )
        return;

    context.exportProgress.current = current;
    context.exportProgress.total = total;

    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
    const progressBar = context.exportProgress.progressElement.querySelector(
        ".export-progress-bar-fill"
    );
    const progressText = context.exportProgress.progressElement.querySelector(
        ".export-progress-text"
    );
    const timeRemaining = context.exportProgress.progressElement.querySelector(
        ".export-progress-time"
    );

    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
    }

    if (progressText) {
        progressText.textContent = `${percentage}% (${current}/${total} records)`;
    }

    // Calculate estimated time remaining
    if (timeRemaining && context.exportProgress.startTime && current > 0) {
        const elapsed = Date.now() - context.exportProgress.startTime;
        const avgTimePerRecord = elapsed / current;
        const remaining = Math.max(0, (total - current) * avgTimePerRecord);
        const seconds = Math.ceil(remaining / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        if (minutes > 0) {
            timeRemaining.textContent = `Estimated time remaining: ${minutes}m ${remainingSeconds}s`;
        } else {
            timeRemaining.textContent = `Estimated time remaining: ${seconds}s`;
        }
    }

    // Update toggle button text if it exists
    updateToggleButton(context);

    // Call user callback
    if (context.exportable.onExportProgress) {
        try {
            context.exportable.onExportProgress(
                current,
                total,
                context.exportProgress.type
            );
        } catch (error) {
            console.error("Error in onExportProgress callback:", error);
        }
    }
}

/**
 * Hide export progress UI completely
 * @param {Object} context - DataTable instance
 */
export function hideExportProgress(context) {
    if (context.exportProgress.progressElement) {
        context.exportProgress.progressElement.classList.add("hidden");
        context.exportProgress.progressElement.style.setProperty(
            "display",
            "none",
            "important"
        );
        setTimeout(() => {
            if (
                context.exportProgress.progressElement &&
                context.exportProgress.progressElement.parentNode
            ) {
                context.exportProgress.progressElement.style.setProperty(
                    "display",
                    "none",
                    "important"
                );
            }
        }, 0);
    }
    removeToggleButton(context);
    context.exportProgress.isActive = false;
    context.exportProgress.isModalVisible = false;
    context.exportProgress.type = null;
    context.exportProgress.current = 0;
    context.exportProgress.total = 0;
    context.exportProgress.startTime = null;
    context.exportProgress.cancelController = null;
}

/**
 * Hide progress modal (but keep export running)
 * @param {Object} context - DataTable instance
 */
export function hideProgressModal(context) {
    if (context.exportProgress.progressElement) {
        context.exportProgress.progressElement.classList.add("hidden");
        context.exportProgress.progressElement.style.setProperty(
            "display",
            "none",
            "important"
        );
    }
    context.exportProgress.isModalVisible = false;
    updateToggleButton(context);
}

/**
 * Show progress modal
 * @param {Object} context - DataTable instance
 */
export function showProgressModal(context) {
    if (context.exportProgress.progressElement) {
        context.exportProgress.progressElement.classList.remove("hidden");
        const isBootstrap = context.theme.framework === "bootstrap";
        if (isBootstrap) {
            context.exportProgress.progressElement.style.setProperty(
                "display",
                "",
                "important"
            );
        } else {
            context.exportProgress.progressElement.style.setProperty(
                "display",
                "flex",
                "important"
            );
        }
    }
    context.exportProgress.isModalVisible = true;
    updateToggleButton(context);

    // Focus the modal for accessibility
    const modal = context.exportProgress.progressElement?.querySelector(
        ".export-progress-modal"
    );
    if (modal) {
        modal.focus();
    }
}

/**
 * Cancel current export
 * @param {Object} context - DataTable instance
 */
export function cancelExport(context) {
    if (context.exportProgress.cancelController) {
        context.exportProgress.cancelController.abort();
    }
    hideExportProgress(context);

    // Call error callback
    if (context.exportable.onExportError) {
        try {
            context.exportable.onExportError(
                new Error("Export cancelled by user"),
                context.exportProgress.type
            );
        } catch (error) {
            console.error("Error in onExportError callback:", error);
        }
    }
}

/**
 * Create floating toggle button
 * @param {Object} context - DataTable instance
 */
export function createToggleButton(context) {
    removeToggleButton(context);

    const isBootstrap = context.theme.framework === "bootstrap";
    const isDaisyUI = context.theme.framework === "daisyui";

    const button = document.createElement("button");
    button.id = `${context.tableId}-export-progress-toggle`;
    button.type = "button";
    button.className = isBootstrap
        ? "btn btn-primary position-fixed bottom-0 end-0 m-3 shadow-lg rounded-circle"
        : isDaisyUI
        ? "btn btn-primary fixed bottom-4 right-4 shadow-lg rounded-full w-14 h-14"
        : "fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center z-[9998]";

    button.innerHTML = isBootstrap
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>';

    button.title = `Exporting ${
        context.exportProgress.type?.toUpperCase() || ""
    } - Click to view progress`;
    button.setAttribute("aria-label", "View export progress");

    button.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        showProgressModal(context);
    });

    document.body.appendChild(button);
    context.exportProgress.toggleButton = button;
    updateToggleButton(context);
}

/**
 * Update toggle button visibility and text
 * @param {Object} context - DataTable instance
 */
export function updateToggleButton(context) {
    if (!context.exportProgress.toggleButton) return;

    const button = context.exportProgress.toggleButton;
    const isActive = context.exportProgress.isActive;
    const isVisible = context.exportProgress.isModalVisible;

    if (isActive && !isVisible) {
        button.style.display = "flex";
        const percentage =
            context.exportProgress.total > 0
                ? Math.round(
                      (context.exportProgress.current /
                          context.exportProgress.total) *
                          100
                  )
                : 0;
        button.title = `Exporting ${
            context.exportProgress.type?.toUpperCase() || ""
        } - ${percentage}% - Click to view progress`;
    } else {
        button.style.display = "none";
    }
}

/**
 * Remove toggle button
 * @param {Object} context - DataTable instance
 */
export function removeToggleButton(context) {
    if (context.exportProgress.toggleButton) {
        context.exportProgress.toggleButton.remove();
        context.exportProgress.toggleButton = null;
    }
}

/**
 * Build progress HTML structure
 * @param {Object} context - DataTable instance
 * @param {string} type - Export type
 * @returns {string} HTML string
 */
export function buildProgressHTML(context, type) {
    const isBootstrap = context.theme.framework === "bootstrap";
    const isDaisyUI = context.theme.framework === "daisyui";

    const overlayClass =
        context.theme.exportProgressOverlay ||
        (isBootstrap
            ? "position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center z-[9999]"
            : "fixed inset-0 flex items-center justify-content-center z-[9999]");

    const modalClass =
        context.theme.exportProgressModal ||
        (isBootstrap
            ? "rounded p-4 shadow-lg w-100 mx-3"
            : isDaisyUI
            ? "bg-base-100 rounded-lg p-6 shadow-xl w-full max-w-md mx-4"
            : "bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl w-full max-w-md mx-4");

    const titleClass =
        context.theme.exportProgressTitle ||
        (isBootstrap ? "h5 mb-3" : "text-xl font-semibold mb-4");

    const barContainerClass =
        context.theme.exportProgressBarContainer ||
        (isBootstrap ? "progress mb-3" : "w-full rounded-full h-2.5 mb-3");

    const barFillClass =
        context.theme.exportProgressBarFill ||
        (isBootstrap
            ? "progress-bar progress-bar-striped progress-bar-animated"
            : "h-2.5 rounded-full transition-all duration-300");

    const textClass =
        context.theme.exportProgressText ||
        (isBootstrap ? "text-center mb-2" : "text-center text-sm mb-2");

    const timeClass =
        context.theme.exportProgressTime ||
        (isBootstrap ? "text-center mb-3" : "text-center text-xs mb-3");

    const noteClass =
        context.theme.exportProgressNote ||
        (isBootstrap ? "text-center mb-3" : "text-center text-xs mb-3");

    const cancelBtnClass =
        context.theme.exportProgressCancel ||
        (isBootstrap
            ? "btn btn-secondary w-100"
            : isDaisyUI
            ? "btn btn-sm btn-outline w-full"
            : "px-4 py-2 rounded text-sm w-full");

    const backdropClass = isBootstrap
        ? "position-absolute top-0 start-0 w-100 h-100 export-progress-overlay-backdrop"
        : "absolute inset-0 export-progress-overlay-backdrop";

    return `
        <div class="${overlayClass}" style="backdrop-filter: blur(2px);">
            <div class="${backdropClass} export-progress-overlay-backdrop" style="background-color: rgba(0, 0, 0, 0.5);"></div>
            <div class="${modalClass} export-progress-modal position-relative z-10" tabindex="-1" style="outline: none; max-width: 500px;">
                <h3 class="${titleClass} export-progress-title text-center">Exporting ${type.toUpperCase()}...</h3>
                <div class="${barContainerClass}">
                    <div class="${barFillClass} export-progress-bar-fill" style="width: 0%;"></div>
                </div>
                <div class="${textClass} export-progress-text">0% (0/0 records)</div>
                <div class="${timeClass} export-progress-time"></div>
                <div class="${noteClass} export-progress-note" style="color: rgba(239, 68, 68, 0.9); font-weight: 500; padding: 8px; background-color: rgba(239, 68, 68, 0.1); border-radius: 4px; margin-bottom: 12px;">
                    <svg style="display: inline-block; width: 16px; height: 16px; vertical-align: middle; margin-right: 6px;" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                    Please do not close this window while export is in progress
                </div>
                <button type="button" class="${cancelBtnClass} export-progress-cancel">Cancel Export</button>
            </div>
        </div>
    `;
}
