import { StorageService } from './storage-service.js';
import { NotificationService } from './notification-service.js';

export class StateManager {
    constructor(tableManager) {
        this.tableManager = tableManager;
        this.storageKey = 'airportAppState';
    }

    saveState() {
        try {
            const rows = this.tableManager.getAllRows();
            if (!rows.length) {
                StorageService.save(this.storageKey, { rows: [] });
                return;
            }

            const state = {
                rows: rows.map(row => {
                    const nameCell = row.cells[0];
                    return {
                        name: nameCell.textContent.trim(),
                        highlighted: nameCell.classList.contains('highlighted'),
                        conditions: this.tableManager.getRowConditions(row)
                    };
                })
            };

            const success = StorageService.save(this.storageKey, state);
            if (!success) {
                NotificationService.error('Ошибка сохранения состояния');
            }
        } catch (error) {
            console.error('Save state error:', error);
            NotificationService.error('Ошибка сохранения состояния');
        }
    }

    loadState() {
        this.tableManager.clearTable();
        try {
            const state = StorageService.load(this.storageKey);
            if (!state || !state.rows || !Array.isArray(state.rows)) return;

            state.rows.forEach(row => {
                if (!row.name || !row.conditions) return;
                
                const tableRow = this.tableManager.addAirportRow(row.name, row.conditions);
                
                if (tableRow && row.highlighted) {
                    tableRow.cells[0].classList.add('highlighted');
                }
            });

            setTimeout(() => {
                const rows = this.tableManager.getAllRows();
                rows.forEach(row => {
                    this.tableManager.updateProgress(row);
                });
            }, 100);

        } catch (error) {
            console.error('Load state error:', error);
            NotificationService.error('Ошибка загрузки состояния');
        }
    }

    clearState() {
        const success = StorageService.remove(this.storageKey);
        if (!success) {
            NotificationService.error('Ошибка при очистке состояния');
        }
    }
}