import { CAT_BREEDS, CAT_NAMES, CAT_STORIES } from '../data.js';

export class CatManager {
    constructor(store) {
        this.store = store;
    }

    adoptCat(breed, free = false) {
        const state = this.store.getState();
        if (!free && state.coins < breed.price) {
            this.store.emit('notification', { message: '金币不足！', type: 'error' });
            return null;
        }
        if (!free) this.store.addCoins(-breed.price);

        const usedNames = state.cats.map(c => c.name);
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

        this.store.addCat(cat);
        this.store.emit('notification', { message: `成功收养了 ${name}！`, type: 'success' });
        return cat;
    }

    addInitialCat() {
        const randomBreed = CAT_BREEDS[Math.floor(Math.random() * 6)];
        return this.adoptCat(randomBreed, true);
    }

    petCat(catId) {
        const cat = this.store.findCat(catId);
        if (!cat) return;
        cat.bond = Math.min(100, cat.bond + 1);
        cat.mood = Math.min(100, cat.mood + 5);
        this._checkStoryUnlock(cat);
        this.store.emit('cats:changed', { type: 'update', cat });
        this.store.emit('notification', { message: `你抚摸了 ${cat.name}，它看起来很开心！`, type: 'success' });
    }

    applyFood(catId, food) {
        const cat = this.store.findCat(catId);
        if (!cat) return;
        if (this.store.getState().coins < food.price) {
            this.store.emit('notification', { message: '金币不足！', type: 'error' });
            return false;
        }
        this.store.addCoins(-food.price);

        const bondMatch = food.effect.match(/好感度\+(\d+)/);
        const moodMatch = food.effect.match(/心情恢复\+(\d+)/);

        if (bondMatch) {
            cat.bond = Math.min(100, cat.bond + parseInt(bondMatch[1]));
            this._checkStoryUnlock(cat);
        }
        if (moodMatch) {
            cat.mood = Math.min(100, cat.mood + parseInt(moodMatch[1]));
        }

        this.store.emit('cats:changed', { type: 'update', cat });
        this.store.emit('notification', { message: `${food.name} 已给 ${cat.name} 使用！`, type: 'success' });
        return true;
    }

    increaseBond(catId, amount) {
        const cat = this.store.findCat(catId);
        if (!cat) return;
        cat.bond = Math.min(100, cat.bond + amount);
        this._checkStoryUnlock(cat);
        this.store.emit('cats:changed', { type: 'update', cat });
    }

    getAvailableCats() {
        const state = this.store.getState();
        return state.cats.filter(cat => {
            for (const assignments of Object.values(state.areaAssignments)) {
                if (assignments.some(c => c && c.id === cat.id)) return false;
            }
            return true;
        });
    }

    _checkStoryUnlock(cat) {
        if (cat.bond >= 100 && CAT_STORIES[cat.breedId]) {
            this.store.unlockStory(cat.breedId);
            this.store.emit('notification', { message: `${cat.name} 的故事已解锁！`, type: 'success' });
        }
    }
}
