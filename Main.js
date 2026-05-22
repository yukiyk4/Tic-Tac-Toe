import { initNavigation } from './design.js';
import { initGame } from './TicTacToe.js';

// Wait for the HTML elements to load, then run the setups
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initGame();
});
