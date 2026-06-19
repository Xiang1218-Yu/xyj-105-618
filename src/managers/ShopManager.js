export class ShopManager {
    constructor(store, areaManager) {
        this.store = store;
        this.areaManager = areaManager;
    }

    buyDecor(decor) {
        if (this.store.getState().coins < decor.price) {
            this.store.emit('notification', { message: '金币不足！', type: 'error' });
            return false;
        }
        if (this.store.getState().purchasedDecor.includes(decor.id)) return false;

        this.store.addCoins(-decor.price);
        this.store.addDecor(decor.id);

        const capacityMap = { d1: ['shelf', 2], d2: ['window', 2], d3: ['hall', 2] };
        if (capacityMap[decor.id]) {
            const [area, delta] = capacityMap[decor.id];
            this.store.setAreaCapacity(area, delta);
        }

        this.store.emit('notification', { message: `购买了 ${decor.name}！`, type: 'success' });
        return true;
    }

    useFood(food) {
        if (this.store.getState().cats.length === 0) {
            this.store.emit('notification', { message: '还没有猫咪！', type: 'error' });
            return false;
        }
        if (this.store.getState().coins < food.price) {
            this.store.emit('notification', { message: '金币不足！', type: 'error' });
            return false;
        }
        this.store.emit('modal:open', { type: 'selectCat', food });
        return true;
    }
}
