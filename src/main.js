import { EventBus } from './core/EventBus.js';
import { Storage } from './core/Storage.js';
import { GameLoop } from './core/GameLoop.js';
import { GameState } from './state/GameState.js';
import { CatManager } from './systems/CatManager.js';
import { MenuSystem } from './systems/MenuSystem.js';
import { ShopSystem } from './systems/ShopSystem.js';
import { CustomerManager } from './systems/CustomerManager.js';
import { CafeSystem } from './systems/CafeSystem.js';
import { CAT_BREEDS, EVENTS } from './data/constants.js';

import { StatsRenderer } from './ui/StatsRenderer.js';
import { MenuRenderer } from './ui/MenuRenderer.js';
import { BonusRenderer } from './ui/BonusRenderer.js';
import { AreasRenderer } from './ui/AreasRenderer.js';
import { CustomersRenderer } from './ui/CustomersRenderer.js';
import { LogRenderer } from './ui/LogRenderer.js';
import { CatsRenderer } from './ui/CatsRenderer.js';
import { ShopRenderer } from './ui/ShopRenderer.js';
import { StoryRenderer } from './ui/StoryRenderer.js';
import { ModalUI } from './ui/ModalUI.js';
import { NotificationUI } from './ui/NotificationUI.js';

class TabController {
    constructor(bus, catsRenderer, storyRenderer) {
        this.bus = bus;
        this.catsRenderer = catsRenderer;
        this.storyRenderer = storyRenderer;

        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        document.getElementById('adopt-btn').addEventListener('click', () => {
            this.switchTab('shop');
        });
    }

    switchTab(tabName) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });
        if (tabName === 'cats') this.catsRenderer.render();
        else if (tabName === 'story') this.storyRenderer.render();
    }
}

class GameApp {
    constructor() {
        this.bus = new EventBus();
        this.state = new GameState(this.bus);
        this.loop = new GameLoop();

        this.catManager = new CatManager(this.state, this.bus);
        this.menuSystem = new MenuSystem(this.state, this.bus);
        this.shopSystem = new ShopSystem(this.state, this.bus);
        this.customerManager = new CustomerManager(this.state, this.bus, this.catManager);
        this.cafeSystem = new CafeSystem(this.state, this.bus, this.catManager);

        this.modal = new ModalUI(this.state, this.bus, this.catManager, this.cafeSystem);
        this.notification = new NotificationUI(this.bus);

        this.statsRenderer = new StatsRenderer(this.state, this.bus);
        this.menuRenderer = new MenuRenderer(this.state, this.bus, this.menuSystem);
        this.bonusRenderer = new BonusRenderer(this.state, this.bus, this.catManager);
        this.areasRenderer = new AreasRenderer(this.state, this.bus, this.catManager, this.modal);
        this.customersRenderer = new CustomersRenderer(this.state, this.bus, this.modal);
        this.logRenderer = new LogRenderer(this.state, this.bus);
        this.catsRenderer = new CatsRenderer(this.state, this.bus, this.modal);
        this.shopRenderer = new ShopRenderer(this.state, this.bus, this.catManager, this.shopSystem, this.modal);
        this.storyRenderer = new StoryRenderer(this.state, this.bus, this.modal);

        this.tabController = new TabController(this.bus, this.catsRenderer, this.storyRenderer);

        this._saveTimer = 0;
        this._setupAutoSave();
    }

    _setupAutoSave() {
        this.bus.on(EVENTS.SAVE, () => {
            Storage.save(this.state.snapshot());
        });
    }

    load() {
        const saved = Storage.load();
        if (saved && saved.cats && saved.cats.length > 0) {
            this.state.hydrate(saved);
            return true;
        }
        return false;
    }

    start() {
        const loaded = this.load();
        if (!loaded) {
            const initialBreed = CAT_BREEDS[Math.floor(Math.random() * 6)];
            this.catManager.adoptCat(initialBreed, true);
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

document.addEventListener('DOMContentLoaded', () => {
    const app = new GameApp();
    app.start();
    window.__game = app;
});
