import { CAT_BREEDS, SHOP_ITEMS } from '../../data.js';

export class ShopRenderer {
    constructor(store, catManager, shopManager) {
        this.store = store;
        this.catManager = catManager;
        this.shopManager = shopManager;
        this.container = document.getElementById('shop-content');
        this._currentTab = 'cats';
        this._visible = false;

        this.store.on('coins:changed', () => { if (this._visible) this.render(this._currentTab); });
        this.store.on('cats:changed', () => { if (this._visible && this._currentTab === 'cats') this.render('cats'); });
        this.store.on('shop:changed', () => { if (this._visible && this._currentTab === 'decor') this.render('decor'); });
        this.store.on('areas:changed', () => { if (this._visible && this._currentTab === 'decor') this.render('decor'); });
        this.store.on('state:hydrated', () => { if (this._visible) this.render(this._currentTab); });
    }

    setVisible(visible) {
        this._visible = visible;
        if (visible) this.render(this._currentTab);
    }

    switchTab(tabName) {
        this._currentTab = tabName;
        this.render(tabName);
    }

    render(shopType = this._currentTab) {
        const s = this.store.getState();
        this.container.innerHTML = '';

        if (shopType === 'cats') {
            CAT_BREEDS.forEach(breed => {
                const owned = s.cats.some(c => c.breedId === breed.id);
                const item = document.createElement('div');
                item.className = 'shop-item';
                if (owned) item.style.opacity = '0.5';
                item.innerHTML = `
                    <div class="shop-item-icon">${breed.emoji}</div>
                    <div class="shop-item-name">${breed.name}</div>
                    <div class="shop-item-desc">${breed.personality} · ${breed.rarity}</div>
                    <div class="shop-item-price">💰 ${breed.price}</div>
                    <button class="buy-btn" ${owned || s.coins < breed.price ? 'disabled' : ''}>${owned ? '已拥有' : '收养'}</button>
                `;
                if (!owned) {
                    item.querySelector('.buy-btn').addEventListener('click', () => this.catManager.adoptCat(breed));
                }
                this.container.appendChild(item);
            });
        } else if (shopType === 'decor') {
            SHOP_ITEMS.decor.forEach(decor => {
                const owned = s.purchasedDecor.includes(decor.id);
                const item = document.createElement('div');
                item.className = 'shop-item';
                if (owned) item.style.opacity = '0.5';
                item.innerHTML = `
                    <div class="shop-item-icon">${decor.emoji}</div>
                    <div class="shop-item-name">${decor.name}</div>
                    <div class="shop-item-desc">${decor.effect}</div>
                    <div class="shop-item-price">💰 ${decor.price}</div>
                    <button class="buy-btn" ${owned || s.coins < decor.price ? 'disabled' : ''}>${owned ? '已购买' : '购买'}</button>
                `;
                if (!owned) {
                    item.querySelector('.buy-btn').addEventListener('click', () => this.shopManager.buyDecor(decor));
                }
                this.container.appendChild(item);
            });
        } else if (shopType === 'food') {
            SHOP_ITEMS.food.forEach(food => {
                const item = document.createElement('div');
                item.className = 'shop-item';
                item.innerHTML = `
                    <div class="shop-item-icon">${food.emoji}</div>
                    <div class="shop-item-name">${food.name}</div>
                    <div class="shop-item-desc">${food.effect}</div>
                    <div class="shop-item-price">💰 ${food.price}</div>
                    <button class="buy-btn" ${s.coins < food.price ? 'disabled' : ''}>使用</button>
                `;
                item.querySelector('.buy-btn').addEventListener('click', () => this.shopManager.useFood(food));
                this.container.appendChild(item);
            });
        }
    }
}
