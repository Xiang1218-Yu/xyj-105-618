export class TabController {
    constructor(store) {
        this.store = store;
        this._currentTab = 'cafe';
        this._currentShopTab = 'cats';
        this._bindEvents();
    }

    _bindEvents() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.currentTarget.dataset.tab));
        });
        document.querySelectorAll('.shop-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchShopTab(e.currentTarget.dataset.shop));
        });
        const adoptBtn = document.getElementById('adopt-btn');
        if (adoptBtn) {
            adoptBtn.addEventListener('click', () => {
                this.switchTab('shop');
                this.switchShopTab('cats');
            });
        }
    }

    switchTab(tabName) {
        this._currentTab = tabName;
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });
        this.store.emit('tab:changed', tabName);
    }

    switchShopTab(shopName) {
        this._currentShopTab = shopName;
        document.querySelectorAll('.shop-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.shop === shopName);
        });
        this.store.emit('shop:tabChanged', shopName);
    }

    getCurrentTab() {
        return this._currentTab;
    }

    getCurrentShopTab() {
        return this._currentShopTab;
    }
}
