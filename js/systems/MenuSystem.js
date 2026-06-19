import { EventEmitter } from '../core/EventEmitter.js';

export class MenuSystem extends EventEmitter {
    constructor(state) {
        super();
        this.state = state;
    }

    developRecipe(item) {
        if (!this.state.spendCoins(item.unlockCost)) {
            this.emit('notification', '金币不足！', 'error');
            return false;
        }
        this.state.unlockMenu(item.id);
        this.state.save();
        this.emit('notification', `成功研发了 ${item.emoji} ${item.name}！`, 'success');
        this.emit('recipe:developed', item);
        return true;
    }
}
