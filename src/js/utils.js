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

// Utility Functions

// Format price with currency
const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
    }).format(price);
};

// Generate random number between min and max
const random = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Generate unique ID
const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Show notification
const showNotification = (message, type = 'info') => {
    const notification = document.getElementById('notification');
    const messageElement = document.getElementById('notification-message');

    // Set message and type
    messageElement.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.remove('hidden');

    // Animate with GSAP
    gsap.fromTo(notification,
        { x: 100, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }
    );

    // Hide after 3 seconds
    setTimeout(() => {
        gsap.to(notification, {
            x: 100,
            opacity: 0,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => {
                notification.classList.add('hidden');
            }
        });
    }, 3000);
};

// Debounce function
const debounce = (func, wait) => {
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

// Throttle function
const throttle = (func, limit) => {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Load image promise
const loadImage = (src) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
};

// Play sound with Web Audio API
const playSound = (() => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const soundCache = new Map();

    return async (soundUrl, volume = 1) => {
        try {
            let buffer = soundCache.get(soundUrl);
            
            if (!buffer) {
                const response = await fetch(soundUrl);
                const arrayBuffer = await response.arrayBuffer();
                buffer = await audioContext.decodeAudioData(arrayBuffer);
                soundCache.set(soundUrl, buffer);
            }

            const source = audioContext.createBufferSource();
            const gainNode = audioContext.createGain();
            
            source.buffer = buffer;
            source.connect(gainNode);
            gainNode.connect(audioContext.destination);
            gainNode.gain.value = volume;
            
            source.start(0);
            return source;
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    };
})();

// Animate element with GSAP
const animate = {
    fadeIn: (element, duration = 0.3) => {
        gsap.fromTo(element,
            { opacity: 0 },
            { opacity: 1, duration, ease: 'power2.out' }
        );
    },

    fadeOut: (element, duration = 0.3) => {
        return gsap.fromTo(element,
            { opacity: 1 },
            { opacity: 0, duration, ease: 'power2.in' }
        );
    },

    slideIn: (element, direction = 'right', duration = 0.3) => {
        const x = direction === 'right' ? 100 : direction === 'left' ? -100 : 0;
        const y = direction === 'down' ? 100 : direction === 'up' ? -100 : 0;

        gsap.fromTo(element,
            { x, y, opacity: 0 },
            { x: 0, y: 0, opacity: 1, duration, ease: 'power2.out' }
        );
    },

    bounce: (element, scale = 1.2, duration = 0.3) => {
        gsap.fromTo(element,
            { scale: 1 },
            {
                scale,
                duration: duration / 2,
                ease: 'power2.out',
                yoyo: true,
                repeat: 1
            }
        );
    },

    shake: (element, intensity = 5, duration = 0.5) => {
        gsap.to(element, {
            x: `random(-${intensity}, ${intensity})`,
            y: `random(-${intensity}, ${intensity})`,
            duration: 0.1,
            repeat: duration * 10,
            ease: 'none',
            onComplete: () => gsap.set(element, { x: 0, y: 0 })
        });
    }
};

// Export utilities
window.utils = {
    formatPrice,
    random,
    generateId,
    showNotification,
    debounce,
    throttle,
    loadImage,
    playSound,
    animate
};

// Utilities Module
const utils = (() => {
    // Format price with Russian Ruble
    const formatPrice = (price) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB'
        }).format(price);
    };

    // Generate random number between min and max
    const random = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    // Generate unique ID
    const generateId = () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    };

    // Show notification
    const showNotification = (message, type = 'success') => {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        // Animate notification
        gsap.fromTo(notification,
            {
                opacity: 0,
                x: 100
            },
            {
                opacity: 1,
                x: 0,
                duration: 0.3,
                ease: 'power2.out'
            }
        );

        // Remove notification after delay
        setTimeout(() => {
            gsap.to(notification, {
                opacity: 0,
                x: 100,
                duration: 0.3,
                ease: 'power2.in',
                onComplete: () => notification.remove()
            });
        }, 3000);
    };

    // Debounce function
    const debounce = (func, wait) => {
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

    // Throttle function
    const throttle = (func, limit) => {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

    // Load image and return promise
    const loadImage = (src) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    };

    // Audio context and cache
    let audioContext;
    const audioCache = new Map();

    // Play sound with volume control
    const playSound = async (src, volume = 1) => {
        try {
            // Initialize audio context on first use
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            // Check cache first
            let buffer = audioCache.get(src);

            if (!buffer) {
                // Load and decode audio file
                const response = await fetch(src);
                const arrayBuffer = await response.arrayBuffer();
                buffer = await audioContext.decodeAudioData(arrayBuffer);
                audioCache.set(src, buffer);
            }

            // Create and configure source
            const source = audioContext.createBufferSource();
            source.buffer = buffer;

            // Create and configure gain node
            const gainNode = audioContext.createGain();
            gainNode.gain.value = volume;

            // Connect nodes
            source.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Play sound
            source.start(0);
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    };

    // Animation utilities
    const animate = {
        fadeIn: (element, duration = 0.3) => {
            gsap.fromTo(element,
                { opacity: 0 },
                { opacity: 1, duration, ease: 'power2.out' }
            );
        },

        fadeOut: (element, duration = 0.3) => {
            gsap.to(element, {
                opacity: 0,
                duration,
                ease: 'power2.in'
            });
        },

        slideIn: (element, direction = 'right', duration = 0.5) => {
            const x = direction === 'right' ? 100 : -100;
            gsap.fromTo(element,
                { x, opacity: 0 },
                { x: 0, opacity: 1, duration, ease: 'power2.out' }
            );
        },

        bounce: (element, scale = 1.2, duration = 0.3) => {
            gsap.to(element, {
                scale,
                duration: duration / 2,
                ease: 'power2.out',
                yoyo: true,
                repeat: 1
            });
        },

        shake: (element, intensity = 5, duration = 0.5) => {
            gsap.to(element, {
                x: `random(-${intensity}, ${intensity})`,
                y: `random(-${intensity}, ${intensity})`,
                duration: 0.1,
                repeat: Math.floor(duration / 0.1),
                ease: 'none',
                yoyo: true
            });
        }
    };

    // Export utilities
    return {
        formatPrice,
        random,
        generateId,
        showNotification,
        debounce,
        throttle,
        loadImage,
        playSound,
        animate
    };
})();

// Make utils available globally
window.utils = utils; 