import { EventEmitter } from '../core/EventEmitter.js';
import { Customer } from '../models/Customer.js';
import { CUSTOMER_TYPES, SERVE_CONFIG } from '../../data.js';

export class CustomerSystem extends EventEmitter {
    constructor(state, catSystem) {
        super();
        this.state = state;
        this.catSystem = catSystem;
        this._spawnTimer = 0;
        this._spawnInterval = 8000;
        this._firstSpawn = true;
    }

    update(deltaMs) {
        if (this._firstSpawn) {
            this._firstSpawn = false;
            setTimeout(() => this.spawnCustomer(), 2000);
        }

        this._spawnTimer += deltaMs;
        if (this._spawnTimer >= this._spawnInterval) {
            this._spawnTimer -= this._spawnInterval;
            this.spawnCustomer();
        }

        const angryCustomers = [];
        for (const customer of this.state.customers) {
            customer.update(deltaMs);
            if (customer.leftAngry) {
                angryCustomers.push(customer);
            }
        }

        if (angryCustomers.length > 0) {
            angryCustomers.forEach(c => this.state.removeCustomer(c.id));
            this.state.addReputation(-angryCustomers.length * 5);
            this.state.incrementAngryLeft(angryCustomers.length);
            this.emit('notification', `${angryCustomers.length} 位客人等不及离开了...`, 'error');
            this.emit('customers:left', angryCustomers);
        }

        if (angryCustomers.length > 0 || this.state.customers.some(c => c.isUrgent())) {
            this.emit('customers:updated');
        }
    }

    spawnCustomer() {
        if (this.state.customers.length >= 5) return;

        const unlocked = this.state.getUnlockedMenu();
        if (unlocked.length === 0) return;

        const bonuses = this.state.calculateBonuses();

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

        const customer = new Customer(customerType, menuItem, maxWait);
        this.state.addCustomer(customer);
        this.emit('customer:spawned', customer);
    }

    serveCustomer(customer, menuItem) {
        const bonuses = this.state.calculateBonuses();
        const tipBonus = 1 + bonuses.tip / 100;
        const isMatch = customer.order && customer.order.id === menuItem.id;
        const config = isMatch ? SERVE_CONFIG.match : SERVE_CONFIG.mismatch;

        let catInteraction = null;
        const interactingCat = this.catSystem.getRandomActiveCat();

        if (interactingCat) {
            const personality = interactingCat.getPersonality();
            if (personality) {
                const interactionText = (personality.interaction || '和客人互动了一下')
                    .replace('{cat}', interactingCat.name)
                    .replace('{customer}', customer.type);
                catInteraction = {
                    cat: interactingCat,
                    text: interactionText
                };
            }
        }

        const baseEarning = menuItem.price - menuItem.cost;
        const tipMultiplier = customer.tip * tipBonus;
        let finalEarning = Math.floor(baseEarning * tipMultiplier * config.earningMultiplier);
        if (config.ingredientCost) {
            finalEarning -= Math.floor(menuItem.cost * config.ingredientCost);
        }

        if (catInteraction) {
            finalEarning = Math.floor(finalEarning * 1.15);
            interactingCat.addBond(1);
            this.catSystem.checkStoryUnlock(interactingCat);

            this.state.addLog(
                `<span class="log-cat">${interactingCat.emoji} ${interactingCat.name}</span> ${catInteraction.text} <span class="log-bonus">收入+15%</span>`
            );
        }

        this.state.addCoins(finalEarning);
        this.state.addReputation(config.reputationChange);

        if (config.countAsServed) {
            this.state.incrementServed(finalEarning);
        }
        if (config.countAsAngry) {
            this.state.incrementAngryLeft();
        }

        this.state.removeCustomer(customer.id);
        this.state.save();

        const notifType = isMatch ? 'success' : 'error';
        const notifText = isMatch
            ? `招待完成！收入 💰${finalEarning}，声望 +${config.reputationChange}`
            : `点错单了！收入 💰${finalEarning}，声望 ${config.reputationChange}`;

        setTimeout(() => {
            this.emit('notification', notifText, notifType);
        }, 1800);

        return {
            success: isMatch,
            earning: finalEarning,
            message: config.message,
            menuItem,
            isMatch,
            catInteraction,
            baseEarning,
            tipMultiplier,
            config,
            customer
        };
    }
}
