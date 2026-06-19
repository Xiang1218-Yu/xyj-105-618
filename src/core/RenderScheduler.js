export class RenderScheduler {
    constructor() {
        this._pending = new Set();
        this._rafId = null;
        this._flush = this._flush.bind(this);
    }

    invalidate(renderer) {
        if (!renderer || typeof renderer.render !== 'function') return;
        this._pending.add(renderer);
        if (this._rafId === null) {
            this._rafId = requestAnimationFrame(this._flush);
        }
    }

    invalidateAll(renderers) {
        for (const r of renderers) this.invalidate(r);
    }

    _flush() {
        this._rafId = null;
        const queue = Array.from(this._pending);
        this._pending.clear();

        for (const renderer of queue) {
            try {
                renderer.render();
            } catch (e) {
                console.error('[RenderScheduler] Render error:', e);
            }
        }
    }

    flushNow() {
        if (this._rafId !== null) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
        const queue = Array.from(this._pending);
        this._pending.clear();
        for (const renderer of queue) {
            try { renderer.render(); } catch (e) { console.error(e); }
        }
    }

    destroy() {
        if (this._rafId !== null) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
        this._pending.clear();
    }
}
