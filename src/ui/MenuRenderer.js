import { MENU_ITEMS, EVENTS } from '../data/constants.js';

export class MenuRenderer {
    constructor(state, bus, menuSystem) {
        this.state = state;
        this.bus = bus;
        this.menuSystem = menuSystem;
        this.container = document.getElementById('menu-list');
        this.developContainer = document.getElementById('develop-list');
        this.developPanel = document.getElementById('develop-panel');

        document.getElementById('develop-toggle-btn').addEventListener('click', () => {
            const visible = this.developPanel.style.display !== 'none';
            this.developPanel.style.display = visible ? 'none' : 'block';
            if (!visible) this.renderDevelop();
        });

        this.bus.on(EVENTS.MENU_CHANGED, () => this.render());
        this.bus.on(EVENTS.COINS_CHANGED, () => {
            if (this.developPanel.style.display !== 'none') this.renderDevelop();
        });
        this.render();
    }

    render() {
        this.container.innerHTML = '';
        MENU_ITEMS.forEach(item => {
            const unlocked = this.state.isMenuUnlocked(item.id);
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
        this.developContainer.innerHTML = '';
        const locked = this.state.getLockedMenu();
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
                <button class="develop-btn" ${this.state.coins < item.unlockCost ? 'disabled' : ''}>研发</button>
            `;
            el.querySelector('.develop-btn').addEventListener('click', () => {
                this.menuSystem.developRecipe(item);
            });
            this.developContainer.appendChild(el);
        });
    }
}
