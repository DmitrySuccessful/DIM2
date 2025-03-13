import { CONFIG } from './config.js';

// Класс для управления состоянием игры
export class GameState {
    constructor() {
        this.money = CONFIG.INITIAL_MONEY;
        this.level = CONFIG.INITIAL_LEVEL;
        this.reputation = CONFIG.INITIAL_REPUTATION;
        this.experience = 0;
        this.inventory = [];
        this.staff = [];
        this.activeMarketing = [];
        this.lastSave = Date.now();
    }

    // Добавление опыта и проверка повышения уровня
    addExperience(amount) {
        this.experience += amount;
        this.checkLevelUp();
    }

    // Проверка повышения уровня
    checkLevelUp() {
        const nextLevel = this.level + 1;
        if (CONFIG.LEVELS[nextLevel] && this.experience >= CONFIG.LEVELS[nextLevel].requiredExp) {
            this.level = nextLevel;
            return true;
        }
        return false;
    }

    // Добавление денег
    addMoney(amount) {
        this.money += amount;
        this.addExperience(Math.floor(amount / 10)); // 1 опыт за каждые 10 денег
    }

    // Трата денег
    spendMoney(amount) {
        if (this.money >= amount) {
            this.money -= amount;
            return true;
        }
        return false;
    }

    // Добавление товара в инвентарь
    addToInventory(product) {
        this.inventory.push({
            ...product,
            quantity: 1
        });
    }

    // Удаление товара из инвентаря
    removeFromInventory(productId) {
        this.inventory = this.inventory.filter(item => item.id !== productId);
    }

    // Найм сотрудника
    hireStaff(staffMember) {
        if (this.spendMoney(staffMember.baseSalary)) {
            this.staff.push({
                ...staffMember,
                hiredAt: Date.now()
            });
            return true;
        }
        return false;
    }

    // Увольнение сотрудника
    fireStaff(staffId) {
        this.staff = this.staff.filter(member => member.id !== staffId);
    }

    // Запуск маркетинговой кампании
    startMarketing(campaign) {
        if (this.spendMoney(campaign.cost)) {
            this.activeMarketing.push({
                ...campaign,
                startTime: Date.now(),
                endTime: Date.now() + (campaign.duration * 60 * 60 * 1000)
            });
            return true;
        }
        return false;
    }

    // Проверка активных маркетинговых кампаний
    checkMarketing() {
        const now = Date.now();
        this.activeMarketing = this.activeMarketing.filter(campaign => campaign.endTime > now);
    }

    // Получение множителя продаж от активных кампаний
    getMarketingMultiplier() {
        return this.activeMarketing.reduce((multiplier, campaign) => multiplier * campaign.effect, 1);
    }

    // Сохранение состояния игры
    save() {
        const saveData = {
            money: this.money,
            level: this.level,
            reputation: this.reputation,
            experience: this.experience,
            inventory: this.inventory,
            staff: this.staff,
            activeMarketing: this.activeMarketing,
            lastSave: Date.now()
        };
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(saveData));
    }

    // Загрузка состояния игры
    load() {
        const saveData = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (saveData) {
            const data = JSON.parse(saveData);
            Object.assign(this, data);
            return true;
        }
        return false;
    }
}

// Класс для управления товарами
export class Product {
    constructor(productData) {
        this.id = productData.id;
        this.name = productData.name;
        this.basePrice = productData.basePrice;
        this.sellPrice = productData.sellPrice;
        this.image = productData.image;
        this.category = productData.category;
    }

    // Расчет цены продажи с учетом множителей
    calculateSellPrice(multiplier = 1) {
        return Math.floor(this.sellPrice * multiplier);
    }

    // Расчет прибыли
    calculateProfit(multiplier = 1) {
        return this.calculateSellPrice(multiplier) - this.basePrice;
    }
}

// Класс для управления персоналом
export class StaffMember {
    constructor(staffData) {
        this.id = staffData.id;
        this.name = staffData.name;
        this.baseSalary = staffData.baseSalary;
        this.efficiency = staffData.efficiency;
        this.image = staffData.image;
    }

    // Расчет эффективности с учетом опыта
    calculateEfficiency() {
        const experience = (Date.now() - this.hiredAt) / (1000 * 60 * 60 * 24); // опыт в днях
        return this.efficiency * (1 + (experience * 0.01)); // +1% эффективности за каждый день
    }
}

// Экспортируем классы
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GameState,
        Product,
        StaffMember
    };
} 