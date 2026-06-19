export class GameLoop {
    constructor() {
        this._rafId = null;
        this._lastTime = 0;
        this._running = false;
        this._tasks = new Map();
        this._tick = this._tick.bind(this);
    }

    addTask(id, callback) {
        this._tasks.set(id, callback);
    }

    removeTask(id) {
        this._tasks.delete(id);
    }

    clearTasks() {
        this._tasks.clear();
    }

    start() {
        if (this._running) return;
        this._running = true;
        this._lastTime = performance.now();
        this._rafId = requestAnimationFrame(this._tick);
    }

    stop() {
        this._running = false;
        if (this._rafId !== null) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
    }

    _tick(now) {
        if (!this._running) return;

        const deltaMs = Math.min(now - this._lastTime, 1000);
        this._lastTime = now;
        const deltaSec = deltaMs / 1000;

        for (const [id, callback] of this._tasks) {
            try {
                callback(deltaSec);
            } catch (e) {
                console.error(`[GameLoop] Task "${id}" error:`, e);
            }
        }

        this._rafId = requestAnimationFrame(this._tick);
    }
}
