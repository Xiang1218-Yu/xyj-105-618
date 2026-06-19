import { PERSONALITY_AREAS, AREA_NAMES, CAT_STORIES, CAT_PERSONALITIES, EVENTS } from '../data/constants.js';

export class ModalUI {
    constructor(store, bus) {
        this.store = store;
        this.bus = bus;
        this.modal = document.getElementById('modal');
        this.body = document.getElementById('modal-body');
        this._handlers = {};

        document.querySelector('.close-btn').addEventListener('click', () => this.close());
        this.modal.addEventListener('click', (e) => {
            if (e.target.id === 'modal') this.close();
        });
    }

    setHandlers(handlers) {
        this._handlers = { ...this._handlers, ...handlers };
    }

    open() {
        this.modal.classList.add('active');
        this.bus.emit(EVENTS.MODAL_OPEN);
    }

    close() {
        this.modal.classList.remove('active');
        this.bus.emit(EVENTS.MODAL_CLOSE);
    }

    showCatDetail(cat) {
        const hasStory = !!CAT_STORIES[cat.breedId];
        const storyUnlocked = cat.bond >= 100;
        const personality = CAT_PERSONALITIES[cat.personality];

        this.body.innerHTML = `
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

        const refreshDetail = () => {
            const fresh = this.store.findCatById(cat.id);
            if (!fresh) return;
            const bv = document.getElementById('detail-bond-value');
            const bf = document.getElementById('detail-bond-fill');
            const mv = document.getElementById('detail-mood-value');
            const mf = document.getElementById('detail-mood-fill');
            if (bv) bv.textContent = Math.floor(fresh.bond) + '%';
            if (bf) bf.style.width = fresh.bond + '%';
            if (mv) mv.textContent = Math.floor(fresh.mood) + '%';
            if (mf) mf.style.width = fresh.mood + '%';
        };

        this.body.querySelector('#pet-btn').addEventListener('click', () => {
            if (this._handlers.onPet) this._handlers.onPet(cat);
            refreshDetail();
        });

        this.body.querySelector('#move-btn').addEventListener('click', () => {
            if (this._handlers.onMoveCat) this._handlers.onMoveCat(cat);
            this.close();
        });

        if (hasStory && storyUnlocked) {
            this.body.querySelector('#story-btn').addEventListener('click', () => {
                this.showStory(cat, CAT_STORIES[cat.breedId]);
            });
        }

        this.open();
    }

    openAssignCatModal(area, index) {
        const availableCats = this.store.getAvailableCats();

        if (availableCats.length === 0) {
            this.bus.emit(EVENTS.NOTIFICATION, { message: '没有可用的猫咪', type: 'info' });
            return;
        }

        this.body.innerHTML = `
            <h2 style="text-align:center;margin-bottom:20px;color:#8B4513;">选择猫咪放到${AREA_NAMES[area]}</h2>
            <p style="text-align:center;color:#999;margin-bottom:20px;">${AREA_NAMES[area]}适合：${PERSONALITY_AREAS[area].join('、')}型猫咪</p>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:15px;">
                ${availableCats.map(c => {
                    const isMatch = PERSONALITY_AREAS[area].includes(c.personality);
                    return `
                        <div class="cat-card" style="cursor:pointer;${isMatch ? 'border-color:#98D8C8;' : ''}" data-cat-id="${c.id}">
                            <span class="cat-emoji">${c.emoji}</span>
                            <div class="cat-name">${c.name}</div>
                            <div class="cat-personality">${c.personality}</div>
                            ${isMatch ? '<div style="font-size:12px;color:#98D8C8;margin-top:5px;">✓ 适合此处</div>' : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        this.body.querySelectorAll('.cat-card').forEach(card => {
            card.addEventListener('click', () => {
                const c = this.store.findCatById(parseInt(card.dataset.catId));
                if (c && this._handlers.onAssignCat) {
                    this._handlers.onAssignCat(c, area, index);
                    this.close();
                }
            });
        });

        this.open();
    }

    openSelectCatModal(food) {
        const state = this.store.getState();
        this.body.innerHTML = `
            <h2 style="text-align:center;margin-bottom:20px;color:#8B4513;">选择猫咪使用 ${food.name}</h2>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:15px;">
                ${state.cats.map(c => `
                    <div class="cat-card" style="cursor:pointer;" data-cat-id="${c.id}">
                        <span class="cat-emoji">${c.emoji}</span>
                        <div class="cat-name">${c.name}</div>
                        <div class="cat-breed">好感度: ${Math.floor(c.bond)}%</div>
                    </div>
                `).join('')}
            </div>
        `;

        this.body.querySelectorAll('.cat-card').forEach(card => {
            card.addEventListener('click', () => {
                const c = this.store.findCatById(parseInt(card.dataset.catId));
                if (c && this._handlers.onUseFood) {
                    this._handlers.onUseFood(c, food);
                    this.close();
                }
            });
        });

        this.open();
    }

    openServeModal(customer) {
        const unlocked = this.store.getUnlockedMenu();

        this.body.innerHTML = `
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

        this.body.querySelectorAll('.serve-menu-item').forEach(el => {
            el.addEventListener('click', () => {
                const menuId = parseInt(el.dataset.menuId);
                const selectedItem = unlocked.find(m => m.id === menuId);
                if (selectedItem && this._handlers.onServe) {
                    const result = this._handlers.onServe(customer, selectedItem);
                    if (result) this.renderServeResult(result);
                }
            });
        });

        this.open();
    }

    renderServeResult(result) {
        const { finalEarning, baseEarning, tipMultiplier, menuItem, catInteraction, config, isMatch, customer } = result;

        if (catInteraction) {
            const ia = document.getElementById('serve-interaction-area');
            if (ia) {
                ia.innerHTML = `
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
                    <div>${config.message}</div>
                    <div class="earn">💰 ${finalEarning >= 0 ? '+' : ''}${finalEarning}</div>
                    <div style="font-size:11px;color:#999;margin-top:4px;">
                        ${isMatch ? '✓ 正确匹配' : '✗ 点错了！客人想要 ' + customer.order.emoji + ' ' + customer.order.name}
                    </div>
                    <div style="font-size:10px;color:#999;margin-top:2px;">
                        基础${baseEarning} × 小费x${tipMultiplier.toFixed(1)} × ${isMatch ? '匹配x1.0' : '错单x' + config.earningMultiplier}
                        ${config.ingredientCost ? ' - 浪费食材' + Math.floor(menuItem.cost * config.ingredientCost) : ''}
                        ${catInteraction ? ' × 互动x1.15' : ''}
                    </div>
                </div>
            `;
        }

        setTimeout(() => this.close(), 1800);
    }

    showStory(cat, story) {
        this.body.innerHTML = `
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
