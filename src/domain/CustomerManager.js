import { CUSTOMER_TYPES } from '../data/customers.js';
import { CAT_PERSONALITIES } from '../data/catBreeds.js';
import { SERVE_CONFIG } from '../data/menu.js';
import { GAME_CONFIG } from '../data/config.js';
import { EVENTS } from '../core/EventBus.js';

export class CustomerManager {
    constructor(state, bus, menuManager, bonusCalculator, catManager) {
        this.state = state;
        this.bus = bus;
        this.menu = menuManager;
        this.bonus = bonusCalculator;
        this.catManager = catManager;
    }

    spawnCustomer() {
        if (this.state.customers.length >= GAME_CONFIG.maxCustomers) return;

        const unlocked = this.menu.getUnlocked();
        if (unlocked.length === 0) return;

        const bonuses = this.bonus.calculateCafeBonuses();
        let pool;
        if (bonuses.rare > 0 && Math.random() * 100 < bonuses.rare) {
            pool = CUSTOMER_TYPES.filter(c => c.rarity === 'rare');
        } else {
            pool = CUSTOMER_TYPES.filter(c => c.rarity === 'common');
        }
        if (pool.length === 0) pool = CUSTOMER_TYPES;

        const customerType = pool[Math.floor(Math.random() * pool.length)];
        const menuItem = unlocked[Math.floor(Math.random() * unlocked.length)];

        const patienceBonus = 1 + bonuses.patience / 100;
        const maxWait = Math.floor(customerType.patience * patienceBonus);

        const customer = {
            id: Date.now() + Math.random(),
            type: customerType.type,
            emoji: customerType.emoji,
            tip: customerType.tip,
            order: { ...menuItem },
            waitTime: 0,
            maxWait
        };

        this.state.customers.push(customer);
        this.bus.emit(EVENTS.CUSTOMERS_CHANGED);
    }

    tickWait(deltaSeconds) {
        if (this.state.customers.length === 0) return;
        let secondTicked = false;
        for (const customer of this.state.customers) {
            const before = Math.ceil(Math.max(0, customer.maxWait - customer.waitTime));
            customer.waitTime += deltaSeconds;
            const after = Math.ceil(Math.max(0, customer.maxWait - customer.waitTime));
            if (before !== after) secondTicked = true;
            if (customer.waitTime >= customer.maxWait) customer.leftAngry = true;
        }
        const angry = this.state.customers.filter(c => c.leftAngry);
        if (angry.length > 0) {
            this.state.totalAngryLeft += angry.length;
            this.state.customers = this.state.customers.filter(c => !c.leftAngry);
            this.state.reputation = Math.max(0, this.state.reputation - angry.length * 5);
            this.bus.emit(EVENTS.NOTIFICATION, {
                type: 'error',
                message: `${angry.length} 位客人等不及离开了...`
            });
            this.bus.emit(EVENTS.STATS_CHANGED);
            this.bus.emit(EVENTS.SAVE_REQUESTED);
            secondTicked = true;
        }
        if (secondTicked) this.bus.emit(EVENTS.CUSTOMERS_CHANGED);
    }

    serveCustomer(customer, menuItem) {
        const bonuses = this.bonus.calculateCafeBonuses();
        const tipBonus = 1 + bonuses.tip / 100;
        const isMatch = customer.order && customer.order.id === menuItem.id;
        const config = isMatch ? SERVE_CONFIG.match : SERVE_CONFIG.mismatch;

        const interaction = this._pickCatInteraction(customer);

        const baseEarning = menuItem.price - menuItem.cost;
        const tipMultiplier = customer.tip * tipBonus;
        let finalEarning = Math.floor(baseEarning * tipMultiplier * config.earningMultiplier);
        if (config.ingredientCost) {
            finalEarning -= Math.floor(menuItem.cost * config.ingredientCost);
        }

        if (interaction) {
            finalEarning = Math.floor(finalEarning * 1.15);
            interaction.cat.bond = Math.min(100, interaction.cat.bond + 1);
            this.catManager.checkStoryUnlock(interaction.cat);
            this.state.appendLog(
                `<span class="log-cat">${interaction.cat.emoji} ${interaction.cat.name}</span> ${interaction.text} <span class="log-bonus">收入+15%</span>`
            );
        }

        this.state.coins += finalEarning;
        this.state.reputation = Math.max(0, this.state.reputation + config.reputationChange);

        if (config.countAsServed) {
            this.state.totalServed += 1;
            this.state.totalEarnings += finalEarning;
        }
        if (config.countAsAngry) {
            this.state.totalAngryLeft += 1;
        }

        const idx = this.state.customers.findIndex(c => c.id === customer.id);
        if (idx !== -1) this.state.customers.splice(idx, 1);

        this.bus.emit(EVENTS.STATS_CHANGED);
        this.bus.emit(EVENTS.CUSTOMERS_CHANGED);
        this.bus.emit(EVENTS.CATS_CHANGED);
        this.bus.emit(EVENTS.BONUS_CHANGED);
        this.bus.emit(EVENTS.SAVE_REQUESTED);

        return {
            isMatch,
            config,
            interaction,
            baseEarning,
            tipMultiplier,
            finalEarning,
            menuItem,
            customer
        };
    }

    _pickCatInteraction(customer) {
        const activeCats = [];
        for (const cats of Object.values(this.state.areaAssignments)) {
            cats.forEach(cat => {
                if (cat) {
                    const realCat = this.state.cats.find(c => c.id === cat.id) || cat;
                    activeCats.push(realCat);
                }
            });
        }
        if (activeCats.length === 0 || Math.random() >= 0.6) return null;
        const cat = activeCats[Math.floor(Math.random() * activeCats.length)];
        const personality = CAT_PERSONALITIES[cat.personality];
        if (!personality) return null;
        const text = (personality.interaction || '和客人互动了一下')
            .replace('{cat}', cat.name)
            .replace('{customer}', customer.type);
        return { cat, text };
    }

    updateCatMoodsFromAreas() {
        for (const [area, cats] of Object.entries(this.state.areaAssignments)) {
            cats.forEach(cat => {
                if (!cat) return;
                const realCat = this.state.cats.find(c => c.id === cat.id) || cat;
                const mood = this.bonus.getCatMood(realCat, area);
                if (mood < 50) {
                    realCat.mood = Math.max(0, realCat.mood - 5);
                } else {
                    realCat.bond = Math.min(100, realCat.bond + 0.5);
                }
            });
        }
        this.bus.emit(EVENTS.AREAS_CHANGED);
        this.bus.emit(EVENTS.CATS_CHANGED);
        this.bus.emit(EVENTS.BONUS_CHANGED);
        this.bus.emit(EVENTS.SAVE_REQUESTED);
    }
}
