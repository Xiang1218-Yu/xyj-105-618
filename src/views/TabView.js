import { EVENTS } from '../core/EventBus.js';

export class TabView {
    constructor(bus, viewsToRefresh) {
        this.bus = bus;
        this.viewsToRefresh = viewsToRefresh || {};
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.currentTarget.dataset.tab));
        });
        document.querySelectorAll('.shop-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchShopTab(e.currentTarget.dataset.shop));
        });
        const adoptBtn = document.getElementById('adopt-btn');
        adoptBtn?.addEventListener('click', () => {
            this.switchTab('shop');
            this.switchShopTab('cats');
        });
    }

    switchTab(tabName) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });
        this.bus.emit(EVENTS.TAB_CHANGED, tabName);
    }

    switchShopTab(shopName) {
        document.querySelectorAll('.shop-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.shop === shopName);
        });
        this.bus.emit(EVENTS.SHOP_TAB_CHANGED, shopName);
    }
}
