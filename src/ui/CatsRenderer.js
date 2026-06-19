import { EVENTS } from '../data/constants.js';

export class CatsRenderer {
    constructor(state, bus, modal) {
        this.state = state;
        this.bus = bus;
        this.modal = modal;
        this.container = document.getElementById('cats-grid');

        this.bus.on(EVENTS.CATS_CHANGED, () => {
            if (document.getElementById('cats-tab').classList.contains('active')) {
                this.render();
            }
        });
    }

    render() {
        this.container.innerHTML = '';
        if (this.state.cats.length === 0) {
            this.container.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#999;padding:40px;">还没有猫咪，去商店收养一只吧！</p>';
            return;
        }

        this.state.cats.forEach(cat => {
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
            card.addEventListener('click', () => this.modal.showCatDetail(cat));
            this.container.appendChild(card);
        });
    }
}
