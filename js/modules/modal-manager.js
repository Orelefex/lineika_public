import { CONSTANTS, AVAILABLE_COLORS, PREDEFINED_CONDITIONS } from './constants.js';
import { NotificationService } from './notification-service.js';

export class ModalManager {
    constructor() {
        this.modal = document.getElementById('modal');
        this.form = document.getElementById('add-airport-form');
        this.conditionsContainer = document.getElementById('conditions-container');
        
        this.initEventListeners();
    }

    initEventListeners() {
        // Основные кнопки модального окна
        document.getElementById('add-airport-btn').addEventListener('click', () => this.show());
        document.getElementById('close-modal').addEventListener('click', () => this.close());
        document.getElementById('add-condition-btn').addEventListener('click', () => this.addConditionField());
        
        // Обработка событий внутри контейнера условий
        this.conditionsContainer.addEventListener('click', (e) => {
            if (e.target.id === 'add-predefined-condition-btn') {
                this.addPredefinedCondition();
            }
            if (e.target.classList.contains('remove-condition-btn')) {
                e.target.closest('.condition-item').remove();
            }
        });

        // Закрытие модального окна по клику вне него
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
    }

    show() {
        this.generateConditionsDropdown();
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.modal.style.display = 'none';
        this.form.reset();
        this.conditionsContainer.innerHTML = '';
        document.body.style.overflow = '';
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

    addConditionField() {
        this.conditionsContainer.insertAdjacentHTML('beforeend', `
            <div class="condition-item">
                <div class="condition-text-group">
                    <div class="input-group">
                        <label for="conditions-main">Основной текст:</label>
                        <input type="text" class="conditions-main" name="conditions-main" 
                               placeholder="Основной текст">
                    </div>
                    
                    <div class="input-group">
                        <label for="conditions-red">Красный текст:</label>
                        <input type="text" class="conditions-red" name="conditions-red" 
                               placeholder="Текст красным цветом">
                    </div>
                    
                    <div class="input-group">
                        <label for="conditions-after">Текст после:</label>
                        <input type="text" class="conditions-after" name="conditions-after" 
                               placeholder="Текст после красного">
                    </div>
                </div>
                <div class="input-group">
                    <label for="arrow-hours">Количество часов:</label>
                    <input type="number" class="arrow-hours" name="arrow-hours" 
                           required min="${CONSTANTS.MIN_ARROW_HOURS}" 
                           max="${CONSTANTS.MAX_ARROW_HOURS}" step="0.1" value="1">
                </div>
                
                <div class="input-group">
                    <label for="arrow-color">Цвет стрелки:</label>
                    <select class="arrow-color" name="arrow-color" required>
                        ${AVAILABLE_COLORS.map(color => 
                            `<option value="${color.value}" style="background-color: ${color.value}">
                                ${color.name}
                            </option>`
                        ).join('')}
                    </select>
                </div>
                
                <button type="button" class="remove-condition-btn">Удалить условие</button>
            </div>
        `);
    }

    addPredefinedCondition() {
        const select = document.getElementById('condition-select');
        const selectedCondition = PREDEFINED_CONDITIONS[select.value];
        
        this.conditionsContainer.insertAdjacentHTML('beforeend', `
            <div class="condition-item">
                <div class="condition-text-group">
                    <div class="input-group">
                        <label for="conditions-main">Основной текст:</label>
                        <input type="text" class="conditions-main" name="conditions-main" 
                               value="${selectedCondition.condition}" placeholder="Основной текст">
                    </div>
                    
                    <div class="input-group">
                        <label for="conditions-red">Красный текст:</label>
                        <input type="text" class="conditions-red" name="conditions-red" 
                               value="" placeholder="Текст красным цветом">
                    </div>
                    
                    <div class="input-group">
                        <label for="conditions-after">Текст после:</label>
                        <input type="text" class="conditions-after" name="conditions-after" 
                               value="" placeholder="Текст после красного">
                    </div>
                </div>
                <div class="input-group">
                    <label for="arrow-hours">Количество часов:</label>
                    <input type="number" class="arrow-hours" name="arrow-hours" 
                           value="${selectedCondition.arrowHours}" required 
                           min="${CONSTANTS.MIN_ARROW_HOURS}" 
                           max="${CONSTANTS.MAX_ARROW_HOURS}" step="1">
                </div>
                
                <div class="input-group">
                    <label for="arrow-color">Цвет стрелки:</label>
                    <select class="arrow-color" name="arrow-color" required>
                        ${AVAILABLE_COLORS.map(color => 
                            `<option value="${color.value}" 
                             ${color.value === selectedCondition.arrowColor ? 'selected' : ''}
                             style="background-color: ${color.value}">${color.name}</option>`
                        ).join('')}
                    </select>
                </div>
                
                <button type="button" class="remove-condition-btn">Удалить условие</button>
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
            const arrowHours = parseFloat(item.querySelector('.arrow-hours')?.value || 1);
            const arrowColor = item.querySelector('.arrow-color')?.value || '#E9FFEA';

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

