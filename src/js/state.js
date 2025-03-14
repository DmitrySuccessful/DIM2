// State Management Module
const State = (() => {
    // Products data
    const products = [
        {
            id: 1,
            name: 'Зомби-маска',
            description: 'Реалистичная маска зомби для косплея',
            price: 1500,
            image: '/DIM2/src/assets/images/mask.jpg',
            category: 'costumes'
        },
        {
            id: 2,
            name: 'Набор для грима',
            description: 'Профессиональный набор для создания образа зомби',
            price: 2500,
            image: '/DIM2/src/assets/images/makeup.jpg',
            category: 'makeup'
        },
        {
            id: 3,
            name: 'Костюм зомби',
            description: 'Полный костюм зомби с рваной одеждой',
            price: 3500,
            image: '/DIM2/src/assets/images/costume.jpg',
            category: 'costumes'
        },
        {
            id: 4,
            name: 'Линзы зомби',
            description: 'Контактные линзы для создания эффекта глаз зомби',
            price: 1200,
            image: '/DIM2/src/assets/images/lenses.jpg',
            category: 'accessories'
        },
        {
            id: 5,
            name: 'Искусственная кровь',
            description: 'Реалистичная искусственная кровь для грима',
            price: 800,
            image: '/DIM2/src/assets/images/blood.jpg',
            category: 'makeup'
        },
        {
            id: 6,
            name: 'Накладные раны',
            description: 'Набор накладных ран и шрамов',
            price: 1000,
            image: '/DIM2/src/assets/images/wounds.jpg',
            category: 'makeup'
        }
    ];

    // Initial state
    let state = {
        cart: [],
        bonusPoints: 0,
        appliedBonus: 0,
        gameState: {
            isPlaying: false,
            isPaused: false,
            score: 0,
            level: 1,
            zombies: [],
            lastSpawnTime: 0,
            spawnInterval: 2000,
            bonusMultiplier: 1
        }
    };

    // Load state from localStorage
    const loadState = () => {
        const savedState = localStorage.getItem('gameShopState');
        if (savedState) {
            state = JSON.parse(savedState);
        }
    };

    // Save state to localStorage
    const saveState = () => {
        localStorage.setItem('gameShopState', JSON.stringify(state));
    };

    // State change listeners
    const listeners = new Set();

    // Notify listeners of state change
    const notifyListeners = () => {
        listeners.forEach(listener => listener(state));
        saveState();
    };

    // Get filtered products
    const getFilteredProducts = (category) => {
        if (!category || category === 'all') {
            return products;
        }
        return products.filter(product => product.category === category);
    };

    // Cart operations
    const addToCart = (product) => {
        const existingItem = state.cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            state.cart.push({ ...product, quantity: 1 });
        }
        notifyListeners();
    };

    const updateCartItemQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            state.cart = state.cart.filter(item => item.id !== productId);
        } else {
            const item = state.cart.find(item => item.id === productId);
            if (item) {
                item.quantity = quantity;
            }
        }
        notifyListeners();
    };

    const clearCart = () => {
        state.cart = [];
        state.appliedBonus = 0;
        notifyListeners();
    };

    // Calculate cart total
    const getCartTotal = () => {
        return state.cart.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const getCartTotalWithBonus = () => {
        const total = getCartTotal();
        return Math.max(0, total - state.appliedBonus);
    };

    // Bonus points operations
    const addBonusPoints = (points) => {
        state.bonusPoints += points;
        notifyListeners();
    };

    const applyBonus = (amount) => {
        if (amount <= state.bonusPoints) {
            state.bonusPoints -= amount;
            state.appliedBonus = amount;
            notifyListeners();
        }
    };

    // Game state operations
    const startGame = () => {
        state.gameState = {
            isPlaying: true,
            isPaused: false,
            score: 0,
            level: 1,
            zombies: [],
            lastSpawnTime: Date.now(),
            spawnInterval: 2000,
            bonusMultiplier: 1
        };
        notifyListeners();
    };

    const pauseGame = () => {
        state.gameState.isPaused = !state.gameState.isPaused;
        notifyListeners();
    };

    const updateGameScore = (points) => {
        state.gameState.score += points;
        
        // Level up every 100 points
        const newLevel = Math.floor(state.gameState.score / 100) + 1;
        if (newLevel > state.gameState.level) {
            state.gameState.level = newLevel;
            state.gameState.spawnInterval = Math.max(500, 2000 - (newLevel - 1) * 200);
            state.gameState.bonusMultiplier = 1 + (newLevel - 1) * 0.1;
        }
        
        notifyListeners();
    };

    const addZombie = (zombie) => {
        state.gameState.zombies.push(zombie);
        notifyListeners();
    };

    const removeZombie = (zombieId) => {
        state.gameState.zombies = state.gameState.zombies.filter(z => z.id !== zombieId);
        notifyListeners();
    };

    // Initialize state
    loadState();

    // Public API
    return {
        // Properties
        get cart() { return state.cart; },
        get bonusPoints() { return state.bonusPoints; },
        get gameState() { return state.gameState; },

        // Methods
        addListener: (listener) => listeners.add(listener),
        removeListener: (listener) => listeners.delete(listener),
        getFilteredProducts,
        addToCart,
        updateCartItemQuantity,
        clearCart,
        getCartTotal,
        getCartTotalWithBonus,
        addBonusPoints,
        applyBonus,
        startGame,
        pauseGame,
        updateGameScore,
        addZombie,
        removeZombie
    };
})();

// Make State available globally
window.State = State; 