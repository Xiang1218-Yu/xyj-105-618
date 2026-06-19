import { CAT_PERSONALITIES } from '../../data.js';

export class Cat {
    constructor(data) {
        this.id = data.id || Date.now();
        this.breedId = data.breedId;
        this.name = data.name;
        this.breed = data.breed;
        this.emoji = data.emoji;
        this.personality = data.personality;
        this.bond = data.bond ?? 10;
        this.mood = data.mood ?? 80;
        this.adoptedAt = data.adoptedAt || new Date().toISOString();
    }

    getPersonality() {
        return CAT_PERSONALITIES[this.personality];
    }

    addBond(amount) {
        this.bond = Math.min(100, this.bond + amount);
        return this.bond;
    }

    addMood(amount) {
        this.mood = Math.min(100, Math.max(0, this.mood + amount));
        return this.mood;
    }

    getMoodForArea(area) {
        const personality = this.getPersonality();
        if (!personality) return 70;
        if (personality.moodBonus === area) return 90;
        if (personality.moodPenalty === area) return 40;
        return 70;
    }

    toJSON() {
        return {
            id: this.id,
            breedId: this.breedId,
            name: this.name,
            breed: this.breed,
            emoji: this.emoji,
            personality: this.personality,
            bond: this.bond,
            mood: this.mood,
            adoptedAt: this.adoptedAt
        };
    }
}
