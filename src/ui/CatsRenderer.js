import { EVENTS } from '../data/constants.js';

export class CatsRenderer {
    constructor(store, bus, scheduler, modal) {
        this.store = store;
        this.scheduler = scheduler;
        this.modal = modal;
        this.container = document.getElementById('cats-grid');

        bus.on(EVENTS.CATS_CHANGED, () => {
            if (document.getElementById('cats-tab').classList.contains('active')) {
                this.scheduler.invalidate(this);
            }
        });
    }

    render() {
        const state = this.store.getState();
        this.container.innerHTML = '';
        if (state.cats.length === 0) {
            this.container.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#999;padding:40px;">还没有猫咪，去商店收养一只吧！</p>';
            return;
        }

        state.cats.forEach(cat => {
            const card = document.createElement('div');
            card.className = 'cat-card';
            card.innerHTML = `
                <span class="cat-emoji">${cat.emoji}</span>
                <div class="cat-name">${cat.name}</div>
                <div class="cat-breed">${cat.breed}</div>
                <div class="cat-personality">${cat.personality}</div>
                <div class="bond-bar">
                    <div class="bond-fill" style="width:${cat.bond}%"></div>
                </div>
            `;
            const captured = cat;
            card.addEventListener('click', () => this.modal.showCatDetail(captured));
            this.container.appendChild(card);
        });
    }
}
