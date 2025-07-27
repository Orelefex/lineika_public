// ===== js/modules/modal-manager.js =====
import { NotificationService } from './notification-service.js';

// Константы для модального окна
const CONSTANTS = {
    MIN_ARROW_HOURS: 0.5,
    MAX_ARROW_HOURS: 18,
    DEFAULT_ARROW_HOURS: 1,
    DEFAULT_ARROW_COLOR: '#E9FFEA'
};

// Предопределенные условия
const PREDEFINED_CONDITIONS = [
    { condition: 'минус', mainText: '', redText: 'минус', afterText: '', arrowHours: 1, arrowColor: '#DEE7F6' },
    { condition: '600х6', mainText: '', redText: '600х6', afterText: '', arrowHours: 1, arrowColor: '#E9FFEA' },
    { condition: '300х3', mainText: '', redText: '300х3', afterText: '', arrowHours: 1, arrowColor: '#DAE6F4' },
    { condition: '200х2', mainText: '', redText: '200х2', afterText: '', arrowHours: 1, arrowColor: '#FFFECE' },
    { condition: '100х1', mainText: '', redText: '100х1', afterText: '', arrowHours: 1, arrowColor: '#FDCDC9' },
    { condition: '50х0.6', mainText: '', redText: '50х0.6', afterText: '', arrowHours: 1, arrowColor: '#FDCDC9' },
    { condition: 'туман', mainText: '', redText: 'туман', afterText: '', arrowHours: 1, arrowColor: '#FDCDC9' },
    { condition: 'гроза', mainText: '', redText: 'гроза', afterText: '', arrowHours: 1, arrowColor: '#FDCDC9' },
    { condition: 'шквал', mainText: '', redText: 'шквал', afterText: '', arrowHours: 1, arrowColor: '#FDCDC9' },
    { condition: 'гололед', mainText: '', redText: 'гололед', afterText: '', arrowHours: 1, arrowColor: '#FDCDC9' }
];

// Доступные цвета стрелок
const ARROW_COLORS = [
    { name: 'Зеленый (отличные условия)', value: '#E9FFEA' },
    { name: 'Голубой (хорошие условия)', value: '#DAE6F4' },
    { name: 'Желтый (удовлетворительные)', value: '#FFFECE' },
    { name: 'Красный (плохие условия)', value: '#FDCDC9' },
    { name: 'Синий (минус)', value: '#DEE7F6' }
];

export class ModalManager {
    constructor() {
        this.modal = document.getElementById('modal');
        this.form = document.getElementById('add-airport-form');
        this.conditionsContainer = document.getElementById('conditions-container');
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Открытие модального окна
        document.getElementById('add-airport-btn').addEventListener('click', () => {
            this.open();
        });

        // Закрытие модального окна
        document.getElementById('close-modal').addEventListener('click', () => {
            this.close();
        });

        // Закрытие при клике вне модального окна
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        // Добавление нового условия
        document.getElementById('add-condition-btn').addEventListener('click', () => {
            this.addConditionField();
        });

        // Обработка кликов в контейнере условий
        this.conditionsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-condition-btn')) {
                e.target.closest('.condition-item').remove();
            }

            if (e.target.id === 'add-predefined-condition-btn') {
                this.addPredefinedCondition();
            }
        });
    }

    open() {
        this.conditionsContainer.innerHTML = '';
        this.generateConditionsDropdown();
        this.addConditionField();
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Фокус на поле названия аэродрома
        setTimeout(() => {
            document.getElementById('airport-name').focus();
        }, 100);
    }

    close() {
        this.form.reset();
        this.conditionsContainer.innerHTML = '';
        this.modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    addPredefinedCondition() {
        const select = document.getElementById('condition-select');
        const selectedIndex = parseInt(select.value);
        const condition = PREDEFINED_CONDITIONS[selectedIndex];

        if (condition) {
            this.addConditionField(condition);
        }
    }

    addConditionField(predefinedCondition = null) {
        const condition = predefinedCondition || {
            mainText: '',
            redText: '',
            afterText: '',
            arrowHours: CONSTANTS.DEFAULT_ARROW_HOURS,
            arrowColor: CONSTANTS.DEFAULT_ARROW_COLOR
        };

        this.conditionsContainer.insertAdjacentHTML('beforeend', `
            <div class="condition-item">
                <div class="condition-text-group">
                    <div class="input-group">
                        <label for="conditions-main">Основной текст:</label>
                        <input type="text" class="conditions-main" name="conditions-main" 
                               placeholder="Основной текст" value="${condition.mainText}">
                    </div>
                    
                    <div class="input-group">
                        <label for="conditions-red">Красный текст:</label>
                        <input type="text" class="conditions-red" name="conditions-red" 
                               placeholder="Текст красным цветом" value="${condition.redText}">
                    </div>
                    
                    <div class="input-group">
                        <label for="conditions-after">Текст после:</label>
                        <input type="text" class="conditions-after" name="conditions-after" 
                               placeholder="Текст после красного" value="${condition.afterText}">
                    </div>
                </div>
                
                <div class="input-group">
                    <label for="arrow-hours">Продолжительность (часы):</label>
                    <input type="number" class="arrow-hours" name="arrow-hours" 
                           min="${CONSTANTS.MIN_ARROW_HOURS}" max="${CONSTANTS.MAX_ARROW_HOURS}" 
                           step="0.5" value="${condition.arrowHours}">
                </div>
                
                <div class="input-group">
                    <label for="arrow-color">Цвет стрелки:</label>
                    <select class="arrow-color" name="arrow-color">
                        ${ARROW_COLORS.map(color => 
                            `<option value="${color.value}" ${color.value === condition.arrowColor ? 
                             'selected' : ''}
                             style="background-color: ${color.value}">${color.name}</option>`
                        ).join('')}
                    </select>
                </div>
                
                <button type="button" class="remove-condition-btn">Удалить условие</button>
            </div>
        `);
    }

    generateConditionsDropdown() {
        this.conditionsContainer.insertAdjacentHTML('afterbegin', `
            <div class="predefined-conditions">
                <select id="condition-select">
                    ${PREDEFINED_CONDITIONS.map((condition, index) => 
                        `<option value="${index}">${condition.condition}</option>`
                    ).join('')}
                </select>
                <button type="button" id="add-predefined-condition-btn">
                    Добавить готовое условие
                </button>
            </div>
        `);
    }

    collectConditionsData() {
        const conditions = [];
        const conditionItems = this.conditionsContainer.querySelectorAll('.condition-item');
        
        conditionItems.forEach((item, index) => {
            const mainText = item.querySelector('.conditions-main')?.value.trim() || '';
            const redText = item.querySelector('.conditions-red')?.value.trim() || '';
            const afterText = item.querySelector('.conditions-after')?.value.trim() || '';
            const arrowHours = parseFloat(item.querySelector('.arrow-hours')?.value || CONSTANTS.DEFAULT_ARROW_HOURS);
            const arrowColor = item.querySelector('.arrow-color')?.value || CONSTANTS.DEFAULT_ARROW_COLOR;

            if (!mainText && !redText) return;

            conditions.push({
                mainText,
                redText,
                afterText,
                arrowHours: Math.min(Math.max(arrowHours, CONSTANTS.MIN_ARROW_HOURS), CONSTANTS.MAX_ARROW_HOURS),
                arrowColor,
                startPosition: 0
            });
        });

        return conditions;
    }

    validateForm() {
        const airportName = document.getElementById('airport-name').value.trim();
        
        if (!airportName) {
            NotificationService.error('Введите название аэродрома');
            return false;
        }

        const conditions = this.collectConditionsData();
        if (conditions.length === 0) {
            NotificationService.error('Добавьте хотя бы одно условие');
            return false;
        }

        return { airportName, conditions };
    }
}