import { EVENTS } from '../core/EventBus.js';

export class CatsView {
    constructor(state, bus) {
        this.state = state;
        this.bus = bus;
        this.container = document.getElementById('cats-grid');
        this.bus.on(EVENTS.CATS_CHANGED, () => this.render());
        this.bus.on(EVENTS.TAB_CHANGED, (tab) => {
            if (tab === 'cats') this.render();
        });
    }

    render() {
        if (!this.container) return;
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
            card.addEventListener('click', () => this.bus.emit('cat:detailRequested', cat));
            this.container.appendChild(card);
        });
    }
}
