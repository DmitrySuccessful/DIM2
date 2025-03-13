// Импорт всех необходимых модулей
import { CONFIG } from './config.js';
import { GameState, Product, StaffMember } from './models.js';
import { ProductService, StaffService, MarketingService, SaveService, ReferralService } from './services.js';
import { UI } from './ui.js';
import { Minigame } from './minigame.js';
import { Game } from './game.js';

// Инициализация игры
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Создаем экземпляр игры
        const game = new Game();

        // Обновляем состояние игры каждую секунду
        setInterval(() => {
            game.update();
        }, 1000);
    } catch (error) {
        console.error('Ошибка при инициализации игры:', error);
        // Показываем сообщение об ошибке пользователю
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = 'Произошла ошибка при загрузке игры. Пожалуйста, обновите страницу.';
        document.body.appendChild(errorMessage);
    }
}); 