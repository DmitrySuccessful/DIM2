import { state, updateBalance } from '../main.js';

export class Sudoku {
    constructor(container, onGameEnd) {
        this.container = container;
        this.onGameEnd = onGameEnd;
        this.board = Array(9).fill().map(() => Array(9).fill(0));
        this.solution = Array(9).fill().map(() => Array(9).fill(0));
        this.fixed = Array(9).fill().map(() => Array(9).fill(false));
        this.selectedCell = null;
        this.gameOver = false;
        this.reward = 100;

        this.init();
    }

    init() {
        this.container.innerHTML = `
            <div class="game-container">
                <div class="sudoku-board"></div>
                <div class="number-pad"></div>
                <div class="game-controls">
                    <div class="game-status"></div>
                    <div class="game-buttons">
                        <button class="game-btn secondary" id="check-solution">Check Solution</button>
                        <button class="game-btn primary" id="new-game">New Game</button>
                    </div>
                </div>
            </div>
        `;

        this.boardElement = this.container.querySelector('.sudoku-board');
        this.numberPadElement = this.container.querySelector('.number-pad');
        this.statusElement = this.container.querySelector('.game-status');
        this.checkButton = this.container.querySelector('#check-solution');
        this.newGameButton = this.container.querySelector('#new-game');

        this.createBoard();
        this.createNumberPad();
        this.setupEventListeners();
        this.generatePuzzle();
    }

    createBoard() {
        this.boardElement.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cell = document.createElement('input');
                cell.type = 'text';
                cell.className = 'sudoku-cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                cell.maxLength = 1;
                this.boardElement.appendChild(cell);
            }
        }
    }

    createNumberPad() {
        this.numberPadElement.innerHTML = '';
        for (let i = 1; i <= 9; i++) {
            const button = document.createElement('button');
            button.className = 'game-btn';
            button.textContent = i;
            button.dataset.number = i;
            this.numberPadElement.appendChild(button);
        }
    }

    setupEventListeners() {
        this.boardElement.addEventListener('click', (e) => {
            if (e.target.classList.contains('sudoku-cell')) {
                this.handleCellClick(e.target);
            }
        });

        this.boardElement.addEventListener('input', (e) => {
            if (e.target.classList.contains('sudoku-cell')) {
                this.handleCellInput(e.target);
            }
        });

        this.numberPadElement.addEventListener('click', (e) => {
            if (e.target.dataset.number) {
                this.handleNumberPadClick(e.target.dataset.number);
            }
        });

        this.checkButton.addEventListener('click', () => this.checkSolution());
        this.newGameButton.addEventListener('click', () => this.generatePuzzle());
    }

    handleCellClick(cell) {
        if (this.gameOver || this.fixed[cell.dataset.row][cell.dataset.col]) return;

        if (this.selectedCell) {
            this.selectedCell.classList.remove('active');
        }
        this.selectedCell = cell;
        cell.classList.add('active');
    }

    handleCellInput(cell) {
        const value = cell.value.replace(/[^1-9]/g, '');
        cell.value = value;

        if (value) {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            this.board[row][col] = parseInt(value);
            
            if (!this.isValidMove(row, col, parseInt(value))) {
                cell.classList.add('error');
            } else {
                cell.classList.remove('error');
            }
        }
    }

    handleNumberPadClick(number) {
        if (this.selectedCell && !this.fixed[this.selectedCell.dataset.row][this.selectedCell.dataset.col]) {
            this.selectedCell.value = number;
            const event = new Event('input');
            this.selectedCell.dispatchEvent(event);
        }
    }

    generatePuzzle() {
        // Reset game state
        this.gameOver = false;
        this.board = Array(9).fill().map(() => Array(9).fill(0));
        this.solution = Array(9).fill().map(() => Array(9).fill(0));
        this.fixed = Array(9).fill().map(() => Array(9).fill(false));

        // Generate solution
        this.generateSolution(0, 0);

        // Copy solution
        this.solution = this.board.map(row => [...row]);

        // Remove numbers to create puzzle
        this.createPuzzle();

        // Update display
        this.updateDisplay();
        this.statusElement.textContent = 'Game started!';
    }

    generateSolution(row, col) {
        if (col >= 9) {
            row++;
            col = 0;
        }
        if (row >= 9) return true;

        const numbers = this.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        
        for (let num of numbers) {
            if (this.isValidMove(row, col, num)) {
                this.board[row][col] = num;
                if (this.generateSolution(row, col + 1)) {
                    return true;
                }
                this.board[row][col] = 0;
            }
        }
        
        return false;
    }

    createPuzzle() {
        const cellsToRemove = 40; // Adjust difficulty by changing this number
        let removed = 0;
        
        while (removed < cellsToRemove) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);
            
            if (this.board[row][col] !== 0) {
                this.board[row][col] = 0;
                removed++;
            }
        }

        // Mark fixed cells
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                this.fixed[i][j] = this.board[i][j] !== 0;
            }
        }
    }

    updateDisplay() {
        const cells = this.boardElement.getElementsByClassName('sudoku-cell');
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cell = cells[i * 9 + j];
                const value = this.board[i][j];
                cell.value = value || '';
                cell.readOnly = this.fixed[i][j];
                if (this.fixed[i][j]) {
                    cell.classList.add('fixed');
                } else {
                    cell.classList.remove('fixed');
                }
                cell.classList.remove('error');
            }
        }
    }

    isValidMove(row, col, num) {
        // Check row
        for (let j = 0; j < 9; j++) {
            if (j !== col && this.board[row][j] === num) return false;
        }

        // Check column
        for (let i = 0; i < 9; i++) {
            if (i !== row && this.board[i][col] === num) return false;
        }

        // Check 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const currentRow = boxRow + i;
                const currentCol = boxCol + j;
                if (currentRow !== row || currentCol !== col) {
                    if (this.board[currentRow][currentCol] === num) return false;
                }
            }
        }

        return true;
    }

    checkSolution() {
        // Check if board is complete
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.board[i][j] === 0) {
                    this.statusElement.textContent = 'The puzzle is not complete!';
                    return;
                }
            }
        }

        // Check if solution is correct
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.board[i][j] !== this.solution[i][j]) {
                    this.statusElement.textContent = 'The solution is incorrect!';
                    return;
                }
            }
        }

        // Puzzle solved
        this.gameOver = true;
        state.stats.gamesPlayed++;
        state.stats.gamesWon++;
        state.balance += this.reward;
        updateBalance();
        this.statusElement.textContent = `Congratulations! You solved it! +${this.reward} Nitcoins`;
        this.onGameEnd(true);
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
} 