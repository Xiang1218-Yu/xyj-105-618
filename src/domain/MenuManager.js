import { MENU_ITEMS } from '../data/menu.js';
import { EVENTS } from '../core/EventBus.js';

export class MenuManager {
    constructor(state, bus) {
        this.state = state;
        this.bus = bus;
    }

    getUnlocked() {
        return MENU_ITEMS.filter(m => this.state.unlockedMenuIds.includes(m.id));
    }

    getLocked() {
        return MENU_ITEMS.filter(m => !this.state.unlockedMenuIds.includes(m.id));
    }

    findById(id) {
        return MENU_ITEMS.find(m => m.id === id) || null;
    }

    developRecipe(item) {
        if (this.state.coins < item.unlockCost) {
            this.bus.emit(EVENTS.NOTIFICATION, { type: 'error', message: '金币不足！' });
            return false;
        }
        this.state.coins -= item.unlockCost;
        this.state.unlockedMenuIds.push(item.id);
        this.bus.emit(EVENTS.STATS_CHANGED);
        this.bus.emit(EVENTS.MENU_CHANGED);
        this.bus.emit(EVENTS.SAVE_REQUESTED);
        this.bus.emit(EVENTS.NOTIFICATION, { type: 'success', message: `成功研发了 ${item.emoji} ${item.name}！` });
        return true;
    }
}
