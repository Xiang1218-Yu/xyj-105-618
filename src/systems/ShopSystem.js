import { EVENTS } from '../data/constants.js';

export class ShopSystem {
    constructor(state, bus) {
        this.state = state;
        this.bus = bus;
    }

    buyDecor(decor) {
        if (!this.state.spendCoins(decor.price)) {
            this.bus.emit(EVENTS.NOTIFICATION, { message: '金币不足！', type: 'error' });
            return false;
        }
        this.state.addPurchasedDecor(decor.id);

        const capacityUpgrades = { d1: ['shelf', 2], d2: ['window', 2], d3: ['hall', 2] };
        const upgrade = capacityUpgrades[decor.id];
        if (upgrade) {
            this.state.upgradeAreaCapacity(upgrade[0], upgrade[1]);
        }

        this.bus.emit(EVENTS.NOTIFICATION, { message: `购买了 ${decor.name}！`, type: 'success' });
        this.bus.emit(EVENTS.SAVE);
        return true;
    }

    requestUseFood(food) {
        if (this.state.cats.length === 0) {
            this.bus.emit(EVENTS.NOTIFICATION, { message: '还没有猫咪！', type: 'error' });
            return false;
        }
        if (this.state.coins < food.price) {
            this.bus.emit(EVENTS.NOTIFICATION, { message: '金币不足！', type: 'error' });
            return false;
        }
        return true;
    }
}
