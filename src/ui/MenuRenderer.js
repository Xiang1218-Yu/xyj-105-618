import { MENU_ITEMS, EVENTS } from '../data/constants.js';

export class MenuRenderer {
    constructor(store, bus, scheduler) {
        this.store = store;
        this.scheduler = scheduler;
        this.container = document.getElementById('menu-list');
        this.developContainer = document.getElementById('develop-list');
        this.developPanel = document.getElementById('develop-panel');
        this._onDevelop = null;

        document.getElementById('develop-toggle-btn').addEventListener('click', () => {
            const visible = this.developPanel.style.display !== 'none';
            this.developPanel.style.display = visible ? 'none' : 'block';
            if (!visible) this.scheduler.invalidate(this);
        });

        bus.on(EVENTS.MENU_CHANGED, () => this.scheduler.invalidate(this));
        bus.on(EVENTS.COINS_CHANGED, () => {
            if (this.developPanel.style.display !== 'none') this.scheduler.invalidate(this);
        });
        this.scheduler.invalidate(this);
    }

    setDevelopHandler(handler) {
        this._onDevelop = handler;
    }

    render() {
        const state = this.store.getState();
        this.container.innerHTML = '';
        MENU_ITEMS.forEach(item => {
            const unlocked = state.unlockedMenuIds.includes(item.id);
            const el = document.createElement('div');
            el.className = `menu-item ${unlocked ? '' : 'locked'}`;
            el.innerHTML = `
                <span>${item.emoji}</span>
                <div>${item.name}</div>
                <div class="price">${unlocked ? '💰' + item.price : '🔒 未研发'}</div>
            `;
            this.container.appendChild(el);
        });

        if (this.developPanel.style.display !== 'none') {
            this.renderDevelop(state);
        }
    }

    renderDevelop(state) {
        this.developContainer.innerHTML = '';
        const locked = MENU_ITEMS.filter(m => !state.unlockedMenuIds.includes(m.id));
        if (locked.length === 0) {
            this.developContainer.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#999;font-size:12px;">所有菜品已研发完毕！</p>';
            return;
        }

        locked.forEach(item => {
            const el = document.createElement('div');
            el.className = 'develop-item';
            el.innerHTML = `
                <span>${item.emoji}</span>
                <div class="develop-name">${item.name}</div>
                <div class="develop-cost">研发费用: 💰${item.unlockCost}</div>
                <button class="develop-btn" ${state.coins < item.unlockCost ? 'disabled' : ''}>研发</button>
            `;
            el.querySelector('.develop-btn').addEventListener('click', () => {
                if (this._onDevelop) this._onDevelop(item);
            });
            this.developContainer.appendChild(el);
        });
    }
}
