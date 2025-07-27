// ===== js/modules/text-adapter.js =====
// Модуль для адаптивного изменения размера текста в стрелках

// Конфигурация шрифта
const FONT_CONFIG = {
    maxFontSize: 15,    // Максимальный размер шрифта
    midFontSize: 12,    // Средний размер шрифта  
    minFontSize: 10,    // Минимальный размер шрифта
    fontStep: 0.5,      // Шаг уменьшения шрифта
    arrowPadding: 5,    // Отступ внутри стрелки
    maxHeight: 28       // Максимальная высота текста
};

/**
 * Проверяет, помещается ли текст в стрелку
 * @param {HTMLElement} textElement - элемент с текстом
 * @param {HTMLElement} arrowElement - элемент стрелки
 * @returns {Object} результат проверки
 */
function checkTextFit(textElement, arrowElement) {
    const textRect = textElement.getBoundingClientRect();
    const arrowRect = arrowElement.getBoundingClientRect();
    
    const buffer = FONT_CONFIG.arrowPadding * 1.8;
    
    return {
        fits: textRect.width <= (arrowRect.width - buffer),
        textWidth: textRect.width,
        arrowWidth: arrowRect.width
    };
}

/**
 * Проверяет, является ли текст числовым форматом
 * @param {string} text - текст для проверки
 * @returns {boolean} true если это числовой формат
 */
function isNumericFormat(text) {
    return /^\d+(?:х|x)\d+(?:\.\d+)?$/.test(text.trim());
}

/**
 * Предварительная обработка структуры красного текста
 * @param {HTMLElement} textElement - элемент с текстом
 */
function processRedTextStructure(textElement) {
    const redTextElements = textElement.querySelectorAll('.red-text');
    
    redTextElements.forEach(redTextElement => {
        const content = redTextElement.textContent;
        
        // Создаем новую структуру для красного текста
        const words = content.split(/\s+/);
        
        // Очищаем содержимое
        redTextElement.innerHTML = '';
        
        // Добавляем каждое слово с соответствующим стилем
        words.forEach((word, index) => {
            const wordSpan = document.createElement('span');
            wordSpan.textContent = word;
            
            // Проверяем, является ли слово числовым форматом
            if (isNumericFormat(word)) {
                // Числовой формат - не уменьшаем
                wordSpan.style.fontSize = 'inherit';
                wordSpan.style.lineHeight = 'normal';
                wordSpan.style.verticalAlign = 'baseline';
                wordSpan.classList.add('numeric-format');
            } else {
                // Текстовый формат - уменьшаем
                wordSpan.style.fontSize = '0.6em';
                wordSpan.style.lineHeight = '1';
                wordSpan.style.verticalAlign = 'middle';
                wordSpan.classList.add('word-format');
            }
            
            // Добавляем слово в контейнер
            redTextElement.appendChild(wordSpan);
            
            // Добавляем пробел после слова (кроме последнего)
            if (index < words.length - 1) {
                redTextElement.appendChild(document.createTextNode(' '));
            }
        });
        
        // Устанавливаем стили для самого контейнера красного текста
        redTextElement.style.color = 'red';
        redTextElement.style.fontWeight = 'bold';
        redTextElement.style.display = 'inline-flex';
        redTextElement.style.alignItems = 'center';
        redTextElement.style.flexWrap = 'nowrap';
    });
}

/**
 * Функция для настройки красного текста в режиме переноса
 * @param {HTMLElement} textElement - элемент с текстом
 */
function updateRedTextForWrapping(textElement) {
    const redTextElements = textElement.querySelectorAll('.red-text');
    
    redTextElements.forEach(redElement => {
        // Убедимся, что красный текст тоже поддерживает перенос
        redElement.style.whiteSpace = 'normal';
        redElement.style.display = 'inline-flex';
        redElement.style.flexWrap = 'wrap';
        redElement.style.alignItems = 'center';
        
        // Настраиваем дочерние элементы для правильного переноса
        const numericElements = redElement.querySelectorAll('.numeric-format');
        const wordElements = redElement.querySelectorAll('.word-format');
        
        numericElements.forEach(el => {
            el.style.display = 'inline-block';
            el.style.whiteSpace = 'normal';
            el.style.margin = '0 2px 0 0';
        });
        
        wordElements.forEach(el => {
            el.style.display = 'inline-block';
            el.style.whiteSpace = 'normal';
            el.style.margin = '0 2px 0 0';
        });
    });
}

/**
 * Функция для сброса текстовых стилей к начальному состоянию
 * @param {HTMLElement} textElement - элемент с текстом
 */
function resetTextStyles(textElement) {
    textElement.style.fontSize = `${FONT_CONFIG.maxFontSize}px`;
    textElement.style.whiteSpace = 'nowrap';
    textElement.style.maxHeight = '';
    textElement.style.overflow = '';
    textElement.classList.remove('wrapped');
    
    // Находим родительскую стрелку и убираем класс переноса
    const arrowElement = textElement.closest('.arrow');
    if (arrowElement) {
        arrowElement.classList.remove('has-wrapped-text');
    }
    
    // Сбрасываем стили для красного текста
    const redTexts = textElement.querySelectorAll('.red-text');
    redTexts.forEach(redText => {
        redText.style.whiteSpace = 'nowrap';
        redText.style.maxHeight = '';
        redText.style.overflow = '';
    });
}

/**
 * Функция для комбинированного подхода к размещению текста
 * @param {HTMLElement} textElement - элемент с текстом
 * @param {HTMLElement} arrowElement - элемент стрелки
 */
async function adaptTextToFit(textElement, arrowElement) {
    // Сначала сбрасываем все стили до начального состояния
    resetTextStyles(textElement);
    
    // Явно устанавливаем стиль отображения
    textElement.style.display = 'inline-block';
    textElement.style.visibility = 'visible';
    
    // Предварительно обрабатываем красный текст
    processRedTextStructure(textElement);
        
    // Проверяем, помещается ли текст с максимальным размером шрифта
    let fitResult = await checkTextFit(textElement, arrowElement);
    if (fitResult.fits) {
        return; // Текст уже помещается, ничего не делаем
    }
    
    // Шаг 1: Пробуем уменьшать шрифт до среднего размера
    let currentSize = FONT_CONFIG.maxFontSize;
    while (!fitResult.fits && currentSize > FONT_CONFIG.midFontSize) {
        currentSize -= FONT_CONFIG.fontStep;
        textElement.style.fontSize = `${currentSize}px`;
        fitResult = await checkTextFit(textElement, arrowElement);
        
        if (fitResult.fits) {
            return; // Текст поместился после уменьшения, выходим
        }
    }
    
    // Шаг 2: Если до сих пор не помещается, включаем перенос строк
    textElement.style.whiteSpace = 'normal';
    textElement.classList.add('wrapped');
    arrowElement.classList.add('has-wrapped-text');
    
    // ВАЖНО: Устанавливаем max-height для предотвращения выхода за пределы ячейки
    textElement.style.maxHeight = `${FONT_CONFIG.maxHeight}px`;
    textElement.style.overflow = 'hidden';
    
    // Обновляем структуру красного текста для режима с переносом
    updateRedTextForWrapping(textElement);
    
    // Проверяем, помещается ли текст после включения переноса
    fitResult = await checkTextFit(textElement, arrowElement);
    if (fitResult.fits) {
        return; // Текст поместился после включения переноса
    }
    
    // Шаг 3: Если и с переносом не помещается, уменьшаем шрифт до минимума
    currentSize = Math.min(currentSize, FONT_CONFIG.midFontSize);
    while (!fitResult.fits && currentSize > FONT_CONFIG.minFontSize) {
        currentSize -= FONT_CONFIG.fontStep;
        textElement.style.fontSize = `${currentSize}px`;
        fitResult = await checkTextFit(textElement, arrowElement);
        
        if (fitResult.fits) {
            return; // Текст поместился после уменьшения с переносом
        }
    }
    
    // Если даже с минимальным шрифтом и переносом текст не помещается,
    // оставляем как есть - будет обрезан через CSS overflow: hidden
}

/**
 * Функция для обработки всех стрелок на странице
 */
function applyTextAdaptationToAllArrows() {
    const arrowWrappers = document.querySelectorAll('.arrow-wrapper');
    
    arrowWrappers.forEach(wrapper => {
        const arrow = wrapper.querySelector('.arrow');
        const textContent = arrow?.querySelector('.text-content');
        
        if (arrow && textContent) {
            adaptTextToFit(textContent, arrow);
        }
    });
}

/**
 * Наблюдатель мутаций DOM для автоматического применения адаптации текста
 * @returns {MutationObserver} экземпляр наблюдателя
 */
function setupMutationObserver() {
    const config = { childList: true, subtree: true };
    
    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Элемент
                        const arrowWrappers = node.classList?.contains('arrow-wrapper') 
                            ? [node] 
                            : node.querySelectorAll?.('.arrow-wrapper');
                            
                        if (arrowWrappers && arrowWrappers.length > 0) {
                            setTimeout(() => {
                                arrowWrappers.forEach(wrapper => {
                                    const arrow = wrapper.querySelector('.arrow');
                                    const textContent = arrow?.querySelector('.text-content');
                                    
                                    if (arrow && textContent) {
                                        adaptTextToFit(textContent, arrow);
                                    }
                                });
                            }, 50);
                        }
                    }
                });
            }
        }
    });
    
    return observer;
}

/**
 * Класс TextAdapter для управления адаптацией текста
 */
export class TextAdapter {
    constructor(tableManager) {
        this.tableManager = tableManager;
        this.observer = null;
    }

    /**
     * Инициализация текстового адаптера
     */
    init() {
        // Запускаем наблюдатель
        this.observer = setupMutationObserver();
        this.observer.observe(document.body, { childList: true, subtree: true });
        
        // Применяем адаптацию к существующим элементам с задержкой
        setTimeout(() => {
            this.applyToAllArrows();
        }, 100);
    }

    /**
     * Применить адаптацию ко всем стрелкам
     */
    applyToAllArrows() {
        applyTextAdaptationToAllArrows();
    }

    /**
     * Применить адаптацию к конкретным стрелкам в строке
     * @param {HTMLElement} row - строка таблицы
     */
    applyToArrows(row) {
        const arrowWrappers = row.querySelectorAll('.arrow-wrapper');
        
        arrowWrappers.forEach(wrapper => {
            const arrow = wrapper.querySelector('.arrow');
            const textContent = arrow?.querySelector('.text-content');
            
            if (arrow && textContent) {
                adaptTextToFit(textContent, arrow);
            }
        });
    }

    /**
     * Уничтожение наблюдателя при очистке
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
    }
}