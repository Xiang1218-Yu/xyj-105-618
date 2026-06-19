export class CustomerRenderer {
    constructor(store, uiController) {
        this.store = store;
        this.ui = uiController;
        this.container = document.getElementById('customers-list');
        this._rafId = null;
        this._lastUpdate = 0;

        this.store.on('customers:changed', () => this.render());
        this.store.on('state:hydrated', () => this.render());
        this.store.on('customers:tick', () => this.renderTimers());
        this.store.on('customers:angry', () => this.render());
    }

    render() {
        const s = this.store.getState();
        this.container.innerHTML = '';
        if (s.customers.length === 0) {
            this.container.innerHTML = '<p style="color:#999;text-align:center;padding:20px;">暂无客人</p>';
            return;
        }
        s.customers.forEach(customer => this._createCustomerEl(customer));
    }

    renderTimers() {
        const s = this.store.getState();
        s.customers.forEach(customer => {
            const el = this.container.querySelector(`[data-customer-id="${customer.id}"] .customer-timer`);
            const btn = this.container.querySelector(`[data-customer-id="${customer.id}"] .serve-customer-btn`);
            if (el) {
                const remaining = Math.max(0, customer.maxWait - customer.waitTime);
                const waitPercent = (customer.waitTime / customer.maxWait) * 100;
                el.textContent = Math.ceil(remaining) + 's';
                el.classList.toggle('urgent', waitPercent > 70);
            }
        });
    }

    _createCustomerEl(customer) {
        const remaining = Math.max(0, customer.maxWait - customer.waitTime);
        const waitPercent = (customer.waitTime / customer.maxWait) * 100;
        const el = document.createElement('div');
        el.className = 'customer';
        el.dataset.customerId = customer.id;
        el.innerHTML = `
            <span class="customer-avatar">${customer.emoji}</span>
            <div class="customer-info">
                <div class="customer-type">${customer.type}</div>
                <div class="customer-order">想点 ${customer.order.emoji} ${customer.order.name}</div>
            </div>
            <span class="customer-timer ${waitPercent > 70 ? 'urgent' : ''}">${Math.ceil(remaining)}s</span>
            <button class="serve-customer-btn">招待</button>
        `;
        el.querySelector('.serve-customer-btn').addEventListener('click', () => {
            this.ui.openServeModal(customer);
        });
        this.container.appendChild(el);
    }
}
