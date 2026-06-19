import { SAVE_KEY } from '../../data.js';

export class Storage {
    static save(data) {
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(data));
            return true;
        } catch (e) {
            console.warn('Save failed:', e);
            return false;
        }
    }

    static load() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (e) {
            console.warn('Load failed:', e);
            return null;
        }
    }

    static clear() {
        try {
            localStorage.removeItem(SAVE_KEY);
        } catch (e) {
            console.warn('Clear failed:', e);
        }
    }
}
