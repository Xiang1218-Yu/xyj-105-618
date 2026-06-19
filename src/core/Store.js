import { EventBus } from './EventBus.js';
import { MENU_ITEMS } from '../data.js';
import { economySlice } from './slices/economySlice.js';
import { catSlice } from './slices/catSlice.js';
import { customerSlice } from './slices/customerSlice.js';
import { areaSlice } from './slices/areaSlice.js';
import { progressSlice } from './slices/progressSlice.js';

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

        Object.assign(this,
            economySlice,
            catSlice,
            customerSlice,
            areaSlice,
            progressSlice
        );
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
}
