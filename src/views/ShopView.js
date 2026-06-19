import { EVENTS } from '../core/EventBus.js';
import { CAT_BREEDS } from '../data/catBreeds.js';

export class ShopView {
    constructor(state, bus, shopManager, catManager) {
        this.state = state;
        this.bus = bus;
        this.shop = shopManager;
        this.catManager = catManager;
        this.container = document.getElementById('shop-content');
        this.currentTab = 'cats';
        this.bus.on(EVENTS.SHOP_TAB_CHANGED, (tab) => {
            this.currentTab = tab;
            this.render();
        });
        this.bus.on(EVENTS.SHOP_CHANGED, () => this.render());
        this.bus.on(EVENTS.STATS_CHANGED, () => this.render());
        this.bus.on(EVENTS.CATS_CHANGED, () => {
            if (this.currentTab === 'cats') this.render();
        });
    }

    render() {
        if (!this.container) return;
        this.container.innerHTML = '';
        if (this.currentTab === 'cats') this._renderCats();
        else if (this.currentTab === 'decor') this._renderDecor();
        else if (this.currentTab === 'food') this._renderFood();
    }

    _renderCats() {
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
                item.querySelector('.buy-btn').addEventListener('click', () => this.catManager.adoptCat(breed));
            }
            this.container.appendChild(item);
        });
    }

    _renderDecor() {
        this.shop.listDecor().forEach(decor => {
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
                item.querySelector('.buy-btn').addEventListener('click', () => this.shop.buyDecor(decor));
            }
            this.container.appendChild(item);
        });
    }

    _renderFood() {
        this.shop.listFood().forEach(food => {
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
                this.bus.emit('shop:foodUseRequested', food);
            });
            this.container.appendChild(item);
        });
    }
}
