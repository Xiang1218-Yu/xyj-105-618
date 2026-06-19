import { EventBus } from './EventBus.js';
import { MENU_ITEMS } from '../data.js';

const createInitialState = () => ({
    coins: 500,
    reputation: 0,
    cats: [],
    customers: [],
    selectedCatId: null,
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

export class Store extends EventBus {
    constructor() {
        super();
        this.state = createInitialState();
        this._pauseRendering = false;
    }

    reset() {
        this.state = createInitialState();
        this.emit('state:reset');
    }

    hydrate(data) {
        Object.assign(this.state, data);
        for (const area of Object.keys(this.state.areaAssignments)) {
            this.state.areaAssignments[area] = this.state.areaAssignments[area].map(cat => {
                if (!cat) return null;
                const realCat = this.state.cats.find(c => c.id === cat.id);
                return realCat || null;
            });
        }
        this.emit('state:hydrated');
    }

    snapshot() {
        return JSON.parse(JSON.stringify({
            coins: this.state.coins,
            reputation: this.state.reputation,
            cats: this.state.cats,
            areaCapacities: this.state.areaCapacities,
            areaAssignments: this.state.areaAssignments,
            unlockedStories: this.state.unlockedStories,
            purchasedDecor: this.state.purchasedDecor,
            unlockedMenuIds: this.state.unlockedMenuIds,
            interactionLogs: this.state.interactionLogs.slice(-50),
            totalServed: this.state.totalServed,
            totalEarnings: this.state.totalEarnings,
            totalAngryLeft: this.state.totalAngryLeft
        }));
    }

    getState() {
        return this.state;
    }

    findCat(catId) {
        return this.state.cats.find(c => c.id === catId) || null;
    }

    findCustomer(customerId) {
        return this.state.customers.find(c => c.id === customerId) || null;
    }

    getAssignedCat(area, index) {
        return this.state.areaAssignments[area]?.[index] || null;
    }

    getUnlockedMenu() {
        return MENU_ITEMS.filter(m => this.state.unlockedMenuIds.includes(m.id));
    }

    getLockedMenu() {
        return MENU_ITEMS.filter(m => !this.state.unlockedMenuIds.includes(m.id));
    }

    batch(fn) {
        this._pauseRendering = true;
        try {
            fn();
        } finally {
            this._pauseRendering = false;
            this.emit('state:changed');
        }
    }

    _emit(event, data) {
        if (!this._pauseRendering) {
            this.emit(event, data);
            this.emit('state:changed', { event, data });
        }
    }

    setCoins(value) {
        this.state.coins = value;
        this._emit('coins:changed', value);
    }

    addCoins(delta) {
        this.setCoins(this.state.coins + delta);
    }

    setReputation(value) {
        this.state.reputation = Math.max(0, value);
        this._emit('reputation:changed', this.state.reputation);
    }

    addReputation(delta) {
        this.setReputation(this.state.reputation + delta);
    }

    addCat(cat) {
        this.state.cats.push(cat);
        this._emit('cats:changed', { type: 'add', cat });
    }

    updateCat(catId, updates) {
        const cat = this.findCat(catId);
        if (!cat) return;
        Object.assign(cat, updates);
        this._emit('cats:changed', { type: 'update', cat });
    }

    selectCat(catId) {
        this.state.selectedCatId = catId;
        this._emit('cat:selected', catId);
    }

    addCustomer(customer) {
        this.state.customers.push(customer);
        this._emit('customers:changed', { type: 'add', customer });
    }

    removeCustomer(customerId) {
        const idx = this.state.customers.findIndex(c => c.id === customerId);
        if (idx === -1) return null;
        const [removed] = this.state.customers.splice(idx, 1);
        this._emit('customers:changed', { type: 'remove', customer: removed });
        return removed;
    }

    tickCustomers(dtSec) {
        let angryLeavers = [];
        for (const customer of this.state.customers) {
            customer.waitTime += dtSec;
            if (customer.waitTime >= customer.maxWait && !customer.leftAngry) {
                customer.leftAngry = true;
                angryLeavers.push(customer);
            }
        }
        if (angryLeavers.length > 0) {
            this.state.totalAngryLeft += angryLeavers.length;
            this.state.customers = this.state.customers.filter(c => !c.leftAngry);
            this.setReputation(this.state.reputation - angryLeavers.length * 5);
            this._emit('customers:angry', angryLeavers);
            this._emit('stats:changed');
        } else {
            this.emit('customers:tick', dtSec);
        }
    }

    assignCat(area, index, cat) {
        this.state.areaAssignments[area][index] = cat;
        this._emit('areas:changed', { area, index });
    }

    removeCatFromArea(catId) {
        for (const area of Object.keys(this.state.areaAssignments)) {
            const idx = this.state.areaAssignments[area].findIndex(c => c && c.id === catId);
            if (idx !== -1) {
                this.state.areaAssignments[area][idx] = null;
                this._emit('areas:changed', { area, index: idx });
                return { area, index: idx };
            }
        }
        return null;
    }

    setAreaCapacity(area, delta) {
        this.state.areaCapacities[area] += delta;
        this._emit('areas:changed', { area });
    }

    unlockMenu(menuId) {
        if (!this.state.unlockedMenuIds.includes(menuId)) {
            this.state.unlockedMenuIds.push(menuId);
            this._emit('menu:changed', { type: 'unlock', menuId });
        }
    }

    addDecor(decorId) {
        if (!this.state.purchasedDecor.includes(decorId)) {
            this.state.purchasedDecor.push(decorId);
            this._emit('shop:changed', { type: 'decor', id: decorId });
        }
    }

    unlockStory(breedId) {
        if (!this.state.unlockedStories.includes(breedId)) {
            this.state.unlockedStories.push(breedId);
            this._emit('stories:changed', { breedId });
        }
    }

    addLog(html) {
        this.state.interactionLogs.push(html);
        if (this.state.interactionLogs.length > 50) {
            this.state.interactionLogs = this.state.interactionLogs.slice(-50);
        }
        this._emit('log:added', html);
    }

    recordServe(earning, asServed) {
        this.state.totalEarnings += earning;
        if (asServed) this.state.totalServed += 1;
        this._emit('stats:changed');
    }
}
