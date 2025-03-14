import { state, updateBalance } from '../main.js';

export class TicTacToe {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameEnded = false;
        this.reward = 50;

        this.start();
    }

    // Start new game
    start() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameEnded = false;
        this.render();
    }

    // Render game board
    render() {
        const container = document.getElementById('game-container');
        if (!container) return;

        container.innerHTML = `
            <div class="tictactoe-board">
                ${this.board.map((cell, index) => `
                    <button class="tictactoe-cell${cell ? ' ' + cell.toLowerCase() : ''}" 
                            data-index="${index}"
                            ${cell || this.gameEnded ? 'disabled' : ''}>
                        ${cell}
                    </button>
                `).join('')}
            </div>
            <div class="game-status">
                ${this.gameEnded ? '' : `Ход: ${this.currentPlayer}`}
            </div>
        `;

        // Add click handlers
        container.querySelectorAll('.tictactoe-cell').forEach(cell => {
            cell.addEventListener('click', () => this.makeMove(parseInt(cell.dataset.index)));
        });
    }

    // Make move
    makeMove(index) {
        if (this.board[index] || this.gameEnded) return;

        // Update board
        this.board[index] = this.currentPlayer;

        // Check for win or draw
        if (this.checkWin()) {
            this.gameEnded = true;
            if (this.currentPlayer === 'X') {
                this.gameManager.onGameWin();
            }
            this.render();
            this.endGame('win');
            return;
        }

        if (this.checkDraw()) {
            this.gameEnded = true;
            this.render();
            this.endGame('draw');
            return;
        }

        // Switch player
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';

        // Render board
        this.render();

        // AI move if it's O's turn
        if (this.currentPlayer === 'O') {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }

    // AI move
    makeAIMove() {
        if (this.gameEnded) return;

        // Find best move
        const bestMove = this.findBestMove();
        if (bestMove !== -1) {
            this.makeMove(bestMove);
        }
    }

    // Find best move for AI
    findBestMove() {
        // First, try to win
        for (let i = 0; i < 9; i++) {
            if (!this.board[i]) {
                this.board[i] = 'O';
                if (this.checkWin()) {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }

        // Second, block player's winning move
        for (let i = 0; i < 9; i++) {
            if (!this.board[i]) {
                this.board[i] = 'X';
                if (this.checkWin()) {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }

        // Third, try to take center
        if (!this.board[4]) return 4;

        // Finally, take any available corner or side
        const corners = [0, 2, 6, 8];
        const sides = [1, 3, 5, 7];

        // Try corners first
        for (const i of corners) {
            if (!this.board[i]) return i;
        }

        // Then try sides
        for (const i of sides) {
            if (!this.board[i]) return i;
        }

        return -1;
    }

    // Check for win
    checkWin() {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];

        return lines.some(([a, b, c]) => {
            return this.board[a] &&
                   this.board[a] === this.board[b] &&
                   this.board[a] === this.board[c];
        });
    }

    // Check for draw
    checkDraw() {
        return this.board.every(cell => cell !== '');
    }

    endGame(result) {
        this.gameEnded = true;
        state.stats.gamesPlayed++;

        if (result === 'win') {
            state.stats.gamesWon++;
            state.balance += this.reward;
            updateBalance();
            this.render();
        } else if (result === 'lose') {
            this.render();
        } else {
            this.render();
        }

        this.gameManager.onGameEnd(result === 'win');
    }
}

export default TicTacToe; 