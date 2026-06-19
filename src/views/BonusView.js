import { EVENTS } from '../core/EventBus.js';

export class BonusView {
    constructor(state, bus, bonusCalculator) {
        this.state = state;
        this.bus = bus;
        this.bonus = bonusCalculator;
        this.container = document.getElementById('bonus-grid');
        this.bus.on(EVENTS.BONUS_CHANGED, () => this.render());
        this.bus.on(EVENTS.STATS_CHANGED, () => this.render());
    }

    render() {
        if (!this.container) return;
        const bonuses = this.bonus.calculateCafeBonuses();
        const { avgOrder, efficiency } = this.bonus.getStats();

        const items = [
            { icon: '🧲', label: '吸引力', value: bonuses.attract, need: '黏人猫', type: 'cat' },
            { icon: '💰', label: '小费加成', value: bonuses.tip, need: '活泼猫', type: 'cat' },
            { icon: '⏳', label: '客人耐心', value: bonuses.patience, need: '安静猫', type: 'cat' },
            { icon: '✨', label: '稀有客率', value: bonuses.rare, need: '高冷猫', type: 'cat' },
            { icon: '🍰', label: '客单价', value: avgOrder, type: 'stats' },
            { icon: '⚡', label: '服务效率', value: efficiency, type: 'stats' }
        ];

        this.container.innerHTML = items.map(item => {
            const active = item.value > 0;
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
