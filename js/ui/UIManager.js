import { EventEmitter } from '../core/EventEmitter.js';

export class UIManager extends EventEmitter {
    constructor(state, systems, renderers) {
        super();
        this.state = state;
        this.systems = systems;
        this.renderers = renderers;
        this.currentTab = 'cafe';
        this.currentShopTab = 'cats';
        this._dirty = new Set(['all']);
        this._rafScheduled = false;
    }

    init() {
        this.bindEvents();
        this.setupStateListeners();
        this.renderAll();
    }

    bindEvents() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        document.querySelectorAll('.shop-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchShopTab(e.target.dataset.shop));
        });

        document.getElementById('adopt-btn').addEventListener('click', () => {
            this.switchTab('shop');
            this.switchShopTab('cats');
        });

        document.getElementById('develop-toggle-btn').addEventListener('click', () => {
            this.renderers.menu.toggleDevelopPanel();
        });

        document.querySelector('.close-btn').addEventListener('click', () => {
            this.renderers.modal.close();
        });

        document.getElementById('modal').addEventListener('click', (e) => {
            if (e.target.id === 'modal') this.renderers.modal.close();
        });
    }

    setupStateListeners() {
        const markDirty = (key) => this.markDirty(key);

        this.state.on('state:changed', markDirty);
        this.state.on('cat:added', () => markDirty('cats'));
        this.state.on('cat:assigned', () => markDirty('areas'));
        this.state.on('cat:removed', () => markDirty('areas'));
        this.state.on('customer:added', () => markDirty('customers'));
        this.state.on('customer:removed', () => markDirty('customers'));
        this.state.on('menu:unlocked', () => markDirty('menu'));
        this.state.on('decor:purchased', () => markDirty('areas'));
        this.state.on('log:added', () => markDirty('log'));
        this.state.on('story:unlocked', () => markDirty('stories'));

        this.systems.cat.on('notification', (msg, type) => {
            this.renderers.notification.show(msg, type);
            this.scheduleRender();
        });
        this.systems.cat.on('cats:updated', () => {
            this.markDirty('areas');
            this.markDirty('bonus');
        });
        this.systems.cat.on('cat:petted', () => {
            this.markDirty('cats');
            this.markDirty('stories');
            this.markDirty('bonus');
        });

        this.systems.customer.on('notification', (msg, type) => {
            this.renderers.notification.show(msg, type);
            this.scheduleRender();
        });
        this.systems.customer.on('customer:spawned', () => {
            this.markDirty('customers');
        });
        this.systems.customer.on('customers:left', () => {
            this.markDirty('customers');
            this.markDirty('stats');
        });
        this.systems.customer.on('customers:updated', () => {
            this.markDirty('customers');
        });

        this.systems.shop.on('notification', (msg, type) => {
            this.renderers.notification.show(msg, type);
            this.scheduleRender();
        });
        this.systems.shop.on('decor:bought', () => {
            this.markDirty('areas');
            this.markDirty('shop');
        });

        this.systems.menu.on('notification', (msg, type) => {
            this.renderers.notification.show(msg, type);
            this.scheduleRender();
        });
        this.systems.menu.on('recipe:developed', () => {
            this.markDirty('menu');
        });
    }

    markDirty(key) {
        this._dirty.add(key);
        this.scheduleRender();
    }

    scheduleRender() {
        if (this._rafScheduled) return;
        this._rafScheduled = true;
        requestAnimationFrame(() => {
            this._rafScheduled = false;
            this.flushRender();
        });
    }

    flushRender() {
        if (this._dirty.has('all')) {
            this.renderAll();
            this._dirty.clear();
            return;
        }

        const dirty = this._dirty;
        this._dirty = new Set();

        if (dirty.has('stats')) this.renderers.stats.render();
        if (dirty.has('coins')) this.renderers.stats.render();
        if (dirty.has('reputation')) this.renderers.stats.render();
        if (dirty.has('cats')) {
            this.renderers.stats.render();
            this.renderers.cats.render();
            this.renderers.bonus.render();
        }
        if (dirty.has('areas')) {
            this.renderers.areas.render();
            this.renderers.bonus.render();
        }
        if (dirty.has('customers')) {
            this.renderers.customers.render();
            this.renderers.bonus.render();
            this.renderers.stats.render();
        }
        if (dirty.has('menu')) {
            this.renderers.menu.render();
        }
        if (dirty.has('bonus')) {
            this.renderers.bonus.render();
        }
        if (dirty.has('log')) {
            this.renderers.log.render();
        }
        if (dirty.has('stories')) {
            if (this.currentTab === 'story') {
                this.renderers.story.render();
            }
        }
        if (dirty.has('shop') || dirty.has('decor')) {
            if (this.currentTab === 'shop') {
                this.renderers.shop.render();
            }
        }
    }

    renderAll() {
        this.renderers.stats.render();
        this.renderers.areas.render();
        this.renderers.menu.render();
        this.renderers.bonus.render();
        this.renderers.cats.render();
        this.renderers.customers.render();
        this.renderers.log.render();
        this.renderers.shop.render();
        this.renderers.story.render();
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });
        if (tabName === 'cats') this.renderers.cats.render();
        else if (tabName === 'story') this.renderers.story.render();
        else if (tabName === 'shop') this.renderers.shop.render();
    }

    switchShopTab(shopName) {
        this.currentShopTab = shopName;
        document.querySelectorAll('.shop-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.shop === shopName);
        });
        this.renderers.shop.setTab(shopName);
    }

    handleSlotClick(area, index) {
        const hasCats = this.renderers.modal.showAssignCatModal(area, index, (cat, area, idx) => {
            this.systems.cat.assignCatToArea(cat, area, idx);
        });
        if (!hasCats) {
            this.renderers.notification.show('没有可用的猫咪', 'info');
        }
    }

    handleCatClick(cat) {
        this.renderers.modal.showCatDetail(cat, () => {
            this.markDirty('cats');
            this.markDirty('stories');
            this.markDirty('bonus');
        });
    }

    handleServeClick(customer) {
        this.renderers.modal.showServeModal(customer, (cust, menuItem) => {
            const result = this.systems.customer.serveCustomer(cust, menuItem);
            this.renderers.modal.showServeResult(result);
            this.markDirty('customers');
            this.markDirty('stats');
            this.markDirty('bonus');
            this.markDirty('log');
            setTimeout(() => {
                this.renderers.modal.close();
            }, 1800);
        });
    }

    handleUseFood(food) {
        if (this.state.cats.length === 0) {
            this.renderers.notification.show('还没有猫咪！', 'error');
            return;
        }
        this.renderers.modal.showSelectCatModal(food, (cat, food) => {
            if (this.systems.cat.applyFood(cat, food)) {
                this.renderers.modal.close();
                this.markDirty('cats');
                this.markDirty('stories');
                this.markDirty('bonus');
            }
        });
    }

    handleStoryClick(cat, story) {
        this.renderers.modal.showStory(cat, story);
    }
}
