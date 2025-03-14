import { ImageGenerationService } from './ImageGenerationService.js';

export class AssetManager {
    constructor(apiKey) {
        this.imageService = new ImageGenerationService(apiKey);
        this.assetCache = new Map();
        this.animationCache = new Map();
    }

    async getAsset(type, description, forceRegenerate = false) {
        const cacheKey = `${type}-${description}`;
        
        if (!forceRegenerate && this.assetCache.has(cacheKey)) {
            return this.assetCache.get(cacheKey);
        }

        try {
            const asset = await this.imageService.generateGameAsset(type, description);
            this.assetCache.set(cacheKey, asset);
            return asset;
        } catch (error) {
            console.error(`Failed to generate asset: ${type}`, error);
            // Возвращаем placeholder изображение в случае ошибки
            return '/MyShop/images/placeholder.svg';
        }
    }

    async getAnimation(description, frames = 8, forceRegenerate = false) {
        const cacheKey = `animation-${description}-${frames}`;
        
        if (!forceRegenerate && this.animationCache.has(cacheKey)) {
            return this.animationCache.get(cacheKey);
        }

        try {
            const animation = await this.imageService.generateAnimation(description, frames);
            this.animationCache.set(cacheKey, animation);
            return animation;
        } catch (error) {
            console.error(`Failed to generate animation: ${description}`, error);
            return null;
        }
    }

    async generateProductImage(product) {
        const description = `${product.name}, ${product.category}, product photo`;
        return this.getAsset('product', description);
    }

    async generateStaffAvatar(staff) {
        const description = `professional ${staff.role} portrait, business attire`;
        return this.getAsset('avatar', description);
    }

    async generateRewardAnimation() {
        return this.getAnimation('sparkling coins and stars reward effect');
    }

    // Сохранение кэша в localStorage
    saveCache() {
        const cache = {
            assets: Object.fromEntries(this.assetCache),
            animations: Object.fromEntries(this.animationCache)
        };
        localStorage.setItem('assetCache', JSON.stringify(cache));
    }

    // Загрузка кэша из localStorage
    loadCache() {
        try {
            const cache = JSON.parse(localStorage.getItem('assetCache'));
            if (cache) {
                this.assetCache = new Map(Object.entries(cache.assets));
                this.animationCache = new Map(Object.entries(cache.animations));
            }
        } catch (error) {
            console.error('Failed to load asset cache:', error);
        }
    }
}

// Пример использования:
/*
const assetManager = new AssetManager('your-api-key');

// Загружаем сохраненный кэш
assetManager.loadCache();

// Генерируем изображение продукта
const productImage = await assetManager.generateProductImage({
    name: "Смартфон",
    category: "electronics"
});

// Генерируем аватар сотрудника
const staffAvatar = await assetManager.generateStaffAvatar({
    role: "sales manager"
});

// Генерируем анимацию награды
const rewardAnimation = await assetManager.generateRewardAnimation();

// Сохраняем кэш перед закрытием
window.addEventListener('beforeunload', () => {
    assetManager.saveCache();
});
*/ 