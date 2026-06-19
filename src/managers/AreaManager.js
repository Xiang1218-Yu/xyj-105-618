import { PERSONALITY_AREAS } from '../data.js';

export class AreaManager {
    constructor(store, bonusSystem, catManager) {
        this.store = store;
        this.bonusSystem = bonusSystem;
        this.catManager = catManager;
    }

    assignCat(area, index, catId) {
        const cat = this.store.findCat(catId);
        if (!cat) return { success: false };

        for (const a of Object.keys(this.store.getState().areaAssignments)) {
            const idx = this.store.getState().areaAssignments[a].findIndex(c => c && c.id === catId);
            if (idx !== -1) {
                this.store.getState().areaAssignments[a][idx] = null;
            }
        }

        const areas = { hall: '大厅', shelf: '猫爬架', window: '窗边' };
        this.store.assignCat(area, index, cat);
        this.catManager.increaseBond(catId, 2);

        const isMatch = PERSONALITY_AREAS[area].includes(cat.personality);
        return {
            success: true,
            areaName: areas[area],
            isMatch,
            catName: cat.name
        };
    }

    removeCat(catId) {
        return this.store.removeCatFromArea(catId);
    }

    updateCatMoods() {
        const state = this.store.getState();
        for (const [area, cats] of Object.entries(state.areaAssignments)) {
            cats.forEach(cat => {
                if (cat) {
                    const realCat = state.cats.find(c => c.id === cat.id) || cat;
                    const mood = this.bonusSystem.getCatMood(realCat, area);
                    if (mood < 50) {
                        realCat.mood = Math.max(0, realCat.mood - 5);
                    } else {
                        realCat.bond = Math.min(100, realCat.bond + 0.5);
                    }
                }
            });
        }
        this.store.emit('cats:changed', { type: 'moodUpdate' });
        this.store.emit('areas:changed', { type: 'moodUpdate' });
    }
}
