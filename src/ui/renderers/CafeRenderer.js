import { CAT_PERSONALITIES } from '../../data.js';

export class CafeRenderer {
    constructor(store, bonusSystem, uiController) {
        this.store = store;
        this.bonusSystem = bonusSystem;
        this.ui = uiController;
        this.areas = ['hall', 'shelf', 'window'];

        this.store.on('areas:changed', () => this.render());
        this.store.on('cats:changed', () => this.render());
        this.store.on('state:hydrated', () => this.render());
    }

    render() {
        const s = this.store.getState();
        this.areas.forEach(area => {
            const container = document.getElementById(`${area}-cats`);
            container.innerHTML = '';
            for (let i = 0; i < s.areaCapacities[area]; i++) {
                const slot = document.createElement('div');
                slot.className = 'cat-slot';
                slot.dataset.area = area;
                slot.dataset.index = i;

                const assignedCat = s.areaAssignments[area][i];
                if (assignedCat) {
                    const cat = s.cats.find(c => c.id === assignedCat.id) || assignedCat;
                    slot.classList.add('occupied');
                    slot.textContent = cat.emoji;

                    const mood = this.bonusSystem.getCatMood(cat, area);
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
                    slot.addEventListener('click', () => this.ui.showCatDetail(cat));
                } else {
                    slot.addEventListener('click', () => this.ui.openAssignCatModal(area, i));
                }
                container.appendChild(slot);
            }
        });
    }
}
