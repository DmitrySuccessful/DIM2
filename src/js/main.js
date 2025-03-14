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
    particles: document.getElementById('click-particles')
};

// Imports
import { initTasks } from './tasks.js';
import { initGames } from './games.js';
import { initAchievements } from './achievements.js';

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
    // Update balance
    state.balance += state.clickValue;
    state.stats.totalClicks++;
    state.stats.totalEarned += state.clickValue;
    updateBalance();
    updateStats();

    // Create particles
    createClickParticles(event);

    // Add bounce animation
    elements.coin.classList.add('coin-bounce');
    setTimeout(() => elements.coin.classList.remove('coin-bounce'), 300);
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
function createClickParticles(event) {
    if (!elements.particles) return;

    const rect = elements.coin.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    for (let i = 0; i < 5; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.setProperty('--angle', `${Math.random() * 360}deg`);
        elements.particles.appendChild(particle);

        setTimeout(() => particle.remove(), 1000);
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

// Export state and functions for other modules
export {
    state,
    elements,
    updateBalance,
    formatNumber,
    saveGameState
}; 