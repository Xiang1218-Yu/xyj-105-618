import { PERSONALITY_AREAS, CAT_STORIES, CAT_PERSONALITIES, MENU_ITEMS, SERVE_CONFIG } from '../data.js';

export class UIController {
    constructor(store, managers) {
        this.store = store;
        this.catManager = managers.catManager;
        this.customerManager = managers.customerManager;
        this.areaManager = managers.areaManager;
        this.menuManager = managers.menuManager;
        this.shopManager = managers.shopManager;
        this.bonusSystem = managers.bonusSystem;

        this.modal = document.getElementById('modal');
        this.modalBody = document.getElementById('modal-body');
        this.notificationEl = document.getElementById('notification');
        this._notifTimer = null;

        this._currentTab = 'cafe';
        this._currentShopTab = 'cats';

        this._bindNavEvents();
        this._bindModalEvents();
        this._bindGlobalEvents();
        this._bindStoreEvents();
    }

    _bindNavEvents() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
        document.querySelectorAll('.shop-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchShopTab(e.target.dataset.shop));
        });
        document.getElementById('adopt-btn').addEventListener('click', () => {
            this.switchTab('shop');
            this.switchShopTab('cats');
        });
    }

    _bindModalEvents() {
        document.querySelector('.close-btn').addEventListener('click', () => this.closeModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target.id === 'modal') this.closeModal();
        });
    }

    _bindGlobalEvents() {
        this.store.on('notification', ({ message, type }) => this.showNotification(message, type));
        this.store.on('modal:open', (data) => {
            if (data.type === 'selectCat') this.openSelectCatModal(data.food);
        });
    }

    _bindStoreEvents() {}

    switchTab(tabName) {
        this._currentTab = tabName;
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });
        this.store.emit('tab:changed', tabName);
    }

    switchShopTab(shopName) {
        this._currentShopTab = shopName;
        document.querySelectorAll('.shop-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.shop === shopName);
        });
        this.store.emit('shop:tabChanged', shopName);
    }

    closeModal() {
        this.modal.classList.remove('active');
    }

    showNotification(message, type = 'info') {
        this.notificationEl.textContent = message;
        this.notificationEl.className = `notification show ${type}`;
        if (this._notifTimer) clearTimeout(this._notifTimer);
        this._notifTimer = setTimeout(() => this.notificationEl.classList.remove('show'), 3000);
    }

    showCatDetail(cat) {
        const hasStory = !!CAT_STORIES[cat.breedId];
        const storyUnlocked = cat.bond >= 100;
        const personality = CAT_PERSONALITIES[cat.personality];

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
            const freshCat = this.store.findCat(cat.id);
            if (!freshCat) return;
            const bondVal = document.getElementById('detail-bond-value');
            const bondFill = document.getElementById('detail-bond-fill');
            const moodVal = document.getElementById('detail-mood-value');
            const moodFill = document.getElementById('detail-mood-fill');
            if (bondVal) bondVal.textContent = Math.floor(freshCat.bond) + '%';
            if (bondFill) bondFill.style.width = freshCat.bond + '%';
            if (moodVal) moodVal.textContent = Math.floor(freshCat.mood) + '%';
            if (moodFill) moodFill.style.width = freshCat.mood + '%';
        };

        this.modalBody.querySelector('#pet-btn').addEventListener('click', () => {
            this.catManager.petCat(cat.id);
            updateDetailUI();
        });

        this.modalBody.querySelector('#move-btn').addEventListener('click', () => {
            this.areaManager.removeCat(cat.id);
            this.closeModal();
            this.showNotification(`请选择新的位置放置 ${cat.name}`, 'info');
        });

        const storyBtn = this.modalBody.querySelector('#story-btn');
        if (storyBtn) {
            storyBtn.addEventListener('click', () => {
                this.showStory(cat, CAT_STORIES[cat.breedId]);
            });
        }

        this.modal.classList.add('active');
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
        this.modal.classList.add('active');
    }

    openAssignCatModal(area, index) {
        const availableCats = this.catManager.getAvailableCats();
        if (availableCats.length === 0) {
            this.showNotification('没有可用的猫咪', 'info');
            return;
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
                const catId = parseInt(card.dataset.catId);
                const result = this.areaManager.assignCat(area, index, catId);
                if (result.success) {
                    this.closeModal();
                    if (result.isMatch) {
                        this.showNotification(`${result.catName} 很喜欢这里！`, 'success');
                    } else {
                        this.showNotification(`${result.catName} 被放到了${result.areaName}`, 'info');
                    }
                }
            });
        });

        this.modal.classList.add('active');
    }

    openSelectCatModal(food) {
        const s = this.store.getState();
        this.modalBody.innerHTML = `
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

        this.modalBody.querySelectorAll('.cat-card').forEach(card => {
            card.addEventListener('click', () => {
                const catId = parseInt(card.dataset.catId);
                const success = this.catManager.applyFood(catId, food);
                if (success) this.closeModal();
            });
        });

        this.modal.classList.add('active');
    }

    openServeModal(customer) {
        const unlocked = this.store.getUnlockedMenu();
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
                this.executeServe(customer.id, menuId);
            });
        });

        this.modal.classList.add('active');
    }

    executeServe(customerId, menuId) {
        const result = this.customerManager.serveCustomer(customerId, menuId);
        if (!result) return;

        const { isMatch, finalEarning, reputationChange, message, catInteraction, breakdown } = result;

        if (catInteraction) {
            const interactionArea = document.getElementById('serve-interaction-area');
            if (interactionArea) {
                interactionArea.innerHTML = `
                    <div class="serve-interaction">
                        <span style="font-size:24px;">${catInteraction.cat.emoji}</span>
                        ${catInteraction.text}
                    </div>
                `;
            }
        }

        const resultArea = document.getElementById('serve-result-area');
        if (resultArea) {
            resultArea.innerHTML = `
                <div class="serve-result ${isMatch ? 'match' : 'mismatch'}">
                    <div>${message}</div>
                    <div class="earn">💰 ${finalEarning >= 0 ? '+' : ''}${finalEarning}</div>
                    <div style="font-size:11px;color:#999;margin-top:4px;">
                        ${isMatch ? '✓ 正确匹配' : '✗ 点错了！客人想要 ' + breakdown.customer.order.emoji + ' ' + breakdown.customer.order.name}
                    </div>
                    <div style="font-size:10px;color:#999;margin-top:2px;">
                        基础${breakdown.baseEarning} × 小费x${breakdown.tipMultiplier.toFixed(1)} × ${isMatch ? '匹配x1.0' : '错单x' + breakdown.earningMultiplier}
                        ${breakdown.ingredientLoss ? ' - 浪费食材' + breakdown.ingredientLoss : ''}
                        ${catInteraction ? ' × 互动x1.15' : ''}
                    </div>
                </div>
            `;
        }

        setTimeout(() => {
            this.closeModal();
            const notifType = isMatch ? 'success' : 'error';
            const notifText = isMatch
                ? `招待完成！收入 💰${finalEarning}，声望 +${reputationChange}`
                : `点错单了！收入 💰${finalEarning}，声望 ${reputationChange}`;
            this.showNotification(notifText, notifType);
        }, 1800);
    }
}
