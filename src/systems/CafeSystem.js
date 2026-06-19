import { SERVE_CONFIG, CAT_PERSONALITIES, EVENTS } from '../data/constants.js';
import { calculateCafeBonuses } from '../logic/catUtils.js';

export class CafeSystem {
    constructor(store, bus) {
        this.store = store;
        this.bus = bus;
    }

    _getActiveCats(state) {
        const active = [];
        for (const cats of Object.values(state.areaAssignments)) {
            cats.forEach(catRef => {
                if (catRef) {
                    const realCat = state.cats.find(c => c.id === catRef.id) || catRef;
                    if (realCat) active.push(realCat);
                }
            });
        }
        return active;
    }

    serveCustomer(customer, menuItem) {
        const state = this.store.getState();
        const bonuses = calculateCafeBonuses(state);
        const tipBonus = 1 + bonuses.tip / 100;
        const isMatch = customer.order && customer.order.id === menuItem.id;
        const config = isMatch ? SERVE_CONFIG.match : SERVE_CONFIG.mismatch;

        let catInteraction = null;
        let interactingCat = null;
        const activeCats = this._getActiveCats(state);

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
            const lostCost = Math.floor(menuItem.cost * config.ingredientCost);
            finalEarning -= lostCost;
        }

        if (catInteraction && interactingCat) {
            finalEarning = Math.floor(finalEarning * 1.15);
            this.store.updateCat(interactingCat.id, (c) => {
                c.bond = Math.min(100, c.bond + 1);
            });
            this.store.addLog(
                `<span class="log-cat">${interactingCat.emoji} ${interactingCat.name}</span> ${catInteraction.text} <span class="log-bonus">收入+15%</span>`
            );
        }

        this.store.addCoins(finalEarning);
        this.store.addReputation(config.reputationChange);

        if (config.countAsServed) {
            this.store.recordServed(finalEarning);
        }

        this.store.removeCustomer(customer.id);

        setTimeout(() => {
            const notifType = isMatch ? 'success' : 'error';
            const notifText = isMatch
                ? `招待完成！收入 💰${finalEarning}，声望 +${config.reputationChange}`
                : `点错单了！收入 💰${finalEarning}，声望 ${config.reputationChange}`;
            this.bus.emit(EVENTS.NOTIFICATION, { message: notifText, type: notifType });
        }, 1800);

        this.bus.emit(EVENTS.SAVE);

        return {
            isMatch,
            finalEarning,
            baseEarning,
            tipMultiplier,
            menuItem,
            customer,
            catInteraction,
            config,
            reputationChange: config.reputationChange
        };
    }
}
