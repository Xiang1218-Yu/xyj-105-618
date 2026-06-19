import { CAT_PERSONALITIES } from '../data.js';

export class BonusSystem {
    constructor(store) {
        this.store = store;
    }

    getCatMood(cat, area) {
        const personality = CAT_PERSONALITIES[cat.personality];
        if (!personality) return 70;
        if (personality.moodBonus === area) return 90;
        if (personality.moodPenalty === area) return 40;
        return 70;
    }

    calculateCafeBonuses() {
        const state = this.store.getState();
        const totals = { attract: 0, tip: 0, patience: 0, rare: 0 };
        for (const [area, cats] of Object.entries(state.areaAssignments)) {
            cats.forEach(cat => {
                if (cat) {
                    const realCat = state.cats.find(c => c.id === cat.id) || cat;
                    const personality = CAT_PERSONALITIES[realCat.personality];
                    if (!personality || !personality.cafeBonus) return;
                    const mood = this.getCatMood(realCat, area);
                    if (mood >= 70) {
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

    getEfficiencyStats() {
        const state = this.store.getState();
        const avgOrder = state.totalServed > 0 ? Math.round(state.totalEarnings / state.totalServed) : 0;
        const total = state.totalServed + state.totalAngryLeft;
        const efficiency = total > 0 ? Math.round(state.totalServed / total * 100) : 0;
        return { avgOrder, efficiency };
    }
}
