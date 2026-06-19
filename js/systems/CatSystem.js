import { EventEmitter } from '../core/EventEmitter.js';
import { Cat } from '../models/Cat.js';
import { CAT_BREEDS, CAT_NAMES, CAT_STORIES, PERSONALITY_AREAS } from '../../data.js';

export class CatSystem extends EventEmitter {
    constructor(state) {
        super();
        this.state = state;
    }

    adoptCat(breed, free = false) {
        if (!free && !this.state.spendCoins(breed.price)) {
            this.emit('notification', '金币不足！', 'error');
            return null;
        }

        const usedNames = this.state.cats.map(c => c.name);
        const availableNames = CAT_NAMES.filter(n => !usedNames.includes(n));
        const name = availableNames[Math.floor(Math.random() * availableNames.length)] || breed.name;

        const cat = new Cat({
            id: Date.now(),
            breedId: breed.id,
            name,
            breed: breed.name,
            emoji: breed.emoji,
            personality: breed.personality
        });

        this.state.addCat(cat);
        this.state.save();
        this.emit('notification', `成功收养了 ${name}！`, 'success');
        return cat;
    }

    addInitialCat() {
        const randomBreed = CAT_BREEDS[Math.floor(Math.random() * 6)];
        return this.adoptCat(randomBreed, true);
    }

    petCat(cat) {
        cat.addBond(1);
        cat.addMood(5);
        this.checkStoryUnlock(cat);
        this.state.save();
        this.emit('notification', `你抚摸了 ${cat.name}，它看起来很开心！`, 'success');
        this.emit('cat:petted', cat);
    }

    assignCatToArea(cat, area, index) {
        this.state.assignCatToArea(cat, area, index);
        cat.addBond(2);
        this.checkStoryUnlock(cat);
        this.state.save();

        const areaNames = { hall: '大厅', shelf: '猫爬架', window: '窗边' };
        if (PERSONALITY_AREAS[area].includes(cat.personality)) {
            this.emit('notification', `${cat.name} 很喜欢这里！`, 'success');
        } else {
            this.emit('notification', `${cat.name} 被放到了${areaNames[area]}`, 'info');
        }
    }

    removeCatFromArea(cat) {
        this.state.removeCatFromArea(cat);
        this.state.save();
    }

    checkStoryUnlock(cat) {
        if (cat.bond >= 100 && this.state.unlockStory(cat.breedId) && CAT_STORIES[cat.breedId]) {
            this.emit('notification', `${cat.name} 的故事已解锁！`, 'success');
            this.emit('story:unlocked', cat);
        }
    }

    applyFood(cat, food) {
        if (!this.state.spendCoins(food.price)) {
            this.emit('notification', '金币不足！', 'error');
            return false;
        }

        const bondMatch = food.effect.match(/好感度\+(\d+)/);
        const moodMatch = food.effect.match(/心情恢复\+(\d+)/);

        if (bondMatch) {
            cat.addBond(parseInt(bondMatch[1]));
            this.checkStoryUnlock(cat);
        }
        if (moodMatch) {
            cat.addMood(parseInt(moodMatch[1]));
        }

        this.state.save();
        this.emit('notification', `${food.name} 已给 ${cat.name} 使用！`, 'success');
        return true;
    }

    updateMoods(deltaMs) {
        const interval = 15000;
        if (!this._moodTimer) this._moodTimer = 0;
        this._moodTimer += deltaMs;

        if (this._moodTimer >= interval) {
            this._moodTimer -= interval;

            for (const [area, cats] of Object.entries(this.state.areaAssignments)) {
                cats.forEach(cat => {
                    if (cat) {
                        const mood = cat.getMoodForArea(area);
                        if (mood < 50) {
                            cat.addMood(-5);
                        } else {
                            cat.addBond(0.5);
                            this.checkStoryUnlock(cat);
                        }
                    }
                });
            }

            this.emit('cats:updated');
        }
    }

    getRandomActiveCat() {
        const activeCats = this.state.getActiveCats();
        if (activeCats.length === 0) return null;
        if (Math.random() >= 0.6) return null;
        return activeCats[Math.floor(Math.random() * activeCats.length)];
    }
}
