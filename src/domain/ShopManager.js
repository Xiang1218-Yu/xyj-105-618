import { SHOP_ITEMS } from '../data/shop.js';
import { EVENTS } from '../core/EventBus.js';

export class ShopManager {
    constructor(state, bus, catManager) {
        this.state = state;
        this.bus = bus;
        this.catManager = catManager;
    }

    listDecor() { return SHOP_ITEMS.decor; }
    listFood() { return SHOP_ITEMS.food; }

    buyDecor(decor) {
        if (this.state.purchasedDecor.includes(decor.id)) {
            this.bus.emit(EVENTS.NOTIFICATION, { type: 'info', message: '已经购买过了' });
            return false;
        }
        if (this.state.coins < decor.price) {
            this.bus.emit(EVENTS.NOTIFICATION, { type: 'error', message: '金币不足！' });
            return false;
        }
        this.state.coins -= decor.price;
        this.state.purchasedDecor.push(decor.id);

        if (decor.id === 'd1') this.state.areaCapacities.shelf += 2;
        else if (decor.id === 'd2') this.state.areaCapacities.window += 2;
        else if (decor.id === 'd3') this.state.areaCapacities.hall += 2;

        this.bus.emit(EVENTS.STATS_CHANGED);
        this.bus.emit(EVENTS.AREAS_CHANGED);
        this.bus.emit(EVENTS.SHOP_CHANGED);
        this.bus.emit(EVENTS.SAVE_REQUESTED);
        this.bus.emit(EVENTS.NOTIFICATION, { type: 'success', message: `购买了 ${decor.name}！` });
        return true;
    }

    requestUseFood(food) {
        if (this.state.cats.length === 0) {
            this.bus.emit(EVENTS.NOTIFICATION, { type: 'error', message: '还没有猫咪！' });
            return false;
        }
        if (this.state.coins < food.price) {
            this.bus.emit(EVENTS.NOTIFICATION, { type: 'error', message: '金币不足！' });
            return false;
        }
        return true;
    }
}
