import { TicTacToe } from './games/tictactoe.js';
import { Sudoku } from './games/sudoku.js';
import { state, updateBalance } from './main.js';

// Game definitions
const gameDefinitions = {
    tictactoe: {
        id: 'tictactoe',
        title: 'Крестики-нолики',
        description: 'Классическая игра. Победите компьютер!',
        reward: 50,
        class: TicTacToe
    },
    sudoku: {
        id: 'sudoku',
        title: 'Судоку',
        description: 'Заполните сетку числами',
        reward: 100,
        class: Sudoku
    }
};

// Active game instance
let activeGame = null;

// Initialize games
export function initGames() {
    const gamesList = document.querySelector('.games-grid');
    if (!gamesList) return;

    // Clear existing content
    gamesList.innerHTML = '';

    // Add game cards
    Object.values(gameDefinitions).forEach(game => {
        const gameCard = document.createElement('div');
        gameCard.className = 'game-card';
        gameCard.innerHTML = `
            <h3>${game.title}</h3>
            <p>${game.description}</p>
            <p class="game-reward">Награда: ${game.reward} монет</p>
            <button class="game-btn" data-game="${game.id}">Играть</button>
        `;
        gamesList.appendChild(gameCard);
    });

    // Setup event listeners
    gamesList.addEventListener('click', (e) => {
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

    const modal = document.getElementById('game-modal');
    const gameContainer = document.getElementById('game-container');
    
    if (!modal || !gameContainer) return;

    // Clear game container
    gameContainer.innerHTML = '';

    // Create game instance
    activeGame = new gameDefinition.class(gameContainer, (won) => {
        if (won) {
            state.stats.gamesWon++;
            state.balance += gameDefinition.reward;
            updateBalance();
        }
        setTimeout(() => {
            modal.style.display = 'none';
        }, 2000);
    });

    // Show modal
    modal.style.display = 'flex';

    // Setup close button
    const closeBtn = modal.querySelector('.close');
    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.style.display = 'none';
            activeGame = null;
        };
    }
}

// Export functions
export {
    gameDefinitions,
    startGame
}; 