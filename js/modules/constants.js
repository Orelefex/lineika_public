export const CONSTANTS = {
    MAX_ARROW_HOURS: 18,
    MIN_ARROW_HOURS: 1,
    TOTAL_COLUMNS: 18,
    START_HOUR: 7,
    CELL_WIDTH: 60,
    ARROW_HEIGHT: 22,
    TABLE_WIDTH: '100%'
};

export const AVAILABLE_COLORS = [
    { name: 'Зеленый', value: '#E9FFEA' },
    { name: 'Синий', value: '#DAE6F4' },
    { name: 'Желтый', value: '#FFFECE' },
    { name: 'Красный', value: '#FDCDC9' },
    { name: 'Фиолетовый', value: '#DEE7F6' }
];

export const PREDEFINED_CONDITIONS = [
    { condition: '600х6', arrowHours: 1, arrowColor: '#E9FFEA' },
    { condition: '300х3', arrowHours: 1, arrowColor: '#DAE6F4' },
    { condition: '200х2', arrowHours: 1, arrowColor: '#FFFECE' },
    { condition: '50х0.6', arrowHours: 1, arrowColor: '#FDCDC9' },
    { condition: 'минус', arrowHours: 1, arrowColor: '#DEE7F6' }
];