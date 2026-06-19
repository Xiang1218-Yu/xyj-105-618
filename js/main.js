import { GameLoop } from './core/GameLoop.js';
import { GameState } from './models/GameState.js';
import { CatSystem } from './systems/CatSystem.js';
import { CustomerSystem } from './systems/CustomerSystem.js';
import { ShopSystem } from './systems/ShopSystem.js';
import { MenuSystem } from './systems/MenuSystem.js';
import { StatsRenderer } from './renderers/StatsRenderer.js';
import { MenuRenderer } from './renderers/MenuRenderer.js';
import { BonusRenderer } from './renderers/BonusRenderer.js';
import { AreasRenderer } from './renderers/AreasRenderer.js';
import { CatsRenderer } from './renderers/CatsRenderer.js';
import { CustomersRenderer } from './renderers/CustomersRenderer.js';
import { ShopRenderer } from './renderers/ShopRenderer.js';
import { StoryRenderer } from './renderers/StoryRenderer.js';
import { LogRenderer } from './renderers/LogRenderer.js';
import { ModalRenderer } from './renderers/ModalRenderer.js';
import { NotificationRenderer } from './renderers/NotificationRenderer.js';
import { UIManager } from './ui/UIManager.js';

class GameApp {
    constructor() {
        this.state = new GameState();
        this.systems = {};
        this.renderers = {};
        this.ui = null;
        this.gameLoop = null;
    }

    init() {
        const hasData = this.state.init();

        this.systems.cat = new CatSystem(this.state);
        this.systems.customer = new CustomerSystem(this.state, this.systems.cat);
        this.systems.shop = new ShopSystem(this.state);
        this.systems.menu = new MenuSystem(this.state);

        if (!hasData) {
            this.systems.cat.addInitialCat();
        }

        this.renderers.stats = new StatsRenderer(this.state);
        this.renderers.menu = new MenuRenderer(this.state, this.systems.menu);
        this.renderers.bonus = new BonusRenderer(this.state);
        this.renderers.areas = new AreasRenderer(
            this.state,
            (area, index) => this.ui.handleSlotClick(area, index),
            (cat) => this.ui.handleCatClick(cat)
        );
        this.renderers.cats = new CatsRenderer(this.state, (cat) => this.ui.handleCatClick(cat));
        this.renderers.customers = new CustomersRenderer(this.state, (customer) => this.ui.handleServeClick(customer));
        this.renderers.shop = new ShopRenderer(
            this.state,
            this.systems.cat,
            this.systems.shop,
            (food) => this.ui.handleUseFood(food)
        );
        this.renderers.story = new StoryRenderer(this.state, (cat, story) => this.ui.handleStoryClick(cat, story));
        this.renderers.log = new LogRenderer(this.state);
        this.renderers.modal = new ModalRenderer(this.state, this.systems.cat, this.systems.customer);
        this.renderers.notification = new NotificationRenderer();

        this.ui = new UIManager(this.state, this.systems, this.renderers);
        this.ui.init();

        this.setupGameLoop();
    }

    setupGameLoop() {
        this.gameLoop = new GameLoop(
            (deltaMs) => this.update(deltaMs),
            () => this.render()
        );
        this.gameLoop.start();
    }

    update(deltaMs) {
        this.systems.cat.updateMoods(deltaMs);
        this.systems.customer.update(deltaMs);
    }

    render() {
        if (this.ui._dirty.size > 0) {
            this.ui.flushRender();
        }

        const customersContainer = document.getElementById('customers-list');
        if (customersContainer && this.state.customers.length > 0) {
            this.state.customers.forEach((customer, idx) => {
                const timerEl = customersContainer.children[idx]?.querySelector('.customer-timer');
                if (timerEl) {
                    timerEl.textContent = Math.ceil(customer.getRemainingTime()) + 's';
                    timerEl.classList.toggle('urgent', customer.isUrgent());
                }
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new GameApp();
    app.init();
});
