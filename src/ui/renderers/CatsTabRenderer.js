export class CatsTabRenderer {
    constructor(store, uiController) {
        this.store = store;
        this.ui = uiController;
        this.container = document.getElementById('cats-grid');
        this._visible = false;

        this.store.on('cats:changed', () => { if (this._visible) this.render(); });
        this.store.on('state:hydrated', () => { if (this._visible) this.render(); });
    }

    setVisible(visible) {
        this._visible = visible;
        if (visible) this.render();
    }

    render() {
        const s = this.store.getState();
        this.container.innerHTML = '';
        if (s.cats.length === 0) {
            this.container.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#999;padding:40px;">还没有猫咪，去商店收养一只吧！</p>';
            return;
        }
        s.cats.forEach(cat => {
            const card = document.createElement('div');
            card.className = 'cat-card';
            if (s.selectedCatId === cat.id) card.classList.add('selected');
            card.innerHTML = `
                <span class="cat-emoji">${cat.emoji}</span>
                <div class="cat-name">${cat.name}</div>
                <div class="cat-breed">${cat.breed}</div>
                <div class="cat-personality">${cat.personality}</div>
                <div class="bond-bar">
                    <div class="bond-fill" style="width:${cat.bond}%"></div>
                </div>
            `;
            card.addEventListener('click', () => this.ui.showCatDetail(cat));
            this.container.appendChild(card);
        });
    }
}
