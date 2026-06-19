export class NotificationRenderer {
    constructor() {
        this.element = document.getElementById('notification');
        this._timer = null;
    }

    show(message, type = 'info') {
        this.element.textContent = message;
        this.element.className = `notification show ${type}`;
        if (this._timer) clearTimeout(this._timer);
        this._timer = setTimeout(() => {
            this.element.classList.remove('show');
        }, 3000);
    }
}
