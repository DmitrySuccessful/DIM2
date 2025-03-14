class MinigameManager {
    constructor() {
        this.canvas = document.getElementById('minigame-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.timeLeft = 60; // 60 секунд на игру
        this.gameRunning = false;
        this.objects = [];
        this.playerX = this.canvas.width / 2;
        this.playerY = this.canvas.height - 50;
        this.playerWidth = 60;
        this.playerHeight = 40;
        this.spawnInterval = 1000; // Интервал появления объектов (1 секунда)
        this.lastSpawn = 0;
        this.lastFrameTime = 0;
        this.fps = 60;
        this.frameInterval = 1000 / this.fps;
        
        // Загрузка изображений
        this.images = {
            basket: new Image(),
            coin: new Image(),
            rock: new Image(),
            star: new Image()
        };

        // Инициализация
        this.init();
    }

    init() {
        // Настройка canvas для правильного масштабирования
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Загрузка изображений
        this.loadImages();
        
        // Слушатели событий
        this.canvas.addEventListener('touchstart', this.handleTouch.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouch.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouse.bind(this));

        // Получаем элементы UI
        this.scoreElement = document.getElementById('game-score');
        this.timeElement = document.getElementById('game-time');
        this.startButton = document.getElementById('start-game');

        // Предотвращаем скролл при касании canvas
        this.canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    }

    resizeCanvas() {
        // Получаем размеры контейнера
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        
        // Устанавливаем размеры canvas
        this.canvas.width = containerWidth;
        this.canvas.height = Math.min(containerWidth * 0.75, 400);
        
        // Обновляем позицию игрока
        this.playerY = this.canvas.height - this.playerHeight - 10;
    }

    loadImages() {
        const svgToDataURL = (svgElement) => {
            const svgString = new XMLSerializer().serializeToString(svgElement);
            const blob = new Blob([svgString], {type: 'image/svg+xml'});
            return URL.createObjectURL(blob);
        };

        fetch('/MyShop/images/minigame.svg')
            .then(response => response.text())
            .then(svgText => {
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');

                this.images.basket.src = svgToDataURL(svgDoc.getElementById('basket'));
                this.images.coin.src = svgToDataURL(svgDoc.getElementById('coin'));
                this.images.rock.src = svgToDataURL(svgDoc.getElementById('rock'));
                this.images.star.src = svgToDataURL(svgDoc.getElementById('star'));
            })
            .catch(error => {
                console.error('Ошибка загрузки изображений:', error);
                const errorMessage = document.getElementById('error-message');
                if (errorMessage) {
                    errorMessage.style.display = 'block';
                    errorMessage.querySelector('p').textContent = 
                        'Не удалось загрузить изображения для мини-игры. Пожалуйста, обновите страницу.';
                }
            });
    }

    handleTouch(e) {
        if (!this.gameRunning) return;
        e.preventDefault();
        
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        this.playerX = touch.clientX - rect.left - this.playerWidth / 2;
        this.playerX = Math.max(0, Math.min(this.canvas.width - this.playerWidth, this.playerX));
    }

    handleMouse(e) {
        if (!this.gameRunning || 'ontouchstart' in window) return;
        
        const rect = this.canvas.getBoundingClientRect();
        this.playerX = e.clientX - rect.left - this.playerWidth / 2;
        this.playerX = Math.max(0, Math.min(this.canvas.width - this.playerWidth, this.playerX));
    }

    spawnObject() {
        const now = Date.now();
        if (now - this.lastSpawn >= this.spawnInterval) {
            const type = Math.random() < 0.7 ? 'coin' : Math.random() < 0.8 ? 'rock' : 'star';
            const size = type === 'star' ? 30 : 25;
            
            this.objects.push({
                x: Math.random() * (this.canvas.width - size),
                y: -size,
                width: size,
                height: size,
                speed: (2 + Math.random() * 2) * (this.canvas.height / 400),
                type: type
            });
            
            this.lastSpawn = now;
        }
    }

    updateObjects() {
        for (let i = this.objects.length - 1; i >= 0; i--) {
            const obj = this.objects[i];
            obj.y += obj.speed;

            if (this.checkCollision(obj)) {
                if (obj.type === 'coin') {
                    this.score += 10;
                    this.showFloatingText('+10', obj.x, obj.y, '#4CAF50');
                } else if (obj.type === 'star') {
                    this.score += 50;
                    this.showFloatingText('+50', obj.x, obj.y, '#FFC107');
                } else if (obj.type === 'rock') {
                    this.score = Math.max(0, this.score - 20);
                    this.showFloatingText('-20', obj.x, obj.y, '#f44336');
                }
                this.objects.splice(i, 1);
                continue;
            }

            if (obj.y > this.canvas.height) {
                if (obj.type === 'coin') {
                    this.score = Math.max(0, this.score - 5);
                    this.showFloatingText('-5', obj.x, this.canvas.height - 20, '#f44336');
                }
                this.objects.splice(i, 1);
            }
        }
    }

    showFloatingText(text, x, y, color) {
        const floatingText = {
            text,
            x,
            y,
            color,
            alpha: 1,
            velocity: -2
        };

        requestAnimationFrame(() => this.animateFloatingText(floatingText));
    }

    animateFloatingText(floatingText) {
        this.ctx.save();
        this.ctx.globalAlpha = floatingText.alpha;
        this.ctx.fillStyle = floatingText.color;
        this.ctx.font = 'bold 20px Roboto';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(floatingText.text, floatingText.x + 15, floatingText.y);
        this.ctx.restore();

        floatingText.y += floatingText.velocity;
        floatingText.alpha -= 0.02;

        if (floatingText.alpha > 0) {
            requestAnimationFrame(() => this.animateFloatingText(floatingText));
        }
    }

    checkCollision(obj) {
        return (
            obj.x < this.playerX + this.playerWidth &&
            obj.x + obj.width > this.playerX &&
            obj.y < this.playerY + this.playerHeight &&
            obj.y + obj.height > this.playerY
        );
    }

    draw(timestamp) {
        if (!this.gameRunning) return;

        // Контроль FPS
        if (timestamp - this.lastFrameTime < this.frameInterval) {
            requestAnimationFrame((t) => this.draw(t));
            return;
        }
        this.lastFrameTime = timestamp;

        // Очищаем canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Рисуем игрока
        this.ctx.drawImage(
            this.images.basket,
            this.playerX,
            this.playerY,
            this.playerWidth,
            this.playerHeight
        );

        // Рисуем объекты
        this.objects.forEach(obj => {
            const image = this.images[obj.type];
            this.ctx.drawImage(image, obj.x, obj.y, obj.width, obj.height);
        });

        // Обновляем UI
        this.scoreElement.textContent = this.score;
        this.timeElement.textContent = this.timeLeft;

        // Следующий кадр
        requestAnimationFrame((t) => this.draw(t));
    }

    startGame() {
        if (this.gameRunning) return;

        // Сброс состояния
        this.gameRunning = true;
        this.score = 0;
        this.timeLeft = 60;
        this.objects = [];
        this.startButton.disabled = true;

        // Запускаем игровой цикл
        this.lastFrameTime = performance.now();
        this.draw(this.lastFrameTime);

        // Запускаем спавн объектов
        const gameLoop = () => {
            if (!this.gameRunning) return;
            this.spawnObject();
            this.updateObjects();
            setTimeout(gameLoop, 16);
        };

        // Запускаем таймер
        const timer = setInterval(() => {
            this.timeLeft--;
            if (this.timeLeft <= 0) {
                this.endGame();
                clearInterval(timer);
            }
        }, 1000);

        gameLoop();
    }

    endGame() {
        this.gameRunning = false;
        this.startButton.disabled = false;
        
        if (this.score > 0) {
            const gameStats = {
                score: this.score,
                date: new Date().toISOString()
            };
            
            const stats = JSON.parse(localStorage.getItem('minigameStats') || '[]');
            stats.push(gameStats);
            localStorage.setItem('minigameStats', JSON.stringify(stats));

            // Обновляем игровую валюту
            if (window.game && typeof window.game.addMoney === 'function') {
                window.game.addMoney(this.score);
            }
        }
    }
}

// Инициализация игры при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const game = new MinigameManager();
    document.getElementById('start-game').addEventListener('click', () => game.startGame());
}); 