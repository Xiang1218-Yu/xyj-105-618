export class LogRenderer {
    constructor(state) {
        this.state = state;
        this.container = document.getElementById('log-content');
    }

    render() {
        this.container.innerHTML = '';
        const recent = this.state.interactionLogs.slice(-8);
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
