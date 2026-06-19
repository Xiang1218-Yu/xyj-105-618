import { CAT_STORIES } from '../../data.js';

export class StoryRenderer {
    constructor(state, onStoryClick) {
        this.state = state;
        this.onStoryClick = onStoryClick;
        this.container = document.getElementById('story-list');
    }

    render() {
        this.container.innerHTML = '';

        this.state.cats.forEach(cat => {
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
                        ${unlocked ? story.content.substring(0, 50) + '...' : `好感度达到100%解锁 (当前: ${Math.floor(cat.bond)}%)`}
                    </div>
                `;
                if (unlocked) {
                    item.addEventListener('click', () => this.onStoryClick(cat, story));
                }
                this.container.appendChild(item);
            }
        });

        if (this.container.children.length === 0) {
            this.container.innerHTML = '<p style="color:#999;text-align:center;">收养猫咪后可以解锁它们的故事</p>';
        }
    }
}
