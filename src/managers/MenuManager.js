export class MenuManager {
    constructor(store) {
        this.store = store;
    }

    developRecipe(item) {
        if (this.store.getState().coins < item.unlockCost) {
            this.store.emit('notification', { message: '金币不足！', type: 'error' });
            return false;
        }
        this.store.addCoins(-item.unlockCost);
        this.store.unlockMenu(item.id);
        this.store.emit('notification', { message: `成功研发了 ${item.emoji} ${item.name}！`, type: 'success' });
        return true;
    }
}
