export class GameLoop {
    constructor(updateCallback, renderCallback) {
        this.updateCallback = updateCallback;
        this.renderCallback = renderCallback;
        this.lastTime = 0;
        this.accumulator = 0;
        this.fixedTimeStep = 1000 / 60;
        this.running = false;
        this.rafId = null;
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.lastTime = performance.now();
        this.accumulator = 0;
        this._loop(this.lastTime);
    }

    stop() {
        this.running = false;
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }

    _loop(currentTime) {
        if (!this.running) return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.accumulator += Math.min(deltaTime, this.fixedTimeStep * 3);

        while (this.accumulator >= this.fixedTimeStep) {
            this.updateCallback(this.fixedTimeStep);
            this.accumulator -= this.fixedTimeStep;
        }

        const alpha = this.accumulator / this.fixedTimeStep;
        this.renderCallback(alpha);

        this.rafId = requestAnimationFrame((t) => this._loop(t));
    }
}
