import { CUSTOMER_TYPES, MENU_ITEMS, CAT_PERSONALITIES, SERVE_CONFIG } from '../data.js';

export class CustomerManager {
    constructor(store, bonusSystem, catManager) {
        this.store = store;
        this.bonusSystem = bonusSystem;
        this.catManager = catManager;
    }

    spawnCustomer() {
        const state = this.store.getState();
        if (state.customers.length >= 5) return null;

        const unlocked = this.store.getUnlockedMenu();
        if (unlocked.length === 0) return null;

        const bonuses = this.bonusSystem.calculateCafeBonuses();
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
        return customer;
    }

    serveCustomer(customerId, menuId) {
        const customer = this.store.findCustomer(customerId);
        if (!customer) return null;

        const menuItem = MENU_ITEMS.find(m => m.id === menuId);
        if (!menuItem) return null;

        const bonuses = this.bonusSystem.calculateCafeBonuses();
        const tipBonus = 1 + bonuses.tip / 100;
        const isMatch = customer.order && customer.order.id === menuItem.id;
        const config = isMatch ? SERVE_CONFIG.match : SERVE_CONFIG.mismatch;

        let catInteraction = null;
        let interactingCat = null;
        const activeCats = [];
        const state = this.store.getState();
        for (const [, cats] of Object.entries(state.areaAssignments)) {
            cats.forEach(cat => {
                if (cat) {
                    const realCat = state.cats.find(c => c.id === cat.id) || cat;
                    activeCats.push(realCat);
                }
            });
        }

        if (activeCats.length > 0 && Math.random() < 0.6) {
            interactingCat = activeCats[Math.floor(Math.random() * activeCats.length)];
            const personality = CAT_PERSONALITIES[interactingCat.personality];
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
            this.catManager.increaseBond(interactingCat.id, 1);
            this.store.addLog(`<span class="log-cat">${interactingCat.emoji} ${interactingCat.name}</span> ${catInteraction.text} <span class="log-bonus">收入+15%</span>`);
        }

        this.store.addCoins(finalEarning);
        this.store.addReputation(config.reputationChange);
        this.store.recordServe(finalEarning > 0 ? finalEarning : 0, config.countAsServed);
        this.store.removeCustomer(customerId);

        const result = {
            isMatch,
            finalEarning,
            reputationChange: config.reputationChange,
            message: config.message,
            catInteraction,
            breakdown: {
                baseEarning,
                tipMultiplier,
                earningMultiplier: config.earningMultiplier,
                ingredientLoss: config.ingredientCost ? Math.floor(menuItem.cost * config.ingredientCost) : 0,
                menuItem,
                customer
            }
        };

        return result;
    }

    onCustomersTick(dtSec) {
        this.store.tickCustomers(dtSec);
    }

    onCustomersAngry(angryLeavers) {
        this.store.emit('notification', {
            message: `${angryLeavers.length} 位客人等不及离开了...`,
            type: 'error'
        });
    }
}
