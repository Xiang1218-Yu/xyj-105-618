import { SAVE_KEY } from '../data/config.js';
import { EVENTS } from './EventBus.js';

export class SaveManager {
    constructor(state, eventBus) {
        this.state = state;
        this.bus = eventBus;
        this.bus.on(EVENTS.SAVE_REQUESTED, () => this.save());
    }

    save() {
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(this.state.serialize()));
        } catch (e) {
            console.warn('[SaveManager] save failed:', e);
        }
    }

    load() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return false;
            const data = JSON.parse(raw);
            this.state.hydrate(data);
            return this.state.cats.length > 0;
        } catch (e) {
            console.warn('[SaveManager] load failed:', e);
            return false;
        }
    }
}
