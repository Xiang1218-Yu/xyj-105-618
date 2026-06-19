import { AREAS, PERSONALITY_AREAS, EVENTS } from '../data/constants.js';

export class AreasRenderer {
    constructor(state, bus, catManager, modal) {
        this.state = state;
        this.bus = bus;
        this.catManager = catManager;
        this.modal = modal;
        this.containers = {
            hall: document.getElementById('hall-cats'),
            shelf: document.getElementById('shelf-cats'),
            window: document.getElementById('window-cats')
        };

        this.bus.on(EVENTS.AREAS_CHANGED, () => this.render());
        this.bus.on(EVENTS.CATS_CHANGED, () => this.render());
        this.render();
    }

    render() {
        AREAS.forEach(area => this.renderArea(area));
    }

    renderArea(area) {
        const container = this.containers[area];
        container.innerHTML = '';
        for (let i = 0; i < this.state.areaCapacities[area]; i++) {
            const slot = document.createElement('div');
            slot.className = 'cat-slot';
            slot.dataset.area = area;
            slot.dataset.index = i;

            const assignedCat = this.state.areaAssignments[area][i];
            if (assignedCat) {
                const cat = this.state.findCatById(assignedCat.id) || assignedCat;
                slot.classList.add('occupied');
                slot.textContent = cat.emoji;

                const mood = this.catManager.getCatMood(cat, area);
                if (mood < 50) {
                    const indicator = document.createElement('span');
                    indicator.className = 'unhappy-indicator';
                    indicator.textContent = '😾';
                    slot.appendChild(indicator);
                } else {
                    const moodEmoji = document.createElement('span');
                    moodEmoji.className = 'cat-mood';
                    moodEmoji.textContent = mood >= 80 ? '😻' : '😺';
                    slot.appendChild(moodEmoji);
                }
                slot.addEventListener('click', () => this.modal.showCatDetail(cat));
            } else {
                slot.addEventListener('click', () => this.modal.openAssignCatModal(area, i));
            }
            container.appendChild(slot);
        }
    }
}
