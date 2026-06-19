export class StoryModal {
    constructor(container, hooks) {
        this.container = container;
        this.hooks = hooks;
    }

    show(cat, story) {
        this.container.innerHTML = `
            <div class="story-content-modal">
                <div style="text-align:center;margin-bottom:20px;">
                    <span style="font-size:60px;">${cat.emoji}</span>
                </div>
                <h2>${story.title}</h2>
                <div class="story-text">${story.content}</div>
            </div>
        `;
        this.hooks.open();
    }
}
