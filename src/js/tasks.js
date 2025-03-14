import { state, updateBalance } from './main.js';

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

// Initialize tasks
export function initTasks() {
    renderTasks();
    checkTasks();
}

// Render tasks
function renderTasks() {
    const container = document.querySelector('.tasks-list');
    if (!container) return;

    container.innerHTML = '';

    tasks.forEach(task => {
        const element = createTaskElement(task);
        container.appendChild(element);
    });
}

// Create task element
function createTaskElement(task) {
    const element = document.createElement('div');
    element.className = 'task';
    element.dataset.taskId = task.id;

    const isCompleted = state.completedTasks.includes(task.id);
    if (isCompleted) {
        element.classList.add('completed');
    }

    const progress = calculateTaskProgress(task);

    element.innerHTML = `
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

    return element;
}

// Calculate task progress
function calculateTaskProgress(task) {
    let current = 0;

    switch (task.type) {
        case TaskType.CLICKS:
            current = state.stats.totalClicks;
            break;
        case TaskType.BALANCE:
            current = state.balance;
            break;
        case TaskType.GAMES_WON:
            current = state.stats.gamesWon;
            break;
        case TaskType.TIME_PLAYED:
            current = (Date.now() - state.startTime) / 1000 / 60; // minutes
            break;
    }

    return (current / task.target) * 100;
}

// Check tasks completion
export function checkTasks() {
    tasks.forEach(task => {
        if (state.completedTasks.includes(task.id)) return;

        const progress = calculateTaskProgress(task);
        if (progress >= 100) {
            completeTask(task);
        }
    });
}

// Complete task
function completeTask(task) {
    if (state.completedTasks.includes(task.id)) return;

    // Add reward
    state.balance += task.reward;
    state.completedTasks.push(task.id);
    updateBalance();

    // Update UI
    const taskElement = document.querySelector(`[data-task-id="${task.id}"]`);
    if (taskElement) {
        taskElement.classList.add('completed');
        showTaskCompletionNotification(task);
    }
}

// Show task completion notification
function showTaskCompletionNotification(task) {
    const notification = document.createElement('div');
    notification.className = 'task-notification';
    notification.innerHTML = `
        <h4>Задание выполнено!</h4>
        <p>${task.title}</p>
        <span class="reward">+${task.reward}</span>
    `;

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
} 