export const progressSlice = {
    unlockMenu(menuId) {
        if (!this.state.unlockedMenuIds.includes(menuId)) {
            this.state.unlockedMenuIds.push(menuId);
            this._emit('menu:changed', { type: 'unlock', menuId });
        }
    },

    addDecor(decorId) {
        if (!this.state.purchasedDecor.includes(decorId)) {
            this.state.purchasedDecor.push(decorId);
            this._emit('shop:changed', { type: 'decor', id: decorId });
        }
    },

    unlockStory(breedId) {
        if (!this.state.unlockedStories.includes(breedId)) {
            this.state.unlockedStories.push(breedId);
            this._emit('stories:changed', { breedId });
        }
    },

    addLog(html) {
        this.state.interactionLogs.push(html);
        if (this.state.interactionLogs.length > 50) {
            this.state.interactionLogs = this.state.interactionLogs.slice(-50);
        }
        this._emit('log:added', html);
    }
};
