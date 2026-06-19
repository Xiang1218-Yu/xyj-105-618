import { GAME_CONFIG } from '../data/config.js';
import { MENU_ITEMS } from '../data/menu.js';
import { EVENTS } from './EventBus.js';

export class GameState {
    constructor(eventBus) {
        this.bus = eventBus;
        this.coins = GAME_CONFIG.initialCoins;
        this.reputation = GAME_CONFIG.initialReputation;
        this.cats = [];
        this.customers = [];
        this.areaCapacities = { ...GAME_CONFIG.initialAreaCapacities };
        this.areaAssignments = { hall: [], shelf: [], window: [] };
        this.unlockedStories = [];
        this.purchasedDecor = [];
        this.unlockedMenuIds = MENU_ITEMS.filter(m => m.unlockCost === 0).map(m => m.id);
        this.interactionLogs = [];
        this.totalServed = 0;
        this.totalEarnings = 0;
        this.totalAngryLeft = 0;
    }

    setCoins(value) {
        this.coins = value;
        this.bus.emit(EVENTS.STATS_CHANGED);
    }

    addCoins(delta) {
        this.coins += delta;
        this.bus.emit(EVENTS.STATS_CHANGED);
    }

    setReputation(value) {
        this.reputation = Math.max(0, value);
        this.bus.emit(EVENTS.STATS_CHANGED);
    }

    addReputation(delta) {
        this.setReputation(this.reputation + delta);
    }

    appendLog(html) {
        this.interactionLogs.push(html);
        if (this.interactionLogs.length > GAME_CONFIG.maxLogEntries) {
            this.interactionLogs = this.interactionLogs.slice(-GAME_CONFIG.maxLogEntries);
        }
        this.bus.emit(EVENTS.LOG_APPENDED, html);
        this.bus.emit(EVENTS.LOG_CHANGED);
    }

    serialize() {
        return {
            coins: this.coins,
            reputation: this.reputation,
            cats: this.cats,
            areaCapacities: this.areaCapacities,
            areaAssignments: this.areaAssignments,
            unlockedStories: this.unlockedStories,
            purchasedDecor: this.purchasedDecor,
            unlockedMenuIds: this.unlockedMenuIds,
            interactionLogs: this.interactionLogs.slice(-GAME_CONFIG.maxLogEntries),
            totalServed: this.totalServed,
            totalEarnings: this.totalEarnings,
            totalAngryLeft: this.totalAngryLeft
        };
    }

    hydrate(data) {
        if (!data) return;
        this.coins = data.coins ?? GAME_CONFIG.initialCoins;
        this.reputation = data.reputation ?? GAME_CONFIG.initialReputation;
        this.cats = data.cats ?? [];
        this.areaCapacities = data.areaCapacities ?? { ...GAME_CONFIG.initialAreaCapacities };
        this.areaAssignments = data.areaAssignments ?? { hall: [], shelf: [], window: [] };
        this.unlockedStories = data.unlockedStories ?? [];
        this.purchasedDecor = data.purchasedDecor ?? [];
        this.unlockedMenuIds = data.unlockedMenuIds ?? MENU_ITEMS.filter(m => m.unlockCost === 0).map(m => m.id);
        this.interactionLogs = data.interactionLogs ?? [];
        this.totalServed = data.totalServed ?? 0;
        this.totalEarnings = data.totalEarnings ?? 0;
        this.totalAngryLeft = data.totalAngryLeft ?? 0;

        for (const area of Object.keys(this.areaAssignments)) {
            this.areaAssignments[area] = this.areaAssignments[area].map(cat => {
                if (!cat) return null;
                const realCat = this.cats.find(c => c.id === cat.id);
                return realCat || null;
            });
        }
    }
}
