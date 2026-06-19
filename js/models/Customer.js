export class Customer {
    constructor(type, menuItem, maxWait) {
        this.id = Date.now() + Math.random();
        this.type = type.type;
        this.emoji = type.emoji;
        this.tip = type.tip;
        this.rarity = type.rarity;
        this.order = { ...menuItem };
        this.waitTime = 0;
        this.maxWait = maxWait;
        this.leftAngry = false;
    }

    update(deltaMs) {
        this.waitTime += deltaMs / 1000;
        if (this.waitTime >= this.maxWait) {
            this.leftAngry = true;
        }
    }

    getRemainingTime() {
        return Math.max(0, this.maxWait - this.waitTime);
    }

    getWaitPercent() {
        return (this.waitTime / this.maxWait) * 100;
    }

    isUrgent() {
        return this.getWaitPercent() > 70;
    }
}
