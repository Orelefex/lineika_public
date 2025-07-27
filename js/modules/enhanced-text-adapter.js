// ===== js/modules/enhanced-text-adapter.js =====
/**
 * Улучшенный адаптер текста, использующий RedTextManager
 */

import { RedTextManager } from './red-text-manager.js';

export class EnhancedTextAdapter {
    constructor(tableManager) {
        this.tableManager = tableManager;
        this.mutationObserver = null;
    }

    init() {
        // Инициализируем наблюдатель мутаций
        this.mutationObserver = RedTextManager.setupMutationObserver();
        this.mutationObserver.observe(document.body, { childList: true, subtree: true });
        
        console.log('✅ Enhanced Text Adapter инициализирован');
    }

    applyToArrows(row) {
        RedTextManager.applyToArrowsInRow(row);
    }

    applyToAllArrows() {
        RedTextManager.applyToAllArrows();
    }

    destroy() {
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }
    }
}