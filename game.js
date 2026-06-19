class CatCafeGame {
    constructor() {
        this.coins = 500;
        this.reputation = 0;
        this.cats = [];
        this.customers = [];
        this.selectedCat = null;
        this.areaCapacities = { hall: 4, shelf: 3, window: 3 };
        this.areaAssignments = { hall: [], shelf: [], window: [] };
        this.unlockedStories = [];
        this.purchasedDecor = [];
        this.unlockedMenuIds = MENU_ITEMS.filter(m => m.unlockCost === 0).map(m => m.id);
        this.interactionLogs = [];
        this._timers = [];
        this.totalServed = 0;
        this.totalEarnings = 0;
        this.totalAngryLeft = 0;

        if (!this.loadGame()) {
            this.init();
            this.addInitialCat();
        } else {
            this.init();
        }
    }

    init() {
        this.bindEvents();
        this.renderAll();
        this.startGameLoop();
    }

    renderAll() {
        this.renderStats();
        this.renderAreas();
        this.renderMenu();
        this.renderBonusPanel();
        this.renderShop('cats');
        this.renderStories();
        this.renderCustomers();
        this.renderInteractionLog();
    }

    addInitialCat() {
        const randomBreed = CAT_BREEDS[Math.floor(Math.random() * 6)];
        this.adoptCat(randomBreed, true);
    }

    saveGame() {
        const data = {
            coins: this.coins,
            reputation: this.reputation,
            cats: this.cats,
            areaCapacities: this.areaCapacities,
            areaAssignments: this.areaAssignments,
            unlockedStories: this.unlockedStories,
            purchasedDecor: this.purchasedDecor,
            unlockedMenuIds: this.unlockedMenuIds,
            interactionLogs: this.interactionLogs.slice(-50),
            totalServed: this.totalServed,
            totalEarnings: this.totalEarnings,
            totalAngryLeft: this.totalAngryLeft
        };
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(data));
        } catch (e) { /* noop */ }
    }

    loadGame() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return false;
            const data = JSON.parse(raw);
            this.coins = data.coins ?? 500;
            this.reputation = data.reputation ?? 0;
            this.cats = data.cats ?? [];
            this.areaCapacities = data.areaCapacities ?? { hall: 4, shelf: 3, window: 3 };
            this.areaAssignments = data.areaAssignments ?? { hall: [], shelf: [], window: [] };
            this.unlockedStories = data.unlockedStories ?? [];
            this.purchasedDecor = data.purchasedDecor ?? [];
            this.unlockedMenuIds = data.unlockedMenuIds ?? MENU_ITEMS.filter(m => m.unlockCost === 0).map(m => m.id);
            this.interactionLogs = data.interactionLogs ?? [];
            this.totalServed = data.totalServed ?? 0;
            this.totalEarnings = data.totalEarnings ?? 0;
            this.totalAngryLeft = data.totalAngryLeft ?? 0;

            for (const area of Object.keys(this.areaAssignments)) {
                this.areaAssignments[area] = this.areaAssignments[area].map(cat => {
                    if (!cat) return null;
                    const realCat = this.cats.find(c => c.id === cat.id);
                    return realCat || null;
                });
            }

            return this.cats.length > 0;
        } catch (e) {
            return false;
        }
    }

    bindEvents() {
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

        document.getElementById('develop-toggle-btn').addEventListener('click', () => {
            const panel = document.getElementById('develop-panel');
            const visible = panel.style.display !== 'none';
            panel.style.display = visible ? 'none' : 'block';
            if (!visible) this.renderDevelopPanel();
        });

        document.querySelector('.close-btn').addEventListener('click', () => this.closeModal());
        document.getElementById('modal').addEventListener('click', (e) => {
            if (e.target.id === 'modal') this.closeModal();
        });
    }

    switchTab(tabName) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });
        if (tabName === 'cats') this.renderCats();
        else if (tabName === 'story') this.renderStories();
    }

    switchShopTab(shopName) {
        document.querySelectorAll('.shop-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.shop === shopName);
        });
        this.renderShop(shopName);
    }

    renderStats() {
        document.getElementById('coins').textContent = this.coins;
        document.getElementById('reputation').textContent = this.reputation;
        document.getElementById('cat-count').textContent = this.cats.length;
    }

    getUnlockedMenu() {
        return MENU_ITEMS.filter(m => this.unlockedMenuIds.includes(m.id));
    }

    getLockedMenu() {
        return MENU_ITEMS.filter(m => !this.unlockedMenuIds.includes(m.id));
    }

    renderMenu() {
        const container = document.getElementById('menu-list');
        container.innerHTML = '';

        MENU_ITEMS.forEach(item => {
            const unlocked = this.unlockedMenuIds.includes(item.id);
            const el = document.createElement('div');
            el.className = `menu-item ${unlocked ? '' : 'locked'}`;
            el.innerHTML = `
                <span>${item.emoji}</span>
                <div>${item.name}</div>
                <div class="price">${unlocked ? '💰' + item.price : '🔒 未研发'}</div>
            `;
            container.appendChild(el);
        });
    }

    renderDevelopPanel() {
        const container = document.getElementById('develop-list');
        container.innerHTML = '';

        const locked = this.getLockedMenu();
        if (locked.length === 0) {
            container.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#999;font-size:12px;">所有菜品已研发完毕！</p>';
            return;
        }

        locked.forEach(item => {
            const el = document.createElement('div');
            el.className = 'develop-item';
            el.innerHTML = `
                <span>${item.emoji}</span>
                <div class="develop-name">${item.name}</div>
                <div class="develop-cost">研发费用: 💰${item.unlockCost}</div>
                <button class="develop-btn" ${this.coins < item.unlockCost ? 'disabled' : ''}>研发</button>
            `;
            el.querySelector('.develop-btn').addEventListener('click', () => {
                this.developRecipe(item);
            });
            container.appendChild(el);
        });
    }

    developRecipe(item) {
        if (this.coins < item.unlockCost) {
            this.showNotification('金币不足！', 'error');
            return;
        }
        this.coins -= item.unlockCost;
        this.unlockedMenuIds.push(item.id);
        this.renderMenu();
        this.renderDevelopPanel();
        this.renderStats();
        this.saveGame();
        this.showNotification(`成功研发了 ${item.emoji} ${item.name}！`, 'success');
    }

    calculateCafeBonuses() {
        const totals = { attract: 0, tip: 0, patience: 0, rare: 0 };
        for (const [area, cats] of Object.entries(this.areaAssignments)) {
            cats.forEach(cat => {
                if (cat) {
                    const realCat = this.cats.find(c => c.id === cat.id) || cat;
                    const personality = CAT_PERSONALITIES[realCat.personality];
                    if (!personality) return;
                    const mood = this.getCatMood(realCat, area);
                    if (mood >= 70) {
                        const bonus = personality.cafeBonus;
                        if (!bonus) return;
                        for (const key of Object.keys(totals)) {
                            if (typeof bonus[key] === 'number') {
                                totals[key] += bonus[key];
                            }
                        }
                    }
                }
            });
        }
        return totals;
    }

    renderBonusPanel() {
        const container = document.getElementById('bonus-grid');
        const bonuses = this.calculateCafeBonuses();

        const avgOrder = this.totalServed > 0 ? Math.round(this.totalEarnings / this.totalServed) : 0;
        const efficiency = (this.totalServed + this.totalAngryLeft) > 0
            ? Math.round(this.totalServed / (this.totalServed + this.totalAngryLeft) * 100) : 0;

        const items = [
            { icon: '🧲', label: '吸引力', value: bonuses.attract, need: '黏人猫', type: 'cat' },
            { icon: '💰', label: '小费加成', value: bonuses.tip, need: '活泼猫', type: 'cat' },
            { icon: '⏳', label: '客人耐心', value: bonuses.patience, need: '安静猫', type: 'cat' },
            { icon: '✨', label: '稀有客率', value: bonuses.rare, need: '高冷猫', type: 'cat' },
            { icon: '🍰', label: '客单价', value: avgOrder, type: 'stats' },
            { icon: '⚡', label: '服务效率', value: efficiency, type: 'stats' }
        ];

        container.innerHTML = items.map(item => {
            const active = item.type === 'cat' ? item.value > 0 : item.value > 0;
            const valueText = item.type === 'cat'
                ? (item.value > 0 ? '+' + item.value + '%' : '0%')
                : (item.label === '客单价' ? '💰' + item.value : item.value + '%');
            return `
                <div class="bonus-item${active ? ' bonus-active' : ''}">
                    <div class="bonus-icon">${item.icon}</div>
                    <div class="bonus-label">${item.label}</div>
                    <div class="bonus-value">${valueText}</div>
                    ${item.type === 'cat' && item.value === 0 ? '<div class="bonus-hint">需' + item.need + '</div>' : ''}
                    ${item.type === 'stats' ? '<div class="bonus-hint">' + (item.label === '客单价' ? '总收入/招待数' : '成功招待率') + '</div>' : ''}
                </div>
            `;
        }).join('');
    }

    renderAreas() {
        const areas = ['hall', 'shelf', 'window'];
        areas.forEach(area => {
            const container = document.getElementById(`${area}-cats`);
            container.innerHTML = '';
            for (let i = 0; i < this.areaCapacities[area]; i++) {
                const slot = document.createElement('div');
                slot.className = 'cat-slot';
                slot.dataset.area = area;
                slot.dataset.index = i;

                const assignedCat = this.areaAssignments[area][i];
                if (assignedCat) {
                    const cat = this.cats.find(c => c.id === assignedCat.id) || assignedCat;
                    slot.classList.add('occupied');
                    slot.textContent = cat.emoji;

                    const mood = this.getCatMood(cat, area);
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
                    slot.addEventListener('click', () => this.showCatDetail(cat));
                } else {
                    slot.addEventListener('click', () => this.openAssignCatModal(area, i));
                }
                container.appendChild(slot);
            }
        });
    }

    getCatMood(cat, area) {
        const personality = CAT_PERSONALITIES[cat.personality];
        if (personality.moodBonus === area) return 90;
        if (personality.moodPenalty === area) return 40;
        return 70;
    }

    renderCats() {
        const container = document.getElementById('cats-grid');
        container.innerHTML = '';

        if (this.cats.length === 0) {
            container.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#999;padding:40px;">还没有猫咪，去商店收养一只吧！</p>';
            return;
        }

        this.cats.forEach(cat => {
            const card = document.createElement('div');
            card.className = 'cat-card';
            if (this.selectedCat && this.selectedCat.id === cat.id) card.classList.add('selected');
            card.innerHTML = `
                <span class="cat-emoji">${cat.emoji}</span>
                <div class="cat-name">${cat.name}</div>
                <div class="cat-breed">${cat.breed}</div>
                <div class="cat-personality">${cat.personality}</div>
                <div class="bond-bar">
                    <div class="bond-fill" style="width:${cat.bond}%"></div>
                </div>
            `;
            card.addEventListener('click', () => this.showCatDetail(cat));
            container.appendChild(card);
        });
    }

    renderShop(shopType) {
        const container = document.getElementById('shop-content');
        container.innerHTML = '';

        if (shopType === 'cats') {
            CAT_BREEDS.forEach(breed => {
                const owned = this.cats.some(c => c.breedId === breed.id);
                const item = document.createElement('div');
                item.className = 'shop-item';
                if (owned) item.style.opacity = '0.5';
                item.innerHTML = `
                    <div class="shop-item-icon">${breed.emoji}</div>
                    <div class="shop-item-name">${breed.name}</div>
                    <div class="shop-item-desc">${breed.personality} · ${breed.rarity}</div>
                    <div class="shop-item-price">💰 ${breed.price}</div>
                    <button class="buy-btn" ${owned || this.coins < breed.price ? 'disabled' : ''}>${owned ? '已拥有' : '收养'}</button>
                `;
                if (!owned) {
                    item.querySelector('.buy-btn').addEventListener('click', () => this.adoptCat(breed));
                }
                container.appendChild(item);
            });
        } else if (shopType === 'decor') {
            SHOP_ITEMS.decor.forEach(decor => {
                const owned = this.purchasedDecor.includes(decor.id);
                const item = document.createElement('div');
                item.className = 'shop-item';
                if (owned) item.style.opacity = '0.5';
                item.innerHTML = `
                    <div class="shop-item-icon">${decor.emoji}</div>
                    <div class="shop-item-name">${decor.name}</div>
                    <div class="shop-item-desc">${decor.effect}</div>
                    <div class="shop-item-price">💰 ${decor.price}</div>
                    <button class="buy-btn" ${owned || this.coins < decor.price ? 'disabled' : ''}>${owned ? '已购买' : '购买'}</button>
                `;
                if (!owned) {
                    item.querySelector('.buy-btn').addEventListener('click', () => this.buyDecor(decor));
                }
                container.appendChild(item);
            });
        } else if (shopType === 'food') {
            SHOP_ITEMS.food.forEach(food => {
                const item = document.createElement('div');
                item.className = 'shop-item';
                item.innerHTML = `
                    <div class="shop-item-icon">${food.emoji}</div>
                    <div class="shop-item-name">${food.name}</div>
                    <div class="shop-item-desc">${food.effect}</div>
                    <div class="shop-item-price">💰 ${food.price}</div>
                    <button class="buy-btn" ${this.coins < food.price ? 'disabled' : ''}>使用</button>
                `;
                item.querySelector('.buy-btn').addEventListener('click', () => this.useFood(food));
                container.appendChild(item);
            });
        }
    }

    renderStories() {
        const container = document.getElementById('story-list');
        container.innerHTML = '';

        this.cats.forEach(cat => {
            const story = CAT_STORIES[cat.breedId];
            const unlocked = cat.bond >= 100;
            if (story) {
                const item = document.createElement('div');
                item.className = `story-item ${!unlocked ? 'locked' : ''}`;
                item.innerHTML = `
                    <div class="story-header">
                        <span class="story-cat">${cat.emoji}</span>
                        <div>
                            <div class="story-title">${story.title}</div>
                            <div style="font-size:12px;color:#999;">${cat.name}的故事</div>
                        </div>
                        ${!unlocked ? '<span style="margin-left:auto;color:#999;">🔒</span>' : ''}
                    </div>
                    <div class="story-preview">
                        ${unlocked ? story.content.substring(0, 50) + '...' : `好感度达到100%解锁 (当前: ${cat.bond}%)`}
                    </div>
                `;
                if (unlocked) {
                    item.addEventListener('click', () => this.showStory(cat, story));
                }
                container.appendChild(item);
            }
        });

        if (container.children.length === 0) {
            container.innerHTML = '<p style="color:#999;text-align:center;">收养猫咪后可以解锁它们的故事</p>';
        }
    }

    renderInteractionLog() {
        const container = document.getElementById('log-content');
        container.innerHTML = '';
        const recent = this.interactionLogs.slice(-8);
        if (recent.length === 0) {
            container.innerHTML = '<div class="log-entry" style="color:#999;">暂无互动记录</div>';
            return;
        }
        recent.forEach(log => {
            const entry = document.createElement('div');
            entry.className = 'log-entry';
            entry.innerHTML = log;
            container.appendChild(entry);
        });
        container.scrollTop = container.scrollHeight;
    }

    addLog(html) {
        this.interactionLogs.push(html);
        if (this.interactionLogs.length > 50) this.interactionLogs = this.interactionLogs.slice(-50);
        this.renderInteractionLog();
    }

    adoptCat(breed, free = false) {
        if (!free && this.coins < breed.price) {
            this.showNotification('金币不足！', 'error');
            return;
        }
        if (!free) this.coins -= breed.price;

        const usedNames = this.cats.map(c => c.name);
        const availableNames = CAT_NAMES.filter(n => !usedNames.includes(n));
        const name = availableNames[Math.floor(Math.random() * availableNames.length)] || breed.name;

        const cat = {
            id: Date.now(),
            breedId: breed.id,
            name: name,
            breed: breed.name,
            emoji: breed.emoji,
            personality: breed.personality,
            bond: 10,
            mood: 80,
            adoptedAt: new Date().toISOString()
        };

        this.cats.push(cat);
        this.renderStats();
        this.renderCats();
        this.renderShop('cats');
        this.renderBonusPanel();
        this.saveGame();
        this.showNotification(`成功收养了 ${name}！`, 'success');
    }

    buyDecor(decor) {
        if (this.coins < decor.price) {
            this.showNotification('金币不足！', 'error');
            return;
        }
        this.coins -= decor.price;
        this.purchasedDecor.push(decor.id);

        if (decor.id === 'd1') this.areaCapacities.shelf += 2;
        else if (decor.id === 'd2') this.areaCapacities.window += 2;
        else if (decor.id === 'd3') this.areaCapacities.hall += 2;

        this.renderStats();
        this.renderAreas();
        this.renderShop('decor');
        this.saveGame();
        this.showNotification(`购买了 ${decor.name}！`, 'success');
    }

    useFood(food) {
        if (this.cats.length === 0) {
            this.showNotification('还没有猫咪！', 'error');
            return;
        }
        if (this.coins < food.price) {
            this.showNotification('金币不足！', 'error');
            return;
        }
        this.openSelectCatModal(food);
    }

    applyFoodToCat(cat, food) {
        this.coins -= food.price;

        const bondMatch = food.effect.match(/好感度\+(\d+)/);
        const moodMatch = food.effect.match(/心情恢复\+(\d+)/);

        if (bondMatch) {
            cat.bond = Math.min(100, cat.bond + parseInt(bondMatch[1]));
            this.checkStoryUnlock(cat);
        }
        if (moodMatch) {
            cat.mood = Math.min(100, cat.mood + parseInt(moodMatch[1]));
        }

        this.closeModal();
        this.renderStats();
        this.renderCats();
        this.renderStories();
        this.renderBonusPanel();
        this.saveGame();
        this.showNotification(`${food.name} 已给 ${cat.name} 使用！`, 'success');
    }

    checkStoryUnlock(cat) {
        if (cat.bond >= 100 && !this.unlockedStories.includes(cat.breedId) && CAT_STORIES[cat.breedId]) {
            this.unlockedStories.push(cat.breedId);
            this.showNotification(`${cat.name} 的故事已解锁！`, 'success');
        }
    }

    openSelectCatModal(food) {
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = `
            <h2 style="text-align:center;margin-bottom:20px;color:#8B4513;">选择猫咪使用 ${food.name}</h2>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:15px;">
                ${this.cats.map(cat => `
                    <div class="cat-card" style="cursor:pointer;" data-cat-id="${cat.id}">
                        <span class="cat-emoji">${cat.emoji}</span>
                        <div class="cat-name">${cat.name}</div>
                        <div class="cat-breed">好感度: ${cat.bond}%</div>
                    </div>
                `).join('')}
            </div>
        `;

        modalBody.querySelectorAll('.cat-card').forEach(card => {
            card.addEventListener('click', () => {
                const cat = this.cats.find(c => c.id === parseInt(card.dataset.catId));
                if (cat) this.applyFoodToCat(cat, food);
            });
        });

        document.getElementById('modal').classList.add('active');
    }

    openAssignCatModal(area, index) {
        const availableCats = this.cats.filter(cat => {
            for (const assignments of Object.values(this.areaAssignments)) {
                if (assignments.some(c => c && c.id === cat.id)) return false;
            }
            return true;
        });

        if (availableCats.length === 0) {
            this.showNotification('没有可用的猫咪', 'info');
            return;
        }

        const areaNames = { hall: '大厅', shelf: '猫爬架', window: '窗边' };
        const modalBody = document.getElementById('modal-body');

        modalBody.innerHTML = `
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

        modalBody.querySelectorAll('.cat-card').forEach(card => {
            card.addEventListener('click', () => {
                const cat = this.cats.find(c => c.id === parseInt(card.dataset.catId));
                if (!cat) return;

                this.areaAssignments[area][index] = cat;
                cat.bond = Math.min(100, cat.bond + 2);

                this.closeModal();
                this.renderAreas();
                this.renderCats();
                this.renderBonusPanel();
                this.saveGame();

                if (PERSONALITY_AREAS[area].includes(cat.personality)) {
                    this.showNotification(`${cat.name} 很喜欢这里！`, 'success');
                } else {
                    this.showNotification(`${cat.name} 被放到了${areaNames[area]}`, 'info');
                }
            });
        });

        document.getElementById('modal').classList.add('active');
    }

    showCatDetail(cat) {
        const modalBody = document.getElementById('modal-body');
        const hasStory = CAT_STORIES[cat.breedId];
        const storyUnlocked = cat.bond >= 100;
        const personality = CAT_PERSONALITIES[cat.personality];

        modalBody.innerHTML = `
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

        modalBody.querySelector('#pet-btn').addEventListener('click', () => {
            cat.bond = Math.min(100, cat.bond + 1);
            cat.mood = Math.min(100, cat.mood + 5);
            this.checkStoryUnlock(cat);
            updateDetailUI();
            this.renderCats();
            this.renderStories();
            this.renderBonusPanel();
            this.saveGame();
            this.showNotification(`你抚摸了 ${cat.name}，它看起来很开心！`, 'success');
        });

        modalBody.querySelector('#move-btn').addEventListener('click', () => {
            this.removeCatFromArea(cat);
            this.closeModal();
            this.showNotification(`请选择新的位置放置 ${cat.name}`, 'info');
        });

        if (hasStory && storyUnlocked) {
            modalBody.querySelector('#story-btn').addEventListener('click', () => {
                this.showStory(cat, CAT_STORIES[cat.breedId]);
            });
        }

        document.getElementById('modal').classList.add('active');
    }

    removeCatFromArea(cat) {
        for (const area of Object.keys(this.areaAssignments)) {
            const index = this.areaAssignments[area].findIndex(c => c && c.id === cat.id);
            if (index !== -1) this.areaAssignments[area][index] = null;
        }
        this.renderAreas();
        this.renderBonusPanel();
        this.saveGame();
    }

    showStory(cat, story) {
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = `
            <div class="story-content-modal">
                <div style="text-align:center;margin-bottom:20px;">
                    <span style="font-size:60px;">${cat.emoji}</span>
                </div>
                <h2>${story.title}</h2>
                <div class="story-text">${story.content}</div>
            </div>
        `;
        document.getElementById('modal').classList.add('active');
    }

    closeModal() {
        document.getElementById('modal').classList.remove('active');
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification show ${type}`;
        setTimeout(() => notification.classList.remove('show'), 3000);
    }

    startGameLoop() {
        this._timers.forEach(t => clearInterval(t));
        this._timers = [];

        this._timers.push(setInterval(() => this.spawnCustomer(), 8000));
        this._timers.push(setInterval(() => this.updateCatMoods(), 15000));
        setTimeout(() => this.spawnCustomer(), 2000);
    }

    spawnCustomer() {
        if (this.customers.length >= 5) return;

        const unlocked = this.getUnlockedMenu();
        if (unlocked.length === 0) return;

        const bonuses = this.calculateCafeBonuses();

        let pool;
        if (bonuses.rare > 0 && Math.random() * 100 < bonuses.rare) {
            pool = CUSTOMER_TYPES.filter(c => c.rarity === 'rare');
        } else {
            pool = CUSTOMER_TYPES.filter(c => c.rarity === 'common');
        }
        if (pool.length === 0) pool = CUSTOMER_TYPES;

        const customerType = pool[Math.floor(Math.random() * pool.length)];
        const menuItem = unlocked[Math.floor(Math.random() * unlocked.length)];

        const patienceBonus = 1 + bonuses.patience / 100;
        const maxWait = Math.floor(customerType.patience * patienceBonus);

        const customer = {
            id: Date.now() + Math.random(),
            type: customerType.type,
            emoji: customerType.emoji,
            tip: customerType.tip,
            order: { ...menuItem },
            waitTime: 0,
            maxWait: maxWait
        };

        this.customers.push(customer);
        this.renderCustomers();
    }

    renderCustomers() {
        const container = document.getElementById('customers-list');
        container.innerHTML = '';

        if (this.customers.length === 0) {
            container.innerHTML = '<p style="color:#999;text-align:center;padding:20px;">暂无客人</p>';
            return;
        }

        this.customers.forEach(customer => {
            const remaining = Math.max(0, customer.maxWait - customer.waitTime);
            const waitPercent = (customer.waitTime / customer.maxWait) * 100;

            const el = document.createElement('div');
            el.className = 'customer';
            el.innerHTML = `
                <span class="customer-avatar">${customer.emoji}</span>
                <div class="customer-info">
                    <div class="customer-type">${customer.type}</div>
                    <div class="customer-order">想点 ${customer.order.emoji} ${customer.order.name}</div>
                </div>
                <span class="customer-timer ${waitPercent > 70 ? 'urgent' : ''}">${remaining}s</span>
                <button class="serve-customer-btn" data-customer-id="${customer.id}">招待</button>
            `;

            el.querySelector('.serve-customer-btn').addEventListener('click', () => {
                this.openServeModal(customer);
            });

            container.appendChild(el);
        });
    }

    openServeModal(customer) {
        const unlocked = this.getUnlockedMenu();
        const modalBody = document.getElementById('modal-body');

        modalBody.innerHTML = `
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

        modalBody.querySelectorAll('.serve-menu-item').forEach(el => {
            el.addEventListener('click', () => {
                const menuId = parseInt(el.dataset.menuId);
                const selectedItem = MENU_ITEMS.find(m => m.id === menuId);
                if (selectedItem) this.executeServe(customer, selectedItem);
            });
        });

        document.getElementById('modal').classList.add('active');
    }

    executeServe(customer, menuItem) {
        const bonuses = this.calculateCafeBonuses();
        const tipBonus = 1 + bonuses.tip / 100;

        const isMatch = customer.order && customer.order.id === menuItem.id;
        const config = isMatch ? SERVE_CONFIG.match : SERVE_CONFIG.mismatch;

        let catInteraction = null;
        let interactingCat = null;
        const activeCats = [];
        for (const [area, cats] of Object.entries(this.areaAssignments)) {
            cats.forEach(cat => {
                if (cat) {
                    const realCat = this.cats.find(c => c.id === cat.id) || cat;
                    activeCats.push(realCat);
                }
            });
        }

        if (activeCats.length > 0 && Math.random() < 0.6) {
            interactingCat = activeCats[Math.floor(Math.random() * activeCats.length)];
            const personality = CAT_PERSONALITIES[interactingCat.personality];
            if (personality) {
                const interactionText = (personality.interaction || '和客人互动了一下')
                    .replace('{cat}', interactingCat.name)
                    .replace('{customer}', customer.type);
                catInteraction = {
                    cat: interactingCat,
                    text: interactionText,
                    bonusType: Object.keys(personality.cafeBonus || {}).find(k => personality.cafeBonus[k] > 0)
                };
            }
        }

        const baseEarning = menuItem.price - menuItem.cost;
        const tipMultiplier = customer.tip * tipBonus;
        let finalEarning = Math.floor(baseEarning * tipMultiplier * config.earningMultiplier);
        if (config.ingredientCost) {
            const lostCost = Math.floor(menuItem.cost * config.ingredientCost);
            finalEarning -= lostCost;
        }

        if (catInteraction) {
            finalEarning = Math.floor(finalEarning * 1.15);
            interactingCat.bond = Math.min(100, interactingCat.bond + 1);
            this.checkStoryUnlock(interactingCat);

            const interactionArea = document.getElementById('serve-interaction-area');
            if (interactionArea) {
                interactionArea.innerHTML = `
                    <div class="serve-interaction">
                        <span style="font-size:24px;">${interactingCat.emoji}</span>
                        ${catInteraction.text}
                    </div>
                `;
            }

            this.addLog(`<span class="log-cat">${interactingCat.emoji} ${interactingCat.name}</span> ${catInteraction.text} <span class="log-bonus">收入+15%</span>`);
        }

        this.coins += finalEarning;
        this.reputation = Math.max(0, this.reputation + config.reputationChange);

        if (config.countAsServed) {
            this.totalServed += 1;
            this.totalEarnings += finalEarning;
        }
        if (config.countAsAngry) {
            this.totalAngryLeft += 1;
        }

        const idx = this.customers.findIndex(c => c.id === customer.id);
        if (idx !== -1) this.customers.splice(idx, 1);

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

        this.renderStats();
        this.renderCustomers();
        this.renderCats();
        this.renderBonusPanel();
        this.saveGame();

        setTimeout(() => {
            this.closeModal();
            const notifType = isMatch ? 'success' : 'error';
            const notifText = isMatch
                ? `招待完成！收入 💰${finalEarning}，声望 +${config.reputationChange}`
                : `点错单了！收入 💰${finalEarning}，声望 ${config.reputationChange}`;
            this.showNotification(notifText, notifType);
        }, 1800);
    }

    updateCatMoods() {
        for (const [area, cats] of Object.entries(this.areaAssignments)) {
            cats.forEach(cat => {
                if (cat) {
                    const realCat = this.cats.find(c => c.id === cat.id) || cat;
                    const mood = this.getCatMood(realCat, area);
                    if (mood < 50) {
                        realCat.mood = Math.max(0, realCat.mood - 5);
                    } else {
                        realCat.bond = Math.min(100, realCat.bond + 0.5);
                    }
                }
            });
        }

        this.customers.forEach(customer => {
            customer.waitTime += 15;
            if (customer.waitTime >= customer.maxWait) customer.leftAngry = true;
        });

        const angryCustomers = this.customers.filter(c => c.leftAngry);
        if (angryCustomers.length > 0) {
            this.totalAngryLeft += angryCustomers.length;
            this.customers = this.customers.filter(c => !c.leftAngry);
            this.reputation = Math.max(0, this.reputation - angryCustomers.length * 5);
            this.showNotification(`${angryCustomers.length} 位客人等不及离开了...`, 'error');
        }

        this.renderAreas();
        this.renderCustomers();
        this.renderBonusPanel();
        this.renderStats();
        this.saveGame();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CatCafeGame();
});
