import { Store } from './core/Store.js';
import { GameLoop } from './core/GameLoop.js';
import { EventBus } from './core/EventBus.js';
import { SaveSystem } from './systems/SaveSystem.js';
import { BonusSystem } from './systems/BonusSystem.js';
import { CatManager } from './managers/CatManager.js';
import { CustomerManager } from './managers/CustomerManager.js';
import { AreaManager } from './managers/AreaManager.js';
import { MenuManager } from './managers/MenuManager.js';
import { ShopManager } from './managers/ShopManager.js';
import { UIController } from './ui/UIController.js';
import { StatsRenderer } from './ui/renderers/StatsRenderer.js';
import { CafeRenderer } from './ui/renderers/CafeRenderer.js';
import { MenuRenderer } from './ui/renderers/MenuRenderer.js';
import { CustomerRenderer } from './ui/renderers/CustomerRenderer.js';
import { CatsTabRenderer } from './ui/renderers/CatsTabRenderer.js';
import { ShopRenderer } from './ui/renderers/ShopRenderer.js';
import { StoryRenderer } from './ui/renderers/StoryRenderer.js';
import { LogRenderer } from './ui/renderers/LogRenderer.js';
import { BonusPanelRenderer } from './ui/renderers/BonusPanelRenderer.js';

class GameApp {
    constructor() {
        this.eventBus = new EventBus();
        this.store = new Store(this.eventBus);

        this.bonusSystem = new BonusSystem(this.store);
        this.saveSystem = new SaveSystem(this.store);

        this.catManager = new CatManager(this.store);
        this.menuManager = new MenuManager(this.store);
        this.areaManager = new AreaManager(this.store, this.bonusSystem, this.catManager);
        this.customerManager = new CustomerManager(this.store, this.bonusSystem, this.catManager);
        this.shopManager = new ShopManager(this.store, this.areaManager);

        this.managers = {
            catManager: this.catManager,
            customerManager: this.customerManager,
            areaManager: this.areaManager,
            menuManager: this.menuManager,
            shopManager: this.shopManager,
            bonusSystem: this.bonusSystem
        };

        this.ui = new UIController(this.store, this.managers);

        this.statsRenderer = new StatsRenderer(this.store);
        this.cafeRenderer = new CafeRenderer(this.store, this.bonusSystem, this.ui);
        this.menuRenderer = new MenuRenderer(this.store, this.menuManager, this.ui);
        this.customerRenderer = new CustomerRenderer(this.store, this.ui);
        this.catsTabRenderer = new CatsTabRenderer(this.store, this.ui);
        this.shopRenderer = new ShopRenderer(this.store, this.catManager, this.shopManager);
        this.storyRenderer = new StoryRenderer(this.store, this.ui);
        this.logRenderer = new LogRenderer(this.store);
        this.bonusPanelRenderer = new BonusPanelRenderer(this.store, this.bonusSystem);

        this.renderers = [
            this.statsRenderer, this.cafeRenderer, this.menuRenderer,
            this.customerRenderer, this.catsTabRenderer, this.shopRenderer,
            this.storyRenderer, this.logRenderer, this.bonusPanelRenderer
        ];

        this._bindTabEvents();
        this._bindCustomerAngryEvent();
        this._setupGameLoop();
    }

    _bindTabEvents() {
        this.store.on('tab:changed', (tabName) => {
            if (tabName === 'cats') this.catsTabRenderer.setVisible(true);
            else this.catsTabRenderer.setVisible(false);
            if (tabName === 'story') this.storyRenderer.setVisible(true);
            else this.storyRenderer.setVisible(false);
            if (tabName === 'shop') this.shopRenderer.setVisible(true);
            else this.shopRenderer.setVisible(false);
        });

        this.store.on('shop:tabChanged', (shopName) => {
            this.shopRenderer.switchTab(shopName);
        });
    }

    _bindCustomerAngryEvent() {
        this.store.on('customers:angry', (angryLeavers) => {
            this.customerManager.onCustomersAngry(angryLeavers);
        });
    }

    _setupGameLoop() {
        this.gameLoop = new GameLoop({
            update: (dtSec) => {
                this.customerManager.onCustomersTick(dtSec);
            },
            render: null
        });

        this.gameLoop.addTimer('spawnCustomer', 8, () => {
            this.customerManager.spawnCustomer();
        }, { immediate: false });

        this.gameLoop.addTimer('spawnInitial', 2, () => {
            this.customerManager.spawnCustomer();
            this.gameLoop.removeTimer('spawnInitial');
        });

        this.gameLoop.addTimer('updateMoods', 15, () => {
            this.areaManager.updateCatMoods();
        });

        this.gameLoop.addTimer('autoSave', 5, () => {
            this.saveSystem.save();
        });
    }

    init() {
        const loaded = this.saveSystem.load();
        if (!loaded) {
            this.catManager.addInitialCat();
        }

        this.renderers.forEach(r => r.render && r.render());

        this.catsTabRenderer.setVisible(false);
        this.shopRenderer.setVisible(false);
        this.storyRenderer.setVisible(false);

        this.gameLoop.start();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.game = new GameApp();
    window.game.init();
});
