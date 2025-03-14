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

// Achievement Manager
class AchievementManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.achievements = achievements;
    }

    // Initialize achievements
    init() {
        if (!this.gameState.achievements) {
            this.gameState.achievements = {};
        }
        this.renderAchievements();
        this.checkAchievements();
    }

    // Render achievements in UI
    renderAchievements() {
        const container = document.getElementById('achievements-list');
        if (!container) return;

        container.innerHTML = '';

        this.achievements.forEach(achievement => {
            const achievementElement = this.createAchievementElement(achievement);
            container.appendChild(achievementElement);
        });
    }

    // Create achievement element
    createAchievementElement(achievement) {
        const element = document.createElement('div');
        element.className = 'achievement';
        element.dataset.achievementId = achievement.id;

        const currentLevel = this.getCurrentLevel(achievement);
        const progress = this.calculateProgress(achievement);
        const isMaxLevel = currentLevel >= achievement.levels.length;

        if (isMaxLevel) {
            element.classList.add('completed');
        }

        const nextLevel = isMaxLevel ? achievement.levels[achievement.levels.length - 1] : achievement.levels[currentLevel];

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
                <span class="progress-text">${isMaxLevel ? 'Завершено!' : `${progress}%`}</span>
            </div>
            ${!isMaxLevel ? `<div class="achievement-reward">Награда: +${nextLevel.reward}</div>` : ''}
        `;

        return element;
    }

    // Get current level of achievement
    getCurrentLevel(achievement) {
        const saved = this.gameState.achievements[achievement.id];
        return saved ? saved.level : 0;
    }

    // Calculate achievement progress
    calculateProgress(achievement) {
        const currentLevel = this.getCurrentLevel(achievement);
        if (currentLevel >= achievement.levels.length) return 100;

        const level = achievement.levels[currentLevel];
        let current = 0;

        switch (achievement.category) {
            case AchievementCategory.CLICKS:
                current = this.gameState.stats.totalClicks;
                break;
            case AchievementCategory.BALANCE:
                current = this.gameState.balance;
                break;
            case AchievementCategory.GAMES:
                current = this.gameState.stats.gamesWon;
                break;
            case AchievementCategory.TASKS:
                current = this.gameState.completedTasks.length;
                break;
        }

        return Math.min((current / level.requirement) * 100, 100);
    }

    // Check achievements progress
    checkAchievements() {
        this.achievements.forEach(achievement => {
            const currentLevel = this.getCurrentLevel(achievement);
            if (currentLevel >= achievement.levels.length) return;

            const progress = this.calculateProgress(achievement);
            if (progress >= 100) {
                this.completeAchievement(achievement);
            }
        });
    }

    // Complete achievement
    completeAchievement(achievement) {
        const currentLevel = this.getCurrentLevel(achievement);
        if (currentLevel >= achievement.levels.length) return;

        const level = achievement.levels[currentLevel];

        // Update achievement state
        this.gameState.achievements[achievement.id] = {
            level: currentLevel + 1,
            completedAt: Date.now()
        };

        // Add reward
        this.gameState.balance += level.reward;

        // Update UI
        this.renderAchievements();
        this.showAchievementNotification(achievement, currentLevel + 1);

        // Save game
        this.gameState.save();
    }

    // Show achievement notification
    showAchievementNotification(achievement, level) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <h4>Достижение разблокировано!</h4>
            <p>${achievement.title} - Уровень ${level}</p>
            <span class="reward">+${achievement.levels[level - 1].reward}</span>
        `;

        document.body.appendChild(notification);

        // Remove notification after animation
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

export default AchievementManager; 