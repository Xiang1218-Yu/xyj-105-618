import { EVENTS } from '../data/constants.js';

export class LogRenderer {
    constructor(store, bus, scheduler) {
        this.store = store;
        this.scheduler = scheduler;
        this.container = document.getElementById('log-content');

        bus.on(EVENTS.LOG_ADDED, () => this.scheduler.invalidate(this));
        this.scheduler.invalidate(this);
    }

    render() {
        const state = this.store.getState();
        this.container.innerHTML = '';
        const recent = state.interactionLogs.slice(-8);
        if (recent.length === 0) {
            this.container.innerHTML = '<div class="log-entry" style="color:#999;">暂无互动记录</div>';
            return;
        }
        recent.forEach(log => {
            const entry = document.createElement('div');
            entry.className = 'log-entry';
            entry.innerHTML = log;
            this.container.appendChild(entry);
        });
        this.container.scrollTop = this.container.scrollHeight;
    }
}
