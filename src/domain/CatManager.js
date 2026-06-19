import { CAT_BREEDS, CAT_NAMES } from '../data/catBreeds.js';
import { CAT_STORIES } from '../data/stories.js';
import { EVENTS } from '../core/EventBus.js';

export class CatManager {
    constructor(state, bus) {
        this.state = state;
        this.bus = bus;
    }

    addInitialCat() {
        const randomBreed = CAT_BREEDS[Math.floor(Math.random() * 6)];
        return this.adoptCat(randomBreed, true);
    }

    adoptCat(breed, free = false) {
        if (!free && this.state.coins < breed.price) {
            this.bus.emit(EVENTS.NOTIFICATION, { type: 'error', message: '金币不足！' });
            return null;
        }
        if (this.state.cats.some(c => c.breedId === breed.id)) {
            this.bus.emit(EVENTS.NOTIFICATION, { type: 'info', message: '已经拥有这只猫咪了' });
            return null;
        }
        if (!free) this.state.coins -= breed.price;

        const usedNames = this.state.cats.map(c => c.name);
        const availableNames = CAT_NAMES.filter(n => !usedNames.includes(n));
        const name = availableNames[Math.floor(Math.random() * availableNames.length)] || breed.name;

        const cat = {
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

        this.state.cats.push(cat);
        this._notifyChanged();
        if (!free) {
            this.bus.emit(EVENTS.NOTIFICATION, { type: 'success', message: `成功收养了 ${name}！` });
        }
        return cat;
    }

    petCat(cat) {
        cat.bond = Math.min(100, cat.bond + 1);
        cat.mood = Math.min(100, cat.mood + 5);
        this.checkStoryUnlock(cat);
        this._notifyChanged();
        this.bus.emit(EVENTS.NOTIFICATION, { type: 'success', message: `你抚摸了 ${cat.name}，它看起来很开心！` });
    }

    applyFood(cat, food) {
        if (this.state.coins < food.price) {
            this.bus.emit(EVENTS.NOTIFICATION, { type: 'error', message: '金币不足！' });
            return false;
        }
        this.state.coins -= food.price;

        const bondMatch = food.effect.match(/好感度\+(\d+)/);
        const moodMatch = food.effect.match(/心情恢复\+(\d+)/);

        if (bondMatch) {
            cat.bond = Math.min(100, cat.bond + parseInt(bondMatch[1]));
            this.checkStoryUnlock(cat);
        }
        if (moodMatch) {
            cat.mood = Math.min(100, cat.mood + parseInt(moodMatch[1]));
        }

        this._notifyChanged();
        this.bus.emit(EVENTS.NOTIFICATION, { type: 'success', message: `${food.name} 已给 ${cat.name} 使用！` });
        return true;
    }

    assignToArea(area, index, cat) {
        this.state.areaAssignments[area][index] = cat;
        cat.bond = Math.min(100, cat.bond + 2);
        this.bus.emit(EVENTS.AREAS_CHANGED);
        this.bus.emit(EVENTS.CATS_CHANGED);
        this.bus.emit(EVENTS.BONUS_CHANGED);
        this.bus.emit(EVENTS.SAVE_REQUESTED);
    }

    removeFromArea(cat) {
        for (const area of Object.keys(this.state.areaAssignments)) {
            const idx = this.state.areaAssignments[area].findIndex(c => c && c.id === cat.id);
            if (idx !== -1) this.state.areaAssignments[area][idx] = null;
        }
        this.bus.emit(EVENTS.AREAS_CHANGED);
        this.bus.emit(EVENTS.BONUS_CHANGED);
        this.bus.emit(EVENTS.SAVE_REQUESTED);
    }

    getAvailableCats() {
        return this.state.cats.filter(cat => {
            for (const assignments of Object.values(this.state.areaAssignments)) {
                if (assignments.some(c => c && c.id === cat.id)) return false;
            }
            return true;
        });
    }

    checkStoryUnlock(cat) {
        if (cat.bond >= 100 && !this.state.unlockedStories.includes(cat.breedId) && CAT_STORIES[cat.breedId]) {
            this.state.unlockedStories.push(cat.breedId);
            this.bus.emit(EVENTS.STORY_UNLOCKED, cat);
            this.bus.emit(EVENTS.STORIES_CHANGED);
            this.bus.emit(EVENTS.NOTIFICATION, { type: 'success', message: `${cat.name} 的故事已解锁！` });
        }
    }

    _notifyChanged() {
        this.bus.emit(EVENTS.STATS_CHANGED);
        this.bus.emit(EVENTS.CATS_CHANGED);
        this.bus.emit(EVENTS.SHOP_CHANGED);
        this.bus.emit(EVENTS.BONUS_CHANGED);
        this.bus.emit(EVENTS.STORIES_CHANGED);
        this.bus.emit(EVENTS.SAVE_REQUESTED);
    }
}
