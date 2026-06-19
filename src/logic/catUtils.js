import { CAT_PERSONALITIES } from '../data/constants.js';

export function getCatMood(cat, area) {
    const personality = CAT_PERSONALITIES[cat.personality];
    if (!personality) return 70;
    if (personality.moodBonus === area) return 90;
    if (personality.moodPenalty === area) return 40;
    return 70;
}

export function calculateCafeBonuses(state) {
    const totals = { attract: 0, tip: 0, patience: 0, rare: 0 };
    for (const [area, cats] of Object.entries(state.areaAssignments)) {
        cats.forEach(catRef => {
            if (!catRef) return;
            const realCat = state.cats.find(c => c.id === catRef.id) || catRef;
            const personality = CAT_PERSONALITIES[realCat.personality];
            if (!personality) return;
            const mood = getCatMood(realCat, area);
            if (mood >= 70) {
                const bonus = personality.cafeBonus;
                if (!bonus) return;
                for (const key of Object.keys(totals)) {
                    if (typeof bonus[key] === 'number') {
                        totals[key] += bonus[key];
                    }
                }
            }
        });
    }
    return totals;
}
