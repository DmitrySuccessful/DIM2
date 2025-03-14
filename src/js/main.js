// Game state
const state = {
    balance: 0,
    clickValue: 1,
    upgrades: {},
    tasks: {},
    achievements: {},
    completedTasks: [],
    stats: {
        totalClicks: 0,
        totalEarned: 0,
        gamesPlayed: 0,
        gamesWon: 0
    }
};

// DOM Elements
const elements = {
    balance: document.getElementById('balance'),
    coin: document.getElementById('coin'),
    clicks: document.getElementById('clicks'),
    perClick: document.getElementById('per-click'),
    particles: document.getElementById('click-particles'),
    loader: document.getElementById('loader'),
    container: document.querySelector('.container')
};

// Imports
import { initTasks } from './tasks.js';
import { initGames } from './games.js';
import { initAchievements } from './achievements.js';
import { updateBalance } from './state.js';
import { initUpgrades } from './upgrades.js';
import { sounds } from './sounds.js';

// Анимации GSAP
const animations = {
    coin: gsap.timeline({ paused: true })
        .to('#coin', { 
            scale: 0.9, 
            duration: 0.1,
            ease: 'power2.out'
        })
        .to('#coin', {
            scale: 1,
            duration: 0.2,
            ease: 'elastic.out'
        }),
    
    particle: (element) => {
        const randomX = (Math.random() - 0.5) * 100;
        const randomY = -50 - Math.random() * 50;
        
        return gsap.timeline()
            .from(element, {
                opacity: 1,
                scale: 1,
                duration: 0.8
            })
            .to(element, {
                x: randomX,
                y: randomY,
                opacity: 0,
                scale: 0,
                duration: 0.8,
                ease: 'power2.out',
                onComplete: () => element.remove()
            }, 0);
    },

    notification: (element) => {
        return gsap.timeline()
            .from(element, {
                x: '100%',
                opacity: 0,
                duration: 0.5,
                ease: 'power2.out'
            })
            .to(element, {
                opacity: 1,
                duration: 2
            })
            .to(element, {
                x: '100%',
                opacity: 0,
                duration: 0.5,
                delay: 1,
                onComplete: () => element.remove()
            });
    }
};

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Скрываем контейнер на время загрузки
        if (elements.container) {
            elements.container.style.visibility = 'hidden';
        }

        // Инициализируем игру
        await initGame();
        
        // Настраиваем обработчики событий
        setupEventListeners();
        
        // Загружаем сохраненное состояние
        loadGameState();
        
        // Показываем игру и скрываем loader
        if (elements.loader) {
            elements.loader.style.display = 'none';
        }
        if (elements.container) {
            elements.container.style.visibility = 'visible';
        }
    } catch (error) {
        console.error('Initialization error:', error);
        if (elements.loader) {
            elements.loader.innerHTML += `<p style="color: red">Error: ${error.message}</p>`;
        }
    }
});

// Initialize game
async function initGame() {
    updateBalance();
    await Promise.all([
        initTasks(),
        initGames(),
        initAchievements(),
        initUpgrades()
    ]);
    initParticles();
}

// Setup event listeners
function setupEventListeners() {
    // Coin click
    if (elements.coin) {
        elements.coin.addEventListener('click', handleCoinClick);
    }

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Auto-save
    setInterval(saveGameState, 30000);

    // Save before closing
    window.addEventListener('beforeunload', saveGameState);
}

// Handle coin click
function handleCoinClick(event) {
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Воспроизведение звука
    sounds.click();
    
    // Анимация монеты
    animations.coin.restart();
    
    // Создание частиц
    createParticles(x, y);
    
    // Обновление баланса
    updateBalance(state.clickValue);
    state.stats.totalClicks++;
    state.stats.totalEarned += state.clickValue;
    updateStats();
    
    // Проверка комбо
    updateCombo();
}

// Update balance display
function updateBalance() {
    if (elements.balance) {
        elements.balance.textContent = formatNumber(state.balance);
    }
}

// Update stats display
function updateStats() {
    if (elements.clicks) {
        elements.clicks.textContent = formatNumber(state.stats.totalClicks);
    }
    if (elements.perClick) {
        elements.perClick.textContent = formatNumber(state.clickValue);
    }
}

// Format number with commas
function formatNumber(num) {
    return num.toLocaleString();
}

// Switch tabs
function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabId);
    });

    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === tabId);
    });
}

// Create click particles
function createParticles(x, y) {
    const container = document.getElementById('click-particles');
    const particleCount = 5;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.innerHTML = '+' + state.clickValue;
        container.appendChild(particle);
        
        animations.particle(particle);
    }
}

// Initialize particles system
function initParticles() {
    const style = document.createElement('style');
    style.textContent = `
        .particle {
            position: absolute;
            width: 10px;
            height: 10px;
            background: #f7931a;
            border-radius: 50%;
            pointer-events: none;
            animation: particle 1s ease-out forwards;
            transform: rotate(var(--angle));
        }
        @keyframes particle {
            0% {
                opacity: 1;
                transform: translate(0, 0) scale(1);
            }
            100% {
                opacity: 0;
                transform: translate(var(--dx, 50px), var(--dy, -50px)) scale(0);
            }
        }
    `;
    document.head.appendChild(style);
}

// Save game state
function saveGameState() {
    localStorage.setItem('nitcoinClickerState', JSON.stringify(state));
}

// Load game state
function loadGameState() {
    const savedState = localStorage.getItem('nitcoinClickerState');
    if (savedState) {
        const loadedState = JSON.parse(savedState);
        Object.assign(state, loadedState);
        updateBalance();
        updateStats();
    }
}

// Система комбо
let comboTimer = null;
let comboProgress = 0;

function updateCombo() {
    if (comboTimer) clearTimeout(comboTimer);
    
    comboProgress += 10;
    if (comboProgress >= 100) {
        state.multiplier++;
        state.clickValue = state.baseClickValue * state.multiplier;
        comboProgress = 0;
        
        // Воспроизведение звука
        sounds.levelUp();
        
        // Обновление интерфейса
        document.getElementById('multiplier').textContent = state.multiplier;
        document.getElementById('per-click').textContent = state.clickValue;
        
        showNotification('Множитель увеличен!');
    }
    
    // Анимация прогресс-бара
    gsap.to('#combo-progress', {
        width: comboProgress + '%',
        duration: 0.3,
        ease: 'power2.out'
    });
    
    comboTimer = setTimeout(() => {
        comboProgress = Math.max(0, comboProgress - 20);
        gsap.to('#combo-progress', {
            width: comboProgress + '%',
            duration: 0.3,
            ease: 'power2.out'
        });
    }, 2000);
}

// Показ уведомлений
function showNotification(message) {
    const container = document.createElement('div');
    container.className = 'notification';
    container.textContent = message;
    document.body.appendChild(container);
    
    animations.notification(container);
}

// Обучение
function showTutorial() {
    const tutorial = document.getElementById('tutorial');
    const steps = tutorial.querySelectorAll('.tutorial-step');
    let currentStep = 0;
    
    tutorial.classList.remove('hidden');
    
    gsap.from(tutorial, {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out'
    });
    
    function showStep(index) {
        steps.forEach(step => step.style.display = 'none');
        if (steps[index]) {
            steps[index].style.display = 'block';
            gsap.from(steps[index], {
                x: -20,
                opacity: 0,
                duration: 0.5,
                ease: 'power2.out'
            });
        }
    }
    
    showStep(currentStep);
    
    tutorial.querySelector('.tutorial-next').addEventListener('click', () => {
        currentStep++;
        if (currentStep >= steps.length) {
            tutorial.classList.add('hidden');
        } else {
            showStep(currentStep);
        }
    });
    
    tutorial.querySelector('.tutorial-close').addEventListener('click', () => {
        tutorial.classList.add('hidden');
    });
}

// Export state and functions for other modules
export {
    state,
    elements,
    updateBalance,
    formatNumber,
    saveGameState
}; 