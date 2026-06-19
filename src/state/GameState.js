import { MENU_ITEMS } from '../data/constants.js';

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
    constructor() {
        this.reset();
    }

    reset() {
        this.coins = DEFAULTS.coins;
        this.reputation = DEFAULTS.reputation;
        this.cats = [];
        this.customers = [];
        this.areaCapacities = { ...DEFAULTS.areaCapacities };
        this.areaAssignments = { hall: [], shelf: [], window: [] };
        this.unlockedStories = [];
        this.purchasedDecor = [];
        this.unlockedMenuIds = [...DEFAULTS.unlockedMenuIds];
        this.interactionLogs = [];
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
}
