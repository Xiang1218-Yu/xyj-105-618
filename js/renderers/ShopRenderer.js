import { CAT_BREEDS, SHOP_ITEMS } from '../../data.js';

export class ShopRenderer {
    constructor(state, catSystem, shopSystem, onUseFood) {
        this.state = state;
        this.catSystem = catSystem;
        this.shopSystem = shopSystem;
        this.onUseFood = onUseFood;
        this.container = document.getElementById('shop-content');
        this.currentTab = 'cats';
    }

    setTab(tabName) {
        this.currentTab = tabName;
        this.render();
    }

    render() {
        this.container.innerHTML = '';

        if (this.currentTab === 'cats') {
            this.renderCatsShop();
        } else if (this.currentTab === 'decor') {
            this.renderDecorShop();
        } else if (this.currentTab === 'food') {
            this.renderFoodShop();
        }
    }

    renderCatsShop() {
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
                    this.catSystem.adoptCat(breed);
                });
            }
            this.container.appendChild(item);
        });
    }

    renderDecorShop() {
        SHOP_ITEMS.decor.forEach(decor => {
            const owned = this.shopSystem.isOwned(decor.id);
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

    renderFoodShop() {
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
                this.onUseFood(food);
            });
            this.container.appendChild(item);
        });
    }
}
