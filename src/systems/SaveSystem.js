import { SAVE_KEY } from '../data.js';

export class SaveSystem {
    constructor(store) {
        this.store = store;
        this._saveTimer = null;
    }

    save() {
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(this.store.snapshot()));
        } catch (e) { /* noop */ }
    }

    load() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return false;
            const data = JSON.parse(raw);
            if (!data.cats || data.cats.length === 0) return false;
            this.store.hydrate(data);
            return true;
        } catch (e) {
            return false;
        }
    }

    startAutoSave(intervalMs = 5000) {
        this.stopAutoSave();
        this._saveTimer = setInterval(() => this.save(), intervalMs);
    }

    stopAutoSave() {
        if (this._saveTimer) {
            clearInterval(this._saveTimer);
            this._saveTimer = null;
        }
    }
}
