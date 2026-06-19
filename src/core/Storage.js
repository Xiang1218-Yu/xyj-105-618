import { SAVE_KEY } from '../data/constants.js';

export class Storage {
    static save(data) {
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('[Storage] Save failed:', e);
        }
    }

    static load() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (e) {
            console.warn('[Storage] Load failed:', e);
            return null;
        }
    }

    static clear() {
        try {
            localStorage.removeItem(SAVE_KEY);
        } catch (e) { /* noop */ }
    }
}
