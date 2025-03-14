import { state, elements, updateBalance } from './main.js';

// Task Types
const TaskType = {
    CLICKS: 'clicks',
    BALANCE: 'balance',
    GAMES_WON: 'gamesWon',
    TIME_PLAYED: 'timePlayed'
};

// Task Definitions
const tasks = [
    {
        id: 'click_100',
        type: TaskType.CLICKS,
        target: 100,
        reward: 50,
        title: 'Начинающий кликер',
        description: 'Кликните 100 раз'
    },
    {
        id: 'balance_1000',
        type: TaskType.BALANCE,
        target: 1000,
        reward: 200,
        title: 'Первая тысяча',
        description: 'Накопите 1000 нитокоинов'
    },
    {
        id: 'games_3',
        type: TaskType.GAMES_WON,
        target: 3,
        reward: 300,
        title: 'Игрок',
        description: 'Выиграйте 3 мини-игры'
    }
    // Add more tasks as needed
];

// Task Manager
class TaskManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.tasks = tasks;
        this.activeTask = null;
    }

    // Initialize tasks
    init() {
        this.renderTasks();
        this.checkTasks();
    }

    // Render tasks in UI
    renderTasks() {
        const tasksContainer = document.getElementById('tasks-list');
        if (!tasksContainer) return;

        tasksContainer.innerHTML = '';

        this.tasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            tasksContainer.appendChild(taskElement);
        });
    }

    // Create task element
    createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = 'task';
        taskElement.dataset.taskId = task.id;

        const isCompleted = this.gameState.completedTasks.includes(task.id);
        if (isCompleted) {
            taskElement.classList.add('completed');
        }

        const progress = this.calculateTaskProgress(task);

        taskElement.innerHTML = `
            <div class="task-header">
                <h3>${task.title}</h3>
                <span class="task-reward">+${task.reward}</span>
            </div>
            <p>${task.description}</p>
            <div class="task-progress">
                <div class="progress-bar">
                    <div class="progress" style="width: ${progress}%"></div>
                </div>
                <span class="progress-text">${Math.min(100, progress)}%</span>
            </div>
        `;

        return taskElement;
    }

    // Calculate task progress
    calculateTaskProgress(task) {
        let current = 0;

        switch (task.type) {
            case TaskType.CLICKS:
                current = this.gameState.stats.totalClicks;
                break;
            case TaskType.BALANCE:
                current = this.gameState.balance;
                break;
            case TaskType.GAMES_WON:
                current = this.gameState.stats.gamesWon;
                break;
            case TaskType.TIME_PLAYED:
                current = (Date.now() - this.gameState.startTime) / 1000 / 60; // minutes
                break;
        }

        return (current / task.target) * 100;
    }

    // Check task completion
    checkTasks() {
        this.tasks.forEach(task => {
            if (this.gameState.completedTasks.includes(task.id)) return;

            const progress = this.calculateTaskProgress(task);
            if (progress >= 100) {
                this.completeTask(task);
            }
        });
    }

    // Complete task
    completeTask(task) {
        if (this.gameState.completedTasks.includes(task.id)) return;

        // Add reward
        this.gameState.balance += task.reward;
        this.gameState.completedTasks.push(task.id);

        // Update UI
        const taskElement = document.querySelector(`[data-task-id="${task.id}"]`);
        if (taskElement) {
            taskElement.classList.add('completed');
            this.showTaskCompletionNotification(task);
        }

        // Save game
        this.gameState.save();
    }

    // Show task completion notification
    showTaskCompletionNotification(task) {
        const notification = document.createElement('div');
        notification.className = 'task-notification';
        notification.innerHTML = `
            <h4>Задание выполнено!</h4>
            <p>${task.title}</p>
            <span class="reward">+${task.reward}</span>
        `;

        document.body.appendChild(notification);

        // Remove notification after animation
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

export default TaskManager; 