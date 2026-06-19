import { MENU_ITEMS, EVENTS } from '../data/constants.js';
import { GameState } from './GameState.js';

export class StateStore {
    constructor(bus) {
        this.bus = bus;
        this.state = new GameState();
    }

    getState() {
        return this.state;
    }

    hydrate(data) {
        this.state.hydrate(data);
    }

    snapshot() {
        return this.state.snapshot();
    }

    _emitChange(event, payload) {
        this.bus.emit(event, payload);
    }

    _emitStats() {
        this.bus.emit(EVENTS.STATS_CHANGED, this.getStats());
    }

    getStats() {
        return {
            coins: this.state.coins,
            reputation: this.state.reputation,
            catCount: this.state.cats.length
        };
    }

    addCoins(amount) {
        this.state.coins += amount;
        this.bus.emit(EVENTS.COINS_CHANGED, { coins: this.state.coins, delta: amount });
        this._emitStats();
    }

    spendCoins(amount) {
        if (this.state.coins < amount) return false;
        this.state.coins -= amount;
        this.bus.emit(EVENTS.COINS_CHANGED, { coins: this.state.coins, delta: -amount });
        this._emitStats();
        return true;
    }

    addReputation(amount) {
        this.state.reputation = Math.max(0, this.state.reputation + amount);
        this.bus.emit(EVENTS.REPUTATION_CHANGED, { reputation: this.state.reputation, delta: amount });
        this._emitStats();
    }

    addCat(cat) {
        this.state.cats.push(cat);
        this.bus.emit(EVENTS.CATS_CHANGED, { cats: this.state.cats });
        this.bus.emit(EVENTS.CAT_ADOPTED, { cat });
        this._emitStats();
    }

    updateCat(catId, updater) {
        const cat = this.state.cats.find(c => c.id === catId);
        if (!cat) return;
        updater(cat);
        this.bus.emit(EVENTS.CATS_CHANGED, { cats: this.state.cats });
        this.bus.emit(EVENTS.CAT_BOND_CHANGED, { cat });
    }

    assignCatToArea(cat, area, index) {
        this.state.areaAssignments[area][index] = cat;
        this.bus.emit(EVENTS.AREAS_CHANGED, {
            assignments: this.state.areaAssignments,
            capacities: this.state.areaCapacities
        });
        this.bus.emit(EVENTS.CAT_ASSIGNED, { cat, area, index });
    }

    removeCatFromArea(cat) {
        for (const area of Object.keys(this.state.areaAssignments)) {
            const idx = this.state.areaAssignments[area].findIndex(c => c && c.id === cat.id);
            if (idx !== -1) this.state.areaAssignments[area][idx] = null;
        }
        this.bus.emit(EVENTS.AREAS_CHANGED, {
            assignments: this.state.areaAssignments,
            capacities: this.state.areaCapacities
        });
    }

    findCatById(id) {
        return this.state.cats.find(c => c.id === id);
    }

    getAvailableCats() {
        const assigned = new Set();
        for (const assignments of Object.values(this.state.areaAssignments)) {
            assignments.forEach(c => { if (c) assigned.add(c.id); });
        }
        return this.state.cats.filter(c => !assigned.has(c.id));
    }

    addCustomer(customer) {
        this.state.customers.push(customer);
        this.bus.emit(EVENTS.CUSTOMERS_CHANGED, { customers: this.state.customers });
        this.bus.emit(EVENTS.CUSTOMER_SPAWNED, { customer });
    }

    removeCustomer(customerId, reason = 'served') {
        const idx = this.state.customers.findIndex(c => c.id === customerId);
        if (idx === -1) return null;
        const [removed] = this.state.customers.splice(idx, 1);
        this.bus.emit(EVENTS.CUSTOMERS_CHANGED, { customers: this.state.customers });
        if (reason === 'angry') {
            this.bus.emit(EVENTS.CUSTOMER_LEFT, { customer: removed, reason });
        } else {
            this.bus.emit(EVENTS.CUSTOMER_SERVED, { customer: removed });
        }
        return removed;
    }

    unlockMenu(menuId) {
        if (!this.state.unlockedMenuIds.includes(menuId)) {
            this.state.unlockedMenuIds.push(menuId);
            this.bus.emit(EVENTS.MENU_CHANGED, { unlockedMenuIds: this.state.unlockedMenuIds });
        }
    }

    isMenuUnlocked(menuId) {
        return this.state.unlockedMenuIds.includes(menuId);
    }

    getUnlockedMenu() {
        return MENU_ITEMS.filter(m => this.state.unlockedMenuIds.includes(m.id));
    }

    getLockedMenu() {
        return MENU_ITEMS.filter(m => !this.state.unlockedMenuIds.includes(m.id));
    }

    addPurchasedDecor(decorId) {
        if (!this.state.purchasedDecor.includes(decorId)) {
            this.state.purchasedDecor.push(decorId);
            this.bus.emit(EVENTS.SHOP_CHANGED, { purchasedDecor: this.state.purchasedDecor });
        }
    }

    upgradeAreaCapacity(area, amount) {
        this.state.areaCapacities[area] += amount;
        this.bus.emit(EVENTS.AREAS_CHANGED, {
            assignments: this.state.areaAssignments,
            capacities: this.state.areaCapacities
        });
    }

    unlockStory(breedId) {
        if (!this.state.unlockedStories.includes(breedId)) {
            this.state.unlockedStories.push(breedId);
            this.bus.emit(EVENTS.STORIES_CHANGED, { unlockedStories: this.state.unlockedStories });
        }
    }

    addLog(html) {
        this.state.interactionLogs.push(html);
        if (this.state.interactionLogs.length > 50) {
            this.state.interactionLogs = this.state.interactionLogs.slice(-50);
        }
        this.bus.emit(EVENTS.LOG_ADDED, { logs: this.state.interactionLogs });
    }

    recordServed(earnings) {
        this.state.totalServed += 1;
        this.state.totalEarnings += earnings;
        this._emitStats();
    }

    recordAngryLeft(count = 1) {
        this.state.totalAngryLeft += count;
        this._emitStats();
    }
}
