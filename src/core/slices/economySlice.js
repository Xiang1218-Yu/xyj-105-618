export const economySlice = {
    setCoins(value) {
        this.state.coins = value;
        this._emit('coins:changed', value);
    },

    addCoins(delta) {
        this.setCoins(this.state.coins + delta);
    },

    setReputation(value) {
        this.state.reputation = Math.max(0, value);
        this._emit('reputation:changed', this.state.reputation);
    },

    addReputation(delta) {
        this.setReputation(this.state.reputation + delta);
    },

    recordServe(earning, asServed) {
        this.state.totalEarnings += earning;
        if (asServed) this.state.totalServed += 1;
        this._emit('stats:changed');
    }
};
