import { CAT_PERSONALITIES, CAT_STORIES } from '../../data.js';

export class CatDetailModal {
    constructor(container, store, managers, hooks) {
        this.container = container;
        this.store = store;
        this.catManager = managers.catManager;
        this.areaManager = managers.areaManager;
        this.hooks = hooks;
    }

    show(cat) {
        const hasStory = !!CAT_STORIES[cat.breedId];
        const storyUnlocked = cat.bond >= 100;
        const personality = CAT_PERSONALITIES[cat.personality];

        this.container.innerHTML = `
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

        this._updateUI = () => {
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

        this.container.querySelector('#pet-btn').addEventListener('click', () => {
            this.catManager.petCat(cat.id);
            this._updateUI();
        });

        this.container.querySelector('#move-btn').addEventListener('click', () => {
            this.areaManager.removeCat(cat.id);
            this.hooks.close();
            this.hooks.notify(`请选择新的位置放置 ${cat.name}`, 'info');
        });

        const storyBtn = this.container.querySelector('#story-btn');
        if (storyBtn) {
            storyBtn.addEventListener('click', () => {
                this.hooks.openStory(cat, CAT_STORIES[cat.breedId]);
            });
        }
    }

    open() {
        this.hooks.open();
    }
}
