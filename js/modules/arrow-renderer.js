import { CONSTANTS } from './constants.js';
import { DOMUtils } from './utils.js';

export class ArrowRenderer {
    static createArrowHead(color) {
        return `
            <div class="arrow-head">
                <svg width="14" height="22" viewBox="0 0 14 22" xmlns="http://www.w3.org/2000/svg">
                <path 
                    d="M1,1 L13,11 L1,21 Z" 
                    fill="${color}" 
                    stroke="none"
                />
                <path 
                    d="M1,1 L13,11" 
                    stroke="black" 
                    stroke-width="1" 
                    fill="none"
                />
                <path 
                    d="M13,11 L1,21" 
                    stroke="black" 
                    stroke-width="1" 
                    fill="none"
                />
                </svg>
            </div>
        `;
    }

    static createArrows(conditions) {
        return conditions.map(condition => {
            const width = (condition.arrowHours * CONSTANTS.CELL_WIDTH) - 2;
            const left = (condition.startPosition || 0) * CONSTANTS.CELL_WIDTH + 1;
            
            const mainText = DOMUtils.escapeHtml(condition.mainText || '');
            const redText = DOMUtils.escapeHtml(condition.redText || '');
            const afterText = DOMUtils.escapeHtml(condition.afterText || '');
            
            return `
                <div class="arrow-wrapper" style="left: ${left}px; width: ${width}px;">
                    <div class="arrow" style="background-color: ${condition.arrowColor};">
                        <div class="text-container">
                            <div class="text-content ${condition.arrowColor === '#FDCDC9' ? 'red-condition' : ''}" 
                                 ${mainText === 'минус' ? 'data-text="минус"' : ''}>
                                ${mainText}
                                ${redText ? `<span class="red-text">${redText}</span>` : ''}
                                ${afterText || ''}
                            </div>
                        </div>
                        ${this.createArrowHead(condition.arrowColor)}
                    </div>
                </div>
            `;
        }).join('');
    }

    static getWrapperCondition(wrapper) {
        const left = parseInt(wrapper.style.left);
        const width = parseInt(wrapper.style.width);
        const cellWidth = CONSTANTS.CELL_WIDTH;
        
        const arrow = wrapper.querySelector('.arrow');
        if (!arrow) return null;
        
        const textContent = arrow.querySelector('.text-content');
        const redText = arrow.querySelector('.red-text');
        
        return {
            mainText: textContent ? textContent.childNodes[0].textContent.trim() : '',
            redText: redText ? redText.textContent.trim() : '',
            afterText: redText && redText.nextSibling ? redText.nextSibling.textContent.trim() : '',
            arrowHours: width / cellWidth + (2 / cellWidth),
            arrowColor: window.getComputedStyle(arrow).backgroundColor,
            startPosition: left / cellWidth - (1 / cellWidth)
        };
    }
}
