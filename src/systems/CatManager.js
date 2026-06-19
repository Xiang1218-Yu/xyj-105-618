import { CAT_BREEDS, CAT_NAMES, CAT_PERSONALITIES, PERSONALITY_AREAS, EVENTS } from '../data/constants.js';
import { getCatMood } from '../logic/catUtils.js';

export class CatManager {
    constructor(store, bus) {
        this.store = store;
        this.bus = bus;
        this._moodAccumSec = 0;
        this._moodIntervalSec = 15;
    }

    createCatFromBreed(breed) {
        const state = this.store.getState();
        const usedNames = state.cats.map(c => c.name);
        const availableNames = CAT_NAMES.filter(n => !usedNames.includes(n));
        const name = availableNames[Math.floor(Math.random() * availableNames.length)] || breed.name;

        return {
            id: Date.now() + Math.floor(Math.random() * 1000),
            breedId: breed.id,
            name,
            breed: breed.name,
            emoji: breed.emoji,
            personality: breed.personality,
            bond: 10,
            mood: 80,
            adoptedAt: new Date().toISOString()
        };
    }

    adoptCat(breed, free = false) {
        if (!free && !this.store.spendCoins(breed.price)) {
            this.bus.emit(EVENTS.NOTIFICATION, { message: '金币不足！', type: 'error' });
            return null;
        }
        const cat = this.createCatFromBreed(breed);
        this.store.addCat(cat);
        this.bus.emit(EVENTS.NOTIFICATION, { message: `成功收养了 ${cat.name}！`, type: 'success' });
        this.bus.emit(EVENTS.SAVE);
        return cat;
    }

    petCat(cat) {
        this.store.updateCat(cat.id, (c) => {
            c.bond = Math.min(100, c.bond + 1);
            c.mood = Math.min(100, c.mood + 5);
        });
        this.checkStoryUnlock(cat);
        this.bus.emit(EVENTS.NOTIFICATION, { message: `你抚摸了 ${cat.name}，它看起来很开心！`, type: 'success' });
        this.bus.emit(EVENTS.SAVE);
    }

    assignCatToArea(cat, area, index) {
        this.store.removeCatFromArea(cat);
        this.store.assignCatToArea(cat, area, index);
        this.store.updateCat(cat.id, (c) => {
            c.bond = Math.min(100, c.bond + 2);
        });
        this.checkStoryUnlock(cat);
        const isMatch = PERSONALITY_AREAS[area].includes(cat.personality);
        const areaNames = { hall: '大厅', shelf: '猫爬架', window: '窗边' };
        const msg = isMatch
            ? `${cat.name} 很喜欢这里！`
            : `${cat.name} 被放到了${areaNames[area]}`;
        this.bus.emit(EVENTS.NOTIFICATION, { message: msg, type: isMatch ? 'success' : 'info' });
        this.bus.emit(EVENTS.SAVE);
    }

    removeCatFromArea(cat) {
        this.store.removeCatFromArea(cat);
        this.bus.emit(EVENTS.SAVE);
    }

    applyFoodToCat(cat, food) {
        if (!this.store.spendCoins(food.price)) {
            this.bus.emit(EVENTS.NOTIFICATION, { message: '金币不足！', type: 'error' });
            return;
        }
        const bondMatch = food.effect.match(/好感度\+(\d+)/);
        const moodMatch = food.effect.match(/心情恢复\+(\d+)/);

        this.store.updateCat(cat.id, (c) => {
            if (bondMatch) c.bond = Math.min(100, c.bond + parseInt(bondMatch[1]));
            if (moodMatch) c.mood = Math.min(100, c.mood + parseInt(moodMatch[1]));
        });

        if (bondMatch) this.checkStoryUnlock(cat);
        this.bus.emit(EVENTS.NOTIFICATION, { message: `${food.name} 已给 ${cat.name} 使用！`, type: 'success' });
        this.bus.emit(EVENTS.SAVE);
    }

    checkStoryUnlock(cat) {
        const freshCat = this.store.findCatById(cat.id);
        if (!freshCat) return;
        if (freshCat.bond >= 100) {
            this.store.unlockStory(freshCat.breedId);
            this.bus.emit(EVENTS.NOTIFICATION, { message: `${freshCat.name} 的故事已解锁！`, type: 'success' });
        }
    }

    tick(deltaSec) {
        this._moodAccumSec += deltaSec;
        if (this._moodAccumSec >= this._moodIntervalSec) {
            this._moodAccumSec = 0;
            this._updateMoods();
            this.bus.emit(EVENTS.SAVE);
        }
    }

    _updateMoods() {
        const state = this.store.getState();
        for (const [area, cats] of Object.entries(state.areaAssignments)) {
            cats.forEach(cat => {
                if (!cat) return;
                const realCat = state.cats.find(c => c.id === cat.id) || cat;
                const mood = getCatMood(realCat, area);
                this.store.updateCat(realCat.id, (c) => {
                    if (mood < 50) {
                        c.mood = Math.max(0, c.mood - 5);
                    } else {
                        c.bond = Math.min(100, c.bond + 0.5);
                    }
                });
            });
        }
    }
}
