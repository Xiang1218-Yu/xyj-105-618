export class NotificationManager {
    constructor(store) {
        this.store = store;
        this.el = document.getElementById('notification');
        this._timer = null;
        this._bindStoreEvents();
    }

    _bindStoreEvents() {
        this.store.on('notification', ({ message, type }) => this.show(message, type));
    }

    show(message, type = 'info') {
        this.el.textContent = message;
        this.el.className = `notification show ${type}`;
        if (this._timer) clearTimeout(this._timer);
        this._timer = setTimeout(() => this.el.classList.remove('show'), 3000);
    }
}
