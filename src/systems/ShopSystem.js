import { EVENTS } from '../data/constants.js';

export class ShopSystem {
    constructor(store, bus) {
        this.store = store;
        this.bus = bus;
    }

    buyDecor(decor) {
        if (!this.store.spendCoins(decor.price)) {
            this.bus.emit(EVENTS.NOTIFICATION, { message: '金币不足！', type: 'error' });
            return false;
        }
        this.store.addPurchasedDecor(decor.id);

        const capacityUpgrades = { d1: ['shelf', 2], d2: ['window', 2], d3: ['hall', 2] };
        const upgrade = capacityUpgrades[decor.id];
        if (upgrade) {
            this.store.upgradeAreaCapacity(upgrade[0], upgrade[1]);
        }

        this.bus.emit(EVENTS.NOTIFICATION, { message: `购买了 ${decor.name}！`, type: 'success' });
        this.bus.emit(EVENTS.SAVE);
        return true;
    }

    requestUseFood(food) {
        const state = this.store.getState();
        if (state.cats.length === 0) {
            this.bus.emit(EVENTS.NOTIFICATION, { message: '还没有猫咪！', type: 'error' });
            return false;
        }
        if (state.coins < food.price) {
            this.bus.emit(EVENTS.NOTIFICATION, { message: '金币不足！', type: 'error' });
            return false;
        }
        return true;
    }
}
