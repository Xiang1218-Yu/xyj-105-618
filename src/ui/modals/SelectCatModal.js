export class SelectCatModal {
    constructor(container, store, managers, hooks) {
        this.container = container;
        this.store = store;
        this.catManager = managers.catManager;
        this.hooks = hooks;
    }

    show(food) {
        const s = this.store.getState();
        this.container.innerHTML = `
            <h2 style="text-align:center;margin-bottom:20px;color:#8B4513;">选择猫咪使用 ${food.name}</h2>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:15px;">
                ${s.cats.map(cat => `
                    <div class="cat-card" style="cursor:pointer;" data-cat-id="${cat.id}">
                        <span class="cat-emoji">${cat.emoji}</span>
                        <div class="cat-name">${cat.name}</div>
                        <div class="cat-breed">好感度: ${Math.floor(cat.bond)}%</div>
                    </div>
                `).join('')}
            </div>
        `;

        this._bindEvents(food);
        this.hooks.open();
    }

    _bindEvents(food) {
        this.container.querySelectorAll('.cat-card').forEach(card => {
            card.addEventListener('click', () => {
                const catId = parseInt(card.dataset.catId);
                const success = this.catManager.applyFood(catId, food);
                if (success) this.hooks.close();
            });
        });
    }
}
