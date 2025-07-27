import { NotificationService } from './notification-service.js';
import { DateUtils } from './utils.js';

export class FileExporter {
    static async exportTableAsPNG() {
        try {
            const table = document.getElementById('airports-table');
            const actionCells = this.prepareTableForExport(table);
            
            const canvas = await html2canvas(table, {
                scale: 4,
                backgroundColor: '#FFFFFF',
                logging: false
            });
            
            const link = document.createElement('a');
            link.download = `airports-day-${DateUtils.getFileTimestamp()}.png`;
            link.href = canvas.toDataURL('image/png', 1.0);
            link.click();
            
            this.restoreTableAfterExport(actionCells);
            NotificationService.success('Изображение сохранено');
        } catch (error) {
            console.error('Export error:', error);
            NotificationService.error('Ошибка при экспорте в PNG');
            
            const actionCells = document.querySelectorAll('.actions-column, td:last-child');
            actionCells.forEach(cell => cell.style.display = '');
        }
    }

    static async exportTableAsPDF() {
        try {
            const table = document.getElementById('airports-table');
            if (!table) throw new Error('Table not found');

            const actionCells = this.prepareTableForExport(table);

            const container = document.createElement('div');
            container.style.cssText = `
                position: fixed;
                left: 0;
                top: 0;
                width: ${table.offsetWidth}px;
                height: ${table.offsetHeight}px;
                background: white;
                padding: 20px;
                z-index: -9999;
            `;
            document.body.appendChild(container);

            const clonedTable = table.cloneNode(true);
            container.appendChild(clonedTable);

            clonedTable.querySelectorAll('.arrow').forEach(arrow => {
                const computed = window.getComputedStyle(arrow);
                const color = computed.backgroundColor;
                const arrowHead = arrow.querySelector('.arrow-head');
                if (arrowHead) {
                    arrowHead.innerHTML = `
                        <svg width="14" height="22" viewBox="0 0 14 22">
                            <path d="M0 0 L14 11 L0 22 Z" fill="${color}" stroke="black"/>
                        </svg>
                    `;
                }
            });

            await new Promise(resolve => setTimeout(resolve, 500));

            const canvas = await html2canvas(clonedTable, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                imageTimeout: 0,
                logging: true,
                removeContainer: false,
                onclone: () => new Promise(resolve => setTimeout(resolve, 500))
            });

            if (!canvas) throw new Error('Canvas creation failed');

            const imgData = canvas.toDataURL('image/png', 1.0);

            const pdf = new jspdf.jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4',
                compress: false
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            const margin = 10;
            const maxWidth = pageWidth - (margin * 2);
            const maxHeight = pageHeight - (margin * 2);

            let imgWidth = canvas.width;
            let imgHeight = canvas.height;

            const scale = Math.min(
                maxWidth / imgWidth,
                maxHeight / imgHeight
            );

            imgWidth = imgWidth * scale;
            imgHeight = imgHeight * scale;

            const x = (pageWidth - imgWidth) / 2;
            const y = (pageHeight - imgHeight) / 2;

            pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight, undefined, 'FAST');

            const fileName = `airports-day-${DateUtils.getFileTimestamp()}.pdf`;
            pdf.save(fileName);

            container.remove();
            this.restoreTableAfterExport(actionCells);

            NotificationService.success('PDF сохранен');
        } catch (error) {
            console.error('PDF Export Error:', error);
            NotificationService.error(`Ошибка при создании PDF: ${error.message}`);
            
            const actionCells = document.querySelectorAll('.actions-column, td:last-child');
            actionCells.forEach(cell => cell.style.display = '');
        }
    }

    static async exportTableAsSVG() {
        try {
            const table = document.getElementById('airports-table');
            if (!table) throw new Error('Table not found');
            
            const actionCells = this.prepareTableForExport(table);
            
            const canvas = await html2canvas(table, {
                scale: 4,
                backgroundColor: '#FFFFFF',
                logging: false
            });
            
            const width = canvas.width;
            const height = canvas.height;
            const imageData = canvas.toDataURL('image/png');
            
            const svgNS = "http://www.w3.org/2000/svg";
            const svg = document.createElementNS(svgNS, "svg");
            svg.setAttribute("width", width);
            svg.setAttribute("height", height);
            svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
            svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
            
            const image = document.createElementNS(svgNS, "image");
            image.setAttribute("width", width);
            image.setAttribute("height", height);
            image.setAttribute("x", 0);
            image.setAttribute("y", 0);
            image.setAttribute("href", imageData);
            svg.appendChild(image);
            
            const rows = table.querySelectorAll('tbody tr');
            
            rows.forEach((row, rowIndex) => {
                const arrows = row.querySelectorAll('.arrow-wrapper');
                const rowTop = row.offsetTop;
                const nameCell = row.cells[0];
                const leftOffset = nameCell.offsetWidth;
                
                arrows.forEach((arrowWrapper) => {
                    const arrow = arrowWrapper.querySelector('.arrow');
                    if (!arrow) return;
                    
                    const left = parseInt(arrowWrapper.style.left) || 0;
                    const width = parseInt(arrowWrapper.style.width) || 0;
                    const textContent = arrow.querySelector('.text-content');
                    let text = textContent ? textContent.textContent.trim() : '';
                    
                    if (text) {
                        const interactiveArea = document.createElementNS(svgNS, "rect");
                        interactiveArea.setAttribute("x", leftOffset + left);
                        interactiveArea.setAttribute("y", rowTop + 3);
                        interactiveArea.setAttribute("width", width - 14);
                        interactiveArea.setAttribute("height", 22);
                        interactiveArea.setAttribute("fill", "transparent");
                        interactiveArea.setAttribute("stroke", "none");
                        
                        const title = document.createElementNS(svgNS, "title");
                        title.textContent = text;
                        interactiveArea.appendChild(title);
                        
                        svg.appendChild(interactiveArea);
                    }
                });
            });
            
            const serializer = new XMLSerializer();
            let svgString = serializer.serializeToString(svg);
            svgString = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n' + svgString;
            
            const blob = new Blob([svgString], {type: "image/svg+xml;charset=utf-8"});
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement("a");
            link.href = url;
            link.download = `airports-day-${DateUtils.getFileTimestamp()}.svg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            setTimeout(() => URL.revokeObjectURL(url), 100);
            
            this.restoreTableAfterExport(actionCells);
            NotificationService.success('SVG сохранен');
        } catch (error) {
            console.error('SVG Export Error:', error);
            NotificationService.error(`Ошибка при создании SVG: ${error.message}`);
            
            const actionCells = document.querySelectorAll('.actions-column, td:last-child');
            actionCells.forEach(cell => cell.style.display = '');
        }
    }

    static prepareTableForExport(table) {
        const actionCells = table.querySelectorAll('.actions-column, td:last-child');
        actionCells.forEach(cell => cell.style.display = 'none');
        return actionCells;
    }
    
    static restoreTableAfterExport(actionCells) {
        actionCells.forEach(cell => cell.style.display = '');
    }
}