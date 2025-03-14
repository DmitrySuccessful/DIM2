// Импорт всех необходимых модулей
import { CONFIG } from './config.js';
import { GameState, Product, StaffMember } from './models.js';
import { ProductService, StaffService, MarketingService, SaveService, ReferralService } from './services.js';
import { UI } from './ui.js';
import { Minigame } from './minigame.js';
import { Game } from './game.js';

class App {
    constructor() {
        this.init();
    }

    async init() {
        try {
            // Инициализация Telegram Mini App
            if (window.Telegram?.WebApp) {
                window.Telegram.WebApp.ready();
                window.Telegram.WebApp.expand();
            }

            // Инициализация основных компонентов
            this.gameState = new GameState(CONFIG);
            this.ui = new UI(this.gameState);
            this.game = new Game(this.gameState, this.ui);

            // Делаем игру доступной глобально для мини-игры
            window.game = this.game;

            // Скрываем загрузчик
            document.getElementById('loading').style.display = 'none';
        } catch (error) {
            console.error('Failed to initialize app:', error);
            const errorMessage = document.getElementById('error-message');
            errorMessage.style.display = 'block';
            errorMessage.querySelector('p').textContent = 
                'Не удалось инициализировать приложение. Пожалуйста, обновите страницу.';
            document.getElementById('loading').style.display = 'none';
        }
    }
}

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new App();
}); 