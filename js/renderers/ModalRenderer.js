import { PERSONALITY_AREAS, MENU_ITEMS, CAT_STORIES } from '../../data.js';

export class ModalRenderer {
    constructor(state, catSystem, customerSystem) {
        this.state = state;
        this.catSystem = catSystem;
        this.customerSystem = customerSystem;
        this.modal = document.getElementById('modal');
        this.modalBody = document.getElementById('modal-body');
    }

    open() {
        this.modal.classList.add('active');
    }

    close() {
        this.modal.classList.remove('active');
    }

    showCatDetail(cat, onUpdate) {
        const hasStory = CAT_STORIES[cat.breedId];
        const storyUnlocked = cat.bond >= 100;
        const personality = cat.getPersonality();

        this.modalBody.innerHTML = `
            <div class="cat-detail-modal">
                <span class="cat-emoji">${cat.emoji}</span>
                <h2>${cat.name}</h2>
                <div class="cat-detail-breed">${cat.breed} · ${cat.personality}</div>
                <div class="cat-detail-info">
                    <div class="info-item">
                        <div class="info-label">好感度</div>
                        <div class="info-value" id="detail-bond-value">${Math.floor(cat.bond)}%</div>
                        <div class="bond-bar" style="margin-top:8px;">
                            <div class="bond-fill" id="detail-bond-fill" style="width:${cat.bond}%"></div>
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">心情</div>
                        <div class="info-value" id="detail-mood-value">${Math.floor(cat.mood)}%</div>
                        <div class="bond-bar" style="margin-top:8px;">
                            <div class="bond-fill" id="detail-mood-fill" style="width:${cat.mood}%;background:linear-gradient(90deg,#98D8C8,#7FCDCD);"></div>
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">性格特点</div>
                        <div class="info-value" style="font-size:13px;">${personality.description}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">店铺加成</div>
                        <div class="info-value" style="font-size:13px;color:#98D8C8;">${personality.bonusLabel}</div>
                    </div>
                </div>
                <div class="cat-actions">
                    <button class="cat-action-btn secondary" id="pet-btn">🤚 抚摸</button>
                    <button class="cat-action-btn primary" id="move-btn">📍 移动位置</button>
                    ${hasStory && storyUnlocked ? '<button class="cat-action-btn secondary" id="story-btn">📖 查看故事</button>' : ''}
                </div>
            </div>
        `;

        const updateDetailUI = () => {
            const bondVal = document.getElementById('detail-bond-value');
            const bondFill = document.getElementById('detail-bond-fill');
            const moodVal = document.getElementById('detail-mood-value');
            const moodFill = document.getElementById('detail-mood-fill');
            if (bondVal) bondVal.textContent = Math.floor(cat.bond) + '%';
            if (bondFill) bondFill.style.width = cat.bond + '%';
            if (moodVal) moodVal.textContent = Math.floor(cat.mood) + '%';
            if (moodFill) moodFill.style.width = cat.mood + '%';
        };

        this.modalBody.querySelector('#pet-btn').addEventListener('click', () => {
            this.catSystem.petCat(cat);
            updateDetailUI();
            if (onUpdate) onUpdate();
        });

        this.modalBody.querySelector('#move-btn').addEventListener('click', () => {
            this.catSystem.removeCatFromArea(cat);
            this.close();
        });

        if (hasStory && storyUnlocked) {
            this.modalBody.querySelector('#story-btn').addEventListener('click', () => {
                this.showStory(cat, CAT_STORIES[cat.breedId]);
            });
        }

        this.open();
    }

    showSelectCatModal(food, onSelect) {
        this.modalBody.innerHTML = `
            <h2 style="text-align:center;margin-bottom:20px;color:#8B4513;">选择猫咪使用 ${food.name}</h2>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:15px;">
                ${this.state.cats.map(cat => `
                    <div class="cat-card" style="cursor:pointer;" data-cat-id="${cat.id}">
                        <span class="cat-emoji">${cat.emoji}</span>
                        <div class="cat-name">${cat.name}</div>
                        <div class="cat-breed">好感度: ${Math.floor(cat.bond)}%</div>
                    </div>
                `).join('')}
            </div>
        `;

        this.modalBody.querySelectorAll('.cat-card').forEach(card => {
            card.addEventListener('click', () => {
                const cat = this.state.getCatById(parseInt(card.dataset.catId));
                if (cat && onSelect) onSelect(cat, food);
            });
        });

        this.open();
    }

    showAssignCatModal(area, index, onAssign) {
        const availableCats = this.state.getAvailableCats();

        if (availableCats.length === 0) {
            return false;
        }

        const areaNames = { hall: '大厅', shelf: '猫爬架', window: '窗边' };

        this.modalBody.innerHTML = `
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

        this.modalBody.querySelectorAll('.cat-card').forEach(card => {
            card.addEventListener('click', () => {
                const cat = this.state.getCatById(parseInt(card.dataset.catId));
                if (cat && onAssign) {
                    onAssign(cat, area, index);
                    this.close();
                }
            });
        });

        this.open();
        return true;
    }

    showServeModal(customer, onSelect) {
        const unlocked = this.state.getUnlockedMenu();

        this.modalBody.innerHTML = `
            <div class="serve-select-modal">
                <h3>招待 ${customer.emoji} ${customer.type}</h3>
                <div class="serve-customer-info">
                    客人想点: ${customer.order.emoji} ${customer.order.name}（或从已研发菜单中选择）
                </div>
                <div class="menu-select-grid">
                    ${unlocked.map(item => {
                        const isCustomerOrder = customer.order && customer.order.id === item.id;
                        return `
                            <div class="serve-menu-item ${isCustomerOrder ? 'customer-order' : ''}" role="button" tabindex="0" data-menu-id="${item.id}">
                                <div>${item.emoji}</div>
                                <div class="item-name">${item.name}</div>
                                <div class="item-price">💰${item.price}</div>
                                ${isCustomerOrder ? '<div class="order-badge">客人要这个</div>' : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
                <div id="serve-interaction-area"></div>
                <div id="serve-result-area"></div>
            </div>
        `;

        this.modalBody.querySelectorAll('.serve-menu-item').forEach(el => {
            el.addEventListener('click', () => {
                const menuId = parseInt(el.dataset.menuId);
                const selectedItem = MENU_ITEMS.find(m => m.id === menuId);
                if (selectedItem && onSelect) onSelect(customer, selectedItem);
            });
        });

        this.open();
    }

    showServeResult(result) {
        const interactionArea = document.getElementById('serve-interaction-area');
        const resultArea = document.getElementById('serve-result-area');

        if (result.catInteraction && interactionArea) {
            interactionArea.innerHTML = `
                <div class="serve-interaction">
                    <span style="font-size:24px;">${result.catInteraction.cat.emoji}</span>
                    ${result.catInteraction.text}
                </div>
            `;
        }

        if (resultArea) {
            resultArea.innerHTML = `
                <div class="serve-result ${result.isMatch ? 'match' : 'mismatch'}">
                    <div>${result.message}</div>
                    <div class="earn">💰 ${result.earning >= 0 ? '+' : ''}${result.earning}</div>
                    <div style="font-size:11px;color:#999;margin-top:4px;">
                        ${result.isMatch ? '✓ 正确匹配' : '✗ 点错了！客人想要 ' + result.customer.order.emoji + ' ' + result.customer.order.name}
                    </div>
                    <div style="font-size:10px;color:#999;margin-top:2px;">
                        基础${result.baseEarning} × 小费x${result.tipMultiplier.toFixed(1)} × ${result.isMatch ? '匹配x1.0' : '错单x' + result.config.earningMultiplier}
                        ${result.config.ingredientCost ? ' - 浪费食材' + Math.floor(result.menuItem.cost * result.config.ingredientCost) : ''}
                        ${result.catInteraction ? ' × 互动x1.15' : ''}
                    </div>
                </div>
            `;
        }
    }

    showStory(cat, story) {
        this.modalBody.innerHTML = `
            <div class="story-content-modal">
                <div style="text-align:center;margin-bottom:20px;">
                    <span style="font-size:60px;">${cat.emoji}</span>
                </div>
                <h2>${story.title}</h2>
                <div class="story-text">${story.content}</div>
            </div>
        `;
        this.open();
    }
}
