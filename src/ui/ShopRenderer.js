import { CAT_BREEDS, SHOP_ITEMS, EVENTS } from '../data/constants.js';

export class ShopRenderer {
    constructor(store, bus, scheduler, modal) {
        this.store = store;
        this.scheduler = scheduler;
        this.modal = modal;
        this.container = document.getElementById('shop-content');
        this.currentTab = 'cats';
        this._onAdopt = null;
        this._onBuyDecor = null;
        this._onRequestFood = null;

        document.querySelectorAll('.shop-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.shop));
        });

        bus.on(EVENTS.COINS_CHANGED, () => this.scheduler.invalidate(this));
        bus.on(EVENTS.CATS_CHANGED, () => { if (this.currentTab === 'cats') this.scheduler.invalidate(this); });
        bus.on(EVENTS.SHOP_CHANGED, () => { if (this.currentTab === 'decor') this.scheduler.invalidate(this); });
        this.scheduler.invalidate(this);
    }

    setHandlers({ onAdopt, onBuyDecor, onRequestFood }) {
        this._onAdopt = onAdopt;
        this._onBuyDecor = onBuyDecor;
        this._onRequestFood = onRequestFood;
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        document.querySelectorAll('.shop-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.shop === tabName);
        });
        this.scheduler.invalidate(this);
    }

    render() {
        const state = this.store.getState();
        this.container.innerHTML = '';
        if (this.currentTab === 'cats') {
            this.renderCats(state);
        } else if (this.currentTab === 'decor') {
            this.renderDecor(state);
        } else if (this.currentTab === 'food') {
            this.renderFood(state);
        }
    }

    renderCats(state) {
        CAT_BREEDS.forEach(breed => {
            const owned = state.cats.some(c => c.breedId === breed.id);
            const item = document.createElement('div');
            item.className = 'shop-item';
            if (owned) item.style.opacity = '0.5';
            item.innerHTML = `
                <div class="shop-item-icon">${breed.emoji}</div>
                <div class="shop-item-name">${breed.name}</div>
                <div class="shop-item-desc">${breed.personality} · ${breed.rarity}</div>
                <div class="shop-item-price">💰 ${breed.price}</div>
                <button class="buy-btn" ${owned || state.coins < breed.price ? 'disabled' : ''}>${owned ? '已拥有' : '收养'}</button>
            `;
            if (!owned && this._onAdopt) {
                const capturedBreed = breed;
                item.querySelector('.buy-btn').addEventListener('click', () => this._onAdopt(capturedBreed));
            }
            this.container.appendChild(item);
        });
    }

    renderDecor(state) {
        SHOP_ITEMS.decor.forEach(decor => {
            const owned = state.purchasedDecor.includes(decor.id);
            const item = document.createElement('div');
            item.className = 'shop-item';
            if (owned) item.style.opacity = '0.5';
            item.innerHTML = `
                <div class="shop-item-icon">${decor.emoji}</div>
                <div class="shop-item-name">${decor.name}</div>
                <div class="shop-item-desc">${decor.effect}</div>
                <div class="shop-item-price">💰 ${decor.price}</div>
                <button class="buy-btn" ${owned || state.coins < decor.price ? 'disabled' : ''}>${owned ? '已购买' : '购买'}</button>
            `;
            if (!owned && this._onBuyDecor) {
                const captured = decor;
                item.querySelector('.buy-btn').addEventListener('click', () => this._onBuyDecor(captured));
            }
            this.container.appendChild(item);
        });
    }

    renderFood(state) {
        SHOP_ITEMS.food.forEach(food => {
            const item = document.createElement('div');
            item.className = 'shop-item';
            item.innerHTML = `
                <div class="shop-item-icon">${food.emoji}</div>
                <div class="shop-item-name">${food.name}</div>
                <div class="shop-item-desc">${food.effect}</div>
                <div class="shop-item-price">💰 ${food.price}</div>
                <button class="buy-btn" ${state.coins < food.price ? 'disabled' : ''}>使用</button>
            `;
            if (this._onRequestFood) {
                const captured = food;
                item.querySelector('.buy-btn').addEventListener('click', () => this._onRequestFood(captured));
            }
            this.container.appendChild(item);
        });
    }
}
