export class LogRenderer {
    constructor(store) {
        this.store = store;
        this.container = document.getElementById('log-content');

        this.store.on('log:added', () => this.render());
        this.store.on('state:hydrated', () => this.render());
    }

    render() {
        const s = this.store.getState();
        this.container.innerHTML = '';
        const recent = s.interactionLogs.slice(-8);
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
