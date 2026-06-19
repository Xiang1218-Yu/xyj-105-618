import { MENU_ITEMS } from '../../data.js';

export class MenuRenderer {
    constructor(store, menuManager, uiController) {
        this.store = store;
        this.menuManager = menuManager;
        this.ui = uiController;
        this.container = document.getElementById('menu-list');
        this.developContainer = document.getElementById('develop-list');

        this.store.on('menu:changed', () => { this.render(); this.renderDevelop(); });
        this.store.on('coins:changed', () => { this.renderDevelop(); });
        this.store.on('state:hydrated', () => { this.render(); this.renderDevelop(); });

        document.getElementById('develop-toggle-btn').addEventListener('click', () => {
            const panel = document.getElementById('develop-panel');
            const visible = panel.style.display !== 'none';
            panel.style.display = visible ? 'none' : 'block';
            if (!visible) this.renderDevelop();
        });
    }

    render() {
        const s = this.store.getState();
        this.container.innerHTML = '';
        MENU_ITEMS.forEach(item => {
            const unlocked = s.unlockedMenuIds.includes(item.id);
            const el = document.createElement('div');
            el.className = `menu-item ${unlocked ? '' : 'locked'}`;
            el.innerHTML = `
                <span>${item.emoji}</span>
                <div>${item.name}</div>
                <div class="price">${unlocked ? '💰' + item.price : '🔒 未研发'}</div>
            `;
            this.container.appendChild(el);
        });
    }

    renderDevelop() {
        const s = this.store.getState();
        this.developContainer.innerHTML = '';
        const locked = this.store.getLockedMenu();
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
                <button class="develop-btn" ${s.coins < item.unlockCost ? 'disabled' : ''}>研发</button>
            `;
            el.querySelector('.develop-btn').addEventListener('click', () => {
                this.menuManager.developRecipe(item);
            });
            this.developContainer.appendChild(el);
        });
    }
}
