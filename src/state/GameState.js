import { MENU_ITEMS, EVENTS } from '../data/constants.js';

const DEFAULTS = Object.freeze({
    coins: 500,
    reputation: 0,
    cats: [],
    customers: [],
    areaCapacities: { hall: 4, shelf: 3, window: 3 },
    areaAssignments: { hall: [], shelf: [], window: [] },
    unlockedStories: [],
    purchasedDecor: [],
    unlockedMenuIds: MENU_ITEMS.filter(m => m.unlockCost === 0).map(m => m.id),
    interactionLogs: [],
    totalServed: 0,
    totalEarnings: 0,
    totalAngryLeft: 0
});

export class GameState {
    constructor(eventBus) {
        this.bus = eventBus;
        this.reset();
    }

    reset() {
        this.coins = DEFAULTS.coins;
        this.reputation = DEFAULTS.reputation;
        this.cats = [...DEFAULTS.cats];
        this.customers = [...DEFAULTS.customers];
        this.areaCapacities = { ...DEFAULTS.areaCapacities };
        this.areaAssignments = { hall: [], shelf: [], window: [] };
        this.unlockedStories = [...DEFAULTS.unlockedStories];
        this.purchasedDecor = [...DEFAULTS.purchasedDecor];
        this.unlockedMenuIds = [...DEFAULTS.unlockedMenuIds];
        this.interactionLogs = [...DEFAULTS.interactionLogs];
        this.totalServed = DEFAULTS.totalServed;
        this.totalEarnings = DEFAULTS.totalEarnings;
        this.totalAngryLeft = DEFAULTS.totalAngryLeft;
    }

    hydrate(data) {
        this.coins = data.coins ?? DEFAULTS.coins;
        this.reputation = data.reputation ?? DEFAULTS.reputation;
        this.cats = data.cats ?? [];
        this.customers = data.customers ?? [];
        this.areaCapacities = data.areaCapacities ?? { ...DEFAULTS.areaCapacities };
        this.areaAssignments = data.areaAssignments ?? { hall: [], shelf: [], window: [] };
        this.unlockedStories = data.unlockedStories ?? [];
        this.purchasedDecor = data.purchasedDecor ?? [];
        this.unlockedMenuIds = data.unlockedMenuIds ?? [...DEFAULTS.unlockedMenuIds];
        this.interactionLogs = data.interactionLogs ?? [];
        this.totalServed = data.totalServed ?? 0;
        this.totalEarnings = data.totalEarnings ?? 0;
        this.totalAngryLeft = data.totalAngryLeft ?? 0;

        for (const area of Object.keys(this.areaAssignments)) {
            this.areaAssignments[area] = this.areaAssignments[area].map(ref => {
                if (!ref) return null;
                return this.cats.find(c => c.id === ref.id) || null;
            });
        }
    }

    snapshot() {
        return {
            coins: this.coins,
            reputation: this.reputation,
            cats: this.cats,
            areaCapacities: { ...this.areaCapacities },
            areaAssignments: {
                hall: this.areaAssignments.hall.map(c => c ? { id: c.id } : null),
                shelf: this.areaAssignments.shelf.map(c => c ? { id: c.id } : null),
                window: this.areaAssignments.window.map(c => c ? { id: c.id } : null)
            },
            unlockedStories: [...this.unlockedStories],
            purchasedDecor: [...this.purchasedDecor],
            unlockedMenuIds: [...this.unlockedMenuIds],
            interactionLogs: this.interactionLogs.slice(-50),
            totalServed: this.totalServed,
            totalEarnings: this.totalEarnings,
            totalAngryLeft: this.totalAngryLeft
        };
    }

    addCoins(amount) {
        this.coins += amount;
        this.bus.emit(EVENTS.COINS_CHANGED, { coins: this.coins, delta: amount });
        this.bus.emit(EVENTS.STATS_CHANGED, this.getStats());
    }

    spendCoins(amount) {
        if (this.coins < amount) return false;
        this.coins -= amount;
        this.bus.emit(EVENTS.COINS_CHANGED, { coins: this.coins, delta: -amount });
        this.bus.emit(EVENTS.STATS_CHANGED, this.getStats());
        return true;
    }

    addReputation(amount) {
        this.reputation = Math.max(0, this.reputation + amount);
        this.bus.emit(EVENTS.REPUTATION_CHANGED, { reputation: this.reputation, delta: amount });
        this.bus.emit(EVENTS.STATS_CHANGED, this.getStats());
    }

    getStats() {
        return {
            coins: this.coins,
            reputation: this.reputation,
            catCount: this.cats.length
        };
    }

    addCat(cat) {
        this.cats.push(cat);
        this.bus.emit(EVENTS.CATS_CHANGED, { cats: this.cats });
        this.bus.emit(EVENTS.CAT_ADOPTED, { cat });
        this.bus.emit(EVENTS.STATS_CHANGED, this.getStats());
    }

    updateCat(catId, updater) {
        const cat = this.cats.find(c => c.id === catId);
        if (!cat) return;
        updater(cat);
        this.bus.emit(EVENTS.CATS_CHANGED, { cats: this.cats });
        this.bus.emit(EVENTS.CAT_BOND_CHANGED, { cat });
    }

    assignCatToArea(cat, area, index) {
        this.areaAssignments[area][index] = cat;
        this.bus.emit(EVENTS.AREAS_CHANGED, { assignments: this.areaAssignments });
        this.bus.emit(EVENTS.CAT_ASSIGNED, { cat, area, index });
    }

    removeCatFromArea(cat) {
        for (const area of Object.keys(this.areaAssignments)) {
            const idx = this.areaAssignments[area].findIndex(c => c && c.id === cat.id);
            if (idx !== -1) this.areaAssignments[area][idx] = null;
        }
        this.bus.emit(EVENTS.AREAS_CHANGED, { assignments: this.areaAssignments });
    }

    findCatById(id) {
        return this.cats.find(c => c.id === id);
    }

    getAvailableCats() {
        const assigned = new Set();
        for (const assignments of Object.values(this.areaAssignments)) {
            assignments.forEach(c => { if (c) assigned.add(c.id); });
        }
        return this.cats.filter(c => !assigned.has(c.id));
    }

    addCustomer(customer) {
        this.customers.push(customer);
        this.bus.emit(EVENTS.CUSTOMERS_CHANGED, { customers: this.customers });
        this.bus.emit(EVENTS.CUSTOMER_SPAWNED, { customer });
    }

    removeCustomer(customerId, reason = 'served') {
        const idx = this.customers.findIndex(c => c.id === customerId);
        if (idx === -1) return null;
        const [removed] = this.customers.splice(idx, 1);
        this.bus.emit(EVENTS.CUSTOMERS_CHANGED, { customers: this.customers });
        if (reason === 'angry') {
            this.bus.emit(EVENTS.CUSTOMER_LEFT, { customer: removed, reason });
        } else {
            this.bus.emit(EVENTS.CUSTOMER_SERVED, { customer: removed });
        }
        return removed;
    }

    unlockMenu(menuId) {
        if (!this.unlockedMenuIds.includes(menuId)) {
            this.unlockedMenuIds.push(menuId);
            this.bus.emit(EVENTS.MENU_CHANGED, { unlockedMenuIds: this.unlockedMenuIds });
        }
    }

    isMenuUnlocked(menuId) {
        return this.unlockedMenuIds.includes(menuId);
    }

    getUnlockedMenu() {
        return MENU_ITEMS.filter(m => this.unlockedMenuIds.includes(m.id));
    }

    getLockedMenu() {
        return MENU_ITEMS.filter(m => !this.unlockedMenuIds.includes(m.id));
    }

    addPurchasedDecor(decorId) {
        if (!this.purchasedDecor.includes(decorId)) {
            this.purchasedDecor.push(decorId);
            this.bus.emit(EVENTS.SHOP_CHANGED, { purchasedDecor: this.purchasedDecor });
        }
    }

    upgradeAreaCapacity(area, amount) {
        this.areaCapacities[area] += amount;
        this.bus.emit(EVENTS.AREAS_CHANGED, { assignments: this.areaAssignments, capacities: this.areaCapacities });
    }

    unlockStory(breedId) {
        if (!this.unlockedStories.includes(breedId)) {
            this.unlockedStories.push(breedId);
            this.bus.emit(EVENTS.STORIES_CHANGED, { unlockedStories: this.unlockedStories });
        }
    }

    addLog(html) {
        this.interactionLogs.push(html);
        if (this.interactionLogs.length > 50) {
            this.interactionLogs = this.interactionLogs.slice(-50);
        }
        this.bus.emit(EVENTS.LOG_ADDED, { logs: this.interactionLogs });
    }

    recordServed(earnings) {
        this.totalServed += 1;
        this.totalEarnings += earnings;
        this.bus.emit(EVENTS.STATS_CHANGED, this.getStats());
    }

    recordAngryLeft(count = 1) {
        this.totalAngryLeft += count;
        this.bus.emit(EVENTS.STATS_CHANGED, this.getStats());
    }
}
