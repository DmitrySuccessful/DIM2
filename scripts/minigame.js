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
        this.playerWidth = 80;
        this.playerHeight = 60;
        this.spawnInterval = 1000; // Интервал появления объектов (1 секунда)
        this.lastSpawn = 0;
        
        // Загрузка изображений
        this.images = {
            basket: new Image(),
            coin: new Image(),
            rock: new Image(),
            star: new Image()
        };

        // Загружаем SVG изображения
        this.loadImages();
        
        // Слушатели событий
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
    }

    loadImages() {
        const svgToDataURL = (svgElement, width, height) => {
            const svgString = new XMLSerializer().serializeToString(svgElement);
            const blob = new Blob([svgString], {type: 'image/svg+xml'});
            return URL.createObjectURL(blob);
        };

        // Загружаем SVG файл
        fetch('images/minigame.svg')
            .then(response => response.text())
            .then(svgText => {
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');

                // Конвертируем каждый символ в Data URL
                this.images.basket.src = svgToDataURL(svgDoc.getElementById('basket'), 100, 100);
                this.images.coin.src = svgToDataURL(svgDoc.getElementById('coin'), 100, 100);
                this.images.rock.src = svgToDataURL(svgDoc.getElementById('rock'), 100, 100);
                this.images.star.src = svgToDataURL(svgDoc.getElementById('star'), 100, 100);
            });
    }

    handleMouseMove(e) {
        if (!this.gameRunning) return;
        
        const rect = this.canvas.getBoundingClientRect();
        this.playerX = e.clientX - rect.left - this.playerWidth / 2;
        
        // Ограничиваем движение игрока границами canvas
        this.playerX = Math.max(0, Math.min(this.canvas.width - this.playerWidth, this.playerX));
    }

    handleTouchMove(e) {
        if (!this.gameRunning) return;
        e.preventDefault();
        
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        this.playerX = touch.clientX - rect.left - this.playerWidth / 2;
        
        // Ограничиваем движение игрока границами canvas
        this.playerX = Math.max(0, Math.min(this.canvas.width - this.playerWidth, this.playerX));
    }

    spawnObject() {
        const now = Date.now();
        if (now - this.lastSpawn >= this.spawnInterval) {
            const type = Math.random() < 0.7 ? 'coin' : Math.random() < 0.8 ? 'rock' : 'star';
            const size = type === 'star' ? 40 : 30;
            
            this.objects.push({
                x: Math.random() * (this.canvas.width - size),
                y: -size,
                width: size,
                height: size,
                speed: 2 + Math.random() * 2,
                type: type
            });
            
            this.lastSpawn = now;
        }
    }

    updateObjects() {
        for (let i = this.objects.length - 1; i >= 0; i--) {
            const obj = this.objects[i];
            obj.y += obj.speed;

            // Проверяем столкновение с игроком
            if (this.checkCollision(obj)) {
                if (obj.type === 'coin') {
                    this.score += 10;
                } else if (obj.type === 'star') {
                    this.score += 50;
                } else if (obj.type === 'rock') {
                    this.score = Math.max(0, this.score - 20);
                }
                this.objects.splice(i, 1);
                continue;
            }

            // Удаляем объекты, вышедшие за пределы canvas
            if (obj.y > this.canvas.height) {
                if (obj.type === 'coin') {
                    this.score = Math.max(0, this.score - 5);
                }
                this.objects.splice(i, 1);
            }
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

    draw() {
        // Очищаем canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Рисуем игрока (корзину)
        this.ctx.drawImage(this.images.basket, this.playerX, this.playerY, this.playerWidth, this.playerHeight);

        // Рисуем падающие объекты
        this.objects.forEach(obj => {
            const image = this.images[obj.type];
            this.ctx.drawImage(image, obj.x, obj.y, obj.width, obj.height);
        });

        // Обновляем отображение счета и времени
        document.querySelector('.score').textContent = `Счёт: ${this.score}`;
        document.querySelector('.time').textContent = `Время: ${this.timeLeft}с`;
    }

    startGame() {
        if (this.gameRunning) return;

        this.gameRunning = true;
        this.score = 0;
        this.timeLeft = 60;
        this.objects = [];
        document.getElementById('start-game').disabled = true;

        // Основной игровой цикл
        const gameLoop = () => {
            if (!this.gameRunning) return;

            this.spawnObject();
            this.updateObjects();
            this.draw();
            requestAnimationFrame(gameLoop);
        };

        // Таймер
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
        document.getElementById('start-game').disabled = false;
        
        // Сохраняем результат
        if (this.score > 0) {
            const gameStats = {
                score: this.score,
                date: new Date().toISOString()
            };
            
            const stats = JSON.parse(localStorage.getItem('minigameStats') || '[]');
            stats.push(gameStats);
            localStorage.setItem('minigameStats', JSON.stringify(stats));
        }
    }
}

// Инициализация игры при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const game = new MinigameManager();
    document.getElementById('start-game').addEventListener('click', () => game.startGame());
}); 