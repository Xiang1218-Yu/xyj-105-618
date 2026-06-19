export class StatsRenderer {
    constructor(state, bus) {
        this.state = state;
        this.bus = bus;
        this.coinsEl = document.getElementById('coins');
        this.repEl = document.getElementById('reputation');
        this.catCountEl = document.getElementById('cat-count');

        this.bus.on('state:stats', () => this.render());
        this.render();
    }

    render() {
        this.coinsEl.textContent = this.state.coins;
        this.repEl.textContent = this.state.reputation;
        this.catCountEl.textContent = this.state.cats.length;
    }
}
