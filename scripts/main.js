// Импорт всех необходимых модулей
import { CONFIG } from './config.js';
import { GameState } from './game-state.js';
import { UI } from './ui.js';
import { Game } from './game.js';
import { AssetManager } from './services/AssetManager.js';

class App {
    constructor() {
        this.telegram = window.Telegram.WebApp;
        this.game = null;
        this.assetManager = null;
    }

    async init() {
        try {
            // Initialize Telegram Mini App
            this.telegram.ready();
            this.telegram.expand();

            // Load saved API key and AI settings
            const apiKey = localStorage.getItem('ai_api_key') || '';
            const aiEnabled = localStorage.getItem('ai_enabled') === 'true';
            
            // Initialize AssetManager if AI is enabled
            if (aiEnabled && apiKey) {
                CONFIG.AI_GENERATION.enabled = true;
                CONFIG.AI_GENERATION.apiKey = apiKey;
                this.assetManager = new AssetManager(CONFIG.AI_GENERATION);
                await this.assetManager.loadCache();
            }

            // Initialize game components
            const gameState = new GameState();
            const ui = new UI(this.assetManager);
            this.game = new Game(gameState, ui, this.assetManager);
            window.game = this.game;

            // Start the game
            await this.game.start();
            document.getElementById('loader').style.display = 'none';

        } catch (error) {
            console.error('Failed to initialize app:', error);
            document.getElementById('error-message').textContent = 'Failed to initialize app: ' + error.message;
            document.getElementById('error-message').style.display = 'block';
            document.getElementById('loader').style.display = 'none';
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();

    // Save cache before unload if AI is enabled
    window.addEventListener('beforeunload', () => {
        if (app.assetManager) {
            app.assetManager.saveCache();
        }
    });
}); 