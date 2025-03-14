// Game Module
(() => {
    // DOM Elements
    const gameContainer = document.getElementById('game-container');
    const startButton = document.getElementById('start-game');
    const pauseButton = document.getElementById('pause-game');
    const scoreDisplay = document.getElementById('game-score');
    const levelDisplay = document.getElementById('game-level');
    const gameBonusDisplay = document.getElementById('game-bonus');

    // Game constants
    const ZOMBIE_TYPES = [
        { name: 'normal', points: 10, speed: 1, image: 'src/assets/images/zombie1.png' },
        { name: 'fast', points: 20, speed: 1.5, image: 'src/assets/images/zombie2.png' },
        { name: 'boss', points: 50, speed: 0.7, image: 'src/assets/images/zombie3.png' }
    ];

    // Game variables
    let animationFrame;
    let lastFrameTime;

    // Create zombie element
    const createZombie = () => {
        const zombie = {
            id: utils.generateId(),
            type: ZOMBIE_TYPES[utils.random(0, ZOMBIE_TYPES.length - 1)],
            x: utils.random(0, gameContainer.clientWidth - 60),
            y: -60,
            element: document.createElement('div')
        };

        zombie.element.className = 'zombie';
        zombie.element.style.backgroundImage = `url(${zombie.type.image})`;
        zombie.element.style.left = `${zombie.x}px`;
        zombie.element.style.top = `${zombie.y}px`;

        // Add click handler
        zombie.element.addEventListener('click', () => catchZombie(zombie));

        gameContainer.appendChild(zombie.element);
        State.addZombie(zombie);

        // Add entrance animation
        gsap.from(zombie.element, {
            scale: 0,
            rotation: 360,
            duration: 0.5,
            ease: 'back.out'
        });

        return zombie;
    };

    // Catch zombie
    const catchZombie = (zombie) => {
        if (State.gameState.isPaused) return;

        // Calculate points with level multiplier
        const points = Math.round(
            zombie.type.points * State.gameState.bonusMultiplier
        );

        // Update score
        State.updateGameScore(points);
        State.addBonusPoints(Math.round(points / 10));

        // Show score popup
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = `+${points}`;
        popup.style.left = `${zombie.x}px`;
        popup.style.top = `${zombie.y}px`;
        gameContainer.appendChild(popup);

        // Add catch animation and remove zombie
        zombie.element.classList.add('caught');
        utils.playSound('src/assets/sounds/catch.mp3', 0.4);

        setTimeout(() => {
            State.removeZombie(zombie.id);
            zombie.element.remove();
            popup.remove();
        }, 500);
    };

    // Update zombie positions
    const updateZombies = (deltaTime) => {
        State.gameState.zombies.forEach(zombie => {
            // Update position
            zombie.y += zombie.type.speed * deltaTime * 0.1;
            zombie.element.style.top = `${zombie.y}px`;

            // Remove if out of bounds
            if (zombie.y > gameContainer.clientHeight) {
                State.removeZombie(zombie.id);
                zombie.element.remove();
            }
        });
    };

    // Spawn new zombie
    const spawnZombie = () => {
        if (State.gameState.isPaused) return;

        const currentTime = Date.now();
        if (currentTime - State.gameState.lastSpawnTime >= State.gameState.spawnInterval) {
            createZombie();
            State.gameState.lastSpawnTime = currentTime;
        }
    };

    // Game loop
    const gameLoop = (timestamp) => {
        if (!State.gameState.isPlaying) return;

        if (!lastFrameTime) lastFrameTime = timestamp;
        const deltaTime = timestamp - lastFrameTime;

        if (!State.gameState.isPaused) {
            spawnZombie();
            updateZombies(deltaTime);
        }

        lastFrameTime = timestamp;
        animationFrame = requestAnimationFrame(gameLoop);
    };

    // Update game displays
    const updateDisplays = () => {
        scoreDisplay.textContent = State.gameState.score;
        levelDisplay.textContent = State.gameState.level;
        gameBonusDisplay.textContent = State.bonusPoints;

        // Update button states
        startButton.textContent = State.gameState.isPlaying ? 'Заново' : 'Начать игру';
        pauseButton.disabled = !State.gameState.isPlaying;
        pauseButton.textContent = State.gameState.isPaused ? 'Продолжить' : 'Пауза';
    };

    // Start game
    const startGame = () => {
        // Clear previous game
        gameContainer.innerHTML = '';
        cancelAnimationFrame(animationFrame);
        lastFrameTime = null;

        // Initialize new game
        State.startGame();
        animationFrame = requestAnimationFrame(gameLoop);

        // Play start sound
        utils.playSound('src/assets/sounds/start.mp3', 0.5);
    };

    // Toggle pause
    const togglePause = () => {
        State.pauseGame();

        // Add pause overlay
        let overlay = gameContainer.querySelector('.pause-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'pause-overlay';
            overlay.textContent = 'ПАУЗА';
            gameContainer.appendChild(overlay);
        }

        if (State.gameState.isPaused) {
            overlay.classList.add('active');
            utils.playSound('src/assets/sounds/pause.mp3', 0.3);
        } else {
            overlay.classList.remove('active');
            utils.playSound('src/assets/sounds/unpause.mp3', 0.3);
        }
    };

    // Initialize game
    const initGame = () => {
        // Add event listeners
        startButton.addEventListener('click', startGame);
        pauseButton.addEventListener('click', togglePause);

        // Subscribe to state changes
        State.addListener(updateDisplays);

        // Add keyboard controls
        document.addEventListener('keydown', (e) => {
            if (!State.gameState.isPlaying) return;

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    togglePause();
                    break;
                case 'KeyR':
                    startGame();
                    break;
            }
        });

        // Initial display update
        updateDisplays();
    };

    // Initialize when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGame);
    } else {
        initGame();
    }
})(); 