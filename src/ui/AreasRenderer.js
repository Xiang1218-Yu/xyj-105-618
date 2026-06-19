import { AREAS, EVENTS } from '../data/constants.js';
import { getCatMood } from '../logic/catUtils.js';

export class AreasRenderer {
    constructor(store, bus, scheduler, modal) {
        this.store = store;
        this.scheduler = scheduler;
        this.modal = modal;
        this.containers = {
            hall: document.getElementById('hall-cats'),
            shelf: document.getElementById('shelf-cats'),
            window: document.getElementById('window-cats')
        };

        const refresh = () => this.scheduler.invalidate(this);
        bus.on(EVENTS.AREAS_CHANGED, refresh);
        bus.on(EVENTS.CATS_CHANGED, refresh);
        this.scheduler.invalidate(this);
    }

    render() {
        const state = this.store.getState();
        AREAS.forEach(area => this.renderArea(area, state));
    }

    renderArea(area, state) {
        const container = this.containers[area];
        container.innerHTML = '';
        for (let i = 0; i < state.areaCapacities[area]; i++) {
            const slot = document.createElement('div');
            slot.className = 'cat-slot';
            slot.dataset.area = area;
            slot.dataset.index = i;

            const assignedCat = state.areaAssignments[area][i];
            if (assignedCat) {
                const cat = state.cats.find(c => c.id === assignedCat.id) || assignedCat;
                slot.classList.add('occupied');
                slot.textContent = cat.emoji;

                const mood = getCatMood(cat, area);
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
                const capturedCat = cat;
                slot.addEventListener('click', () => this.modal.showCatDetail(capturedCat));
            } else {
                slot.addEventListener('click', () => this.modal.openAssignCatModal(area, i));
            }
            container.appendChild(slot);
        }
    }
}
