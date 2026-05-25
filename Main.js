import { initNavigation } from './design.js';
import { initGame } from './TicTacToe.js';
import { initSnakeGame } from './Snake.js';
import { initTetrisGame } from './Tetris.js';
import { initMinesweeperGame } from './Minesweeper.js';
import { init2048 } from './2048.js';
import { initBlackjack } from './Blackjack.js';
import { initPoker } from './Poker.js';
import { initWordle } from './Wordle.js';
import { initChatbot } from './Chatbot.js';


document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initGame();
    initSnakeGame();
    initTetrisGame();
    initMinesweeperGame();
    init2048();
    initBlackjack();
    initPoker();
    initWordle();
    initChatbot();
});
