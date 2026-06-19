export class StatsRenderer {
    constructor(store) {
        this.store = store;
        this.coinsEl = document.getElementById('coins');
        this.reputationEl = document.getElementById('reputation');
        this.catCountEl = document.getElementById('cat-count');

        this.store.on('coins:changed', () => this.render());
        this.store.on('reputation:changed', () => this.render());
        this.store.on('cats:changed', () => this.render());
        this.store.on('state:hydrated', () => this.render());
    }

    render() {
        const s = this.store.getState();
        this.coinsEl.textContent = s.coins;
        this.reputationEl.textContent = s.reputation;
        this.catCountEl.textContent = s.cats.length;
    }
}
