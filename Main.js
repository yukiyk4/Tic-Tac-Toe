import { initNavigation } from './design.js';
import { initGame } from './TicTacToe.js';
import { initSnakeGame } from './Snake.js';

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initGame();
    initSnakeGame();
});
