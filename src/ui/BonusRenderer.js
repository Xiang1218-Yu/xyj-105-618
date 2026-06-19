import { EVENTS } from '../data/constants.js';
import { calculateCafeBonuses } from '../logic/catUtils.js';

export class BonusRenderer {
    constructor(store, bus, scheduler) {
        this.store = store;
        this.scheduler = scheduler;
        this.container = document.getElementById('bonus-grid');

        const refresh = () => this.scheduler.invalidate(this);
        bus.on(EVENTS.AREAS_CHANGED, refresh);
        bus.on(EVENTS.CATS_CHANGED, refresh);
        bus.on(EVENTS.STATS_CHANGED, refresh);
        this.scheduler.invalidate(this);
    }

    render() {
        const state = this.store.getState();
        const bonuses = calculateCafeBonuses(state);
        const avgOrder = state.totalServed > 0
            ? Math.round(state.totalEarnings / state.totalServed)
            : 0;
        const efficiency = (state.totalServed + state.totalAngryLeft) > 0
            ? Math.round(state.totalServed / (state.totalServed + state.totalAngryLeft) * 100)
            : 0;

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
