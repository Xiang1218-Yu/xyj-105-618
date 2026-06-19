import { EVENTS } from '../core/EventBus.js';
import { CAT_PERSONALITIES, PERSONALITY_AREAS } from '../data/catBreeds.js';
import { CAT_STORIES } from '../data/stories.js';
import { AREA_NAMES, GAME_CONFIG } from '../data/config.js';
import { SERVE_CONFIG } from '../data/menu.js';

export class DialogController {
    constructor(state, bus, deps) {
        this.state = state;
        this.bus = bus;
        this.catManager = deps.catManager;
        this.menu = deps.menu;
        this.shop = deps.shop;
        this.customerManager = deps.customerManager;

        this.bus.on('cat:detailRequested', (cat) => this.showCatDetail(cat));
        this.bus.on('area:assignRequested', ({ area, index }) => this.openAssignCatModal(area, index));
        this.bus.on('shop:foodUseRequested', (food) => this._requestUseFood(food));
        this.bus.on('customer:serveRequested', (customer) => this.openServeModal(customer));
        this.bus.on('story:viewRequested', ({ cat, story }) => this.showStory(cat, story));
    }

    _requestUseFood(food) {
        if (!this.shop.requestUseFood(food)) return;
        this.openSelectCatModal(food);
    }

    showCatDetail(cat) {
        const hasStory = !!CAT_STORIES[cat.breedId];
        const storyUnlocked = cat.bond >= 100;
        const personality = CAT_PERSONALITIES[cat.personality];

        const html = `
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

        this.bus.emit(EVENTS.MODAL_OPEN, {
            html,
            onMount: (root) => {
                const updateUI = () => {
                    const bondVal = root.querySelector('#detail-bond-value');
                    const bondFill = root.querySelector('#detail-bond-fill');
                    const moodVal = root.querySelector('#detail-mood-value');
                    const moodFill = root.querySelector('#detail-mood-fill');
                    if (bondVal) bondVal.textContent = Math.floor(cat.bond) + '%';
                    if (bondFill) bondFill.style.width = cat.bond + '%';
                    if (moodVal) moodVal.textContent = Math.floor(cat.mood) + '%';
                    if (moodFill) moodFill.style.width = cat.mood + '%';
                };
                root.querySelector('#pet-btn')?.addEventListener('click', () => {
                    this.catManager.petCat(cat);
                    updateUI();
                });
                root.querySelector('#move-btn')?.addEventListener('click', () => {
                    this.catManager.removeFromArea(cat);
                    this.bus.emit(EVENTS.MODAL_CLOSE);
                    this.bus.emit(EVENTS.NOTIFICATION, { type: 'info', message: `请选择新的位置放置 ${cat.name}` });
                });
                if (hasStory && storyUnlocked) {
                    root.querySelector('#story-btn')?.addEventListener('click', () => {
                        this.showStory(cat, CAT_STORIES[cat.breedId]);
                    });
                }
            }
        });
    }

    openAssignCatModal(area, index) {
        const availableCats = this.catManager.getAvailableCats();
        if (availableCats.length === 0) {
            this.bus.emit(EVENTS.NOTIFICATION, { type: 'info', message: '没有可用的猫咪' });
            return;
        }

        const html = `
            <h2 style="text-align:center;margin-bottom:20px;color:#8B4513;">选择猫咪放到${AREA_NAMES[area]}</h2>
            <p style="text-align:center;color:#999;margin-bottom:20px;">${AREA_NAMES[area]}适合：${PERSONALITY_AREAS[area].join('、')}型猫咪</p>
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

        this.bus.emit(EVENTS.MODAL_OPEN, {
            html,
            onMount: (root) => {
                root.querySelectorAll('.cat-card').forEach(card => {
                    card.addEventListener('click', () => {
                        const catId = Number(card.dataset.catId);
                        const cat = this.state.cats.find(c => c.id === catId);
                        if (!cat) return;
                        this.catManager.assignToArea(area, index, cat);
                        this.bus.emit(EVENTS.MODAL_CLOSE);
                        if (PERSONALITY_AREAS[area].includes(cat.personality)) {
                            this.bus.emit(EVENTS.NOTIFICATION, { type: 'success', message: `${cat.name} 很喜欢这里！` });
                        } else {
                            this.bus.emit(EVENTS.NOTIFICATION, { type: 'info', message: `${cat.name} 被放到了${AREA_NAMES[area]}` });
                        }
                    });
                });
            }
        });
    }

    openSelectCatModal(food) {
        const html = `
            <h2 style="text-align:center;margin-bottom:20px;color:#8B4513;">选择猫咪使用 ${food.name}</h2>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:15px;">
                ${this.state.cats.map(cat => `
                    <div class="cat-card" style="cursor:pointer;" data-cat-id="${cat.id}">
                        <span class="cat-emoji">${cat.emoji}</span>
                        <div class="cat-name">${cat.name}</div>
                        <div class="cat-breed">好感度: ${cat.bond}%</div>
                    </div>
                `).join('')}
            </div>
        `;
        this.bus.emit(EVENTS.MODAL_OPEN, {
            html,
            onMount: (root) => {
                root.querySelectorAll('.cat-card').forEach(card => {
                    card.addEventListener('click', () => {
                        const cat = this.state.cats.find(c => c.id === Number(card.dataset.catId));
                        if (!cat) return;
                        if (this.catManager.applyFood(cat, food)) {
                            this.bus.emit(EVENTS.MODAL_CLOSE);
                        }
                    });
                });
            }
        });
    }

    openServeModal(customer) {
        const unlocked = this.menu.getUnlocked();
        const html = `
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
        this.bus.emit(EVENTS.MODAL_OPEN, {
            html,
            onMount: (root) => {
                root.querySelectorAll('.serve-menu-item').forEach(el => {
                    el.addEventListener('click', () => {
                        const menuId = Number(el.dataset.menuId);
                        const item = this.menu.findById(menuId);
                        if (!item) return;
                        const result = this.customerManager.serveCustomer(customer, item);
                        this._renderServeResult(root, result);
                    });
                });
            }
        });
    }

    _renderServeResult(root, result) {
        const { isMatch, config, interaction, baseEarning, tipMultiplier, finalEarning, menuItem, customer } = result;
        const interactionArea = root.querySelector('#serve-interaction-area');
        const resultArea = root.querySelector('#serve-result-area');
        if (interaction && interactionArea) {
            interactionArea.innerHTML = `
                <div class="serve-interaction">
                    <span style="font-size:24px;">${interaction.cat.emoji}</span>
                    ${interaction.text}
                </div>
            `;
        }
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
                        ${interaction ? ' × 互动x1.15' : ''}
                    </div>
                </div>
            `;
        }
        setTimeout(() => {
            this.bus.emit(EVENTS.MODAL_CLOSE);
            const notifType = isMatch ? 'success' : 'error';
            const notifText = isMatch
                ? `招待完成！收入 💰${finalEarning}，声望 +${config.reputationChange}`
                : `点错单了！收入 💰${finalEarning}，声望 ${config.reputationChange}`;
            this.bus.emit(EVENTS.NOTIFICATION, { type: notifType, message: notifText });
        }, GAME_CONFIG.serveResultDelayMs);
    }

    showStory(cat, story) {
        const html = `
            <div class="story-content-modal">
                <div style="text-align:center;margin-bottom:20px;">
                    <span style="font-size:60px;">${cat.emoji}</span>
                </div>
                <h2>${story.title}</h2>
                <div class="story-text">${story.content}</div>
            </div>
        `;
        this.bus.emit(EVENTS.MODAL_OPEN, { html });
    }
}
