const CAT_BREEDS = [
    { id: 1, name: '橘猫', emoji: '🐱', personality: '黏人', preferredArea: 'hall', price: 200, rarity: '普通' },
    { id: 2, name: '狸花猫', emoji: '😺', personality: '活泼', preferredArea: 'hall', price: 250, rarity: '普通' },
    { id: 3, name: '三花猫', emoji: '😸', personality: '安静', preferredArea: 'window', price: 300, rarity: '普通' },
    { id: 4, name: '奶牛猫', emoji: '😹', personality: '活泼', preferredArea: 'hall', price: 280, rarity: '普通' },
    { id: 5, name: '玄猫', emoji: '🐈‍⬛', personality: '高冷', preferredArea: 'shelf', price: 350, rarity: '普通' },
    { id: 6, name: '白猫', emoji: '🐈', personality: '安静', preferredArea: 'window', price: 320, rarity: '普通' },
    { id: 7, name: '英短蓝猫', emoji: '😻', personality: '慵懒', preferredArea: 'window', price: 800, rarity: '稀有' },
    { id: 8, name: '英短银渐层', emoji: '😽', personality: '黏人', preferredArea: 'hall', price: 1000, rarity: '稀有' },
    { id: 9, name: '英短金渐层', emoji: '😼', personality: '安静', preferredArea: 'window', price: 1500, rarity: '稀有' },
    { id: 10, name: '美短虎斑', emoji: '🙀', personality: '活泼', preferredArea: 'hall', price: 900, rarity: '稀有' },
    { id: 11, name: '美短加白', emoji: '😿', personality: '黏人', preferredArea: 'hall', price: 1100, rarity: '稀有' },
    { id: 12, name: '布偶猫', emoji: '😾', personality: '黏人', preferredArea: 'hall', price: 2500, rarity: '珍贵' },
    { id: 13, name: '暹罗猫', emoji: '🐱‍👤', personality: '活泼', preferredArea: 'hall', price: 1200, rarity: '稀有' },
    { id: 14, name: '波斯猫', emoji: '👑', personality: '高冷', preferredArea: 'shelf', price: 2000, rarity: '珍贵' },
    { id: 15, name: '加菲猫', emoji: '😴', personality: '慵懒', preferredArea: 'window', price: 1800, rarity: '稀有' },
    { id: 16, name: '缅因猫', emoji: '🦁', personality: '独立', preferredArea: 'shelf', price: 3000, rarity: '珍贵' },
    { id: 17, name: '斯芬克斯猫', emoji: '🥚', personality: '黏人', preferredArea: 'hall', price: 3500, rarity: '传说' },
    { id: 18, name: '苏格兰折耳', emoji: '🍞', personality: '安静', preferredArea: 'window', price: 2200, rarity: '珍贵' },
    { id: 19, name: '俄罗斯蓝猫', emoji: '💙', personality: '高冷', preferredArea: 'shelf', price: 2800, rarity: '珍贵' },
    { id: 20, name: '孟加拉豹猫', emoji: '🐆', personality: '活泼', preferredArea: 'hall', price: 4000, rarity: '传说' },
    { id: 21, name: '挪威森林猫', emoji: '🌲', personality: '独立', preferredArea: 'shelf', price: 3200, rarity: '珍贵' },
    { id: 22, name: '土耳其梵猫', emoji: '🏊', personality: '活泼', preferredArea: 'hall', price: 3800, rarity: '传说' },
    { id: 23, name: '阿比西尼亚猫', emoji: '🌟', personality: '独立', preferredArea: 'shelf', price: 2500, rarity: '珍贵' },
    { id: 24, name: '缅甸猫', emoji: '🍫', personality: '黏人', preferredArea: 'hall', price: 2000, rarity: '珍贵' },
    { id: 25, name: '伯曼猫', emoji: '✨', personality: '安静', preferredArea: 'window', price: 2600, rarity: '珍贵' },
    { id: 26, name: '夏特尔猫', emoji: '🌙', personality: '高冷', preferredArea: 'shelf', price: 2400, rarity: '珍贵' },
    { id: 27, name: '奥西猫', emoji: '🐾', personality: '活泼', preferredArea: 'hall', price: 3000, rarity: '传说' },
    { id: 28, name: '埃及猫', emoji: '👁️', personality: '独立', preferredArea: 'shelf', price: 4500, rarity: '传说' },
    { id: 29, name: '柯尼斯卷毛', emoji: '🐑', personality: '黏人', preferredArea: 'hall', price: 3500, rarity: '传说' },
    { id: 30, name: '德文卷毛', emoji: '🐩', personality: '活泼', preferredArea: 'hall', price: 4000, rarity: '传说' },
    { id: 31, name: '塞尔凯克卷毛', emoji: '🧸', personality: '安静', preferredArea: 'window', price: 4200, rarity: '传说' },
    { id: 32, name: '日本短尾猫', emoji: '🎌', personality: '活泼', preferredArea: 'hall', price: 2800, rarity: '珍贵' },
    { id: 33, name: '曼基康矮脚', emoji: '🍄', personality: '黏人', preferredArea: 'hall', price: 3000, rarity: '传说' },
    { id: 34, name: '拿破仑猫', emoji: '👑', personality: '慵懒', preferredArea: 'window', price: 3600, rarity: '传说' },
    { id: 35, name: '褴褛猫', emoji: '🧶', personality: '黏人', preferredArea: 'hall', price: 2500, rarity: '珍贵' }
];

const CAT_NAMES = [
    '小橘', '花花', '年糕', '麻薯', '汤圆', '豆沙', '粽子', '月饼', '寿司', '饭团',
    '布丁', '果冻', '奶茶', '咖啡', '可可', '摩卡', '拿铁', '卡布', '芝士', '奶油',
    '雪球', '棉花', '云朵', '毛毛', '绒绒', '暖暖', '阳阳', '月月', '星星', '点点',
    '豆豆', '果果', '糖糖', '蜜蜜', '甜甜', '香香', '臭臭', '胖胖', '瘦瘦', '高高'
];

const CAT_PERSONALITIES = {
    '黏人': {
        description: '喜欢与人亲近，适合放在大厅',
        moodBonus: 'hall',
        moodPenalty: 'shelf',
        cafeBonus: { attract: 15, tip: 0, patience: 0, rare: 0 },
        bonusLabel: '吸引力+15%',
        interaction: '蹭蹭客人的手，客人好感大增'
    },
    '活泼': {
        description: '精力充沛，喜欢热闹的地方',
        moodBonus: 'hall',
        moodPenalty: 'window',
        cafeBonus: { attract: 0, tip: 15, patience: 0, rare: 0 },
        bonusLabel: '小费加成+15%',
        interaction: '表演了一个翻滚，客人给了更多小费'
    },
    '安静': {
        description: '温和安静，适合靠窗的位置',
        moodBonus: 'window',
        moodPenalty: 'hall',
        cafeBonus: { attract: 0, tip: 0, patience: 15, rare: 0 },
        bonusLabel: '客人耐心+15%',
        interaction: '安静地陪伴客人，让客人放松下来'
    },
    '高冷': {
        description: '独立傲娇，喜欢待在高处',
        moodBonus: 'shelf',
        moodPenalty: 'hall',
        cafeBonus: { attract: 0, tip: 0, patience: 0, rare: 15 },
        bonusLabel: '稀有客率+15%',
        interaction: '优雅的姿态吸引了路过的行人进店'
    },
    '慵懒': {
        description: '爱睡觉，喜欢晒太阳',
        moodBonus: 'window',
        moodPenalty: 'hall',
        cafeBonus: { attract: 10, tip: 5, patience: 0, rare: 0 },
        bonusLabel: '吸引力+10% 小费+5%',
        interaction: '慵懒地打着哈欠，路过的客人都被萌化了'
    },
    '独立': {
        description: '有自己的想法，喜欢独处',
        moodBonus: 'shelf',
        moodPenalty: 'hall',
        cafeBonus: { attract: 0, tip: 0, patience: 10, rare: 5 },
        bonusLabel: '客人耐心+10% 稀有客率+5%',
        interaction: '安静地坐在一旁，让客人感到很放松'
    }
};

const MENU_ITEMS = [
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

const CUSTOMER_TYPES = [
    { type: '学生', emoji: '👩‍🎓', patience: 30, tip: 1.0, rarity: 'common' },
    { type: '白领', emoji: '👨‍💼', patience: 20, tip: 1.2, rarity: 'common' },
    { type: '情侣', emoji: '💑', patience: 40, tip: 1.5, rarity: 'common' },
    { type: '老人', emoji: '👵', patience: 50, tip: 0.9, rarity: 'common' },
    { type: '摄影师', emoji: '📸', patience: 35, tip: 1.3, rarity: 'rare' },
    { type: '作家', emoji: '✍️', patience: 60, tip: 1.1, rarity: 'rare' },
    { type: '网红', emoji: '🤳', patience: 25, tip: 2.0, rarity: 'rare' }
];

const SHOP_ITEMS = {
    decor: [
        { id: 'd1', name: '豪华猫爬架', emoji: '🏔️', price: 1000, effect: '猫爬架容量+2' },
        { id: 'd2', name: '观景落地窗', emoji: '🪟', price: 1500, effect: '窗边容量+2' },
        { id: 'd3', name: '舒适沙发区', emoji: '🛋️', price: 1200, effect: '大厅容量+2' },
        { id: 'd4', name: '温馨灯光', emoji: '💡', price: 800, effect: '客人满意度+10%' },
        { id: 'd5', name: '猫咪玩具套装', emoji: '🧸', price: 600, effect: '猫咪心情恢复加速' },
        { id: 'd6', name: '空气净化器', emoji: '🌬️', price: 900, effect: '猫咪健康度+10%' }
    ],
    food: [
        { id: 'f1', name: '猫罐头', emoji: '🥫', price: 50, effect: '好感度+5' },
        { id: 'f2', name: '猫条', emoji: '🥓', price: 30, effect: '好感度+3' },
        { id: 'f3', name: '冻干零食', emoji: '🍖', price: 80, effect: '好感度+8' },
        { id: 'f4', name: '猫薄荷', emoji: '🌿', price: 40, effect: '心情恢复+20' },
        { id: 'f5', name: '豪华猫粮', emoji: '🍗', price: 100, effect: '好感度+10' },
        { id: 'f6', name: '羊奶', emoji: '🥛', price: 60, effect: '好感度+6' }
    ]
};

const CAT_STORIES = {
    1: {
        title: '小巷里的等待',
        content: '小橘曾经是一只在菜市场附近流浪的猫咪。每天它都守在同一个巷口，等待着那个曾经喂过它一次的小女孩。下雨天它会躲在纸箱里，饿了就翻找垃圾桶，但它从未离开那个巷口。直到有一天，你的出现，让它重新感受到了家的温暖。'
    },
    2: {
        title: '屋顶上的冒险家',
        content: '花花是这片街区最勇敢的猫咪。它曾经爬上最高的屋顶，只为追逐一只蝴蝶。从那以后，它爱上了在屋顶漫步的感觉。然而有一次，它从屋顶摔下来，腿受伤了，只能在角落里独自舔舐伤口。幸运的是，你发现了它，给了它一个安全的家。'
    },
    3: {
        title: '纸箱里的三朵花',
        content: '年糕和它的两个兄弟姐妹一起被遗弃在公园的纸箱里。那是一个寒冷的冬天，三只小猫蜷缩在一起取暖。另外两只小猫被好心人领养了，只剩下年糕，因为它的一只眼睛有轻微的残疾。但在你眼里，它是最特别的那一个。'
    },
    4: {
        title: '黑白配的小调皮',
        content: '麻薯因为太调皮被前主人送走了。它喜欢打翻水杯，喜欢在凌晨三点跑酷，喜欢把纸巾撕得满天飞。前主人觉得它太闹腾了，于是把它丢在了路边。但你知道，这些看似调皮的行为，只是它想要被关注的方式。'
    },
    5: {
        title: '黑夜中的精灵',
        content: '玄猫常常被人们误解为带来厄运的象征。因为这个原因，它一次次被领养，又一次次被送回。它开始变得不信任人类，总是躲在角落里观察。直到你出现，你不在乎那些迷信的说法，你只知道它是一只需要被爱的猫咪。'
    },
    6: {
        title: '白雪公主的眼泪',
        content: '雪球曾经是一只被宠爱的家养猫。它的主人是一位老奶奶，每天都抱着它晒太阳。后来老奶奶去世了，家人把雪球丢在了外面。雪白的毛发变得脏乱，但它依然每天坐在老房子门口等待。你经过时，它轻轻地蹭了蹭你的腿，像是在寻求一个新的开始。'
    },
    7: {
        title: '蓝胖子的忧伤',
        content: '这只英短蓝猫被主人买来作为送给女朋友的礼物。然而两人分手后，谁也不愿意继续养它。它被辗转送给了好几户人家，每一次都以为自己找到了家，每一次都失望。它变得越来越沉默，越来越不爱动。直到遇见你，它才重新开始信任人类。'
    },
    8: {
        title: '银色的月光',
        content: '银渐层是从繁殖场救出来的。它的一生都被关在狭小的笼子里，不断地生育。当它再也无法生育时，繁殖场准备把它处理掉。幸运的是，志愿者救下了它。刚到你家时，它甚至不会走路，因为它从来没有在地面上自由行走过。'
    },
    12: {
        title: '布偶的秘密',
        content: '这只布偶猫有着完美的外貌，却被主人丢弃在宠物医院门口。原来它患有先天性的心脏病，需要长期服药。主人不愿意承担治疗费用，选择了放弃。你把它带回了家，虽然医药费很贵，但每天看到它温柔的眼神，你知道一切都是值得的。'
    },
    17: {
        title: '无毛的温暖',
        content: '斯芬克斯猫因为独特的外表，经常被人用异样的眼光看待。它的前主人买它只是为了炫耀，后来新鲜感过了就不再管它。没有毛发的它在冬天特别怕冷，只能蜷缩在暖气旁边。你给它穿上了小衣服，给了它满满的爱。它虽然没有毛，但它的心是温暖的。'
    },
    20: {
        title: '小豹子的归处',
        content: '这只孟加拉豹猫被非法走私贩卖，在运输途中受尽了折磨。被警方解救后，它对人类充满了恐惧。你花了整整三个月的时间，每天静静地坐在它旁边，给它喂食，跟它说话。终于有一天，它主动走到了你身边，把头靠在了你的腿上。'
    },
    33: {
        title: '矮脚猫的大梦想',
        content: '曼基康因为天生的短腿，常常被其他猫咪欺负。它跑不快，跳不高，只能看着其他猫咪在高处玩耍。但它从来没有放弃过，它会用自己的方式探索这个世界。你给了它一个充满爱的家，在这里，它不需要跑得快，不需要跳得高，只需要做一只快乐的小猫咪。'
    }
};

const PERSONALITY_AREAS = {
    hall: ['黏人', '活泼'],
    shelf: ['高冷', '独立'],
    window: ['安静', '慵懒']
};

const CAT_INTERACTIONS = [
    { personality: '黏人', text: '{cat}蹭蹭了{customer}的手，客人好感大增！', bonus: 'tip' },
    { personality: '活泼', text: '{cat}表演了一个翻滚，{customer}给了更多小费！', bonus: 'tip' },
    { personality: '安静', text: '{cat}安静地陪伴{customer}，客人感到很放松', bonus: 'patience' },
    { personality: '高冷', text: '{cat}优雅的姿态吸引了路过的{customer}进店', bonus: 'attract' },
    { personality: '慵懒', text: '{cat}慵懒的样子让{customer}想多待一会，又点了一份', bonus: 'order' },
    { personality: '独立', text: '{cat}聪明地引导{customer}找到座位，服务更高效了', bonus: 'speed' }
];

const SERVE_CONFIG = {
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

const SAVE_KEY = 'cat_cafe_save';
