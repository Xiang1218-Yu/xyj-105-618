import { CUSTOMER_TYPES, EVENTS } from '../data/constants.js';
import { calculateCafeBonuses } from '../logic/catUtils.js';

export class CustomerManager {
    constructor(store, bus) {
        this.store = store;
        this.bus = bus;
        this._spawnAccumSec = 0;
        this._spawnIntervalSec = 8;
        this._customerTickAccum = 0;
    }

    spawnCustomer() {
        const state = this.store.getState();
        if (state.customers.length >= 5) return;

        const unlocked = this.store.getUnlockedMenu();
        if (unlocked.length === 0) return;

        const bonuses = calculateCafeBonuses(state);

        let pool;
        if (bonuses.rare > 0 && Math.random() * 100 < bonuses.rare) {
            pool = CUSTOMER_TYPES.filter(c => c.rarity === 'rare');
        } else {
            pool = CUSTOMER_TYPES.filter(c => c.rarity === 'common');
        }
        if (pool.length === 0) pool = CUSTOMER_TYPES;

        const customerType = pool[Math.floor(Math.random() * pool.length)];
        const menuItem = unlocked[Math.floor(Math.random() * unlocked.length)];

        const patienceBonus = 1 + bonuses.patience / 100;
        const maxWait = Math.floor(customerType.patience * patienceBonus);

        const customer = {
            id: Date.now() + Math.random(),
            type: customerType.type,
            emoji: customerType.emoji,
            tip: customerType.tip,
            order: { ...menuItem },
            waitTime: 0,
            maxWait
        };

        this.store.addCustomer(customer);
    }

    tick(deltaSec) {
        this._customerTickAccum += deltaSec;
        let secondsElapsed = 0;
        while (this._customerTickAccum >= 1) {
            this._customerTickAccum -= 1;
            this._tickCustomersOneSecond();
            secondsElapsed++;
        }
        if (secondsElapsed > 0 && this.store.getState().customers.length > 0) {
            this.bus.emit(EVENTS.CUSTOMERS_CHANGED, { customers: this.store.getState().customers });
        }

        this._spawnAccumSec += deltaSec;
        if (this._spawnAccumSec >= this._spawnIntervalSec) {
            this._spawnAccumSec = 0;
            this.spawnCustomer();
        }
    }

    _tickCustomersOneSecond() {
        const state = this.store.getState();
        const angryCustomers = [];
        for (const customer of state.customers) {
            customer.waitTime += 1;
            if (customer.waitTime >= customer.maxWait) {
                angryCustomers.push(customer);
            }
        }

        if (angryCustomers.length > 0) {
            for (const c of angryCustomers) {
                this.store.removeCustomer(c.id, 'angry');
            }
            this.store.recordAngryLeft(angryCustomers.length);
            this.store.addReputation(-angryCustomers.length * 5);
            this.bus.emit(EVENTS.NOTIFICATION, {
                message: `${angryCustomers.length} 位客人等不及离开了...`,
                type: 'error'
            });
            this.bus.emit(EVENTS.SAVE);
        }
    }
}
