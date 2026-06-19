import { EVENTS } from '../core/EventBus.js';
import { PERSONALITY_AREAS } from '../data/catBreeds.js';
import { AREA_NAMES } from '../data/config.js';

export class AreaView {
    constructor(state, bus, bonusCalculator, catManager) {
        this.state = state;
        this.bus = bus;
        this.bonus = bonusCalculator;
        this.catManager = catManager;
        this.bus.on(EVENTS.AREAS_CHANGED, () => this.render());
        this.bus.on(EVENTS.CATS_CHANGED, () => this.render());
    }

    render() {
        const areas = ['hall', 'shelf', 'window'];
        areas.forEach(area => {
            const container = document.getElementById(`${area}-cats`);
            if (!container) return;
            container.innerHTML = '';
            for (let i = 0; i < this.state.areaCapacities[area]; i++) {
                const slot = document.createElement('div');
                slot.className = 'cat-slot';
                slot.dataset.area = area;
                slot.dataset.index = i;

                const assignedCat = this.state.areaAssignments[area][i];
                if (assignedCat) {
                    const cat = this.state.cats.find(c => c.id === assignedCat.id) || assignedCat;
                    slot.classList.add('occupied');
                    slot.textContent = cat.emoji;
                    const mood = this.bonus.getCatMood(cat, area);
                    const indicator = document.createElement('span');
                    if (mood < 50) {
                        indicator.className = 'unhappy-indicator';
                        indicator.textContent = '😾';
                    } else {
                        indicator.className = 'cat-mood';
                        indicator.textContent = mood >= 80 ? '😻' : '😺';
                    }
                    slot.appendChild(indicator);
                    slot.addEventListener('click', () => {
                        this.bus.emit('cat:detailRequested', cat);
                    });
                } else {
                    slot.addEventListener('click', () => {
                        this.bus.emit('area:assignRequested', { area, index: i });
                    });
                }
                container.appendChild(slot);
            }
        });
    }
}
