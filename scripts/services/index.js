import { CONFIG } from '../config.js';

export class ProductService {
    constructor() {
        // Инициализация сервиса продуктов
    }

    getAllProducts() {
        return CONFIG.PRODUCTS.map(product => ({...product}));
    }
}

export class StaffService {
    constructor() {
        // Инициализация сервиса персонала
    }

    getAllStaff() {
        return CONFIG.STAFF.map(staff => ({...staff}));
    }
}

export class MarketingService {
    constructor() {
        // Инициализация сервиса маркетинга
    }

    getAllCampaigns() {
        return CONFIG.MARKETING.map(campaign => ({...campaign}));
    }
}

export class SaveService {
    constructor(gameState) {
        this.gameState = gameState;
    }

    save() {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(this.gameState));
            return true;
        } catch (error) {
            console.error('Failed to save game:', error);
            return false;
        }
    }

    load() {
        try {
            const data = localStorage.getItem(CONFIG.STORAGE_KEY);
            if (data) {
                Object.assign(this.gameState, JSON.parse(data));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to load game:', error);
            return false;
        }
    }

    clearSave() {
        localStorage.removeItem(CONFIG.STORAGE_KEY);
    }
}

export class ReferralService {
    constructor(gameState) {
        this.gameState = gameState;
    }

    generateReferralCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    applyReferralCode(code) {
        // Логика применения реферального кода
        return true;
    }
} 