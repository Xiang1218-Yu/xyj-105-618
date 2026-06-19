import { GameApp } from './app/GameApp.js';

document.addEventListener('DOMContentLoaded', () => {
    const app = new GameApp();
    app.start();
    window.__game = app;
});
