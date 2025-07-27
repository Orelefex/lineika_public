export class NotificationService {
    static #showNotification(message, type) {
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.remove(), 3000);
    }

    static success(message) {
        this.#showNotification(message, 'success');
    }

    static error(message) {
        this.#showNotification(message, 'error');
    }
}