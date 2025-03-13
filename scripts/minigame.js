import { CONFIG } from './config.js';

// Класс для управления мини-игрой
export class Minigame {
    constructor(canvas, ctx, gameState) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.gameState = gameState;
        this.isRunning = false;
        this.score = 0;
        this.timeLeft = CONFIG.MINIGAME.gameDuration;
        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 50,
            width: 50,
            height: 50,
            speed: CONFIG.MINIGAME.playerSpeed
        };
        this.items = [];
        this.keys = {};
        this.setupControls();
    }

    // Настройка управления
    setupControls() {
        window.addEventListener('keydown', (e) => this.keys[e.key] = true);
        window.addEventListener('keyup', (e) => this.keys[e.key] = false);
    }

    // Запуск игры
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.score = 0;
        this.timeLeft = CONFIG.MINIGAME.gameDuration;
        this.items = [];
        this.spawnItem();
        this.gameLoop();
    }

    // Основной игровой цикл
    gameLoop() {
        if (!this.isRunning) return;

        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    // Обновление состояния игры
    update() {
        // Обновление времени
        this.timeLeft -= 1/60; // 60 FPS
        if (this.timeLeft <= 0) {
            this.endGame();
            return;
        }

        // Обновление позиции игрока
        if (this.keys['ArrowLeft']) {
            this.player.x = Math.max(0, this.player.x - this.player.speed);
        }
        if (this.keys['ArrowRight']) {
            this.player.x = Math.min(this.canvas.width - this.player.width, this.player.x + this.player.speed);
        }

        // Обновление предметов
        this.items.forEach((item, index) => {
            item.y += CONFIG.MINIGAME.itemSpeed;

            // Проверка столкновения с игроком
            if (this.checkCollision(this.player, item)) {
                this.collectItem(item);
                this.items.splice(index, 1);
            }

            // Удаление предметов, вышедших за пределы экрана
            if (item.y > this.canvas.height) {
                this.items.splice(index, 1);
            }
        });

        // Создание новых предметов
        if (Math.random() < 0.02) { // 2% шанс каждый кадр
            this.spawnItem();
        }
    }

    // Отрисовка игры
    draw() {
        // Очистка canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Отрисовка игрока
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);

        // Отрисовка предметов
        this.items.forEach(item => {
            this.ctx.fillStyle = item.color;
            this.ctx.fillRect(item.x, item.y, item.width, item.height);
        });

        // Отрисовка счета и времени
        this.ctx.fillStyle = '#000';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Счет: ${this.score}`, 10, 30);
        this.ctx.fillText(`Время: ${Math.ceil(this.timeLeft)}с`, 10, 60);
    }

    // Создание нового предмета
    spawnItem() {
        const item = {
            x: Math.random() * (this.canvas.width - 30),
            y: -30,
            width: 30,
            height: 30,
            value: this.getRandomItemValue(),
            color: this.getRandomItemColor()
        };
        this.items.push(item);
    }

    // Получение случайной ценности предмета
    getRandomItemValue() {
        const rand = Math.random();
        if (rand < 0.6) return CONFIG.MINIGAME.rewards.common;
        if (rand < 0.9) return CONFIG.MINIGAME.rewards.rare;
        return CONFIG.MINIGAME.rewards.epic;
    }

    // Получение случайного цвета предмета
    getRandomItemColor() {
        const colors = ['#FFD700', '#C0C0C0', '#CD7F32']; // золото, серебро, бронза
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Проверка столкновения
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    // Сбор предмета
    collectItem(item) {
        this.score += item.value;
        this.gameState.addMoney(item.value);
    }

    // Завершение игры
    endGame() {
        this.isRunning = false;
        this.gameState.addExperience(this.score);
        return this.score;
    }
}

// Экспортируем класс Minigame
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Minigame;
} 