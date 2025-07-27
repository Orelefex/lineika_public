
export class TextAdapter {
    constructor(tableManager) {
        this.tableManager = tableManager;
        this.mutationObserver = null;
    }

    init() {
        // Инициализируем наблюдатель мутаций из auto-resize-text.js
        if (typeof setupMutationObserver === 'function') {
            this.mutationObserver = setupMutationObserver();
            this.mutationObserver.observe(document.body, { childList: true, subtree: true });
        }
    }

    applyToArrows(row) {
        const arrowWrappers = row.querySelectorAll('.arrow-wrapper');
        
        arrowWrappers.forEach(wrapper => {
            const arrow = wrapper.querySelector('.arrow');
            const textContent = arrow.querySelector('.text-content');
            
            if (arrow && textContent && typeof adaptTextToFit === 'function') {
                adaptTextToFit(textContent, arrow);
            }
        });
    }

    applyToAllArrows() {
        const rows = this.tableManager.getAllRows();
        rows.forEach(row => {
            this.applyToArrows(row);
        });
    }

    destroy() {
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }
    }
}