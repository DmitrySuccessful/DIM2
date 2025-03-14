import { TicTacToe } from './games/tictactoe.js';
import { Sudoku } from './games/sudoku.js';
import { elements } from './main.js';
import { checkTasks } from './tasks.js';

// Game definitions
const gameDefinitions = {
    tictactoe: {
        id: 'tictactoe',
        title: 'Tic Tac Toe',
        description: 'Classic game of X\'s and O\'s. Win to earn Nitcoins!',
        reward: 50,
        class: TicTacToe
    },
    sudoku: {
        id: 'sudoku',
        title: 'Sudoku',
        description: 'Fill the grid with numbers. Complete the puzzle to earn Nitcoins!',
        reward: 100,
        class: Sudoku
    }
};

// Active game instance
let activeGame = null;

// Initialize games
export function initGames() {
    renderGameList();
    setupEventListeners();
}

// Render game list
function renderGameList() {
    elements.gameList.innerHTML = '';

    Object.values(gameDefinitions).forEach(game => {
        const gameElement = document.createElement('div');
        gameElement.className = 'game-item';
        gameElement.innerHTML = `
            <h3>${game.title}</h3>
            <p>${game.description}</p>
            <p class="game-reward">Reward: ${game.reward} Nitcoins</p>
            <button class="game-btn primary" data-game="${game.id}">Play</button>
        `;

        elements.gameList.appendChild(gameElement);
    });
}

// Setup event listeners
function setupEventListeners() {
    elements.gameList.addEventListener('click', (e) => {
        const playButton = e.target.closest('button[data-game]');
        if (playButton) {
            const gameId = playButton.dataset.game;
            startGame(gameId);
        }
    });
}

// Start a game
function startGame(gameId) {
    const gameDefinition = gameDefinitions[gameId];
    if (!gameDefinition) return;

    // Clear game list
    elements.gameList.innerHTML = '';

    // Create game container
    const gameContainer = document.createElement('div');
    gameContainer.id = `${gameId}-container`;
    elements.gameList.appendChild(gameContainer);

    // Initialize game
    activeGame = new gameDefinition.class(gameContainer, (won) => {
        // Game end callback
        setTimeout(() => {
            endGame();
            if (won) {
                checkTasks();
            }
        }, 2000);
    });
}

// End current game
function endGame() {
    activeGame = null;
    renderGameList();
}

// Export functions
export {
    gameDefinitions,
    startGame,
    endGame
}; 