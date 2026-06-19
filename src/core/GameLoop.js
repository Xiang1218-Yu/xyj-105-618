export class GameLoop {
    constructor({ update, render }) {
        this._update = update;
        this._render = render;
        this._rafId = null;
        this._lastTime = 0;
        this._running = false;
        this._accumulators = new Map();
        this._frame = this._frame.bind(this);
    }

    start() {
        if (this._running) return;
        this._running = true;
        this._lastTime = performance.now();
        this._rafId = requestAnimationFrame(this._frame);
    }

    stop() {
        this._running = false;
        if (this._rafId !== null) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
    }

    addTimer(name, intervalSeconds, callback, { immediate = false } = {}) {
        this._accumulators.set(name, {
            interval: intervalSeconds * 1000,
            elapsed: immediate ? intervalSeconds * 1000 : 0,
            callback
        });
    }

    removeTimer(name) {
        this._accumulators.delete(name);
    }

    _frame(now) {
        if (!this._running) return;

        const dt = Math.min(now - this._lastTime, 100);
        this._lastTime = now;
        const dtSec = dt / 1000;

        for (const [name, timer] of this._accumulators) {
            timer.elapsed += dt;
            while (timer.elapsed >= timer.interval) {
                timer.elapsed -= timer.interval;
                timer.callback(dtSec);
            }
        }

        if (this._update) this._update(dtSec);
        if (this._render) this._render(dtSec);

        this._rafId = requestAnimationFrame(this._frame);
    }
}
