// ===== js/app.js =====
import { TableManager } from './modules/table-manager.js';
import { ModalManager } from './modules/modal-manager.js';
import { ExcelManager } from './modules/excel-manager.js';
import { StateManager } from './modules/state-manager.js';
import { TextAdapter } from './modules/text-adapter.js';
import { FileExporter } from './modules/file-exporter.js';
import { NotificationService } from './modules/notification-service.js';

class AirportApp {
    constructor() {
        this.initializeManagers();
        this.initializeEventListeners();
        this.setupAutoSave();
        this.loadInitialState();
        
        console.log('Airport App initialized successfully');
    }

    initializeManagers() {
        // Создаем основные менеджеры
        this.tableManager = new TableManager();
        this.modalManager = new ModalManager();
        this.excelManager = new ExcelManager(this.tableManager);
        this.stateManager = new StateManager(this.tableManager);
        this.textAdapter = new TextAdapter(this.tableManager);

        // Связываем менеджеры через колбэки
        this.tableManager.onStateChange = () => this.stateManager.saveState();
        
        // Инициализируем адаптер текста
        this.textAdapter.init();
    }

    initializeEventListeners() {
        // Обработка форм
        this.modalManager.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Обработка кликов по таблице
        this.tableManager.tableBody.addEventListener('click', (e) => {
            this.tableManager.handleTableClick(e);
        });

        // Обработка экспорта файлов
        document.getElementById('download-png-btn').addEventListener('click', () => {
            FileExporter.exportTableAsPNG();
        });
        
        document.getElementById('download-pdf-btn').addEventListener('click', () => {
            FileExporter.exportTableAsPDF();
        });
        
        document.getElementById('download-svg-btn').addEventListener('click', () => {
            FileExporter.exportTableAsSVG();
        });

        // Обработка перезагрузки приложения
        document.getElementById('reload-app-btn').addEventListener('click', () => {
            this.handleReload();
        });

        // Обработка изменения размера окна
        window.addEventListener('resize', this.debounce(() => {
            this.tableManager.handleWindowResize();
            
            setTimeout(() => {
                this.textAdapter.applyToAllArrows();
            }, 300);
        }, 250));

        // Периодическое обновление даты
        setInterval(() => {
            this.tableManager.updateTableDate();
        }, 60000);
    }

    setupAutoSave() {
        // Автосохранение каждые 30 секунд
        setInterval(() => {
            this.stateManager.saveState();
        }, 30000);

        // Сохранение при закрытии страницы
        window.addEventListener('beforeunload', () => {
            this.stateManager.saveState();
        });
    }

    loadInitialState() {
        // Загружаем сохраненное состояние
        this.stateManager.loadState();
        
        // Обновляем дату в таблице
        this.tableManager.updateTableDate();
        
        // Применяем адаптацию текста с задержкой
        setTimeout(() => {
            this.tableManager.updateArrowPositions();
            this.textAdapter.applyToAllArrows();
        }, 100);
    }

    handleFormSubmit(event) {
        event.preventDefault();
        
        const formData = this.modalManager.validateForm();
        if (!formData) return;

        const { airportName, conditions } = formData;
        
        const row = this.tableManager.addAirportRow(airportName, conditions);
        
        // Применяем адаптацию текста к новой строке
        setTimeout(() => {
            this.textAdapter.applyToArrows(row);
            this.tableManager.updateProgress(row);
        }, 200);

        this.modalManager.close();
        this.stateManager.saveState();
        NotificationService.success('Аэродром добавлен');
    }

    handleReload() {
        if (confirm('Перезагрузить приложение? Несохраненные данные будут утеряны.')) {
            try {
                this.stateManager.clearState();
                window.location.reload(true);
                NotificationService.success('Приложение перезагружается...');
            } catch (error) {
                console.error('Reload error:', error);
                NotificationService.error('Ошибка при перезагрузке');
            }
        }
    }

    // Утилита для debouncing частых событий
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Метод для очистки ресурсов при уничтожении приложения
    destroy() {
        this.textAdapter.destroy();
        this.stateManager.saveState();
    }
}

// Инициализация приложения при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.airportApp = new AirportApp();
    } catch (error) {
        console.error('Application initialization error:', error);
        NotificationService.error('Ошибка при инициализации приложения');
    }
});

// Экспортируем класс для возможности тестирования
export default AirportApp;