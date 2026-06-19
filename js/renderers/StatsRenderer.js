export class StatsRenderer {
    constructor(state) {
        this.state = state;
        this.coinsEl = document.getElementById('coins');
        this.reputationEl = document.getElementById('reputation');
        this.catCountEl = document.getElementById('cat-count');
    }

    render() {
        this.coinsEl.textContent = this.state.coins;
        this.reputationEl.textContent = this.state.reputation;
        this.catCountEl.textContent = this.state.cats.length;
    }
}
