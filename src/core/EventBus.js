export class EventBus {
    constructor() {
        this._listeners = new Map();
    }

    on(event, callback) {
        if (!this._listeners.has(event)) {
            this._listeners.set(event, new Set());
        }
        this._listeners.get(event).add(callback);
        return () => this.off(event, callback);
    }

    once(event, callback) {
        const wrapper = (data) => {
            this.off(event, wrapper);
            callback(data);
        };
        return this.on(event, wrapper);
    }

    off(event, callback) {
        const cbs = this._listeners.get(event);
        if (cbs) {
            cbs.delete(callback);
            if (cbs.size === 0) this._listeners.delete(event);
        }
    }

    emit(event, data) {
        const cbs = this._listeners.get(event);
        if (cbs) {
            cbs.forEach(cb => {
                try { cb(data); } catch (e) { console.error(`[EventBus] Error in listener for "${event}":`, e); }
            });
        }
        const wildcard = this._listeners.get('*');
        if (wildcard) {
            wildcard.forEach(cb => {
                try { cb(event, data); } catch (e) { console.error(`[EventBus] Error in wildcard listener:`, e); }
            });
        }
    }

    removeAll(event) {
        if (event) {
            this._listeners.delete(event);
        } else {
            this._listeners.clear();
        }
    }
}
