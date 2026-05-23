import { initNavigation } from './design.js';
import { initGame } from './TicTacToe.js';
import { initSnakeGame } from './Snake.js';
import { initTetrisGame } from './Tetris.js';
import { initMinesweeperGame } from './Minesweeper.js';


document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initGame();
    initSnakeGame();
    initTetrisGame();
    initMinesweeperGame();
});
