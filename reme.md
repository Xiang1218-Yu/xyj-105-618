# 🐱 喵星人咖啡屋 - 项目扩展与工程化建议

---

## 一、可扩展功能模块（从0到1开发）

> 以下模块均为**全新独立功能**，不依赖现有模块，彼此之间也无依赖关系，均可独立开发上线。

---

### 1. 🏆 成就系统

**功能描述**：一套完整的成就追踪与展示系统，玩家完成特定目标后解锁成就徽章，获得金币/声望奖励。

**交互设计**：
- 导航栏新增「🏅 成就」Tab 页
- 成就按类别分组展示：收集类（收养N只猫）、经营类（累计赚取N金币）、社交类（抚摸N次）、探索类（解锁N个故事）
- 每个成就有未完成/已完成/已领取三种状态，已完成可点击领取奖励
- 解锁成就时弹出全屏庆祝动画（星星粒子 + 徽章放大展示）
- 成就总览面板显示完成进度百分比

**数据模型**：
```js
const ACHIEVEMENTS = [
  { id: 'a1', category: 'collect', title: '初来乍到', desc: '收养第一只猫咪', icon: '🐾', condition: { type: 'catCount', value: 1 }, reward: { coins: 100 } },
  { id: 'a2', category: 'collect', title: '猫咪大家庭', desc: '收养10只猫咪', icon: '🏠', condition: { type: 'catCount', value: 10 }, reward: { coins: 500, reputation: 20 } },
  { id: 'a3', category: 'business', title: '小有积蓄', desc: '累计赚取5000金币', icon: '💰', condition: { type: 'totalEarnings', value: 5000 }, reward: { coins: 200 } },
  { id: 'a4', category: 'social', title: '温柔之手', desc: '累计抚摸猫咪50次', icon: '🤚', condition: { type: 'totalPets', value: 50 }, reward: { coins: 150 } },
  { id: 'a5', category: 'explore', title: '故事收藏家', desc: '解锁5个猫咪故事', icon: '📖', condition: { type: 'storiesUnlocked', value: 5 }, reward: { coins: 300 } },
];
```

---

### 2. 🎰 幸运转盘抽奖

**功能描述**：消耗金币转动转盘，随机获得道具奖励的独立抽奖系统。

**交互设计**：
- 导航栏新增「🎰 转盘」Tab 页
- 中央展示圆形转盘，6-8个扇形奖格，用CSS/SVG绘制
- 点击「旋转」按钮，转盘以缓出动画旋转3-5圈后停在随机位置
- 奖格内容：金币包（100/500/1000）、稀有猫咪体验券、零食大礼包、装饰折扣券、声望加成卡、谢谢参与
- 每次消耗 200 金币，每日前3次半价
- 中奖后弹出奖励展示弹窗 + 特效

**数据模型**：
```js
const WHEEL_ITEMS = [
  { id: 'w1', name: '金币x100', emoji: '💰', weight: 30, type: 'coins', value: 100 },
  { id: 'w2', name: '金币x500', emoji: '💎', weight: 10, type: 'coins', value: 500 },
  { id: 'w3', name: '零食大礼包', emoji: '🎁', weight: 15, type: 'foodBundle', value: ['f1','f2','f3'] },
  { id: 'w4', name: '声望加成卡', emoji: '⭐', weight: 10, type: 'reputationBoost', value: 50 },
  { id: 'w5', name: '装饰折扣券', emoji: '🏷️', weight: 15, type: 'discount', value: 0.5 },
  { id: 'w6', name: '稀有猫咪体验', emoji: '🌟', weight: 5, type: 'rareCatTrial', value: 7 },
  { id: 'w7', name: '金币x1000', emoji: '👑', weight: 3, type: 'coins', value: 1000 },
  { id: 'w8', name: '谢谢参与', emoji: '😊', weight: 12, type: 'none', value: 0 },
];
```

---

### 3. 🎨 猫咪换装系统

**功能描述**：为猫咪穿戴帽子、围巾、眼镜等配饰的纯外观定制系统，不改变猫咪任何属性数值。

**交互设计**：
- 猫咪详情弹窗新增「👒 换装」按钮
- 打开换装面板，左侧猫咪预览图（emoji + CSS叠加装饰），右侧配饰列表
- 配饰分类：帽子类🎩、围巾类🧣、眼镜类👓、项圈类📿
- 点击配饰即时预览叠加效果，确认后保存
- 配饰通过金币购买解锁，在商店新增「🧢 配饰」子Tab
- 已佩戴配饰的猫咪在区域格子中以CSS伪元素显示小装饰

**数据模型**：
```js
const CAT_ACCESSORIES = [
  { id: 'acc1', name: '小皇冠', emoji: '👑', category: 'hat', price: 500 },
  { id: 'acc2', name: '红围巾', emoji: '🧣', category: 'scarf', price: 300 },
  { id: 'acc3', name: '圆框眼镜', emoji: '👓', category: 'glasses', price: 400 },
  { id: 'acc4', name: '铃铛项圈', emoji: '🔔', category: 'collar', price: 350 },
  { id: 'acc5', name: '蝴蝶结', emoji: '🎀', category: 'hat', price: 200 },
  { id: 'acc6', name: '魔法帽', emoji: '🧙', category: 'hat', price: 800 },
];
// cat.accessories = { hat: 'acc1', scarf: null, glasses: 'acc3', collar: 'acc4' }
```

---

### 4. 🧩 猫咪拼图小游戏

**功能描述**：以猫咪emoji为主题的经典滑块拼图小游戏，独立休闲玩法。

**交互设计**：
- 导航栏新增「🧩 游戏」Tab 页
- 提供3x3 / 4x4 / 5x5三种难度选择
- 拼图使用猫咪emoji网格，随机打乱后玩家点击相邻空格的方块滑动
- 计时器 + 步数统计，完成后展示成绩
- 每日挑战模式：每日固定一个打乱序列，排行榜记录最佳成绩
- 完成拼图可获得少量金币奖励（3x3奖励20金币，4x4奖励50，5x5奖励100）

**数据模型**：
```js
const PUZZLE_CONFIG = {
  sizes: [
    { size: 3, reward: 20, label: '简单 3×3' },
    { size: 4, reward: 50, label: '普通 4×4' },
    { size: 5, reward: 100, label: '困难 5×5' },
  ],
  emojis: ['🐱','😺','😸','😹','😻','😼','😽','🙀','😿','😾'],
};
// game state: { board: [[...]], emptyPos: {r,c}, moves: 0, startTime: timestamp }
```

---

### 5. 🎵 猫咪音乐盒

**功能描述**：猫咪演奏不同乐器的混音创作工具，每只猫咪对应一种乐器音色，点击排列组合创作旋律。

**交互设计**：
- 导航栏新增「🎵 音乐」Tab 页
- 顶部是4拍x8小节的音序网格，每行对应一只已收养的猫咪
- 每只猫咪绑定一种乐器（钢琴🎹、吉他🎸、鼓🥁、铃铛🔔、小提琴🎻、笛子🎺）
- 点击网格格子激活/取消该拍位的音符
- 点击播放按钮，按节拍依次播放激活的音符（使用Web Audio API合成音色）
- 可调节BPM速度，可保存/加载旋律方案
- 纯创作工具，无数值奖励

**数据模型**：
```js
const INSTRUMENTS = [
  { id: 'piano', name: '钢琴', emoji: '🎹', frequency: [261,293,329,349,392,440,494,523] },
  { id: 'guitar', name: '吉他', emoji: '🎸', frequency: [196,220,246,261,293,329,349,392] },
  { id: 'drum', name: '鼓', emoji: '🥁', frequency: [100,120,150,100,120,150,100,120] },
];
// melody state: { bpm: 120, grid: [[false,true,...], ...], instruments: ['piano','guitar',...] }
```

---

### 6. 📸 猫咪拍照相册

**功能描述**：捕捉猫咪在不同状态下的照片，建立专属相册收集系统。

**交互设计**：
- 导航栏新增「📸 相册」Tab 页
- 猫咪在区域中随机触发特殊状态（打哈欠🥱、伸懒腰🐱、玩毛线🧶、打盹😴、看窗外🌅、舔爪子🐾）
- 特殊状态出现时，猫咪上方显示相机图标📸，3秒内点击即可「拍照」
- 拍照后弹出快门动画 + 照片卡牌（猫咪emoji + 状态描述 + 时间戳）
- 相册按猫咪分类，每只猫咪有独立的照片墙
- 收集全某只猫的所有状态照片可解锁「完美写真」称号
- 照片卡牌可点击查看大图 + 生成分享文案

**数据模型**：
```js
const CAT_POSES = [
  { id: 'yawn', name: '打哈欠', emoji: '🥱', description: '{cat}正打着大大的哈欠' },
  { id: 'stretch', name: '伸懒腰', emoji: '🙆', description: '{cat}优雅地伸了个懒腰' },
  { id: 'play', name: '玩毛线', emoji: '🧶', description: '{cat}正专注地追逐毛线球' },
  { id: 'sleep', name: '打盹', emoji: '😴', description: '{cat}蜷成一团沉沉睡去' },
  { id: 'window', name: '看窗外', emoji: '🌅', description: '{cat}静静望着窗外的风景' },
  { id: 'lick', name: '舔爪子', emoji: '🐾', description: '{cat}正在认真地舔着爪子' },
];
// photo: { catId, pose, timestamp, caption }
```

---

### 7. 🎲 猫咪大冒险棋盘

**功能描述**：以猫咪为主角的回合制棋盘冒险游戏，掷骰子前进，触发随机事件。

**交互设计**：
- 导航栏新增「🎲 冒险」Tab 页
- 横向滚动的棋盘地图，30个格子，包含：金币格💰、事件格⚡、休息格🏠、商店格🏪、宝箱格🎁、陷阱格💀
- 玩家选择一只已收养的猫咪作为角色，点击掷骰子（1-6点，带3D翻转动画）
- 事件格触发随机事件文字弹窗 + 效果（获得/失去金币、前进/后退N格）
- 到达终点获得大量金币奖励
- 每次冒险消耗1张冒险券（每8小时自动恢复1张）

**数据模型**：
```js
const BOARD_CELLS = [
  { pos: 0, type: 'start', icon: '🏠', label: '起点' },
  { pos: 1, type: 'coin', icon: '💰', value: 50 },
  { pos: 2, type: 'event', icon: '⚡', pool: 'adventure' },
  { pos: 3, type: 'chest', icon: '🎁', rewards: [{type:'coins',value:200},{type:'food',value:'f3'}] },
  { pos: 4, type: 'trap', icon: '💀', effect: { type: 'moveBack', value: 2 } },
];
const ADVENTURE_EVENTS = [
  { id: 'e1', text: '猫咪发现了一枚闪亮的硬币！', effect: { type: 'coins', value: 80 } },
  { id: 'e2', text: '一只野猫挡住了去路，绕路走丢了些金币', effect: { type: 'coins', value: -30 } },
];
```

---

### 8. 🃏 猫咪卡牌对战

**功能描述**：以猫咪品种为基础的回合制卡牌对战游戏，组建卡组与AI对手对战。

**交互设计**：
- 导航栏新增「🃏 对战」Tab 页
- 每只已收养的猫咪自动生成一张卡牌，属性基于品种稀有度和性格
- 卡牌属性：攻击力⚔️、防御力🛡️、速度⚡、特殊技能✨
- 3v3回合制对战：玩家选3张卡出战，AI随机选3张
- 每回合双方各出一张卡，比较速度决定先手，交替攻击直到一方HP归零
- 胜利获得金币 + 对战积分，积分可兑换专属卡背
- 对战不消耗任何现有资源，独立循环

**数据模型**：
```js
// card derived from cat
function generateCard(cat) {
  const rarityBase = { '普通': 10, '稀有': 20, '珍贵': 35, '传说': 50 };
  const personalityBonus = { '黏人': {hp:10}, '活泼': {atk:5}, '安静': {def:5}, '高冷': {spd:5}, '慵懒': {hp:15}, '独立': {atk:3,def:3} };
  return {
    catId: cat.id, name: cat.name, emoji: cat.emoji,
    hp: 50 + rarityBase[catRarity] + (personalityBonus[cat.personality].hp || 0),
    atk: 10 + Math.floor(rarityBase[catRarity] / 3) + (personalityBonus[cat.personality].atk || 0),
    def: 5 + Math.floor(rarityBase[catRarity] / 5) + (personalityBonus[cat.personality].def || 0),
    spd: 5 + Math.floor(rarityBase[catRarity] / 4) + (personalityBonus[cat.personality].spd || 0),
    skill: SKILLS[cat.personality],
  };
}
```

---

### 9. 🌙 昼夜循环与天气系统

**功能描述**：游戏内实时昼夜交替与天气变化，纯视觉氛围系统，不同时段/天气下店铺背景和猫咪行为有视觉差异。

**交互设计**：
- 根据玩家本地时间自动切换昼夜：早晨🌅、白天☀️、傍晚🌇、夜晚🌙
- 天气每2小时随机切换：晴天☀️、多云⛅、雨天🌧️、雪天❄️
- 猫咖背景渐变色随时段变化（早晨暖橙、白天明亮、傍晚紫红、夜晚深蓝）
- 雨天窗边区域显示雨滴CSS动画，雪天显示飘雪粒子
- 夜晚猫咪emoji变为睡眠状态😴，窗边区域猫咪表情变化
- 右上角显示当前时段图标和天气图标
- 纯视觉系统，不影响任何数值计算

**数据模型**：
```js
const TIME_PERIODS = [
  { id: 'morning', range: [6,10], icon: '🌅', bg: 'linear-gradient(135deg,#FFECD2,#FCB69F)' },
  { id: 'day', range: [10,17], icon: '☀️', bg: 'linear-gradient(135deg,#FFF5E6,#FFE4E1)' },
  { id: 'evening', range: [17,20], icon: '🌇', bg: 'linear-gradient(135deg,#E8CAC8,#C4878B)' },
  { id: 'night', range: [20,6], icon: '🌙', bg: 'linear-gradient(135deg,#2C3E50,#4A6741)' },
];
const WEATHER_TYPES = [
  { id: 'sunny', name: '晴天', icon: '☀️', particle: null },
  { id: 'cloudy', name: '多云', icon: '⛅', particle: null },
  { id: 'rainy', name: '雨天', icon: '🌧️', particle: 'rain' },
  { id: 'snowy', name: '雪天', icon: '❄️', particle: 'snow' },
];
```

---

### 10. 📮 猫咪信箱

**功能描述**：猫咪之间互相写信的趣味互动系统，玩家可以阅读和回复猫咪的信件。

**交互设计**：
- 导航栏新增「📮 信箱」Tab 页
- 每30分钟随机一只猫咪「写」一封信，信箱图标显示未读数量红点
- 信件内容基于猫咪性格生成模板化文字（黏人猫写撒娇信、高冷猫写傲娇信）
- 信件格式：猫咪头像 + 称呼 + 正文 + 落款，风格各异
- 玩家可从3个预设回复中选择一个回信，猫咪收到回复后好感度微增
- 信箱按时间线展示，支持删除和收藏
- 收藏的信件可以在故事Tab中回顾

**数据模型**：
```js
const LETTER_TEMPLATES = {
  '黏人': [
    { greeting: '亲爱的主人~', body: '今天你还没有摸摸我呢，我等了好久好久...可以来抱抱我吗？🥺', closing: '永远黏着你的' },
    { greeting: '主人主人！', body: '我今天在窗边看到一只蝴蝶，好想和你一起看！下次我们一起看好不好？', closing: '最最最黏人的' },
  ],
  '高冷': [
    { greeting: '哼。', body: '我不是想你了，只是猫粮不够了。顺便说一句，今天的阳光不错。就这样。', closing: '并不想念你的' },
  ],
};
// letter: { from: catId, to: 'player'|catId, template, reply, timestamp, starred }
```

---

### 11. 🎬 猫咪剧场

**功能描述**：编排猫咪出演短剧的互动娱乐系统，玩家选择演员和剧本，观看猫咪演绎故事。

**交互设计**：
- 导航栏新增「🎬 剧场」Tab 页
- 预设多个剧本模板（侦探剧🔍、爱情剧💕、冒险剧⚔️、喜剧🎭）
- 玩家从已收养猫咪中为每个角色选角（主角、配角、反派）
- 选角完成后点击「开演」，进入全屏剧场模式
- 舞台展示：猫咪emoji按剧本顺序出场，对话气泡逐字显示
- 演出结束后显示谢幕动画 + 演员表
- 每个剧本首次演出奖励金币，重复演出无奖励但可换角重看

**数据模型**：
```js
const PLAY_SCRIPTS = [
  {
    id: 'p1', title: '猫探长与失踪的鱼干', genre: '侦探', roles: ['探长','助手','嫌疑人'],
    scenes: [
      { speaker: 0, line: '这起鱼干失踪案，一定有内鬼！' },
      { speaker: 1, line: '探长，我发现了一个重要线索！' },
      { speaker: 2, line: '我...我不是故意的...' },
      { speaker: 0, line: '案子破了！原来是你在偷吃！' },
    ]
  },
];
// performance: { scriptId, cast: [catId, catId, catId], performedAt, firstTime: bool }
```

---

### 12. 🗺️ 猫咖街区地图探索

**功能描述**：围绕猫咖的街区地图探索系统，点击不同建筑触发偶遇事件。

**交互设计**：
- 导航栏新增「🗺️ 街区」Tab 页
- 2D俯瞰式街区地图，中央是猫咖，周围分布：公园🌳、集市🎪、河边🌊、巷口🚪、屋顶🏙️
- 点击建筑进入探索，3秒加载动画后触发随机事件
- 公园：偶遇流浪猫（可收养限定品种）/ 集市：买到打折零食 / 河边：猫咪钓鱼小游戏 / 巷口：发现金币 / 屋顶：猫咪冒险事件
- 每个建筑有冷却时间（5分钟），冷却中显示灰色不可点击
- 探索产出的道具进入独立背包，可在猫咖中使用

**数据模型**：
```js
const MAP_LOCATIONS = [
  { id: 'park', name: '街心公园', icon: '🌳', cooldown: 300, events: ['stray_cat','bird_chase','flower_find'] },
  { id: 'market', name: '周末集市', icon: '🎪', cooldown: 300, events: ['discount_food','rare_item','lucky_draw'] },
  { id: 'riverside', name: '河边小路', icon: '🌊', cooldown: 300, events: ['fishing','treasure','cat_swim'] },
  { id: 'alley', name: '小巷深处', icon: '🚪', cooldown: 300, events: ['coin_find','stray_cat2','mystery_box'] },
  { id: 'rooftop', name: '屋顶天台', icon: '🏙️', cooldown: 300, events: ['cat_adventure','stargazing','roof_treasure'] },
];
```

---

## 二、可迭代功能模块（在已有功能上开发）

> 以下模块均在**现有功能基础上**增强迭代，彼此独立，互不依赖。

---

### 1. 客人评价与回头客系统

**迭代基础**：现有 `customers` 客人系统（[spawnCustomer](file:///Users/tog/Desktop/code/solo/xyj-105/xyj-105-1/game.js#L744-L778)）

**新增功能**：
- 招待客人后，客人给出1-5星评价，评价基于：等待时间、猫咪互动、菜品匹配度
- 评价以星级 + 文字评语弹窗展示
- 5星评价的客人有概率成为「回头客」，回头客下次光临时自带偏好（点名要某只猫/某道菜）
- 头部Stats区新增「⭐ 均评」显示当前平均评分
- 回头客的emoji旁显示💎标记，招待回头客收入x1.5

**数据变更**：
```js
// customer新增字段
{ rating: 4, review: '猫咪好可爱，但等太久了~', isRegular: false }
// game新增字段
this.avgRating = 5.0;
this.regularCustomers = []; // [{type, preferredCat, preferredMenu}]
```

---

### 2. 猫咪技能升级树

**迭代基础**：现有 `CAT_PERSONALITIES` 性格系统（[CAT_PERSONALITIES](file:///Users/tog/Desktop/code/solo/xyj-105/xyj-105-1/data.js#L46-L95)）

**新增功能**：
- 猫咪详情弹窗新增「🌳 技能」Tab
- 每种性格有独立的3级技能树，消耗金币升级
- 升级后增强该性格的cafeBonus数值（15%→20%→30%）
- 技能树可视化展示：节点连线图，已解锁节点亮色，未解锁灰色
- 每个节点显示：技能名、效果描述、升级费用

**数据变更**：
```js
// cat新增字段
{ skillLevel: { main: 0 } } // 0=基础, 1=进阶, 2=大师
// 技能树配置
const SKILL_TREES = {
  '黏人': [
    { level: 1, name: '甜言蜜语', cost: 500, bonus: { attract: 20 } },
    { level: 2, name: '万人迷', cost: 1500, bonus: { attract: 30 } },
  ],
};
```

---

### 3. 菜品套餐组合系统

**迭代基础**：现有 `MENU_ITEMS` 菜单系统（[MENU_ITEMS](file:///Users/tog/Desktop/code/solo/xyj-105/xyj-105-1/data.js#L97-L110)）

**新增功能**：
- 菜单区新增「🍱 套餐」子Tab
- 预设套餐配方：咖啡+甜点组合，必须两种都已研发才能解锁
- 套餐售价低于单点总和，但利润率更高（鼓励玩家研发全品类）
- 招待时客人有概率点套餐，套餐上菜动画展示组合盘
- 套餐示例：☕拿铁+🍪曲奇 = 「经典下午茶」原价60→套餐价50

**数据变更**：
```js
const COMBO_MEALS = [
  { id: 'c1', name: '经典下午茶', items: [2,7], originalPrice: 60, comboPrice: 50, emoji: '🫖' },
  { id: 'c2', name: '甜蜜时光', items: [4,9], originalPrice: 84, comboPrice: 70, emoji: '🍯' },
  { id: 'c3', name: '抹茶物语', items: [5,10], originalPrice: 88, comboPrice: 72, emoji: '🍵' },
];
```

---

### 4. 区域随机事件系统

**迭代基础**：现有 `areaAssignments` 区域系统（[renderAreas](file:///Users/tog/Desktop/code/solo/xyj-105/xyj-105-1/game.js#L255-L291)）

**新增功能**：
- 每个区域每60秒有概率触发随机事件
- 事件以区域上方浮动的气泡提示显示，5秒内点击可参与
- 大厅事件：猫咪打翻水杯💦（花钱清理/不管）、猫咪撒娇吸引路人😻（额外客人）
- 猫爬架事件：猫咪打架😾（移走一只/买零食安抚）、猫咪叠罗汉🎪（声望+5）
- 窗边事件：窗外小鸟🐦（猫咪心情+10）、下雨了🌧️（猫咪回室内/留在窗边掉心情）
- 每个选择有不同结果，增加策略性

**数据变更**：
```js
const AREA_EVENTS = {
  hall: [
    { id: 'h1', name: '水杯大作战', emoji: '💦', choices: [
      { text: '花钱清理', cost: 30, result: '干净整洁，客人更满意', effect: { reputation: 3 } },
      { text: '不管它', cost: 0, result: '客人差点滑倒...', effect: { reputation: -2 } },
    ]},
  ],
};
```

---

### 5. 声望等级与里程碑奖励

**迭代基础**：现有 `reputation` 声望数值（[renderStats](file:///Users/tog/Desktop/code/solo/xyj-105/xyj-105-1/game.js#L137-L141)）

**新增功能**：
- 头部声望显示改为进度条 + 等级名称
- 每100声望升1级，等级名称：新手上路→小有名气→口碑载道→远近闻名→传奇猫咖
- 升级时全屏等级提升动画 + 里程碑奖励弹窗
- 奖励内容：金币、解锁新区域主题色、解锁新客人类型
- 声望等级面板在Stats区域点击可展开查看详情

**数据变更**：
```js
const REP_LEVELS = [
  { level: 1, name: '新手上路', minRep: 0, icon: '🌱', reward: { coins: 0 } },
  { level: 2, name: '小有名气', minRep: 100, icon: '🌿', reward: { coins: 300 } },
  { level: 3, name: '口碑载道', minRep: 300, icon: '🌳', reward: { coins: 800, unlockTheme: 'garden' } },
  { level: 4, name: '远近闻名', minRep: 600, icon: '🏰', reward: { coins: 2000, unlockCustomer: '美食家' } },
  { level: 5, name: '传奇猫咖', minRep: 1000, icon: '👑', reward: { coins: 5000, unlockTheme: 'royal' } },
];
```

---

### 6. 猫咪成长与年龄阶段

**迭代基础**：现有猫咪属性系统 `adoptedAt`（[adoptCat](file:///Users/tog/Desktop/code/solo/xyj-105/xyj-105-1/game.js#L442-L472)）

**新增功能**：
- 基于领养时间计算猫咪年龄，分为4个阶段：幼年🍼（0-3天）、青年⚡（3-7天）、成年🌟（7-30天）、长老🧓（30天+）
- 不同阶段猫咪emoji旁显示阶段图标
- 幼年猫：cafeBonus减半，但成长速度x2（好感度提升更快）
- 青年猫：cafeBonus正常，偶尔触发活力事件
- 成年猫：cafeBonus +10%，收入加成最高
- 长老猫：cafeBonus正常，但解锁长老专属互动（讲故事给其他猫听）
- 猫咪详情卡显示当前阶段和预计下阶段升级时间

**数据变更**：
```js
const AGE_STAGES = [
  { id: 'kitten', name: '幼年', icon: '🍼', daysRequired: 0, bonusMult: 0.5, bondGainMult: 2.0 },
  { id: 'young', name: '青年', icon: '⚡', daysRequired: 3, bonusMult: 1.0, bondGainMult: 1.0 },
  { id: 'adult', name: '成年', icon: '🌟', daysRequired: 7, bonusMult: 1.1, bondGainMult: 1.0 },
  { id: 'elder', name: '长老', icon: '🧓', daysRequired: 30, bonusMult: 1.0, bondGainMult: 0.8 },
];
```

---

### 7. 菜品烹饪迷你游戏

**迭代基础**：现有招待系统 `openServeModal`（[openServeModal](file:///Users/tog/Desktop/code/solo/xyj-105/xyj-105-1/game.js#L813-L847)）

**新增功能**：
- 选择菜品招待客人后，不再直接结算，而是进入烹饪小游戏
- 咖啡类：进度条来回移动，点击在绿色区域停下=完美，偏离=普通/失败
- 甜点类：依次点击出现的食材图标，按顺序点对=完美
- 结果影响：完美=收入x1.5 + 客人必5星，普通=正常收入，失败=收入x0.6 + 客人可能差评
- 可选择「跳过烹饪」直接以普通结果结算
- 烹饪结果以动画展示（完美=🎉金色特效，失败=💨灰烟）

**数据变更**：
```js
const COOKING_GAMES = {
  coffee: { type: 'timing', speed: 1.5, perfectZone: [40,60], goodZone: [25,75] },
  dessert: { type: 'sequence', itemCount: 4, timeLimit: 5 },
};
// serve结果新增字段
{ cookResult: 'perfect'|'good'|'fail', cookBonus: 1.5|1.0|0.6 }
```

---

### 8. 猫咪亲密度对话系统

**迭代基础**：现有猫咪抚摸互动 `showCatDetail`（[showCatDetail](file:///Users/tog/Desktop/code/solo/xyj-105/xyj-105-1/game.js#L619-L698)）

**新增功能**：
- 猫咪详情弹窗新增「💬 对话」按钮
- 基于好感度等级解锁不同深度的对话内容
- 好感度0-30：冷淡对话（单句回应）
- 好感度30-60：友好对话（多轮对话，2-3个话题）
- 好感度60-90：亲密对话（分享秘密，触发隐藏剧情线索）
- 好感度90-100：心灵对话（猫咪内心独白，深度背景故事片段）
- 对话以聊天气泡形式展示，玩家从2-3个回应选项中选择
- 每只猫每天限对话3次，每次好感度+2

**数据变更**：
```js
const DIALOGUE_TREES = {
  '黏人': {
    low: [{ cat: '嗯？', options: ['摸摸头','打招呼'], next: [...] }],
    mid: [{ cat: '主人今天也来了~我最喜欢你了！', options: ['我也喜欢你','今天过得好吗'], next: [...] }],
    high: [{ cat: '其实...我以前很害怕被丢掉的。但现在有你在，我不怕了。', options: ['永远不会','我会保护你'], next: [...] }],
  },
};
```

---

### 9. 装饰可视化摆放

**迭代基础**：现有商店装饰系统 `buyDecor`（[buyDecor](file:///Users/tog/Desktop/code/solo/xyj-105/xyj-105-1/game.js#L474-L491)）

**新增功能**：
- 购买的装饰不再只是被动数值加成，而是可以在猫咖区域中拖拽摆放
- 猫咖Tab左上角新增「🛋️ 装饰」按钮，点击进入编辑模式
- 编辑模式下，底部显示已购买的装饰列表，可拖拽到区域中任意位置
- 装饰以小emoji图标显示在区域中，猫咪会与附近装饰互动（坐在沙发上🛋️、玩玩具🧸）
- 装饰放置位置影响区域视觉效果评分，视觉评分高的区域吸引更多客人
- 保存摆放方案，退出编辑模式后生效

**数据变更**：
```js
// decor新增字段
{ placed: false, position: { x: 0, y: 0 }, area: 'hall' }
// game新增字段
this.decorPlacements = []; // [{decorId, area, x, y}]
```

---

### 10. 猫咪心情日记

**迭代基础**：现有猫咪心情系统 `getCatMood`（[getCatMood](file:///Users/tog/Desktop/code/solo/xyj-105/xyj-105-1/game.js#L293-L298)）

**新增功能**：
- 猫咪详情弹窗新增「📓 日记」Tab
- 每次猫咪心情发生显著变化时自动记录一条日记（心情>80记录开心事件，心情<50记录不开心事件）
- 日记内容基于性格+心情+区域生成模板化文字
- 黏人猫开心日记：「今天主人又摸摸我了，好幸福~想一直黏着主人！」
- 高冷猫不开心日记：「被放在了吵闹的大厅，很烦躁。想回到安静的架子上。」
- 日记按时间线展示，支持翻页查看历史记录
- 连续7天心情>80的猫咪获得「快乐猫猫」标签

**数据变更**：
```js
// cat新增字段
{ diary: [
  { date: '2026-06-03', mood: 90, area: 'window', text: '在窗边晒太阳，舒服极了~', type: 'happy' },
  { date: '2026-06-02', mood: 40, area: 'hall', text: '太吵了，不太喜欢这里...', type: 'sad' },
]}
```

---

## 三、代码理解建议

---

### 建议1：建立核心数据流心智模型

**现状问题**：

当前 [CatCafeGame](file:///Users/tog/Desktop/code/solo/xyj-105/xyj-105-1/game.js#L1-L971) 是一个970行的单体类，所有状态、逻辑、渲染混在一起。新开发者阅读时难以快速建立对系统整体运作的理解。

**建议做法**：

绘制一张核心数据流图，标注数据的**流向和变更触发点**：

```
┌─────────── 数据源头 ───────────┐
│                                 │
│  data.js (常量配置)             │
│  ├── CAT_BREEDS                │
│  ├── CAT_PERSONALITIES         │
│  ├── MENU_ITEMS                │
│  ├── CUSTOMER_TYPES            │
│  ├── SHOP_ITEMS                │
│  └── CAT_STORIES               │
│                                 │
└──────────────┬──────────────────┘
               │ 读取
               ▼
┌─────────── 游戏状态 ───────────┐
│                                 │
│  this.coins ◄─── adoptCat()    │
│              ◄─── buyDecor()   │
│              ◄─── executeServe()│
│              ◄─── developRecipe│
│                                 │
│  this.cats[] ◄─── adoptCat()   │
│               ◄─── applyFood() │
│               ◄─── updateMood()│
│                                 │
│  this.areaAssignments           │
│              ◄─── assignCat()  │
│              ◄─── removeCat()  │
│                                 │
│  this.customers[] ◄── spawn()  │
│                   ◄── serve()  │
│                   ◄── timeout()│
│                                 │
└──────────────┬──────────────────┘
               │ 变更后
               ▼
┌─────────── 渲染输出 ───────────┐
│  renderStats()                  │
│  renderAreas()                  │
│  renderCats()                   │
│  renderCustomers()              │
│  renderMenu()                   │
│  renderBonusPanel()             │
│  renderStories()                │
│  renderShop()                   │
└─────────────────────────────────┘
```

将此图以注释形式写入 `game.js` 顶部，帮助后续开发者快速理解「哪些方法会修改哪些状态，哪些状态变更需要触发哪些渲染」。

---

### 建议2：标注方法职责分类

**现状问题**：

[CatCafeGame](file:///Users/tog/Desktop/code/solo/xyj-105/xyj-105-1/game.js#L1-L971) 中的方法混合了三种职责——状态查询、业务逻辑、DOM渲染，但方法命名没有区分，阅读时需要逐个打开才能判断用途。

**建议做法**：

对每个方法用注释标注其职责类型，并按类型分组排列：

| 职责类型 | 标记 | 方法列表 |
|----------|------|----------|
| 状态查询 | `[Q]` | `getUnlockedMenu`, `getLockedMenu`, `getCatMood`, `calculateCafeBonuses` |
| 业务逻辑 | `[B]` | `adoptCat`, `buyDecor`, `applyFoodToCat`, `developRecipe`, `executeServe`, `removeCatFromArea`, `checkStoryUnlock`, `spawnCustomer`, `updateCatMoods` |
| DOM渲染 | `[R]` | `renderStats`, `renderAreas`, `renderCats`, `renderCustomers`, `renderMenu`, `renderBonusPanel`, `renderStories`, `renderShop`, `renderInteractionLog` |
| UI交互 | `[U]` | `switchTab`, `switchShopTab`, `showCatDetail`, `openAssignCatModal`, `openServeModal`, `openSelectCatModal`, `showStory`, `showNotification`, `closeModal` |
| 生命周期 | `[L]` | `constructor`, `init`, `startGameLoop`, `saveGame`, `loadGame` |

示例：
```js
// [Q] 状态查询 - 计算当前所有区域的店铺加成总和
calculateCafeBonuses() { ... }

// [B] 业务逻辑 - 收养一只新猫咪
adoptCat(breed, free = false) { ... }

// [R] DOM渲染 - 渲染区域中的猫咪格子
renderAreas() { ... }
```

---

## 四、代码重构建议

---

### 建议1：拆分单体类为子管理器

**现状问题**：

[CatCafeGame](file:///Users/tog/Desktop/code/solo/xyj-105/xyj-105-1/game.js#L1-L971) 承担了所有职责，970行代码耦合在一个类中。任何一个功能的修改都可能意外影响其他功能，且难以独立测试。

**建议做法**：

按职责域拆分为4个子管理器，主类只做协调：

```js
class CatManager {
  constructor(game) { this.game = game; }
  adopt(breed, free) { ... }
  removeCatFromArea(cat) { ... }
  getCatMood(cat, area) { ... }
  updateCatMoods() { ... }
}

class CustomerManager {
  constructor(game) { this.game = game; }
  spawn() { ... }
  serve(customer, menuItem) { ... }
  updateWaitTimes() { ... }
}

class ShopManager {
  constructor(game) { this.game = game; }
  adoptCat(breed) { ... }
  buyDecor(decor) { ... }
  useFood(food, cat) { ... }
  developRecipe(item) { ... }
}

class UIRenderer {
  constructor(game) { this.game = game; }
  renderAll() { ... }
  renderStats() { ... }
  renderAreas() { ... }
  // ... 所有render和modal方法
}

class CatCafeGame {
  constructor() {
    this.state = { coins: 500, reputation: 0, cats: [], ... };
    this.catMgr = new CatManager(this);
    this.customerMgr = new CustomerManager(this);
    this.shopMgr = new ShopManager(this);
    this.ui = new UIRenderer(this);
  }
}
```

**收益**：每个管理器可独立理解和修改，主类缩减到100行以内，职责边界清晰。

---

### 建议2：将渲染逻辑与业务逻辑分离

**现状问题**：

当前业务方法中大量混杂DOM操作。以 [adoptCat](file:///Users/tog/Desktop/code/solo/xyj-105/xyj-105-1/game.js#L442-L472) 为例，它既包含「扣金币→创建猫→添加到列表」的业务逻辑，又包含「renderStats→renderCats→renderShop→renderBonusPanel」的渲染调用。

**建议做法**：

引入简单的事件驱动模式，业务层只发事件，渲染层订阅事件：

```js
class EventBus {
  constructor() { this._listeners = {}; }
  on(event, fn) { (this._listeners[event] ||= []).push(fn); }
  emit(event, data) { (this._listeners[event] || []).forEach(fn => fn(data)); }
}

// 业务层 - 只做逻辑，不碰DOM
adoptCat(breed, free = false) {
  // ... 业务逻辑 ...
  this.cats.push(cat);
  this.bus.emit('cat:adopted', { cat });
  this.bus.emit('coins:changed', { value: this.coins });
}

// 渲染层 - 订阅事件，只做DOM
this.bus.on('cat:adopted', () => {
  this.renderCats();
  this.renderBonusPanel();
});
this.bus.on('coins:changed', () => {
  this.renderStats();
});
```

**收益**：业务方法变得纯粹可测试，渲染逻辑集中管理，新增功能时只需订阅已有事件即可接入UI。

---

### 建议3：提取HTML模板为独立模板函数

**现状问题**：

当前大量HTML字符串直接写在JS方法体内，以模板字符串形式存在，阅读和维护困难。例如 [renderShop](file:///Users/tog/Desktop/code/solo/xyj-105/xyj-105-1/game.js#L327-L382) 中有3段几乎相同的商品卡片HTML。

**建议做法**：

抽取通用模板函数，消除重复：

```js
const templates = {
  shopItem(data) {
    return `
      <div class="shop-item" ${data.owned ? 'style="opacity:0.5"' : ''}>
        <div class="shop-item-icon">${data.emoji}</div>
        <div class="shop-item-name">${data.name}</div>
        <div class="shop-item-desc">${data.desc}</div>
        <div class="shop-item-price">💰 ${data.price}</div>
        <button class="buy-btn" ${data.disabled ? 'disabled' : ''}>${data.btnText}</button>
      </div>
    `;
  },
  catCard(cat, options = {}) {
    return `
      <div class="cat-card" data-cat-id="${cat.id}" ${options.extraStyle || ''}>
        <span class="cat-emoji">${cat.emoji}</span>
        <div class="cat-name">${cat.name}</div>
        ${options.showBond ? `<div class="cat-breed">好感度: ${cat.bond}%</div>` : ''}
        ${options.showPersonality ? `<div class="cat-personality">${cat.personality}</div>` : ''}
      </div>
    `;
  },
};
```

**收益**：模板复用减少重复代码，修改样式只需改一处，模板可独立测试输出正确性。

---

## 五、代码测试建议

---

### 建议1：为核心计算逻辑编写单元测试

**现状问题**：

项目当前零测试。核心计算逻辑如 [calculateCafeBonuses](file:///Users/tog/Desktop/code/solo/xyj-105/xyj-105-1/game.js#L208-L230)、[getCatMood](file:///Users/tog/Desktop/code/solo/xyj-105/xyj-105-1/game.js#L293-L298)、[executeServe](file:///Users/tog/Desktop/code/solo/xyj-105/xyj-105-1/game.js#L849-L936) 中的收入计算都包含多条件分支，手动验证容易遗漏边界情况。

**建议做法**：

使用 Jest 编写单元测试，将纯计算函数从类中提取出来单独测试：

```js
// 提取纯函数
function calculateEarning(menuItem, customer, bonuses, hasCatInteraction) {
  const baseEarning = menuItem.price - menuItem.cost;
  const tipMultiplier = customer.tip * (1 + bonuses.tip / 100);
  const orderMultiplier = 1 + bonuses.order / 100;
  const speedMultiplier = 1 + bonuses.speed / 100;
  let earning = Math.floor(baseEarning * tipMultiplier * orderMultiplier * speedMultiplier);
  if (hasCatInteraction) earning = Math.floor(earning * 1.15);
  return earning;
}

// 测试文件
describe('calculateEarning', () => {
  test('基础收入计算', () => {
    const menu = { price: 35, cost: 12 };
    const customer = { tip: 1.0 };
    const bonuses = { tip: 0, order: 0, speed: 0 };
    expect(calculateEarning(menu, customer, bonuses, false)).toBe(23);
  });

  test('猫咪互动加成15%', () => {
    const menu = { price: 35, cost: 12 };
    const customer = { tip: 1.0 };
    const bonuses = { tip: 0, order: 0, speed: 0 };
    expect(calculateEarning(menu, customer, bonuses, true)).toBe(26); // 23 * 1.15 = 26.45 → 26
  });

  test('小费+订单加成叠加', () => {
    const menu = { price: 42, cost: 16 };
    const customer = { tip: 1.5 };
    const bonuses = { tip: 15, order: 15, speed: 0 };
    const expected = Math.floor(26 * 1.5 * 1.15 * 1.15 * 1.0);
    expect(calculateEarning(menu, customer, bonuses, false)).toBe(expected);
  });
});

describe('getCatMood', () => {
  test('偏好区域心情90', () => { ... });
  test('惩罚区域心情40', () => { ... });
  test('中性区域心情70', () => { ... });
});
```

**收益**：纯函数测试覆盖核心计算，防止数值策划调整时引入bug，为后续重构提供安全网。

---

### 建议2：为存档系统编写集成测试

**现状问题**：

[saveGame](file:///Users/tog/Desktop/code/solo/xyj-105/xyj-105-1/game.js#L46-L61) / [loadGame](file:///Users/tog/Desktop/code/solo/xyj-105/xyj-105-1/game.js#L63-L90) 是数据持久化的核心，但 `loadGame` 中有复杂的数据修复逻辑（如 [areaAssignments的cat引用修复](file:///Users/tog/Desktop/code/solo/xyj-105/xyj-105-1/game.js#L78-L84)），且 `saveGame` 中 `interactionLogs` 截断逻辑可能导致数据丢失。这些都没有测试保护。

**建议做法**：

```js
describe('存档系统', () => {
  beforeEach(() => localStorage.clear());

  test('完整存读档往返', () => {
    const game = new CatCafeGame();
    game.coins = 9999;
    game.reputation = 500;
    game.cats.push({ id: 1, breedId: 1, name: '小橘', ... });
    game.saveGame();

    const loaded = new CatCafeGame();
    expect(loaded.coins).toBe(9999);
    expect(loaded.reputation).toBe(500);
    expect(loaded.cats.length).toBe(1);
  });

  test('损坏存档安全降级', () => {
    localStorage.setItem('cat_cafe_save', '{invalid json');
    const game = new CatCafeGame();
    expect(game.coins).toBe(500); // 回退默认值
  });

  test('areaAssignments引用修复', () => {
    // 模拟存档中area有cat引用但cats列表已被修改
    const savedData = {
      coins: 500, cats: [{ id: 42, name: '测试猫' }],
      areaAssignments: { hall: [{ id: 42 }, null], shelf: [null], window: [null] },
    };
    localStorage.setItem('cat_cafe_save', JSON.stringify(savedData));
    const game = new CatCafeGame();
    expect(game.areaAssignments.hall[0].name).toBe('测试猫');
    expect(game.areaAssignments.hall[1]).toBeNull();
  });

  test('缺失字段使用默认值', () => {
    localStorage.setItem('cat_cafe_save', JSON.stringify({ coins: 100 }));
    const game = new CatCafeGame();
    expect(game.reputation).toBe(0);
    expect(game.cats).toEqual([]);
  });
});
```

**收益**：确保存档格式变更时向后兼容，防止玩家存档损坏，验证边界情况处理。

---

## 六、代码工程化建议

---

### 建议1：引入模块化构建工具

**现状问题**：

项目以原生 `<script>` 标签按顺序加载 [data.js](file:///Users/tog/Desktop/code/solo/xyj-105/xyj-105-1/data.js) 和 [game.js](file:///Users/tog/Desktop/code/solo/xyj-105/xyj-105-1/game.js)（见 [index.html#L138-L139](file:///Users/tog/Desktop/code/solo/xyj-105/xyj-105-1/index.html#L138-L139)），所有变量挂载在全局作用域，加载顺序不可乱，无法使用 npm 生态。

**建议做法**：

引入 Vite 作为构建工具：

```
1. 初始化项目
   npm init -y
   npm install -D vite

2. 改造文件结构
   src/
   ├── main.js        ← 入口
   ├── data.js        ← export 常量
   ├── game.js        ← import data
   ├── ui/
   │   ├── renderer.js
   │   └── templates.js
   └── managers/
       ├── cat.js
       ├── customer.js
       └── shop.js

3. 每个文件使用 ES Module
   // data.js
   export const CAT_BREEDS = [...];
   
   // game.js
   import { CAT_BREEDS } from './data.js';

4. package.json 添加脚本
   "scripts": {
     "dev": "vite",
     "build": "vite build",
     "preview": "vite preview"
   }
```

**收益**：模块化依赖管理、热更新开发体验、Tree-shaking减小产物体积、可接入npm生态工具链。

---

### 建议2：引入 TypeScript 增强类型安全

**现状问题**：

[game.js](file:///Users/tog/Desktop/code/solo/xyj-105/xyj-105-1/game.js) 中大量依赖隐式数据契约——如 `cat.breedId`、`cat.personality`、`customer.tip`、`decor.id` 等字段名分布在 [data.js](file:///Users/tog/Desktop/code/solo/xyj-105/xyj-105-1/data.js) 和 game.js 中，但没有类型约束。拼错字段名不会报错，只会产生 undefined 静默失败。

**建议做法**：

为核心数据结构定义 TypeScript 接口：

```ts
interface Cat {
  id: number;
  breedId: number;
  name: string;
  breed: string;
  emoji: string;
  personality: keyof typeof CAT_PERSONALITIES;
  bond: number;       // 0-100
  mood: number;       // 0-100
  adoptedAt: string;  // ISO date
}

interface Customer {
  id: number;
  type: string;
  emoji: string;
  tip: number;
  order: MenuItem;
  waitTime: number;
  maxWait: number;
  leftAngry?: boolean;
}

interface MenuItem {
  id: number;
  name: string;
  emoji: string;
  price: number;
  cost: number;
  unlockCost: number;
  category: 'coffee' | 'dessert';
}

interface Personality {
  description: string;
  moodBonus: AreaName;
  moodPenalty: AreaName;
  cafeBonus: BonusMap;
  bonusLabel: string;
  interaction: string;
}

type AreaName = 'hall' | 'shelf' | 'window';
type BonusMap = { attract: number; tip: number; patience: number; rare: number; order: number; speed: number };
```

**渐进式迁移路径**：
1. 先用 `// @ts-check` + JSDoc 在 JS 文件中添加类型注解，零迁移成本
2. 新增文件使用 `.ts` 扩展名
3. 逐步将现有文件重命名为 `.ts` 并补充类型

**收益**：IDE自动补全、编译期类型检查、重构安全、接口即文档。

---

### 建议3：建立代码质量检查流水线

**现状问题**：

项目没有任何代码检查工具，[game.js](file:///Users/tog/Desktop/code/solo/xyj-105/xyj-105-1/game.js) 中存在多处代码风格不一致：
- [loadGame](file:///Users/tog/Desktop/code/solo/xyj-105/xyj-105-1/game.js#L63-L90) 中 `catch (e)` 空异常吞没
- [renderShop](file:///Users/tog/Desktop/code/solo/xyj-105/xyj-105-1/game.js#L327-L382) 中内联样式 `style="opacity:0.5"` 混用
- 多处 `innerHTML` 直接拼接用户数据（XSS风险）

**建议做法**：

```bash
# 安装工具
npm install -D eslint prettier

# .eslintrc.json
{
  "env": { "browser": true, "es2022": true },
  "extends": ["eslint:recommended"],
  "rules": {
    "no-empty": ["error", { "allowCatchBlocks": false }],
    "no-inner-declarations": "error",
    "prefer-const": "warn",
    "no-var": "error"
  }
}

# .prettierrc
{
  "singleQuote": true,
  "tabWidth": 4,
  "printWidth": 120,
  "trailingComma": "es5"
}

# package.json
"scripts": {
  "lint": "eslint src/**/*.js",
  "format": "prettier --write src/**/*.js",
  "check": "npm run lint && npm run format -- --check"
}
```

**重点检查项**：
| 检查项 | 规则 | 原因 |
|--------|------|------|
| 空catch块 | `no-empty` | [saveGame#L60](file:///Users/tog/Desktop/code/solo/xyj-105/xyj-105-1/game.js#L60) 吞没异常导致存档失败静默无反馈 |
| innerHTML注入 | 自定义规则 | 多处直接拼接变量到innerHTML，应使用textContent或转义 |
| var声明 | `no-var` | 统一使用let/const |
| 常量优先 | `prefer-const` | 不变的变量声明为const |

**收益**：自动发现潜在bug、统一代码风格、防止安全漏洞、CI集成保障代码质量。
