import { EVENTS } from '../core/EventBus.js';
import { GAME_CONFIG } from '../data/config.js';

export class LogView {
    constructor(state, bus) {
        this.state = state;
        this.bus = bus;
        this.container = document.getElementById('log-content');
        this.bus.on(EVENTS.LOG_CHANGED, () => this.render());
        this.bus.on(EVENTS.LOG_APPENDED, () => this.render());
    }

    render() {
        if (!this.container) return;
        this.container.innerHTML = '';
        const recent = this.state.interactionLogs.slice(-GAME_CONFIG.visibleLogEntries);
        if (recent.length === 0) {
            this.container.innerHTML = '<div class="log-entry" style="color:#999;">暂无互动记录</div>';
            return;
        }
        recent.forEach(html => {
            const entry = document.createElement('div');
            entry.className = 'log-entry';
            entry.innerHTML = html;
            this.container.appendChild(entry);
        });
        this.container.scrollTop = this.container.scrollHeight;
    }
}
