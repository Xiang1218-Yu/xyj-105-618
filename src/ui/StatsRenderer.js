import { EVENTS } from '../data/constants.js';

export class StatsRenderer {
    constructor(store, bus, scheduler) {
        this.store = store;
        this.scheduler = scheduler;
        this.coinsEl = document.getElementById('coins');
        this.repEl = document.getElementById('reputation');
        this.catCountEl = document.getElementById('cat-count');

        bus.on(EVENTS.STATS_CHANGED, () => this.scheduler.invalidate(this));
        this.scheduler.invalidate(this);
    }

    render() {
        const s = this.store.getState();
        this.coinsEl.textContent = s.coins;
        this.repEl.textContent = s.reputation;
        this.catCountEl.textContent = s.cats.length;
    }
}
