import { EVENTS } from '../data/constants.js';

export class MenuSystem {
    constructor(store, bus) {
        this.store = store;
        this.bus = bus;
    }

    developRecipe(item) {
        if (!this.store.spendCoins(item.unlockCost)) {
            this.bus.emit(EVENTS.NOTIFICATION, { message: '金币不足！', type: 'error' });
            return false;
        }
        this.store.unlockMenu(item.id);
        this.bus.emit(EVENTS.NOTIFICATION, { message: `成功研发了 ${item.emoji} ${item.name}！`, type: 'success' });
        this.bus.emit(EVENTS.SAVE);
        return true;
    }
}
