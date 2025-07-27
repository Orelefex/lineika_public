// ===== js/modules/excel-manager.js =====
import { ConditionParser } from './condition-parser.js';
import { NotificationService } from './notification-service.js';

export class ExcelManager {
    constructor(tableManager) {
        this.tableManager = tableManager;
        this.uploadInput = document.getElementById('upload-excel');
        
        this.initEventListeners();
    }

    initEventListeners() {
        document.getElementById('upload-excel-btn').addEventListener('click', () => {
            this.uploadInput.click();
        });
        
        this.uploadInput.addEventListener('change', (e) => this.handleUpload(e));
    }

    async handleUpload(e) {
        try {
            const file = e.target.files[0];
            if (!file) return;

            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, {
                type: 'array',
                cellDates: true,
                cellNF: true,
                cellText: true
            });

            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];

            const jsonData = XLSX.utils.sheet_to_json(sheet, {
                header: 1,
                defval: '',
                raw: false
            });

            this.tableManager.clearTable();

            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i];
                if (!row[0]) continue;
                
                const airportName = row[0].toString().trim();
                const conditions = ConditionParser.processConditions(row.slice(1));
                
                if (airportName && conditions.length > 0) {
                    this.tableManager.addAirportRow(airportName, conditions);
                }
            }

            setTimeout(() => {
                const rows = this.tableManager.getAllRows();
                rows.forEach(row => this.tableManager.updateProgress(row));
            }, 100);

            this.tableManager.onStateChange?.();
            NotificationService.success('Данные загружены');
            e.target.value = '';
        } catch (error) {
            console.error('Excel upload error:', error);
            NotificationService.error(`Ошибка загрузки файла: ${error.message}`);
            e.target.value = '';
        }
    }
}