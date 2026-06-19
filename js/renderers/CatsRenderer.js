export class CatsRenderer {
    constructor(state, onCatClick) {
        this.state = state;
        this.onCatClick = onCatClick;
        this.container = document.getElementById('cats-grid');
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
            if (this.state.selectedCat && this.state.selectedCat.id === cat.id) {
                card.classList.add('selected');
            }
            card.innerHTML = `
                <span class="cat-emoji">${cat.emoji}</span>
                <div class="cat-name">${cat.name}</div>
                <div class="cat-breed">${cat.breed}</div>
                <div class="cat-personality">${cat.personality}</div>
                <div class="bond-bar">
                    <div class="bond-fill" style="width:${cat.bond}%"></div>
                </div>
            `;
            card.addEventListener('click', () => this.onCatClick(cat));
            this.container.appendChild(card);
        });
    }
}
