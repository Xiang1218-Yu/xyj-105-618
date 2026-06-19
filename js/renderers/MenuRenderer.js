import { MENU_ITEMS } from '../../data.js';

export class MenuRenderer {
    constructor(state, menuSystem) {
        this.state = state;
        this.menuSystem = menuSystem;
        this.container = document.getElementById('menu-list');
        this.developContainer = document.getElementById('develop-list');
        this.developPanel = document.getElementById('develop-panel');
        this.developToggleBtn = document.getElementById('develop-toggle-btn');
        this._developVisible = false;
    }

    render() {
        this.renderMenu();
        if (this._developVisible) this.renderDevelopPanel();
    }

    renderMenu() {
        this.container.innerHTML = '';
        MENU_ITEMS.forEach(item => {
            const unlocked = this.state.unlockedMenuIds.includes(item.id);
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

    toggleDevelopPanel() {
        this._developVisible = !this._developVisible;
        this.developPanel.style.display = this._developVisible ? 'block' : 'none';
        if (this._developVisible) this.renderDevelopPanel();
    }

    renderDevelopPanel() {
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
