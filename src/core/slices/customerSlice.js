export const customerSlice = {
    addCustomer(customer) {
        this.state.customers.push(customer);
        this._emit('customers:changed', { type: 'add', customer });
    },

    removeCustomer(customerId) {
        const idx = this.state.customers.findIndex(c => c.id === customerId);
        if (idx === -1) return null;
        const [removed] = this.state.customers.splice(idx, 1);
        this._emit('customers:changed', { type: 'remove', customer: removed });
        return removed;
    },

    tickCustomers(dtSec) {
        let angryLeavers = [];
        for (const customer of this.state.customers) {
            customer.waitTime += dtSec;
            if (customer.waitTime >= customer.maxWait && !customer.leftAngry) {
                customer.leftAngry = true;
                angryLeavers.push(customer);
            }
        }
        if (angryLeavers.length > 0) {
            this.state.totalAngryLeft += angryLeavers.length;
            this.state.customers = this.state.customers.filter(c => !c.leftAngry);
            this.setReputation(this.state.reputation - angryLeavers.length * 5);
            this._emit('customers:angry', angryLeavers);
            this._emit('stats:changed');
        } else {
            this.emit('customers:tick', dtSec);
        }
    }
};
