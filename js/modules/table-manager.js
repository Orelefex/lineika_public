import { CONSTANTS } from './constants.js';
import { MathUtils, DateUtils } from './utils.js';
import { ArrowRenderer } from './arrow-renderer.js';
import { NotificationService } from './notification-service.js';

export class TableManager {
    constructor() {
        this.tableBody = document.getElementById('table-body');
        this.tableDate = document.getElementById('table-date');
    }

    updateTableDate() {
        if (this.tableDate) {
            this.tableDate.textContent = DateUtils.formatTableDate();
        }
    }

    addAirportRow(airportName, conditions) {
        const row = document.createElement('tr');
        row.setAttribute('draggable', 'true');
        
        row.innerHTML = `
            <td class="airport-name-cell">
                <span>${airportName}</span>
            </td>
            <td colspan="${CONSTANTS.TOTAL_COLUMNS}" class="conditions-cell">
                <div class="arrow-container">${ArrowRenderer.createArrows(conditions)}</div>
            </td>
            <td>
                <button class="highlight-btn" title="Выделить">✔</button>
                <button class="delete-btn" title="Удалить">🗑</button>
            </td>
        `;
        
        this.tableBody.appendChild(row);
        this.initDragAndDrop(row);
        this.setArrowSequence(row);
        
        return row;
    }

    initDragAndDrop(row) {
        row.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', row.rowIndex);
        });

        row.addEventListener('dragover', e => e.preventDefault());

        row.addEventListener('drop', e => {
            e.preventDefault();
            const fromIndex = e.dataTransfer.getData('text/plain');
            const toIndex = row.rowIndex;
            
            if (fromIndex !== toIndex) {
                const rows = this.tableBody.rows;
                const moveRow = rows[fromIndex - 1];
                const referenceRow = toIndex < fromIndex ? row : row.nextSibling;
                this.tableBody.insertBefore(moveRow, referenceRow);
                
                // Уведомляем о необходимости сохранить состояние
                this.onStateChange?.();
            }
        });
    }

    setArrowSequence(row) {
        const arrowWrappers = row.querySelectorAll('.arrow-wrapper');
        arrowWrappers.forEach((wrapper, index) => {
            wrapper.style.setProperty('--arrow-index', index);
        });
    }

    updateProgress(row) {
        const nameCell = row.querySelector('.airport-name-cell');
        if (!nameCell) return;

        nameCell.style.removeProperty('--start-progress');
        nameCell.style.removeProperty('--end-progress');

        const redArrows = Array.from(row.querySelectorAll('.arrow')).filter(arrow => {
            const style = window.getComputedStyle(arrow);
            return style.backgroundColor === 'rgb(253, 205, 201)' || 
                   style.backgroundColor === '#FDCDC9';
        });

        if (redArrows.length === 0) return;

        const redArrowWrappers = redArrows.map(arrow => arrow.closest('.arrow-wrapper'))
                                        .filter(wrapper => wrapper !== null);

        if (redArrowWrappers.length === 0) return;

        const conditionsCell = row.querySelector('.conditions-cell');
        if (!conditionsCell) return;
        
        const conditionsCellWidth = conditionsCell.offsetWidth;
        
        const positions = redArrowWrappers.map(wrapper => ({
            left: parseFloat(wrapper.style.left),
            width: parseFloat(wrapper.style.width)
        }));

        const startPos = Math.min(...positions.map(p => p.left));
        const endPos = Math.max(...positions.map(p => p.left + p.width));
        
        const startProgress = (startPos / conditionsCellWidth) * 100;
        const endProgress = (endPos / conditionsCellWidth) * 100;

        const safeStartProgress = Math.max(0, Math.min(100, startProgress));
        const safeEndProgress = Math.max(0, Math.min(100, endProgress));

        requestAnimationFrame(() => {
            nameCell.style.setProperty('--start-progress', `${safeStartProgress}%`);
            nameCell.style.setProperty('--end-progress', `${safeEndProgress}%`);
        });
    }

    updateArrowPositions() {
        const rows = this.tableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const arrowWrappers = row.querySelectorAll('.arrow-wrapper');
            arrowWrappers.forEach(wrapper => {
                const condition = ArrowRenderer.getWrapperCondition(wrapper);
                if (condition) {
                    const width = (condition.arrowHours * CONSTANTS.CELL_WIDTH) - 2;
                    const left = (condition.startPosition || 0) * CONSTANTS.CELL_WIDTH + 1;
                    
                    wrapper.style.width = `${width}px`;
                    wrapper.style.left = `${left}px`;
                }
            });
            
            this.updateProgress(row);
        });
    }

    handleTableClick(event) {
        const target = event.target;
        const row = target.closest('tr');
        
        if (!row) return;
        
        if (target.classList.contains('highlight-btn')) {
            const nameCell = row.cells[0];
            nameCell.classList.toggle('highlighted');
            this.onStateChange?.();
            NotificationService.success(
                nameCell.classList.contains('highlighted') ? 
                'Аэродром выделен' : 'Выделение снято'
            );
        } else if (target.classList.contains('delete-btn')) {
            if (confirm('Удалить эту строку?')) {
                row.remove();
                this.onStateChange?.();
                NotificationService.success('Строка удалена');
            }
        }
        
        this.updateProgress(row);
    }

    getRowConditions(row) {
        return Array.from(row.querySelectorAll('.arrow')).map(arrow => {
            const textContent = arrow.querySelector('.text-content');
            const redText = arrow.querySelector('.red-text');
            const wrapper = arrow.closest('.arrow-wrapper');
            
            return {
                mainText: textContent.childNodes[0].textContent.trim(),
                redText: redText ? redText.textContent.trim() : '',
                afterText: redText && redText.nextSibling ? redText.nextSibling.textContent.trim() : '',
                arrowHours: parseInt(wrapper.style.width) / CONSTANTS.CELL_WIDTH,
                arrowColor: window.getComputedStyle(arrow).backgroundColor,
                startPosition: parseInt(wrapper.style.left) / CONSTANTS.CELL_WIDTH || 0
            };
        });
    }

    getAllRows() {
        return Array.from(this.tableBody.children);
    }

    clearTable() {
        this.tableBody.innerHTML = '';
    }

    handleWindowResize() {
        CONSTANTS.CELL_WIDTH = MathUtils.calculateCellWidth();
        this.updateArrowPositions();
    }

    // Колбэк для уведомления об изменениях состояния
    onStateChange = null;
}