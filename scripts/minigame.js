import { GAME_CONFIG } from './gameConfig.js';

// Класс для управления мини-игрой
export class Minigame {
    constructor(canvas, ctx, gameState) {
        if (!canvas || !ctx || !gameState) {
            throw new Error('Missing required parameters for Minigame initialization');
        }

        this.canvas = canvas;
        this.ctx = ctx;
        this.gameState = gameState;
        this.isRunning = false;
        this.score = 0;
        this.combo = 0;
        this.comboTimer = null;
        this.timeLeft = 60;
        this.currentBackground = 0;
        this.powerUps = new Set();
        this.particles = [];
        
        // Load assets
        this.loadAssets();
        
        // Setup game elements
        this.setupGame();
        
        // Initialize event listeners
        this.setupControls();
    }

    loadAssets() {
        try {
            // Создаем базовые ассеты
            this.assets = {
                backgrounds: [],
                items: {},
                cart: new Image()
            };

            // Загружаем фоны
            GAME_CONFIG.minigame.backgrounds.forEach((src, index) => {
                const img = new Image();
                img.onerror = () => {
                    console.warn(`Не удалось загрузить фон ${src}`);
                };
                img.src = `assets/backgrounds/${src}`;
                this.assets.backgrounds[index] = img;
            });

            // Загружаем спрайты предметов
            Object.entries(GAME_CONFIG.minigame.itemTypes).forEach(([key, value]) => {
                const img = new Image();
                img.onerror = () => {
                    console.warn(`Не удалось загрузить спрайт ${value.sprite}`);
                };
                img.src = `assets/items/${value.sprite}`;
                this.assets.items[key] = img;
            });

            // Загружаем спрайт корзины
            this.assets.cart.onerror = () => {
                console.warn('Не удалось загрузить спрайт корзины');
            };
            this.assets.cart.src = 'assets/cart.png';

        } catch (error) {
            console.error('Ошибка при загрузке ассетов:', error);
            // Продолжаем работу с цветными прямоугольниками
        }
    }

    setupGame() {
        // Canvas setup
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Player setup
        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 80,
            width: 80,
            height: 60,
            speed: 8,
            targetX: null,
            velocity: 0,
            acceleration: 0.5,
            maxSpeed: 12,
            friction: 0.92
        };

        // Game elements
        this.items = [];
        this.powerUps = new Set();
        this.particles = [];
        this.combo = 0;
        this.comboMultiplier = 1;
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        if (!container) return;

        const maxWidth = Math.min(container.clientWidth, 800);
        this.canvas.width = maxWidth;
        this.canvas.height = maxWidth * 0.75;

        // Adjust player position after resize
        if (this.player) {
            this.player.y = this.canvas.height - 80;
        }
    }

    setupControls() {
        // Keyboard controls
        window.addEventListener('keydown', (e) => {
            if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
                this.handleInput(e.key === 'ArrowLeft' ? 'left' : 'right');
            }
        });

        // Touch controls
        let touchStartX = null;
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            const rect = this.canvas.getBoundingClientRect();
            this.player.targetX = touch.clientX - rect.left - this.player.width / 2;
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.player.targetX = touch.clientX - rect.left - this.player.width / 2;
        });

        this.canvas.addEventListener('touchend', () => {
            touchStartX = null;
            this.player.targetX = null;
        });
    }

    handleInput(direction) {
        const acceleration = direction === 'left' ? -this.player.acceleration : this.player.acceleration;
        this.player.velocity = Math.max(
            -this.player.maxSpeed,
            Math.min(this.player.maxSpeed, this.player.velocity + acceleration)
        );
    }

    spawnItem() {
        const rand = Math.random();
        let type = null;
        let cumProb = 0;

        // Select item type based on probability
        for (const [itemType, config] of Object.entries(GAME_CONFIG.minigame.itemTypes)) {
            cumProb += config.probability;
            if (rand <= cumProb) {
                type = itemType;
                break;
            }
        }

        if (!type) return;

        const config = GAME_CONFIG.minigame.itemTypes[type];
        const item = {
            x: Math.random() * (this.canvas.width - 40),
            y: -40,
            width: 40,
            height: 40,
            type,
            value: config.value,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.1
        };

        this.items.push(item);
    }

    spawnPowerUp() {
        if (Math.random() > 0.05) return; // 5% chance to spawn power-up

        const powerUpTypes = Object.keys(GAME_CONFIG.minigame.powerUps);
        const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        const config = GAME_CONFIG.minigame.powerUps[type];

        const powerUp = {
            x: Math.random() * (this.canvas.width - 30),
            y: -30,
            width: 30,
            height: 30,
            type,
            duration: config.duration
        };

        this.items.push(powerUp);
    }

    activatePowerUp(type) {
        const config = GAME_CONFIG.minigame.powerUps[type];
        this.powerUps.add(type);

        setTimeout(() => {
            this.powerUps.delete(type);
        }, config.duration);
    }

    updateCombo() {
        this.combo++;
        this.comboMultiplier = Math.min(
            GAME_CONFIG.minigame.comboSystem.maxMultiplier,
            1 + (this.combo * GAME_CONFIG.minigame.comboSystem.baseMultiplier)
        );

        // Reset combo timer
        if (this.comboTimer) clearTimeout(this.comboTimer);
        this.comboTimer = setTimeout(() => {
            this.combo = 0;
            this.comboMultiplier = 1;
        }, GAME_CONFIG.minigame.comboSystem.comboTimeout);
    }

    createParticles(x, y, color, value) {
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const speed = 2 + Math.random() * 2;
            
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                alpha: 1,
                color,
                size: 4,
                value: value
            });
        }
    }

    update() {
        if (!this.isRunning) return;

        // Update player movement
        if (this.player.targetX !== null) {
            const dx = this.player.targetX - this.player.x;
            this.player.velocity = Math.sign(dx) * Math.min(Math.abs(dx) * 0.2, this.player.maxSpeed);
        }

        this.player.velocity *= this.player.friction;
        this.player.x = Math.max(0, Math.min(
            this.canvas.width - this.player.width,
            this.player.x + this.player.velocity
        ));

        // Update items
        this.items.forEach((item, index) => {
            const baseSpeed = 4;
            const speedMultiplier = this.powerUps.has('SLOW_TIME') ? 0.5 : 1;
            
            item.y += baseSpeed * speedMultiplier;
            item.rotation += item.rotationSpeed;

            // Check for magnet power-up
            if (this.powerUps.has('MAGNET')) {
                const dx = this.player.x + this.player.width/2 - (item.x + item.width/2);
                const dy = this.player.y + this.player.height/2 - (item.y + item.height/2);
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                if (dist < GAME_CONFIG.minigame.powerUps.MAGNET.radius) {
                    item.x += dx * 0.1;
                    item.y += dy * 0.1;
                }
            }

            // Collision detection
            if (this.checkCollision(this.player, item)) {
                if (item.type === 'BROKEN_ITEM') {
                    this.score = Math.max(0, this.score + GAME_CONFIG.minigame.obstacles.BROKEN_ITEM.penalty);
                    this.combo = 0;
                    this.comboMultiplier = 1;
                } else if (Object.keys(GAME_CONFIG.minigame.powerUps).includes(item.type)) {
                    this.activatePowerUp(item.type);
                } else {
                    const baseValue = item.value;
                    const multiplier = this.powerUps.has('MULTIPLIER') ? 
                        GAME_CONFIG.minigame.powerUps.MULTIPLIER.factor : 1;
                    const finalValue = Math.round(baseValue * this.comboMultiplier * multiplier);
                    
                    this.score += finalValue;
                    this.updateCombo();
                    this.createParticles(item.x + item.width/2, item.y, this.getItemColor(item.type), finalValue);
                }
                this.items.splice(index, 1);
            }

            // Remove items that are off screen
            if (item.y > this.canvas.height) {
                this.items.splice(index, 1);
                this.combo = 0;
                this.comboMultiplier = 1;
            }
        });

        // Update particles
        this.particles.forEach((particle, index) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.1; // gravity
            particle.alpha -= 0.02;
            
            if (particle.alpha <= 0) {
                this.particles.splice(index, 1);
            }
        });

        // Spawn new items
        if (Math.random() < 0.03) this.spawnItem();
        if (Math.random() < 0.01) this.spawnPowerUp();

        // Update time
        this.timeLeft = Math.max(0, this.timeLeft - 1/60);
        if (this.timeLeft === 0) this.endGame();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background
        const bg = this.assets.backgrounds[this.currentBackground];
        if (bg && bg.complete && bg.naturalHeight !== 0) {
            this.ctx.drawImage(bg, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            // Фолбэк на градиентный фон
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(1, '#E0F7FA');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // Draw items
        this.items.forEach(item => {
            this.ctx.save();
            this.ctx.translate(item.x + item.width/2, item.y + item.height/2);
            this.ctx.rotate(item.rotation);
            
            const sprite = this.assets.items[item.type];
            if (sprite && sprite.complete && sprite.naturalHeight !== 0) {
                this.ctx.drawImage(sprite, -item.width/2, -item.height/2, item.width, item.height);
            } else {
                // Фолбэк на цветные прямоугольники
                this.ctx.fillStyle = this.getItemColor(item.type);
                this.ctx.fillRect(-item.width/2, -item.height/2, item.width, item.height);
            }
            
            this.ctx.restore();
        });

        // Draw player cart
        this.ctx.save();
        const cartTilt = -this.player.velocity * 0.05;
        this.ctx.translate(this.player.x + this.player.width/2, this.player.y + this.player.height/2);
        this.ctx.rotate(cartTilt);
        
        if (this.assets.cart.complete && this.assets.cart.naturalHeight !== 0) {
            this.ctx.drawImage(
                this.assets.cart,
                -this.player.width/2,
                -this.player.height/2,
                this.player.width,
                this.player.height
            );
        } else {
            // Фолбэк на цветной прямоугольник для корзины
            this.ctx.fillStyle = '#4CAF50';
            this.ctx.fillRect(-this.player.width/2, -this.player.height/2, this.player.width, this.player.height);
        }
        this.ctx.restore();

        // Draw particles
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw score value
            if (particle.value) {
                this.ctx.fillStyle = '#FFF';
                this.ctx.font = '16px Arial';
                this.ctx.fillText(`+${particle.value}`, particle.x, particle.y);
            }
            
            this.ctx.restore();
        });

        // Draw UI
        this.drawUI();
    }

    drawUI() {
        // Score and time
        this.ctx.fillStyle = '#000';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillText(`Счет: ${this.score}`, 10, 30);
        this.ctx.fillText(`Время: ${Math.ceil(this.timeLeft)}с`, 10, 60);

        // Combo counter
        if (this.combo > 1) {
            this.ctx.fillStyle = '#FF5722';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.fillText(`Комбо: x${this.combo} (${this.comboMultiplier.toFixed(1)})`, 10, 90);
        }

        // Active power-ups
        let powerUpY = 120;
        this.powerUps.forEach(type => {
            this.ctx.fillStyle = '#2196F3';
            this.ctx.font = '18px Arial';
            this.ctx.fillText(`🌟 ${type}`, 10, powerUpY);
            powerUpY += 25;
        });
    }

    getItemColor(type) {
        const colors = {
            BRONZE: '#CD7F32',
            SILVER: '#C0C0C0',
            GOLD: '#FFD700',
            RARE: '#FF5722',
            BROKEN_ITEM: '#F44336',
            MAGNET: '#2196F3',
            SLOW_TIME: '#9C27B0',
            MULTIPLIER: '#4CAF50'
        };
        return colors[type] || '#000';
    }

    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.score = 0;
        this.combo = 0;
        this.comboMultiplier = 1;
        this.timeLeft = 60;
        this.items = [];
        this.particles = [];
        this.powerUps.clear();
        
        // Start game loop
        const gameLoop = () => {
            if (!this.isRunning) return;
            
            this.update();
            this.draw();
            requestAnimationFrame(gameLoop);
        };
        
        gameLoop();
    }

    stop() {
        this.isRunning = false;
        this.clearCanvas();
        if (this.comboTimer) {
            clearTimeout(this.comboTimer);
        }
    }

    endGame() {
        this.isRunning = false;
        this.gameState.addMoney(this.score);
        this.gameState.addExperience(Math.floor(this.score / 10));
        return this.score;
    }
}

// Экспортируем класс Minigame
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Minigame;
} 