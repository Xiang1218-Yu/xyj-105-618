export class BonusPanelRenderer {
    constructor(store, bonusSystem) {
        this.store = store;
        this.bonusSystem = bonusSystem;
        this.container = document.getElementById('bonus-grid');

        this.store.on('areas:changed', () => this.render());
        this.store.on('cats:changed', () => this.render());
        this.store.on('stats:changed', () => this.render());
        this.store.on('customers:changed', () => this.render());
        this.store.on('state:hydrated', () => this.render());
    }

    render() {
        const bonuses = this.bonusSystem.calculateCafeBonuses();
        const { avgOrder, efficiency } = this.bonusSystem.getEfficiencyStats();

        const items = [
            { icon: '🧲', label: '吸引力', value: bonuses.attract, need: '黏人猫', type: 'cat' },
            { icon: '💰', label: '小费加成', value: bonuses.tip, need: '活泼猫', type: 'cat' },
            { icon: '⏳', label: '客人耐心', value: bonuses.patience, need: '安静猫', type: 'cat' },
            { icon: '✨', label: '稀有客率', value: bonuses.rare, need: '高冷猫', type: 'cat' },
            { icon: '🍰', label: '客单价', value: avgOrder, type: 'stats' },
            { icon: '⚡', label: '服务效率', value: efficiency, type: 'stats' }
        ];

        this.container.innerHTML = items.map(item => {
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
}
