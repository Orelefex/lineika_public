export class ConditionParser {
    static parseCondition(value) {
        if (!value) return null;
        
        const text = value.toString().replace(/\s+/g, ' ').trim();
        
        // Проверяем наличие фигурных скобок для выделения красным
        const bracketMatch = text.match(/(.*?)\{(.*?)\}(.*)/);
        if (bracketMatch) {
            const [_, beforeBraces, inBraces, afterBraces] = bracketMatch.map(part => part ? part.trim() : '');
            
            return {
                mainText: beforeBraces,
                redText: inBraces,
                afterText: afterBraces,
                arrowHours: 1,
                arrowColor: this.getConditionColor(text)
            };
        }
        
        // Если нет фигурных скобок, используем стандартную обработку опасных явлений
        const processed = processConditionText(text);
        
        return {
            mainText: processed.mainText,
            redText: processed.redText,
            afterText: processed.afterText || '',
            arrowHours: 1,
            arrowColor: this.getConditionColor(text)
        };
    }

    static getConditionColor(text) {
        const normalizedText = text.toLowerCase().trim();
        
        if (normalizedText.includes('минус')) return '#DEE7F6';
        
        const matches = normalizedText.match(/\d+(?:х|x)\d+(?:\.\d+)?/g) || [];
        if (matches.length === 0) return '#FDCDC9';
        
        let worstPriority = 1;
        
        for (const match of matches) {
            const [height, visibility] = match.split(/(?:х|x)/).map(Number);
            
            let currentPriority = 4;
                        
            if (visibility >= 4 && visibility <= 6 && [1000, 600, 500, 400].includes(height)) {
                currentPriority = 1;
            } 
            else if (visibility === 3 && [1000, 600, 500, 400, 300].includes(height)) {
                currentPriority = 2;
            } 
            else if ((visibility === 1 || visibility === 2) && 
                    [1000, 600, 500, 400, 300, 200, 100].includes(height)) {
                currentPriority = 3;
            } 
            else if (visibility >= 3 && visibility <= 6 && [200, 100].includes(height)) {
                currentPriority = 3;
            }
            
            worstPriority = Math.max(worstPriority, currentPriority);
        }
        
        switch (worstPriority) {
            case 1: return '#E9FFEA';
            case 2: return '#DAE6F4';
            case 3: return '#FFFECE';
            case 4: return '#FDCDC9';
            default: return '#FDCDC9';
        }
    }

    static processConditions(rowData) {
        const conditions = [];
        let currentCondition = null;
        
        rowData.forEach((value, index) => {
            if (!value) {
                if (currentCondition) {
                    conditions.push(currentCondition);
                    currentCondition = null;
                }
                return;
            }
            
            const condition = this.parseCondition(value.toString().trim());
            if (!condition) return;

            if (!currentCondition) {
                currentCondition = {
                    ...condition,
                    startPosition: index,
                    arrowHours: 1
                };
            } else {
                const isSameCondition = this.areConditionsEqual(currentCondition, condition);
                if (isSameCondition && index === currentCondition.startPosition + currentCondition.arrowHours) {
                    currentCondition.arrowHours++;
                } else {
                    conditions.push(currentCondition);
                    currentCondition = {
                        ...condition,
                        startPosition: index,
                        arrowHours: 1
                    };
                }
            }
        });

        if (currentCondition) {
            conditions.push(currentCondition);
        }

        return conditions;
    }

    static areConditionsEqual(condition1, condition2) {
        return condition1.mainText === condition2.mainText &&
               condition1.redText === condition2.redText &&
               condition1.afterText === condition2.afterText &&
               condition1.arrowColor === condition2.arrowColor;
    }
}