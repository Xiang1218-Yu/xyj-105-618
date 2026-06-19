export class TabController {
    constructor(catsRenderer, storyRenderer) {
        this.catsRenderer = catsRenderer;
        this.storyRenderer = storyRenderer;

        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        document.getElementById('adopt-btn').addEventListener('click', () => {
            this.switchTab('shop');
        });
    }

    switchTab(tabName) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });
        if (tabName === 'cats') this.catsRenderer.render();
        else if (tabName === 'story') this.storyRenderer.render();
    }
}
