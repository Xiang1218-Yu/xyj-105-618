import { EventEmitter } from '../core/EventEmitter.js';
import { Storage } from '../core/Storage.js';
import { Cat } from './Cat.js';
import { MENU_ITEMS } from '../../data.js';

export class GameState extends EventEmitter {
    constructor() {
        super();
        this.reset();
    }

    reset() {
        this.coins = 500;
        this.reputation = 0;
        this.cats = [];
        this.customers = [];
        this.selectedCat = null;
        this.areaCapacities = { hall: 4, shelf: 3, window: 3 };
        this.areaAssignments = { hall: [], shelf: [], window: [] };
        this.unlockedStories = [];
        this.purchasedDecor = [];
        this.unlockedMenuIds = MENU_ITEMS.filter(m => m.unlockCost === 0).map(m => m.id);
        this.interactionLogs = [];
        this.totalServed = 0;
        this.totalEarnings = 0;
        this.totalAngryLeft = 0;
    }

    init() {
        const data = Storage.load();
        if (data && data.cats && data.cats.length > 0) {
            this.loadFromData(data);
            return true;
        }
        return false;
    }

    loadFromData(data) {
        this.coins = data.coins ?? 500;
        this.reputation = data.reputation ?? 0;
        this.cats = (data.cats || []).map(c => new Cat(c));
        this.areaCapacities = data.areaCapacities ?? { hall: 4, shelf: 3, window: 3 };
        this.areaAssignments = data.areaAssignments ?? { hall: [], shelf: [], window: [] };
        this.unlockedStories = data.unlockedStories ?? [];
        this.purchasedDecor = data.purchasedDecor ?? [];
        this.unlockedMenuIds = data.unlockedMenuIds ?? MENU_ITEMS.filter(m => m.unlockCost === 0).map(m => m.id);
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

    save() {
        const data = {
            coins: this.coins,
            reputation: this.reputation,
            cats: this.cats.map(c => c.toJSON()),
            areaCapacities: this.areaCapacities,
            areaAssignments: this._serializeAssignments(),
            unlockedStories: this.unlockedStories,
            purchasedDecor: this.purchasedDecor,
            unlockedMenuIds: this.unlockedMenuIds,
            interactionLogs: this.interactionLogs.slice(-50),
            totalServed: this.totalServed,
            totalEarnings: this.totalEarnings,
            totalAngryLeft: this.totalAngryLeft
        };
        Storage.save(data);
        this.emit('state:saved');
    }

    _serializeAssignments() {
        const result = {};
        for (const [area, cats] of Object.entries(this.areaAssignments)) {
            result[area] = cats.map(c => c ? { id: c.id } : null);
        }
        return result;
    }

    addCoins(amount) {
        this.coins += amount;
        this.emit('state:changed', 'coins');
    }

    spendCoins(amount) {
        if (this.coins < amount) return false;
        this.coins -= amount;
        this.emit('state:changed', 'coins');
        return true;
    }

    addReputation(amount) {
        this.reputation = Math.max(0, this.reputation + amount);
        this.emit('state:changed', 'reputation');
    }

    addCat(cat) {
        this.cats.push(cat);
        this.emit('cat:added', cat);
        this.emit('state:changed', 'cats');
    }

    addLog(html) {
        this.interactionLogs.push(html);
        if (this.interactionLogs.length > 50) {
            this.interactionLogs = this.interactionLogs.slice(-50);
        }
        this.emit('log:added', html);
    }

    getCatById(id) {
        return this.cats.find(c => c.id === id);
    }

    getUnlockedMenu() {
        return MENU_ITEMS.filter(m => this.unlockedMenuIds.includes(m.id));
    }

    getLockedMenu() {
        return MENU_ITEMS.filter(m => !this.unlockedMenuIds.includes(m.id));
    }

    unlockMenu(itemId) {
        if (!this.unlockedMenuIds.includes(itemId)) {
            this.unlockedMenuIds.push(itemId);
            this.emit('menu:unlocked', itemId);
            this.emit('state:changed', 'menu');
        }
    }

    assignCatToArea(cat, area, index) {
        this.removeCatFromArea(cat);
        this.areaAssignments[area][index] = cat;
        this.emit('cat:assigned', cat, area, index);
        this.emit('state:changed', 'areas');
    }

    removeCatFromArea(cat) {
        for (const area of Object.keys(this.areaAssignments)) {
            const idx = this.areaAssignments[area].findIndex(c => c && c.id === cat.id);
            if (idx !== -1) {
                this.areaAssignments[area][idx] = null;
                this.emit('cat:removed', cat, area);
                this.emit('state:changed', 'areas');
                return true;
            }
        }
        return false;
    }

    getCatsInArea(area) {
        return this.areaAssignments[area].filter(Boolean);
    }

    getAvailableCats() {
        return this.cats.filter(cat => {
            for (const assignments of Object.values(this.areaAssignments)) {
                if (assignments.some(c => c && c.id === cat.id)) return false;
            }
            return true;
        });
    }

    addCustomer(customer) {
        this.customers.push(customer);
        this.emit('customer:added', customer);
    }

    removeCustomer(customerId) {
        const idx = this.customers.findIndex(c => c.id === customerId);
        if (idx !== -1) {
            const removed = this.customers.splice(idx, 1)[0];
            this.emit('customer:removed', removed);
            return removed;
        }
        return null;
    }

    purchaseDecor(decorId) {
        if (!this.purchasedDecor.includes(decorId)) {
            this.purchasedDecor.push(decorId);
            this.emit('decor:purchased', decorId);
            this.emit('state:changed', 'decor');
        }
    }

    incrementServed(earning) {
        this.totalServed += 1;
        this.totalEarnings += earning;
        this.emit('state:changed', 'stats');
    }

    incrementAngryLeft(count = 1) {
        this.totalAngryLeft += count;
        this.emit('state:changed', 'stats');
    }

    unlockStory(breedId) {
        if (!this.unlockedStories.includes(breedId)) {
            this.unlockedStories.push(breedId);
            this.emit('story:unlocked', breedId);
            return true;
        }
        return false;
    }

    getActiveCats() {
        const active = [];
        for (const cats of Object.values(this.areaAssignments)) {
            cats.forEach(cat => {
                if (cat) active.push(cat);
            });
        }
        return active;
    }

    calculateBonuses() {
        const totals = { attract: 0, tip: 0, patience: 0, rare: 0 };
        for (const [area, cats] of Object.entries(this.areaAssignments)) {
            cats.forEach(cat => {
                if (cat) {
                    const personality = cat.getPersonality();
                    if (!personality) return;
                    const mood = cat.getMoodForArea(area);
                    if (mood >= 70 && personality.cafeBonus) {
                        for (const key of Object.keys(totals)) {
                            if (typeof personality.cafeBonus[key] === 'number') {
                                totals[key] += personality.cafeBonus[key];
                            }
                        }
                    }
                }
            });
        }
        return totals;
    }
}
