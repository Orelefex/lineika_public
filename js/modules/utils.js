import { CONSTANTS } from './constants.js';

export class DOMUtils {
    static createElement(tag, className = '', content = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content) element.innerHTML = content;
        return element;
    }

    static escapeHtml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

export class MathUtils {
    static calculateCellWidth() {
        const table = document.getElementById('airports-table');
        if (!table) return 60;
        
        const tableWidth = table.clientWidth;
        const airportColumnWidth = table.querySelector('.airport-column')?.offsetWidth || 150;
        const actionsColumnWidth = table.querySelector('.actions-column')?.offsetWidth || 100;
        
        const availableWidth = tableWidth - airportColumnWidth - actionsColumnWidth;
        return availableWidth / CONSTANTS.TOTAL_COLUMNS;
    }

    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
}

export class DateUtils {
    static formatTableDate() {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        return `${day}.${month}.${year} г.`;
    }

    static getFileTimestamp() {
        return new Date().toISOString().slice(0, 10);
    }
}