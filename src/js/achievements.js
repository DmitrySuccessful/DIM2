import { state, updateBalance } from './main.js';

// Achievement Categories
const AchievementCategory = {
    CLICKS: 'clicks',
    BALANCE: 'balance',
    GAMES: 'games',
    TASKS: 'tasks'
};

// Achievement Definitions
const achievements = [
    {
        id: 'click_master_1',
        category: AchievementCategory.CLICKS,
        title: 'Кликер-новичок',
        description: 'Сделайте 1,000 кликов',
        levels: [
            { requirement: 1000, reward: 100 },
            { requirement: 5000, reward: 500 },
            { requirement: 10000, reward: 1000 }
        ]
    },
    {
        id: 'wealth_1',
        category: AchievementCategory.BALANCE,
        title: 'Начинающий богач',
        description: 'Накопите 10,000 нитокоинов',
        levels: [
            { requirement: 10000, reward: 1000 },
            { requirement: 50000, reward: 5000 },
            { requirement: 100000, reward: 10000 }
        ]
    },
    {
        id: 'game_master_1',
        category: AchievementCategory.GAMES,
        title: 'Игровой мастер',
        description: 'Выиграйте 10 мини-игр',
        levels: [
            { requirement: 10, reward: 500 },
            { requirement: 25, reward: 1250 },
            { requirement: 50, reward: 2500 }
        ]
    },
    {
        id: 'task_master_1',
        category: AchievementCategory.TASKS,
        title: 'Исполнительный',
        description: 'Выполните 5 заданий',
        levels: [
            { requirement: 5, reward: 250 },
            { requirement: 15, reward: 750 },
            { requirement: 30, reward: 1500 }
        ]
    }
];

// Initialize achievements
export function initAchievements() {
    if (!state.achievements) {
        state.achievements = {};
    }
    renderAchievements();
    checkAchievements();
}

// Render achievements
function renderAchievements() {
    const container = document.getElementById('achievements-list');
    if (!container) return;

    container.innerHTML = '';

    achievements.forEach(achievement => {
        const element = createAchievementElement(achievement);
        container.appendChild(element);
    });
}

// Create achievement element
function createAchievementElement(achievement) {
    const element = document.createElement('div');
    element.className = 'achievement';
    element.dataset.achievementId = achievement.id;

    const progress = calculateProgress(achievement);
    const currentLevel = getCurrentLevel(achievement);
    const isMaxLevel = currentLevel >= achievement.levels.length;

    element.innerHTML = `
        <div class="achievement-header">
            <h3>${achievement.title}</h3>
            <span class="achievement-level">Уровень ${currentLevel + 1}</span>
        </div>
        <p>${achievement.description}</p>
        <div class="achievement-progress">
            <div class="progress-bar">
                <div class="progress" style="width: ${progress}%"></div>
            </div>
            <span class="progress-text">${Math.min(100, progress)}%</span>
        </div>
        ${!isMaxLevel ? `<div class="achievement-reward">Награда: +${achievement.levels[currentLevel].reward}</div>` : ''}
    `;

    if (isMaxLevel) {
        element.classList.add('completed');
    }

    return element;
}

// Get current level
function getCurrentLevel(achievement) {
    const saved = state.achievements[achievement.id];
    return saved ? saved.level : 0;
}

// Calculate achievement progress
function calculateProgress(achievement) {
    const currentLevel = getCurrentLevel(achievement);
    if (currentLevel >= achievement.levels.length) return 100;

    const level = achievement.levels[currentLevel];
    let current = 0;

    switch (achievement.category) {
        case AchievementCategory.CLICKS:
            current = state.stats.totalClicks;
            break;
        case AchievementCategory.BALANCE:
            current = state.balance;
            break;
        case AchievementCategory.GAMES:
            current = state.stats.gamesWon;
            break;
        case AchievementCategory.TASKS:
            current = state.completedTasks.length;
            break;
    }

    return Math.min((current / level.requirement) * 100, 100);
}

// Check achievements
export function checkAchievements() {
    achievements.forEach(achievement => {
        const currentLevel = getCurrentLevel(achievement);
        if (currentLevel >= achievement.levels.length) return;

        const progress = calculateProgress(achievement);
        if (progress >= 100) {
            completeAchievement(achievement);
        }
    });
}

// Complete achievement
function completeAchievement(achievement) {
    const currentLevel = getCurrentLevel(achievement);
    if (currentLevel >= achievement.levels.length) return;

    const level = achievement.levels[currentLevel];

    // Update achievement state
    state.achievements[achievement.id] = {
        level: currentLevel + 1,
        completedAt: Date.now()
    };

    // Add reward
    state.balance += level.reward;
    updateBalance();

    // Update UI
    renderAchievements();
    showAchievementNotification(achievement, currentLevel + 1);
}

// Show achievement notification
function showAchievementNotification(achievement, level) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <h4>Достижение разблокировано!</h4>
        <p>${achievement.title} - Уровень ${level}</p>
        <span class="reward">+${achievement.levels[level - 1].reward}</span>
    `;

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
} 