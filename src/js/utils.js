// Функция для создания и показа уведомлений
export const showNotification = (message, type = 'info') => {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    
    notification.className = `notification ${type}`;
    notification.textContent = message;

    container.appendChild(notification);

    // Анимация появления
    gsap.from(notification, {
        x: 100,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out'
    });

    // Удаление уведомления через 3 секунды
    setTimeout(() => {
        gsap.to(notification, {
            x: 100,
            opacity: 0,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => {
                notification.remove();
            }
        });
    }, 3000);
};

// Функция для форматирования чисел (добавление разделителей)
export const formatNumber = (number) => {
    return new Intl.NumberFormat('ru-RU').format(number);
};

// Функция для генерации случайного числа в диапазоне
export const random = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Функция для проверки столкновений
export const checkCollision = (rect1, rect2) => {
    return !(rect1.right < rect2.left || 
             rect1.left > rect2.right || 
             rect1.bottom < rect2.top || 
             rect1.top > rect2.bottom);
};

// Функция для создания элемента с классами
export const createElement = (tag, className, parent) => {
    const element = document.createElement(tag);
    if (className) {
        element.className = className;
    }
    if (parent) {
        parent.appendChild(element);
    }
    return element;
};

// Функция для воспроизведения звука
export const playSound = (src, volume = 1) => {
    const audio = new Audio(src);
    audio.volume = volume;
    audio.play().catch(error => console.error('Error playing sound:', error));
};

// Функция для дебаунса
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Функция для тротлинга
export const throttle = (func, limit) => {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Функция для сохранения данных в localStorage
export const saveToStorage = (key, data) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
};

// Функция для загрузки данных из localStorage
export const loadFromStorage = (key, defaultValue = null) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return defaultValue;
    }
};

// Функция для проверки поддержки WebGL
export const checkWebGLSupport = () => {
    try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && 
                 (canvas.getContext('webgl') || 
                  canvas.getContext('experimental-webgl')));
    } catch (error) {
        return false;
    }
};

// Функция для определения мобильного устройства
export const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Функция для определения поддержки звука
export const checkAudioSupport = () => {
    try {
        const audio = new Audio();
        return typeof audio.canPlayType === 'function';
    } catch (error) {
        return false;
    }
}; 