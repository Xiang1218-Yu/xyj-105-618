import { CAT_PERSONALITIES } from '../data/catBreeds.js';

export class BonusCalculator {
    constructor(state) {
        this.state = state;
    }

    getCatMood(cat, area) {
        const personality = CAT_PERSONALITIES[cat.personality];
        if (!personality) return 70;
        if (personality.moodBonus === area) return 90;
        if (personality.moodPenalty === area) return 40;
        return 70;
    }

    calculateCafeBonuses() {
        const totals = { attract: 0, tip: 0, patience: 0, rare: 0 };
        for (const [area, cats] of Object.entries(this.state.areaAssignments)) {
            cats.forEach(cat => {
                if (!cat) return;
                const realCat = this.state.cats.find(c => c.id === cat.id) || cat;
                const personality = CAT_PERSONALITIES[realCat.personality];
                if (!personality) return;
                const mood = this.getCatMood(realCat, area);
                if (mood < 70) return;
                const bonus = personality.cafeBonus;
                if (!bonus) return;
                for (const key of Object.keys(totals)) {
                    if (typeof bonus[key] === 'number') {
                        totals[key] += bonus[key];
                    }
                }
            });
        }
        return totals;
    }

    getStats() {
        const avgOrder = this.state.totalServed > 0
            ? Math.round(this.state.totalEarnings / this.state.totalServed)
            : 0;
        const denom = this.state.totalServed + this.state.totalAngryLeft;
        const efficiency = denom > 0
            ? Math.round(this.state.totalServed / denom * 100)
            : 0;
        return { avgOrder, efficiency };
    }
}
