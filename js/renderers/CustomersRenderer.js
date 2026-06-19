export class CustomersRenderer {
    constructor(state, onServeClick) {
        this.state = state;
        this.onServeClick = onServeClick;
        this.container = document.getElementById('customers-list');
    }

    render() {
        this.container.innerHTML = '';

        if (this.state.customers.length === 0) {
            this.container.innerHTML = '<p style="color:#999;text-align:center;padding:20px;">暂无客人</p>';
            return;
        }

        this.state.customers.forEach(customer => {
            const remaining = Math.ceil(customer.getRemainingTime());
            const waitPercent = customer.getWaitPercent();

            const el = document.createElement('div');
            el.className = 'customer';
            el.innerHTML = `
                <span class="customer-avatar">${customer.emoji}</span>
                <div class="customer-info">
                    <div class="customer-type">${customer.type}</div>
                    <div class="customer-order">想点 ${customer.order.emoji} ${customer.order.name}</div>
                </div>
                <span class="customer-timer ${customer.isUrgent() ? 'urgent' : ''}">${remaining}s</span>
                <button class="serve-customer-btn" data-customer-id="${customer.id}">招待</button>
            `;

            el.querySelector('.serve-customer-btn').addEventListener('click', () => {
                this.onServeClick(customer);
            });

            this.container.appendChild(el);
        });
    }
}
