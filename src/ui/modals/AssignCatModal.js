import { PERSONALITY_AREAS } from '../../data.js';

export class AssignCatModal {
    constructor(container, store, managers, hooks) {
        this.container = container;
        this.store = store;
        this.catManager = managers.catManager;
        this.areaManager = managers.areaManager;
        this.hooks = hooks;
    }

    show(area, index) {
        const availableCats = this.catManager.getAvailableCats();
        if (availableCats.length === 0) {
            this.hooks.notify('没有可用的猫咪', 'info');
            return;
        }

        const areaNames = { hall: '大厅', shelf: '猫爬架', window: '窗边' };
        this.container.innerHTML = `
            <h2 style="text-align:center;margin-bottom:20px;color:#8B4513;">选择猫咪放到${areaNames[area]}</h2>
            <p style="text-align:center;color:#999;margin-bottom:20px;">${areaNames[area]}适合：${PERSONALITY_AREAS[area].join('、')}型猫咪</p>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:15px;">
                ${availableCats.map(cat => {
                    const isMatch = PERSONALITY_AREAS[area].includes(cat.personality);
                    return `
                        <div class="cat-card" style="cursor:pointer;${isMatch ? 'border-color:#98D8C8;' : ''}" data-cat-id="${cat.id}">
                            <span class="cat-emoji">${cat.emoji}</span>
                            <div class="cat-name">${cat.name}</div>
                            <div class="cat-personality">${cat.personality}</div>
                            ${isMatch ? '<div style="font-size:12px;color:#98D8C8;margin-top:5px;">✓ 适合此处</div>' : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        this._bindEvents(area, index);
        this.hooks.open();
    }

    _bindEvents(area, index) {
        this.container.querySelectorAll('.cat-card').forEach(card => {
            card.addEventListener('click', () => {
                const catId = parseInt(card.dataset.catId);
                const result = this.areaManager.assignCat(area, index, catId);
                if (result.success) {
                    this.hooks.close();
                    if (result.isMatch) {
                        this.hooks.notify(`${result.catName} 很喜欢这里！`, 'success');
                    } else {
                        this.hooks.notify(`${result.catName} 被放到了${result.areaName}`, 'info');
                    }
                }
            });
        });
    }
}
