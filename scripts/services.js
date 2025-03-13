import { CONFIG } from './config.js';
import { Product } from './models.js';
import { StaffMember } from './models.js';
import { GameState } from './models.js';

// Сервис для работы с товарами
export class ProductService {
    constructor() {
        this.products = CONFIG.PRODUCTS.map(product => new Product(product));
    }

    // Получение всех товаров
    getAllProducts() {
        return this.products;
    }

    // Получение товара по ID
    getProductById(id) {
        return this.products.find(product => product.id === id);
    }

    // Получение товаров по категории
    getProductsByCategory(category) {
        return this.products.filter(product => product.category === category);
    }

    // Создание нового товара
    createProduct(productData) {
        const newProduct = new Product({
            id: this.products.length + 1,
            ...productData
        });
        this.products.push(newProduct);
        return newProduct;
    }
}

// Сервис для работы с персоналом
export class StaffService {
    constructor() {
        this.staff = CONFIG.STAFF.map(staff => new StaffMember(staff));
    }

    // Получение всех сотрудников
    getAllStaff() {
        return this.staff;
    }

    // Получение сотрудника по ID
    getStaffById(id) {
        return this.staff.find(member => member.id === id);
    }

    // Создание нового сотрудника
    createStaffMember(staffData) {
        const newStaff = new StaffMember({
            id: this.staff.length + 1,
            ...staffData
        });
        this.staff.push(newStaff);
        return newStaff;
    }
}

// Сервис для работы с маркетингом
export class MarketingService {
    constructor() {
        this.campaigns = CONFIG.MARKETING;
    }

    // Получение всех маркетинговых кампаний
    getAllCampaigns() {
        return this.campaigns;
    }

    // Получение кампании по ID
    getCampaignById(id) {
        return this.campaigns.find(campaign => campaign.id === id);
    }

    // Создание новой кампании
    createCampaign(campaignData) {
        const newCampaign = {
            id: this.campaigns.length + 1,
            ...campaignData
        };
        this.campaigns.push(newCampaign);
        return newCampaign;
    }
}

// Сервис для работы с сохранением
export class SaveService {
    constructor(gameState) {
        this.gameState = gameState;
        this.saveInterval = setInterval(() => this.save(), CONFIG.SAVE_INTERVAL);
    }

    // Сохранение игры
    save() {
        this.gameState.save();
    }

    // Загрузка игры
    load() {
        return this.gameState.load();
    }

    // Очистка сохранения
    clearSave() {
        localStorage.removeItem(CONFIG.STORAGE_KEY);
        this.gameState = new GameState();
    }

    // Остановка автосохранения
    stopAutoSave() {
        clearInterval(this.saveInterval);
    }

    // Возобновление автосохранения
    startAutoSave() {
        this.saveInterval = setInterval(() => this.save(), CONFIG.SAVE_INTERVAL);
    }
}

// Сервис для работы с реферальной системой
export class ReferralService {
    constructor(gameState) {
        this.gameState = gameState;
        this.referralCode = this.generateReferralCode();
    }

    // Генерация реферального кода
    generateReferralCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    // Получение реферального кода
    getReferralCode() {
        return this.referralCode;
    }

    // Обработка реферальной покупки
    processReferralPurchase(amount) {
        const commission = amount * CONFIG.REFERRAL.commission;
        this.gameState.addMoney(commission);
        return commission;
    }

    // Получение бонуса за приглашение
    getReferralBonus() {
        return CONFIG.REFERRAL.bonus;
    }
}

// Экспортируем сервисы
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ProductService,
        StaffService,
        MarketingService,
        SaveService,
        ReferralService
    };
} 