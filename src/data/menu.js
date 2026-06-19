export const MENU_ITEMS = [
    { id: 1, name: '美式咖啡', emoji: '☕', price: 28, cost: 8, unlockCost: 0, category: 'coffee' },
    { id: 2, name: '拿铁', emoji: '🥛', price: 35, cost: 12, unlockCost: 0, category: 'coffee' },
    { id: 3, name: '卡布奇诺', emoji: '☁️', price: 38, cost: 14, unlockCost: 100, category: 'coffee' },
    { id: 4, name: '摩卡', emoji: '🍫', price: 42, cost: 16, unlockCost: 150, category: 'coffee' },
    { id: 5, name: '抹茶拿铁', emoji: '🍵', price: 40, cost: 15, unlockCost: 200, category: 'coffee' },
    { id: 6, name: '焦糖玛奇朵', emoji: '🍯', price: 45, cost: 18, unlockCost: 300, category: 'coffee' },
    { id: 7, name: '曲奇饼干', emoji: '🍪', price: 25, cost: 8, unlockCost: 0, category: 'dessert' },
    { id: 8, name: '马卡龙', emoji: '🍬', price: 35, cost: 12, unlockCost: 120, category: 'dessert' },
    { id: 9, name: '芝士蛋糕', emoji: '🧀', price: 42, cost: 18, unlockCost: 180, category: 'dessert' },
    { id: 10, name: '提拉米苏', emoji: '🍰', price: 48, cost: 20, unlockCost: 250, category: 'dessert' },
    { id: 11, name: '草莓蛋糕', emoji: '🍓', price: 52, cost: 22, unlockCost: 350, category: 'dessert' },
    { id: 12, name: '华夫饼', emoji: '🧇', price: 38, cost: 14, unlockCost: 160, category: 'dessert' }
];

export const SERVE_CONFIG = {
    match: {
        earningMultiplier: 1,
        reputationChange: 2,
        countAsServed: true,
        message: '招待成功！'
    },
    mismatch: {
        earningMultiplier: 0,
        reputationChange: -5,
        ingredientCost: 0.5,
        countAsServed: false,
        countAsAngry: true,
        message: '点错单了！客人很不满意，食材也浪费了...'
    }
};
