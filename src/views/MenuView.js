import { EVENTS } from '../core/EventBus.js';
import { MENU_ITEMS } from '../data/menu.js';

export class MenuView {
    constructor(state, bus, menuManager) {
        this.state = state;
        this.bus = bus;
        this.menu = menuManager;
        this.listEl = document.getElementById('menu-list');
        this.developEl = document.getElementById('develop-list');
        this.developPanel = document.getElementById('develop-panel');
        const toggleBtn = document.getElementById('develop-toggle-btn');
        toggleBtn?.addEventListener('click', () => this._toggleDevelopPanel());
        this.bus.on(EVENTS.MENU_CHANGED, () => {
            this.render();
            if (this.developPanel && this.developPanel.style.display !== 'none') {
                this.renderDevelopPanel();
            }
        });
        this.bus.on(EVENTS.STATS_CHANGED, () => {
            if (this.developPanel && this.developPanel.style.display !== 'none') {
                this.renderDevelopPanel();
            }
        });
    }

    render() {
        if (!this.listEl) return;
        this.listEl.innerHTML = '';
        MENU_ITEMS.forEach(item => {
            const unlocked = this.state.unlockedMenuIds.includes(item.id);
            const el = document.createElement('div');
            el.className = `menu-item ${unlocked ? '' : 'locked'}`;
            el.innerHTML = `
                <span>${item.emoji}</span>
                <div>${item.name}</div>
                <div class="price">${unlocked ? '💰' + item.price : '🔒 未研发'}</div>
            `;
            this.listEl.appendChild(el);
        });
    }

    _toggleDevelopPanel() {
        if (!this.developPanel) return;
        const visible = this.developPanel.style.display !== 'none';
        this.developPanel.style.display = visible ? 'none' : 'block';
        if (!visible) this.renderDevelopPanel();
    }

    renderDevelopPanel() {
        if (!this.developEl) return;
        this.developEl.innerHTML = '';
        const locked = this.menu.getLocked();
        if (locked.length === 0) {
            this.developEl.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#999;font-size:12px;">所有菜品已研发完毕！</p>';
            return;
        }
        locked.forEach(item => {
            const el = document.createElement('div');
            el.className = 'develop-item';
            el.innerHTML = `
                <span>${item.emoji}</span>
                <div class="develop-name">${item.name}</div>
                <div class="develop-cost">研发费用: 💰${item.unlockCost}</div>
                <button class="develop-btn" ${this.state.coins < item.unlockCost ? 'disabled' : ''}>研发</button>
            `;
            el.querySelector('.develop-btn').addEventListener('click', () => {
                this.menu.developRecipe(item);
            });
            this.developEl.appendChild(el);
        });
    }
}
