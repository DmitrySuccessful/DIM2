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
    constructor() {
        try {
            // Инициализация состояния игры
            this.gameState = new GameState();
            
            // Инициализация сервисов
            this.initializeServices();

            // Загрузка сохраненного состояния
            this.loadGame();

            // Инициализация UI
            this.ui = new UI(this.gameState, this.services);

            // Инициализация мини-игры
            this.initializeMinigame();

            // Запуск игрового цикла
            this.startGameLoop();

            // Запуск автосохранения
            this.startAutoSave();

            // Обработчики событий
            this.setupEventListeners();
        } catch (error) {
            console.error('Failed to initialize game:', error);
            throw error;
        }
    }

    /**
     * Инициализация игровых сервисов
     * @private
     */
    initializeServices() {
        this.services = {
            productService: new ProductService(),
            staffService: new StaffService(),
            marketingService: new MarketingService(),
            saveService: new SaveService(this.gameState),
            referralService: new ReferralService(this.gameState)
        };
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
            
            canvas.width = CONFIG.MINIGAME.canvasWidth;
            canvas.height = CONFIG.MINIGAME.canvasHeight;
            
            const ctx = canvas.getContext('2d');
            this.minigame = new Minigame(canvas, ctx, this.gameState);
        } catch (error) {
            console.error('Failed to initialize minigame:', error);
            // Продолжаем без мини-игры
        }
    }

    /**
     * Настройка обработчиков событий
     * @private
     */
    setupEventListeners() {
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
            this.ui.showError('Произошла ошибка в игре');
        });
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
}

// Инициализация игры при загрузке страницы
window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
}); 