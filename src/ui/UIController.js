import { TabController } from './TabController.js';
import { NotificationManager } from './NotificationManager.js';
import { ModalManager } from './ModalManager.js';
import { CatDetailModal } from './modals/CatDetailModal.js';
import { AssignCatModal } from './modals/AssignCatModal.js';
import { SelectCatModal } from './modals/SelectCatModal.js';
import { ServeModal } from './modals/ServeModal.js';
import { StoryModal } from './modals/StoryModal.js';

export class UIController {
    constructor(store, managers) {
        this.store = store;
        this.managers = managers;

        this.tabs = new TabController(store);
        this.notifications = new NotificationManager(store);
        this.modals = new ModalManager();

        this._initModals();
        this._bindStoreEvents();
    }

    _initModals() {
        const hooks = {
            open: () => this.modals.open(),
            close: () => this.modals.close(),
            notify: (msg, type) => this.notifications.show(msg, type),
            openStory: (cat, story) => this.showStory(cat, story)
        };

        const body = this.modals.getBody();
        this.catDetailModal = new CatDetailModal(body, this.store, this.managers, hooks);
        this.assignCatModal = new AssignCatModal(body, this.store, this.managers, hooks);
        this.selectCatModal = new SelectCatModal(body, this.store, this.managers, hooks);
        this.serveModal = new ServeModal(body, this.store, this.managers, hooks);
        this.storyModal = new StoryModal(body, hooks);
    }

    _bindStoreEvents() {
        this.store.on('modal:open', (data) => {
            if (data.type === 'selectCat') this.openSelectCatModal(data.food);
        });
    }

    showNotification(message, type) {
        this.notifications.show(message, type);
    }

    openModal() {
        this.modals.open();
    }

    closeModal() {
        this.modals.close();
    }

    switchTab(tabName) {
        this.tabs.switchTab(tabName);
    }

    switchShopTab(shopName) {
        this.tabs.switchShopTab(shopName);
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
