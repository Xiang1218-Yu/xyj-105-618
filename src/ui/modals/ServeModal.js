export class ServeModal {
    constructor(container, store, managers, hooks) {
        this.container = container;
        this.store = store;
        this.customerManager = managers.customerManager;
        this.hooks = hooks;
    }

    show(customer) {
        const unlocked = this.store.getUnlockedMenu();
        this._currentCustomer = customer;
        this.container.innerHTML = `
            <div class="serve-select-modal">
                <h3>招待 ${customer.emoji} ${customer.type}</h3>
                <div class="serve-customer-info">
                    客人想点: ${customer.order.emoji} ${customer.order.name}（或从已研发菜单中选择）
                </div>
                <div class="menu-select-grid">
                    ${unlocked.map(item => {
                        const isCustomerOrder = customer.order && customer.order.id === item.id;
                        return `
                            <div class="serve-menu-item ${isCustomerOrder ? 'customer-order' : ''}" role="button" tabindex="0" data-menu-id="${item.id}">
                                <div>${item.emoji}</div>
                                <div class="item-name">${item.name}</div>
                                <div class="item-price">💰${item.price}</div>
                                ${isCustomerOrder ? '<div class="order-badge">客人要这个</div>' : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
                <div id="serve-interaction-area"></div>
                <div id="serve-result-area"></div>
            </div>
        `;

        this._bindEvents(customer);
        this.hooks.open();
    }

    _bindEvents(customer) {
        this.container.querySelectorAll('.serve-menu-item').forEach(el => {
            el.addEventListener('click', () => {
                const menuId = parseInt(el.dataset.menuId);
                this._executeServe(customer.id, menuId);
            });
        });
    }

    _executeServe(customerId, menuId) {
        const result = this.customerManager.serveCustomer(customerId, menuId);
        if (!result) return;

        const { isMatch, finalEarning, reputationChange, message, catInteraction, breakdown } = result;

        if (catInteraction) {
            const interactionArea = document.getElementById('serve-interaction-area');
            if (interactionArea) {
                interactionArea.innerHTML = `
                    <div class="serve-interaction">
                        <span style="font-size:24px;">${catInteraction.cat.emoji}</span>
                        ${catInteraction.text}
                    </div>
                `;
            }
        }

        const resultArea = document.getElementById('serve-result-area');
        if (resultArea) {
            resultArea.innerHTML = `
                <div class="serve-result ${isMatch ? 'match' : 'mismatch'}">
                    <div>${message}</div>
                    <div class="earn">💰 ${finalEarning >= 0 ? '+' : ''}${finalEarning}</div>
                    <div style="font-size:11px;color:#999;margin-top:4px;">
                        ${isMatch ? '✓ 正确匹配' : '✗ 点错了！客人想要 ' + breakdown.customer.order.emoji + ' ' + breakdown.customer.order.name}
                    </div>
                    <div style="font-size:10px;color:#999;margin-top:2px;">
                        基础${breakdown.baseEarning} × 小费x${breakdown.tipMultiplier.toFixed(1)} × ${isMatch ? '匹配x1.0' : '错单x' + breakdown.earningMultiplier}
                        ${breakdown.ingredientLoss ? ' - 浪费食材' + breakdown.ingredientLoss : ''}
                        ${catInteraction ? ' × 互动x1.15' : ''}
                    </div>
                </div>
            `;
        }

        setTimeout(() => {
            this.hooks.close();
            const notifType = isMatch ? 'success' : 'error';
            const notifText = isMatch
                ? `招待完成！收入 💰${finalEarning}，声望 +${reputationChange}`
                : `点错单了！收入 💰${finalEarning}，声望 ${reputationChange}`;
            this.hooks.notify(notifText, notifType);
        }, 1800);
    }
}
