import { EVENTS } from '../core/EventBus.js';

export class ModalView {
    constructor(bus) {
        this.bus = bus;
        this.modal = document.getElementById('modal');
        this.body = document.getElementById('modal-body');
        const closeBtn = this.modal?.querySelector('.close-btn');
        closeBtn?.addEventListener('click', () => this.close());
        this.modal?.addEventListener('click', (e) => {
            if (e.target.id === 'modal') this.close();
        });
        this.bus.on(EVENTS.MODAL_OPEN, ({ html, onMount }) => this.open(html, onMount));
        this.bus.on(EVENTS.MODAL_CLOSE, () => this.close());
    }

    open(html, onMount) {
        if (!this.body || !this.modal) return;
        this.body.innerHTML = html;
        this.modal.classList.add('active');
        if (typeof onMount === 'function') onMount(this.body);
    }

    close() {
        this.modal?.classList.remove('active');
    }
}
