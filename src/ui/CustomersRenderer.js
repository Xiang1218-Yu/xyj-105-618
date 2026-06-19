import { EVENTS } from '../data/constants.js';

export class CustomersRenderer {
    constructor(store, bus, scheduler, modal) {
        this.store = store;
        this.scheduler = scheduler;
        this.modal = modal;
        this.container = document.getElementById('customers-list');

        bus.on(EVENTS.CUSTOMERS_CHANGED, () => this.scheduler.invalidate(this));
        this.scheduler.invalidate(this);
    }

    render() {
        const state = this.store.getState();
        this.container.innerHTML = '';

        if (state.customers.length === 0) {
            this.container.innerHTML = '<p style="color:#999;text-align:center;padding:20px;">暂无客人</p>';
            return;
        }

        state.customers.forEach(customer => {
            const remaining = Math.max(0, customer.maxWait - customer.waitTime);
            const waitPercent = (customer.waitTime / customer.maxWait) * 100;

            const el = document.createElement('div');
            el.className = 'customer';
            el.innerHTML = `
                <span class="customer-avatar">${customer.emoji}</span>
                <div class="customer-info">
                    <div class="customer-type">${customer.type}</div>
                    <div class="customer-order">想点 ${customer.order.emoji} ${customer.order.name}</div>
                </div>
                <span class="customer-timer ${waitPercent > 70 ? 'urgent' : ''}">${Math.ceil(remaining)}s</span>
                <button class="serve-customer-btn" data-customer-id="${customer.id}">招待</button>
            `;

            const captured = customer;
            el.querySelector('.serve-customer-btn').addEventListener('click', () => {
                this.modal.openServeModal(captured);
            });

            this.container.appendChild(el);
        });
    }
}
