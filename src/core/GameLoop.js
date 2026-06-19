export class GameLoop {
    constructor() {
        this._systems = [];
        this._running = false;
        this._lastTime = 0;
        this._rafId = null;
        this._tick = this._tick.bind(this);
    }

    addSystem(system) {
        if (typeof system.update !== 'function') {
            throw new Error('GameLoop.addSystem: system must have update(deltaSeconds, nowMs)');
        }
        this._systems.push(system);
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
        let delta = (now - this._lastTime) / 1000;
        this._lastTime = now;
        if (delta < 0) delta = 0;
        if (delta > 0.25) delta = 0.25;

        for (const system of this._systems) {
            try {
                system.update(delta, now);
            } catch (e) {
                console.error('[GameLoop] system update error:', e);
            }
        }
        this._rafId = requestAnimationFrame(this._tick);
    }
}

export class IntervalSystem {
    constructor(intervalSeconds, callback) {
        this.interval = intervalSeconds;
        this.callback = callback;
        this._acc = 0;
    }

    setInterval(intervalSeconds) {
        this.interval = intervalSeconds;
    }

    triggerNow() {
        this._acc = this.interval;
    }

    triggerAfter(seconds) {
        this._acc = Math.max(0, this.interval - seconds);
    }

    update(delta) {
        this._acc += delta;
        while (this._acc >= this.interval) {
            this._acc -= this.interval;
            this.callback(this.interval);
        }
    }
}
