import { state, elements, updateBalance } from './main.js';

// Task definitions
const taskDefinitions = {
    clickTask: {
        id: 'clickTask',
        title: 'Click Master',
        description: 'Click the coin {target} times',
        type: 'click',
        targetValues: [10, 50, 100, 500, 1000],
        rewards: [5, 25, 50, 250, 500],
        getProgress: () => state.stats.totalClicks,
        onComplete: (reward) => {
            state.balance += reward;
            updateBalance();
        }
    },
    earningTask: {
        id: 'earningTask',
        title: 'Wealth Builder',
        description: 'Earn a total of {target} Nitcoins',
        type: 'earning',
        targetValues: [100, 500, 1000, 5000, 10000],
        rewards: [10, 50, 100, 500, 1000],
        getProgress: () => state.stats.totalEarned,
        onComplete: (reward) => {
            state.balance += reward;
            updateBalance();
        }
    },
    gameTask: {
        id: 'gameTask',
        title: 'Game Master',
        description: 'Win {target} mini-games',
        type: 'game',
        targetValues: [1, 5, 10, 25, 50],
        rewards: [20, 100, 200, 500, 1000],
        getProgress: () => state.stats.gamesWon,
        onComplete: (reward) => {
            state.balance += reward;
            updateBalance();
        }
    }
};

// Initialize tasks
export function initTasks() {
    // Initialize task state if not exists
    if (!state.tasks.active) {
        state.tasks.active = {};
        state.tasks.completed = new Set();
        
        // Initialize first level of each task
        Object.values(taskDefinitions).forEach(task => {
            activateTask(task, 0);
        });
    }

    // Render tasks
    renderTasks();
}

// Activate a new task
function activateTask(taskDef, level) {
    if (level >= taskDef.targetValues.length) return;

    state.tasks.active[taskDef.id] = {
        ...taskDef,
        currentLevel: level,
        target: taskDef.targetValues[level],
        reward: taskDef.rewards[level]
    };
}

// Render tasks
function renderTasks() {
    elements.taskList.innerHTML = '';

    Object.values(state.tasks.active).forEach(task => {
        const progress = task.getProgress();
        const progressPercent = Math.min((progress / task.target) * 100, 100);
        
        const taskElement = document.createElement('div');
        taskElement.className = 'task';
        taskElement.innerHTML = `
            <div class="task-header">
                <h3>${task.title}</h3>
                <span class="task-reward">+${task.reward}</span>
            </div>
            <p>${task.description.replace('{target}', task.target)}</p>
            <div class="task-progress">
                <div class="progress-bar">
                    <div class="progress" style="width: ${progressPercent}%"></div>
                </div>
                <span class="progress-text">${progress}/${task.target}</span>
            </div>
        `;

        elements.taskList.appendChild(taskElement);
    });
}

// Check task progress
export function checkTasks() {
    Object.values(state.tasks.active).forEach(task => {
        const progress = task.getProgress();
        if (progress >= task.target) {
            // Complete task
            task.onComplete(task.reward);
            state.tasks.completed.add(`${task.id}_${task.currentLevel}`);
            
            // Activate next level
            activateTask(taskDefinitions[task.id], task.currentLevel + 1);
            
            // Show completion animation
            showTaskComplete(task);
        }
    });

    // Update task display
    renderTasks();
}

// Show task completion animation
function showTaskComplete(task) {
    const notification = document.createElement('div');
    notification.className = 'task-complete';
    notification.innerHTML = `
        <h3>Task Complete!</h3>
        <p>${task.title}</p>
        <p class="reward">+${task.reward} Nitcoins</p>
    `;

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Export functions
export {
    taskDefinitions,
    renderTasks
}; 