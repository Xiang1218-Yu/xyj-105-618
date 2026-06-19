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

    off(event, callback) {
        const cbs = this._listeners.get(event);
        if (cbs) {
            cbs.delete(callback);
            if (cbs.size === 0) this._listeners.delete(event);
        }
    }

    emit(event, payload) {
        const cbs = this._listeners.get(event);
        if (cbs) {
            for (const cb of cbs) {
                try {
                    cb(payload);
                } catch (e) {
                    console.error(`[EventBus] Error in listener for "${event}":`, e);
                }
            }
        }
    }

    once(event, callback) {
        const wrapper = (payload) => {
            this.off(event, wrapper);
            callback(payload);
        };
        return this.on(event, wrapper);
    }
}
