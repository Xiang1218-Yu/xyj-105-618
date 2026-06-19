import { CatDetailModal } from './modals/CatDetailModal.js';
import { AssignCatModal } from './modals/AssignCatModal.js';
import { SelectCatModal } from './modals/SelectCatModal.js';
import { ServeModal } from './modals/ServeModal.js';
import { StoryModal } from './modals/StoryModal.js';

export class UIController {
    constructor(store, managers) {
        this.store = store;
        this.managers = managers;

        this.modal = document.getElementById('modal');
        this.modalBody = document.getElementById('modal-body');
        this.notificationEl = document.getElementById('notification');
        this._notifTimer = null;

        this._currentTab = 'cafe';
        this._currentShopTab = 'cats';

        this._initModals();
        this._bindNavEvents();
        this._bindModalEvents();
        this._bindGlobalEvents();
    }

    _initModals() {
        const hooks = {
            open: () => this.openModal(),
            close: () => this.closeModal(),
            notify: (msg, type) => this.showNotification(msg, type),
            openStory: (cat, story) => this.showStory(cat, story)
        };

        this.catDetailModal = new CatDetailModal(this.modalBody, this.store, this.managers, hooks);
        this.assignCatModal = new AssignCatModal(this.modalBody, this.store, this.managers, hooks);
        this.selectCatModal = new SelectCatModal(this.modalBody, this.store, this.managers, hooks);
        this.serveModal = new ServeModal(this.modalBody, this.store, this.managers, hooks);
        this.storyModal = new StoryModal(this.modalBody, hooks);
    }

    _bindNavEvents() {
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
    }

    _bindModalEvents() {
        document.querySelector('.close-btn').addEventListener('click', () => this.closeModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target.id === 'modal') this.closeModal();
        });
    }

    _bindGlobalEvents() {
        this.store.on('notification', ({ message, type }) => this.showNotification(message, type));
        this.store.on('modal:open', (data) => {
            if (data.type === 'selectCat') this.openSelectCatModal(data.food);
        });
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

    openModal() {
        this.modal.classList.add('active');
    }

    closeModal() {
        this.modal.classList.remove('active');
    }

    showNotification(message, type = 'info') {
        this.notificationEl.textContent = message;
        this.notificationEl.className = `notification show ${type}`;
        if (this._notifTimer) clearTimeout(this._notifTimer);
        this._notifTimer = setTimeout(() => this.notificationEl.classList.remove('show'), 3000);
    }

    showCatDetail(cat) {
        this.catDetailModal.show(cat);
    }

    showStory(cat, story) {
        this.storyModal.show(cat, story);
    }

    openAssignCatModal(area, index) {
        this.assignCatModal.show(area, index);
    }

    openSelectCatModal(food) {
        this.selectCatModal.show(food);
    }

    openServeModal(customer) {
        this.serveModal.show(customer);
    }
}
