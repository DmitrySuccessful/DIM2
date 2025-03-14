import { state, updateBalance } from './main.js';

// Achievement definitions
const achievementDefinitions = {
    clickMaster: {
        id: 'clickMaster',
        title: 'Click Master',
        description: 'Click the coin {target} times',
        levels: [
            { target: 100, reward: 50 },
            { target: 500, reward: 250 },
            { target: 1000, reward: 500 },
            { target: 5000, reward: 2500 },
            { target: 10000, reward: 5000 }
        ],
        check: () => state.stats.totalClicks
    },
    wealthBuilder: {
        id: 'wealthBuilder',
        title: 'Wealth Builder',
        description: 'Earn a total of {target} Nitcoins',
        levels: [
            { target: 1000, reward: 100 },
            { target: 5000, reward: 500 },
            { target: 10000, reward: 1000 },
            { target: 50000, reward: 5000 },
            { target: 100000, reward: 10000 }
        ],
        check: () => state.stats.totalEarned
    },
    gameMaster: {
        id: 'gameMaster',
        title: 'Game Master',
        description: 'Win {target} games',
        levels: [
            { target: 5, reward: 250 },
            { target: 25, reward: 1250 },
            { target: 50, reward: 2500 },
            { target: 100, reward: 5000 },
            { target: 200, reward: 10000 }
        ],
        check: () => state.stats.gamesWon
    }
};

// Initialize achievements
export function initAchievements() {
    if (!state.achievements.unlocked) {
        state.achievements.unlocked = new Set();
        state.achievements.levels = {};
        
        // Initialize achievement levels
        Object.keys(achievementDefinitions).forEach(id => {
            state.achievements.levels[id] = 0;
        });
    }
}

// Check achievements
export function checkAchievements() {
    Object.values(achievementDefinitions).forEach(achievement => {
        const currentLevel = state.achievements.levels[achievement.id];
        if (currentLevel >= achievement.levels.length) return;

        const progress = achievement.check();
        const nextLevel = achievement.levels[currentLevel];

        if (progress >= nextLevel.target) {
            unlockAchievement(achievement, currentLevel);
        }
    });
}

// Unlock achievement
function unlockAchievement(achievement, level) {
    const achievementId = `${achievement.id}_${level}`;
    if (state.achievements.unlocked.has(achievementId)) return;

    // Update state
    state.achievements.unlocked.add(achievementId);
    state.achievements.levels[achievement.id]++;
    
    // Award reward
    const reward = achievement.levels[level].reward;
    state.balance += reward;
    updateBalance();

    // Show notification
    showAchievementNotification(achievement, level, reward);
}

// Show achievement notification
function showAchievementNotification(achievement, level, reward) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <h3>Achievement Unlocked!</h3>
        <p class="achievement-title">${achievement.title} - Level ${level + 1}</p>
        <p class="achievement-reward">+${reward} Nitcoins</p>
    `;

    document.body.appendChild(notification);

    // Add animation class after a small delay
    setTimeout(() => notification.classList.add('show'), 100);

    // Remove notification after animation
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// Get achievement progress
export function getAchievementProgress(achievementId) {
    const achievement = achievementDefinitions[achievementId];
    if (!achievement) return null;

    const currentLevel = state.achievements.levels[achievementId];
    if (currentLevel >= achievement.levels.length) {
        return {
            completed: true,
            progress: 100,
            currentLevel
        };
    }

    const progress = achievement.check();
    const nextLevel = achievement.levels[currentLevel];
    const progressPercent = Math.min((progress / nextLevel.target) * 100, 100);

    return {
        completed: false,
        progress: progressPercent,
        currentValue: progress,
        targetValue: nextLevel.target,
        currentLevel,
        reward: nextLevel.reward
    };
}

// Export definitions
export {
    achievementDefinitions
}; 