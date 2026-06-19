import { EVENTS } from '../core/EventBus.js';
import { CAT_STORIES } from '../data/stories.js';

export class StoryView {
    constructor(state, bus) {
        this.state = state;
        this.bus = bus;
        this.container = document.getElementById('story-list');
        this.bus.on(EVENTS.STORIES_CHANGED, () => this.render());
        this.bus.on(EVENTS.CATS_CHANGED, () => this.render());
        this.bus.on(EVENTS.TAB_CHANGED, (tab) => {
            if (tab === 'story') this.render();
        });
    }

    render() {
        if (!this.container) return;
        this.container.innerHTML = '';
        this.state.cats.forEach(cat => {
            const story = CAT_STORIES[cat.breedId];
            if (!story) return;
            const unlocked = cat.bond >= 100;
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
                item.addEventListener('click', () => this.bus.emit('story:viewRequested', { cat, story }));
            }
            this.container.appendChild(item);
        });
        if (this.container.children.length === 0) {
            this.container.innerHTML = '<p style="color:#999;text-align:center;">收养猫咪后可以解锁它们的故事</p>';
        }
    }
}
