import { state, updateBalance } from '../main.js';

export class TicTacToe {
    constructor(container, onGameEnd) {
        this.container = container;
        this.onGameEnd = onGameEnd;
        this.board = Array(9).fill('');
        this.currentPlayer = 'x';
        this.gameOver = false;
        this.reward = 50;

        this.init();
    }

    init() {
        this.container.innerHTML = `
            <div class="game-container">
                <div class="tictactoe-board"></div>
                <div class="game-controls">
                    <div class="game-status"></div>
                    <div class="game-buttons">
                        <button class="game-btn primary" id="restart-game">New Game</button>
                    </div>
                </div>
            </div>
        `;

        this.boardElement = this.container.querySelector('.tictactoe-board');
        this.statusElement = this.container.querySelector('.game-status');
        this.restartButton = this.container.querySelector('#restart-game');

        this.createBoard();
        this.setupEventListeners();
        this.updateStatus();
    }

    createBoard() {
        this.boardElement.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('button');
            cell.className = 'tictactoe-cell';
            cell.dataset.index = i;
            this.boardElement.appendChild(cell);
        }
    }

    setupEventListeners() {
        this.boardElement.addEventListener('click', (e) => {
            if (e.target.classList.contains('tictactoe-cell')) {
                this.handleCellClick(e.target);
            }
        });

        this.restartButton.addEventListener('click', () => this.resetGame());
    }

    handleCellClick(cell) {
        const index = cell.dataset.index;
        if (this.board[index] || this.gameOver) return;

        // Player move
        this.makeMove(index);
        
        // Check for win or draw
        if (this.checkWin()) {
            this.endGame('win');
            return;
        }
        if (this.checkDraw()) {
            this.endGame('draw');
            return;
        }

        // AI move
        this.makeAIMove();
    }

    makeMove(index) {
        this.board[index] = this.currentPlayer;
        const cell = this.boardElement.children[index];
        cell.textContent = this.currentPlayer.toUpperCase();
        cell.classList.add(this.currentPlayer);
        this.currentPlayer = this.currentPlayer === 'x' ? 'o' : 'x';
        this.updateStatus();
    }

    makeAIMove() {
        setTimeout(() => {
            if (this.gameOver) return;

            // Find best move
            const availableMoves = this.board
                .map((cell, index) => cell ? null : index)
                .filter(index => index !== null);

            if (availableMoves.length === 0) return;

            // Simple AI: randomly choose an available move
            const randomIndex = Math.floor(Math.random() * availableMoves.length);
            const move = availableMoves[randomIndex];

            this.makeMove(move);

            // Check for win or draw
            if (this.checkWin()) {
                this.endGame('lose');
                return;
            }
            if (this.checkDraw()) {
                this.endGame('draw');
            }
        }, 500);
    }

    checkWin() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];

        return winPatterns.some(pattern => {
            const [a, b, c] = pattern;
            return this.board[a] &&
                   this.board[a] === this.board[b] &&
                   this.board[a] === this.board[c];
        });
    }

    checkDraw() {
        return this.board.every(cell => cell !== '');
    }

    endGame(result) {
        this.gameOver = true;
        state.stats.gamesPlayed++;

        if (result === 'win') {
            state.stats.gamesWon++;
            state.balance += this.reward;
            updateBalance();
            this.statusElement.textContent = `You won! +${this.reward} Nitcoins`;
        } else if (result === 'lose') {
            this.statusElement.textContent = 'Game Over - You lost!';
        } else {
            this.statusElement.textContent = 'Game Over - Draw!';
        }

        this.onGameEnd(result === 'win');
    }

    updateStatus() {
        if (!this.gameOver) {
            this.statusElement.textContent = `Current turn: ${this.currentPlayer.toUpperCase()}`;
        }
    }

    resetGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'x';
        this.gameOver = false;
        this.createBoard();
        this.updateStatus();
    }
} 