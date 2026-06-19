export class EventBus {
    constructor() {
        this._listeners = new Map();
    }

    on(event, handler) {
        if (!this._listeners.has(event)) {
            this._listeners.set(event, new Set());
        }
        this._listeners.get(event).add(handler);
        return () => this.off(event, handler);
    }

    off(event, handler) {
        const set = this._listeners.get(event);
        if (set) set.delete(handler);
    }

    emit(event, payload) {
        const set = this._listeners.get(event);
        if (!set) return;
        for (const handler of [...set]) {
            try {
                handler(payload);
            } catch (e) {
                console.error(`[EventBus] handler error for "${event}":`, e);
            }
        }
    }

    clear() {
        this._listeners.clear();
    }
}

export const EVENTS = Object.freeze({
    STATE_CHANGED: 'state:changed',
    STATS_CHANGED: 'stats:changed',
    CATS_CHANGED: 'cats:changed',
    AREAS_CHANGED: 'areas:changed',
    BONUS_CHANGED: 'bonus:changed',
    MENU_CHANGED: 'menu:changed',
    SHOP_CHANGED: 'shop:changed',
    CUSTOMERS_CHANGED: 'customers:changed',
    STORIES_CHANGED: 'stories:changed',
    LOG_APPENDED: 'log:appended',
    LOG_CHANGED: 'log:changed',
    NOTIFICATION: 'ui:notification',
    MODAL_OPEN: 'ui:modal:open',
    MODAL_CLOSE: 'ui:modal:close',
    TAB_CHANGED: 'ui:tab:changed',
    SHOP_TAB_CHANGED: 'ui:shopTab:changed',
    SAVE_REQUESTED: 'save:requested',
    STORY_UNLOCKED: 'story:unlocked'
});
