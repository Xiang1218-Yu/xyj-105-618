import { EVENTS } from '../core/EventBus.js';
import { GAME_CONFIG } from '../data/config.js';

export class NotificationView {
    constructor(bus) {
        this.bus = bus;
        this.el = document.getElementById('notification');
        this._timer = null;
        this.bus.on(EVENTS.NOTIFICATION, ({ type = 'info', message }) => this.show(type, message));
    }

    show(type, message) {
        if (!this.el) return;
        this.el.textContent = message;
        this.el.className = `notification show ${type}`;
        if (this._timer) clearTimeout(this._timer);
        this._timer = setTimeout(() => {
            this.el.classList.remove('show');
        }, GAME_CONFIG.notificationDurationMs);
    }
}
