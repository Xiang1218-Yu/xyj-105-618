import { EventEmitter } from '../core/EventEmitter.js';
import { SHOP_ITEMS } from '../../data.js';

export class ShopSystem extends EventEmitter {
    constructor(state) {
        super();
        this.state = state;
    }

    buyDecor(decor) {
        if (!this.state.spendCoins(decor.price)) {
            this.emit('notification', '金币不足！', 'error');
            return false;
        }

        this.state.purchaseDecor(decor.id);

        if (decor.id === 'd1') this.state.areaCapacities.shelf += 2;
        else if (decor.id === 'd2') this.state.areaCapacities.window += 2;
        else if (decor.id === 'd3') this.state.areaCapacities.hall += 2;

        this.state.save();
        this.emit('notification', `购买了 ${decor.name}！`, 'success');
        this.emit('decor:bought', decor);
        return true;
    }

    isOwned(decorId) {
        return this.state.purchasedDecor.includes(decorId);
    }

    getShopItems(type) {
        return SHOP_ITEMS[type] || [];
    }
}
