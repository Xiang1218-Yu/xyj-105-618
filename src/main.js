import { EventBus, EVENTS } from './core/EventBus.js';
import { GameState } from './core/GameState.js';
import { SaveManager } from './core/SaveManager.js';
import { GameLoop, IntervalSystem } from './core/GameLoop.js';

import { BonusCalculator } from './domain/BonusCalculator.js';
import { CatManager } from './domain/CatManager.js';
import { MenuManager } from './domain/MenuManager.js';
import { ShopManager } from './domain/ShopManager.js';
import { CustomerManager } from './domain/CustomerManager.js';

import { StatsView } from './views/StatsView.js';
import { NotificationView } from './views/NotificationView.js';
import { ModalView } from './views/ModalView.js';
import { TabView } from './views/TabView.js';
import { BonusView } from './views/BonusView.js';
import { AreaView } from './views/AreaView.js';
import { CatsView } from './views/CatsView.js';
import { MenuView } from './views/MenuView.js';
import { ShopView } from './views/ShopView.js';
import { StoryView } from './views/StoryView.js';
import { CustomerView } from './views/CustomerView.js';
import { LogView } from './views/LogView.js';
import { DialogController } from './views/DialogController.js';

import { GAME_CONFIG } from './data/config.js';

class GameController {
    constructor() {
        this.bus = new EventBus();
        this.state = new GameState(this.bus);
        this.save = new SaveManager(this.state, this.bus);

        this.bonusCalc = new BonusCalculator(this.state);
        this.catManager = new CatManager(this.state, this.bus);
        this.menuManager = new MenuManager(this.state, this.bus);
        this.shopManager = new ShopManager(this.state, this.bus, this.catManager);
        this.customerManager = new CustomerManager(
            this.state, this.bus, this.menuManager, this.bonusCalc, this.catManager
        );

        this._initViews();
        this._initLoop();
    }

    _initViews() {
        new NotificationView(this.bus);
        new ModalView(this.bus);
        new TabView(this.bus);
        new StatsView(this.state, this.bus);
        new BonusView(this.state, this.bus, this.bonusCalc);
        new AreaView(this.state, this.bus, this.bonusCalc, this.catManager);
        new CatsView(this.state, this.bus);
        new MenuView(this.state, this.bus, this.menuManager);
        new ShopView(this.state, this.bus, this.shopManager, this.catManager);
        new StoryView(this.state, this.bus);
        new CustomerView(this.state, this.bus);
        new LogView(this.state, this.bus);
        new DialogController(this.state, this.bus, {
            catManager: this.catManager,
            menu: this.menuManager,
            shop: this.shopManager,
            customerManager: this.customerManager
        });
    }

    _initLoop() {
        this.loop = new GameLoop();

        const customerSpawnSec = GAME_CONFIG.customerSpawnIntervalMs / 1000;
        const moodTickSec = GAME_CONFIG.catMoodTickIntervalMs / 1000;

        this.spawnSystem = new IntervalSystem(customerSpawnSec, () => {
            this.customerManager.spawnCustomer();
        });
        this.moodSystem = new IntervalSystem(moodTickSec, () => {
            this.customerManager.updateCatMoodsFromAreas();
        });
        this.waitSystem = {
            update: (delta) => this.customerManager.tickWait(delta)
        };

        this.loop.addSystem(this.spawnSystem);
        this.loop.addSystem(this.moodSystem);
        this.loop.addSystem(this.waitSystem);
    }

    boot() {
        const loaded = this.save.load();
        if (!loaded) {
            this.catManager.addInitialCat();
        }

        this._renderAll();
        this._scheduleFirstCustomer();
        this.loop.start();
    }

    _renderAll() {
        this.bus.emit(EVENTS.STATS_CHANGED);
        this.bus.emit(EVENTS.AREAS_CHANGED);
        this.bus.emit(EVENTS.MENU_CHANGED);
        this.bus.emit(EVENTS.BONUS_CHANGED);
        this.bus.emit(EVENTS.SHOP_TAB_CHANGED, 'cats');
        this.bus.emit(EVENTS.STORIES_CHANGED);
        this.bus.emit(EVENTS.CUSTOMERS_CHANGED);
        this.bus.emit(EVENTS.LOG_CHANGED);
        this.bus.emit(EVENTS.CATS_CHANGED);
    }

    _scheduleFirstCustomer() {
        const firstDelay = GAME_CONFIG.firstCustomerDelayMs / 1000;
        const interval = GAME_CONFIG.customerSpawnIntervalMs / 1000;
        this.spawnSystem.triggerAfter(interval - firstDelay);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new GameController();
    game.boot();
    window.__game = game;
});
