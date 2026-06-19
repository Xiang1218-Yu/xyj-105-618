import { EVENTS } from '../core/EventBus.js';

export class StatsView {
    constructor(state, bus) {
        this.state = state;
        this.bus = bus;
        this.coinsEl = document.getElementById('coins');
        this.repEl = document.getElementById('reputation');
        this.countEl = document.getElementById('cat-count');
        this.bus.on(EVENTS.STATS_CHANGED, () => this.render());
        this.bus.on(EVENTS.CATS_CHANGED, () => this.render());
    }

    render() {
        if (this.coinsEl) this.coinsEl.textContent = this.state.coins;
        if (this.repEl) this.repEl.textContent = this.state.reputation;
        if (this.countEl) this.countEl.textContent = this.state.cats.length;
    }
}
