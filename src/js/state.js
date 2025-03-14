// Начальное состояние приложения
const initialState = {
    cart: [],
    bonus: 0,
    gameStats: {
        level: 1,
        score: 0,
        highScore: 0
    }
};

// Загрузка состояния из localStorage
const loadState = () => {
    try {
        const savedState = localStorage.getItem('gameShopState');
        return savedState ? JSON.parse(savedState) : initialState;
    } catch (error) {
        console.error('Error loading state:', error);
        return initialState;
    }
};

// Текущее состояние приложения
export let state = loadState();

// Функция для обновления состояния
export const updateState = (newState) => {
    state = {
        ...state,
        ...newState
    };

    // Сохраняем состояние в localStorage
    try {
        localStorage.setItem('gameShopState', JSON.stringify(state));
    } catch (error) {
        console.error('Error saving state:', error);
    }

    // Вызываем все подписанные обработчики
    notifySubscribers();
};

// Массив подписчиков на изменения состояния
const subscribers = [];

// Подписка на изменения состояния
export const subscribe = (callback) => {
    subscribers.push(callback);
    return () => {
        const index = subscribers.indexOf(callback);
        if (index !== -1) {
            subscribers.splice(index, 1);
        }
    };
};

// Уведомление всех подписчиков об изменении состояния
const notifySubscribers = () => {
    subscribers.forEach(callback => callback(state));
};

// Функция для сброса состояния
export const resetState = () => {
    updateState(initialState);
}; 