import { CAT_BREEDS, SHOP_ITEMS, EVENTS } from '../data/constants.js';

export class ShopRenderer {
    constructor(state, bus, catManager, shopSystem, modal) {
        this.state = state;
        this.bus = bus;
        this.catManager = catManager;
        this.shopSystem = shopSystem;
        this.modal = modal;
        this.container = document.getElementById('shop-content');
        this.currentTab = 'cats';

        document.querySelectorAll('.shop-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.shop));
        });

        this.bus.on(EVENTS.COINS_CHANGED, () => this.render());
        this.bus.on(EVENTS.CATS_CHANGED, () => { if (this.currentTab === 'cats') this.render(); });
        this.bus.on(EVENTS.SHOP_CHANGED, () => { if (this.currentTab === 'decor') this.render(); });

        this.render();
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        document.querySelectorAll('.shop-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.shop === tabName);
        });
        this.render();
    }

    render() {
        this.container.innerHTML = '';
        if (this.currentTab === 'cats') {
            this.renderCats();
        } else if (this.currentTab === 'decor') {
            this.renderDecor();
        } else if (this.currentTab === 'food') {
            this.renderFood();
        }
    }

    renderCats() {
        CAT_BREEDS.forEach(breed => {
            const owned = this.state.cats.some(c => c.breedId === breed.id);
            const item = document.createElement('div');
            item.className = 'shop-item';
            if (owned) item.style.opacity = '0.5';
            item.innerHTML = `
                <div class="shop-item-icon">${breed.emoji}</div>
                <div class="shop-item-name">${breed.name}</div>
                <div class="shop-item-desc">${breed.personality} · ${breed.rarity}</div>
                <div class="shop-item-price">💰 ${breed.price}</div>
                <button class="buy-btn" ${owned || this.state.coins < breed.price ? 'disabled' : ''}>${owned ? '已拥有' : '收养'}</button>
            `;
            if (!owned) {
                item.querySelector('.buy-btn').addEventListener('click', () => {
                    this.catManager.adoptCat(breed);
                });
            }
            this.container.appendChild(item);
        });
    }

    renderDecor() {
        SHOP_ITEMS.decor.forEach(decor => {
            const owned = this.state.purchasedDecor.includes(decor.id);
            const item = document.createElement('div');
            item.className = 'shop-item';
            if (owned) item.style.opacity = '0.5';
            item.innerHTML = `
                <div class="shop-item-icon">${decor.emoji}</div>
                <div class="shop-item-name">${decor.name}</div>
                <div class="shop-item-desc">${decor.effect}</div>
                <div class="shop-item-price">💰 ${decor.price}</div>
                <button class="buy-btn" ${owned || this.state.coins < decor.price ? 'disabled' : ''}>${owned ? '已购买' : '购买'}</button>
            `;
            if (!owned) {
                item.querySelector('.buy-btn').addEventListener('click', () => {
                    this.shopSystem.buyDecor(decor);
                });
            }
            this.container.appendChild(item);
        });
    }

    renderFood() {
        SHOP_ITEMS.food.forEach(food => {
            const item = document.createElement('div');
            item.className = 'shop-item';
            item.innerHTML = `
                <div class="shop-item-icon">${food.emoji}</div>
                <div class="shop-item-name">${food.name}</div>
                <div class="shop-item-desc">${food.effect}</div>
                <div class="shop-item-price">💰 ${food.price}</div>
                <button class="buy-btn" ${this.state.coins < food.price ? 'disabled' : ''}>使用</button>
            `;
            item.querySelector('.buy-btn').addEventListener('click', () => {
                if (this.shopSystem.requestUseFood(food)) {
                    this.modal.openSelectCatModal(food);
                }
            });
            this.container.appendChild(item);
        });
    }
}
