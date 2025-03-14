// Game state
const state = {
    balance: 0,
    clickValue: 1,
    upgrades: {},
    tasks: {},
    achievements: {},
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
    tabs: document.querySelectorAll('.tab'),
    tabContents: document.querySelectorAll('.tab-content'),
    taskList: document.getElementById('task-list'),
    gameList: document.getElementById('game-list'),
    achievementsList: document.getElementById('achievements-list')
};

// Imports
import { initTasks, checkTasks } from './tasks.js';
import { initGames } from './games.js';
import { initAchievements, checkAchievements, achievementDefinitions, getAchievementProgress } from './achievements.js';

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    setupEventListeners();
    loadGameState();
});

// Initialize game
function initGame() {
    updateBalance();
    initTasks();
    initGames();
    initAchievements();
    initParticles();
    renderAchievements();
}

// Setup event listeners
function setupEventListeners() {
    // Coin click
    elements.coin.addEventListener('click', handleCoinClick);

    // Tab switching
    elements.tabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Auto-save
    setInterval(saveGameState, 30000);

    // Save before closing
    window.addEventListener('beforeunload', saveGameState);
}

// Handle coin click
function handleCoinClick(event) {
    // Update balance
    state.balance += state.clickValue;
    state.stats.totalClicks++;
    state.stats.totalEarned += state.clickValue;
    updateBalance();

    // Create particles
    createClickParticles(event.clientX, event.clientY);

    // Add bounce animation
    elements.coin.classList.add('coin-bounce');
    setTimeout(() => elements.coin.classList.remove('coin-bounce'), 300);

    // Check for achievements and tasks
    checkAchievements();
    checkTasks();
}

// Update balance display
function updateBalance() {
    elements.balance.textContent = formatNumber(state.balance);
}

// Format number with commas
function formatNumber(num) {
    return num.toLocaleString();
}

// Switch tabs
function switchTab(tabId) {
    elements.tabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabId);
    });

    elements.tabContents.forEach(content => {
        content.classList.toggle('active', content.id === `${tabId}-content`);
    });

    // Update achievements display when switching to achievements tab
    if (tabId === 'achievements') {
        renderAchievements();
    }
}

// Create click particles
function createClickParticles(x, y) {
    const particles = document.createElement('div');
    particles.className = 'particles';
    particles.style.left = x + 'px';
    particles.style.top = y + 'px';

    for (let i = 0; i < 5; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.setProperty('--angle', `${Math.random() * 360}deg`);
        particles.appendChild(particle);
    }

    document.body.appendChild(particles);
    setTimeout(() => particles.remove(), 1000);
}

// Initialize particles system
function initParticles() {
    const style = document.createElement('style');
    style.textContent = `
        .particles {
            position: fixed;
            pointer-events: none;
            z-index: 9999;
        }
        .particle {
            position: absolute;
            width: 10px;
            height: 10px;
            background: gold;
            border-radius: 50%;
            animation: particle 1s ease-out forwards;
            transform: rotate(var(--angle));
        }
        @keyframes particle {
            0% {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
            100% {
                opacity: 0;
                transform: translateY(-50px) scale(0);
            }
        }
    `;
    document.head.appendChild(style);
}

// Render achievements
function renderAchievements() {
    if (!elements.achievementsList) return;

    elements.achievementsList.innerHTML = '';

    Object.values(achievementDefinitions).forEach(achievement => {
        const progress = getAchievementProgress(achievement.id);
        if (!progress) return;

        const achievementElement = document.createElement('div');
        achievementElement.className = 'achievement';
        
        if (progress.completed) {
            achievementElement.classList.add('completed');
            achievementElement.innerHTML = `
                <div class="achievement-header">
                    <h3>${achievement.title}</h3>
                    <span class="achievement-level">MAX LEVEL</span>
                </div>
                <p>All levels completed!</p>
                <div class="achievement-progress">
                    <div class="progress-bar">
                        <div class="progress" style="width: 100%"></div>
                    </div>
                </div>
            `;
        } else {
            const currentLevel = progress.currentLevel + 1;
            achievementElement.innerHTML = `
                <div class="achievement-header">
                    <h3>${achievement.title}</h3>
                    <span class="achievement-level">Level ${currentLevel}</span>
                </div>
                <p>${achievement.description.replace('{target}', progress.targetValue)}</p>
                <div class="achievement-progress">
                    <div class="progress-bar">
                        <div class="progress" style="width: ${progress.progress}%"></div>
                    </div>
                    <span class="progress-text">${progress.currentValue}/${progress.targetValue}</span>
                </div>
                <p class="achievement-reward">Next reward: ${progress.reward} Nitcoins</p>
            `;
        }

        elements.achievementsList.appendChild(achievementElement);
    });
}

// Save game state
function saveGameState() {
    localStorage.setItem('nitcoinClickerState', JSON.stringify(state));
}

// Load game state
function loadGameState() {
    const savedState = localStorage.getItem('nitcoinClickerState');
    if (savedState) {
        Object.assign(state, JSON.parse(savedState));
        updateBalance();
    }
}

// Export state and functions for other modules
export {
    state,
    elements,
    updateBalance,
    formatNumber,
    saveGameState
}; 