import { EventBus } from '../core/EventBus.js';
import { Storage } from '../core/Storage.js';
import { GameLoop } from '../core/GameLoop.js';
import { RenderScheduler } from '../core/RenderScheduler.js';
import { StateStore } from '../state/StateStore.js';
import { CatManager } from '../systems/CatManager.js';
import { MenuSystem } from '../systems/MenuSystem.js';
import { ShopSystem } from '../systems/ShopSystem.js';
import { CustomerManager } from '../systems/CustomerManager.js';
import { CafeSystem } from '../systems/CafeSystem.js';
import { CAT_BREEDS, EVENTS } from '../data/constants.js';

import { StatsRenderer } from '../ui/StatsRenderer.js';
import { MenuRenderer } from '../ui/MenuRenderer.js';
import { BonusRenderer } from '../ui/BonusRenderer.js';
import { AreasRenderer } from '../ui/AreasRenderer.js';
import { CustomersRenderer } from '../ui/CustomersRenderer.js';
import { LogRenderer } from '../ui/LogRenderer.js';
import { CatsRenderer } from '../ui/CatsRenderer.js';
import { ShopRenderer } from '../ui/ShopRenderer.js';
import { StoryRenderer } from '../ui/StoryRenderer.js';
import { ModalUI } from '../ui/ModalUI.js';
import { NotificationUI } from '../ui/NotificationUI.js';
import { TabController } from '../ui/TabController.js';

export class GameApp {
    constructor() {
        this.bus = new EventBus();
        this.store = new StateStore(this.bus);
        this.loop = new GameLoop();
        this.scheduler = new RenderScheduler();

        this.catManager = new CatManager(this.store, this.bus);
        this.menuSystem = new MenuSystem(this.store, this.bus);
        this.shopSystem = new ShopSystem(this.store, this.bus);
        this.customerManager = new CustomerManager(this.store, this.bus);
        this.cafeSystem = new CafeSystem(this.store, this.bus);

        this.modal = new ModalUI(this.store, this.bus);
        this.notification = new NotificationUI(this.bus);

        this._initRenderers();
        this._wireHandlers();
        this._setupAutoSave();
    }

    _initRenderers() {
        const store = this.store;
        const bus = this.bus;
        const sched = this.scheduler;
        const modal = this.modal;

        this.statsRenderer = new StatsRenderer(store, bus, sched);
        this.menuRenderer = new MenuRenderer(store, bus, sched);
        this.bonusRenderer = new BonusRenderer(store, bus, sched);
        this.areasRenderer = new AreasRenderer(store, bus, sched, modal);
        this.customersRenderer = new CustomersRenderer(store, bus, sched, modal);
        this.logRenderer = new LogRenderer(store, bus, sched);
        this.catsRenderer = new CatsRenderer(store, bus, sched, modal);
        this.shopRenderer = new ShopRenderer(store, bus, sched, modal);
        this.storyRenderer = new StoryRenderer(store, bus, sched, modal);

        this.tabController = new TabController(this.catsRenderer, this.storyRenderer);
    }

    _wireHandlers() {
        this.menuRenderer.setDevelopHandler((item) => this.menuSystem.developRecipe(item));

        this.shopRenderer.setHandlers({
            onAdopt: (breed) => this.catManager.adoptCat(breed),
            onBuyDecor: (decor) => this.shopSystem.buyDecor(decor),
            onRequestFood: (food) => {
                if (this.shopSystem.requestUseFood(food)) {
                    this.modal.openSelectCatModal(food);
                }
            }
        });

        this.modal.setHandlers({
            onPet: (cat) => this.catManager.petCat(cat),
            onMoveCat: (cat) => {
                this.catManager.removeCatFromArea(cat);
                this.bus.emit(EVENTS.NOTIFICATION, {
                    message: `请选择新的位置放置 ${cat.name}`,
                    type: 'info'
                });
            },
            onAssignCat: (cat, area, index) => this.catManager.assignCatToArea(cat, area, index),
            onUseFood: (cat, food) => this.catManager.applyFoodToCat(cat, food),
            onServe: (customer, menuItem) => this.cafeSystem.serveCustomer(customer, menuItem)
        });
    }

    _setupAutoSave() {
        this.bus.on(EVENTS.SAVE, () => {
            Storage.save(this.store.snapshot());
        });
    }

    _loadInitialCat() {
        const initialBreed = CAT_BREEDS[Math.floor(Math.random() * 6)];
        this.catManager.adoptCat(initialBreed, true);
    }

    start() {
        const saved = Storage.load();
        if (saved && saved.cats && saved.cats.length > 0) {
            this.store.hydrate(saved);
            this.scheduler.flushNow();
        } else {
            this._loadInitialCat();
        }

        this.loop.addTask('customers', (deltaSec) => {
            this.customerManager.tick(deltaSec);
        });

        this.loop.addTask('cats', (deltaSec) => {
            this.catManager.tick(deltaSec);
        });

        setTimeout(() => this.customerManager.spawnCustomer(), 2000);

        this.loop.start();
        console.log('[CatCafe] Game initialized with modular architecture');
    }
}
