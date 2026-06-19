import { EVENTS } from '../data/constants.js';

export class NotificationUI {
    constructor(bus) {
        this.bus = bus;
        this.el = document.getElementById('notification');
        this._timer = null;
        this.bus.on(EVENTS.NOTIFICATION, ({ message, type }) => this.show(message, type));
    }

    show(message, type = 'info') {
        this.el.textContent = message;
        this.el.className = `notification show ${type}`;
        if (this._timer) clearTimeout(this._timer);
        this._timer = setTimeout(() => this.el.classList.remove('show'), 3000);
    }
}
