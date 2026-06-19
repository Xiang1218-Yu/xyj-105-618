export class BonusRenderer {
    constructor(state) {
        this.state = state;
        this.container = document.getElementById('bonus-grid');
    }

    render() {
        const bonuses = this.state.calculateBonuses();
        const avgOrder = this.state.totalServed > 0
            ? Math.round(this.state.totalEarnings / this.state.totalServed)
            : 0;
        const efficiency = (this.state.totalServed + this.state.totalAngryLeft) > 0
            ? Math.round(this.state.totalServed / (this.state.totalServed + this.state.totalAngryLeft) * 100)
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
