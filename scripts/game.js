import { CONFIG } from './config.js';
import { GameState } from './models.js';
import {
    ProductService,
    StaffService,
    MarketingService,
    SaveService,
    ReferralService
} from './services.js';
import { UI } from './ui.js';
import { Minigame } from './minigame.js';

/**
 * Основной класс игры
 */
export class Game {
    constructor(gameState, ui, assetManager) {
        this.gameState = gameState;
        this.ui = ui;
        this.assetManager = assetManager;
        this.isRunning = false;
        try {
            // Инициализация состояния игры
            this.gameState = new GameState();
            
            // Инициализация сервисов
            this.initializeServices();

            // Загрузка сохраненного состояния
            this.loadGame();

            // Инициализация UI
            this.ui = new UI(this.gameState, this.services);

            // Запуск игрового цикла
            this.startGameLoop();

            // Запуск автосохранения
            this.startAutoSave();

            // Обработчики событий
            this.setupEventListeners();

            // Инициализация мини-игры после загрузки DOM
            window.addEventListener('load', () => {
                this.initializeMinigame();
            });
        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.handleError(error);
            throw error;
        }
    }

    /**
     * Обработка ошибок
     * @private
     */
    handleError(error) {
        console.error('Game error:', error);
        if (this.ui) {
            this.ui.showError('Произошла ошибка в игре: ' + error.message);
        } else {
            const errorElement = document.getElementById('error-message');
            if (errorElement) {
                errorElement.style.display = 'block';
                errorElement.querySelector('p').textContent = 'Произошла ошибка при инициализации игры: ' + error.message;
            }
        }
    }

    /**
     * Инициализация игровых сервисов
     * @private
     */
    initializeServices() {
        try {
            this.services = {
                productService: new ProductService(),
                staffService: new StaffService(),
                marketingService: new MarketingService(),
                saveService: new SaveService(this.gameState),
                referralService: new ReferralService(this.gameState)
            };
        } catch (error) {
            console.error('Failed to initialize services:', error);
            throw error;
        }
    }

    /**
     * Загрузка сохраненной игры
     * @private
     */
    loadGame() {
        try {
            const loaded = this.services.saveService.load();
            if (loaded) {
                console.log('Game loaded successfully');
            } else {
                console.log('No saved game found, starting new game');
            }
        } catch (error) {
            console.error('Failed to load game:', error);
            // Продолжаем с новой игрой
        }
    }

    /**
     * Инициализация мини-игры
     * @private
     */
    initializeMinigame() {
        try {
            const canvas = document.getElementById('minigame-canvas');
            if (!canvas) {
                throw new Error('Minigame canvas not found');
            }
            
            // Настройка canvas
            const container = canvas.parentElement;
            if (!container) {
                throw new Error('Canvas container not found');
            }

            // Получаем контекст
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('Failed to get canvas context');
            }

            // Создаем экземпляр мини-игры
            this.minigame = new Minigame(canvas, ctx, this.gameState);

            // Добавляем обработчик для кнопки старта
            const startButton = document.getElementById('start-game');
            if (startButton) {
                startButton.addEventListener('click', () => this.startMinigame());
            }

            console.log('Minigame initialized successfully');
        } catch (error) {
            console.error('Failed to initialize minigame:', error);
            this.handleError(error);
        }
    }

    /**
     * Настройка обработчиков событий
     * @private
     */
    setupEventListeners() {
        try {
            // Сохранение перед закрытием страницы
            window.addEventListener('beforeunload', () => {
                this.services.saveService.save();
            });

            // Сохранение при переключении вкладки
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.services.saveService.save();
                }
            });

            // Обработка ошибок
            window.addEventListener('error', (event) => {
                console.error('Game error:', event.error);
                this.handleError(event.error);
            });

            // Обработка необработанных промисов
            window.addEventListener('unhandledrejection', (event) => {
                console.error('Unhandled promise rejection:', event.reason);
                this.handleError(event.reason);
            });
        } catch (error) {
            console.error('Failed to setup event listeners:', error);
            this.handleError(error);
        }
    }

    /**
     * Запуск игрового цикла
     * @private
     */
    startGameLoop() {
        let lastUpdate = performance.now();
        const gameLoop = () => {
            const currentTime = performance.now();
            const deltaTime = currentTime - lastUpdate;

            this.update(deltaTime);
            
            lastUpdate = currentTime;
            requestAnimationFrame(gameLoop);
        };

        requestAnimationFrame(gameLoop);
    }

    /**
     * Запуск автосохранения
     * @private
     */
    startAutoSave() {
        setInterval(() => {
            try {
                this.services.saveService.save();
                console.log('Game auto-saved');
            } catch (error) {
                console.error('Failed to auto-save game:', error);
            }
        }, CONFIG.SAVE_INTERVAL);
    }

    /**
     * Запуск мини-игры
     * @returns {Promise<number>} Счет игры
     */
    async startMinigame() {
        try {
            if (!this.minigame) {
                throw new Error('Minigame not initialized');
            }

            const score = await this.minigame.start();
            this.ui.showNotification(`Игра окончена! Счет: ${score}`);
            return score;
        } catch (error) {
            console.error('Failed to start minigame:', error);
            this.ui.showError('Не удалось запустить мини-игру');
            return 0;
        }
    }

    /**
     * Обновление состояния игры
     * @param {number} deltaTime - Время с последнего обновления
     */
    update(deltaTime) {
        try {
            // Проверка активных маркетинговых кампаний
            this.gameState.checkMarketing();

            // Обновление UI
            this.ui.updateStats();

            // Обновление мини-игры
            if (this.minigame && this.minigame.isRunning) {
                this.minigame.update(deltaTime);
            }
        } catch (error) {
            console.error('Failed to update game state:', error);
        }
    }

    /**
     * Сохранение игры
     * @returns {boolean} Успешность сохранения
     */
    save() {
        try {
            this.services.saveService.save();
            this.ui.showNotification('Игра сохранена');
            return true;
        } catch (error) {
            console.error('Failed to save game:', error);
            this.ui.showError('Не удалось сохранить игру');
            return false;
        }
    }

    /**
     * Очистка игры
     */
    dispose() {
        try {
            // Остановка автосохранения
            this.services.saveService.stopAutoSave();

            // Остановка мини-игры
            if (this.minigame) {
                this.minigame.stop();
            }

            // Очистка UI
            this.ui.dispose();

            // Сохранение перед выходом
            this.save();
        } catch (error) {
            console.error('Failed to dispose game:', error);
        }
    }

    async start() {
        try {
            this.isRunning = true;
            
            // Load saved game state
            await this.gameState.load();
            
            // Generate or load assets if AI is enabled
            if (this.assetManager) {
                await this.generateInitialAssets();
            }
            
            // Initialize UI with current state
            await this.ui.initialize(this.gameState);
            
            // Start game loop
            this.gameLoop();
            
        } catch (error) {
            console.error('Failed to start game:', error);
            throw error;
        }
    }

    async generateInitialAssets() {
        try {
            // Generate product images
            for (const product of CONFIG.PRODUCTS) {
                if (!this.assetManager.hasAsset(product.id)) {
                    await this.assetManager.generateProductImage(product);
                }
            }

            // Generate staff avatars
            for (const staff of CONFIG.STAFF) {
                if (!this.assetManager.hasAsset(staff.id)) {
                    await this.assetManager.generateStaffAvatar(staff);
                }
            }

            // Generate reward animations
            if (!this.assetManager.hasAnimation('reward')) {
                await this.assetManager.generateRewardAnimation();
            }

        } catch (error) {
            console.warn('Failed to generate some assets:', error);
            // Continue game execution with placeholder assets
        }
    }

    gameLoop() {
        if (!this.isRunning) return;

        // Update game state
        this.gameState.update();
        
        // Update UI
        this.ui.update(this.gameState);

        // Schedule next frame
        requestAnimationFrame(() => this.gameLoop());
    }

    stop() {
        this.isRunning = false;
        if (this.assetManager) {
            this.assetManager.saveCache();
        }
    }

    async regenerateAssets() {
        if (!this.assetManager) return;
        
        try {
            // Clear existing cache
            this.assetManager.clearCache();
            
            // Regenerate all assets
            await this.generateInitialAssets();
            
            // Update UI with new assets
            await this.ui.refreshAssets();
            
        } catch (error) {
            console.error('Failed to regenerate assets:', error);
            throw error;
        }
    }
}

// Инициализация игры при загрузке страницы
window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
}); 