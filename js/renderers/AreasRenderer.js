export class AreasRenderer {
    constructor(state, onSlotClick, onCatClick) {
        this.state = state;
        this.onSlotClick = onSlotClick;
        this.onCatClick = onCatClick;
    }

    render() {
        const areas = ['hall', 'shelf', 'window'];
        areas.forEach(area => this.renderArea(area));
    }

    renderArea(area) {
        const container = document.getElementById(`${area}-cats`);
        container.innerHTML = '';
        for (let i = 0; i < this.state.areaCapacities[area]; i++) {
            const slot = document.createElement('div');
            slot.className = 'cat-slot';
            slot.dataset.area = area;
            slot.dataset.index = i;

            const assignedCat = this.state.areaAssignments[area][i];
            if (assignedCat) {
                slot.classList.add('occupied');
                slot.textContent = assignedCat.emoji;

                const mood = assignedCat.getMoodForArea(area);
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
                slot.addEventListener('click', () => this.onCatClick(assignedCat));
            } else {
                slot.addEventListener('click', () => this.onSlotClick(area, i));
            }
            container.appendChild(slot);
        }
    }
}
