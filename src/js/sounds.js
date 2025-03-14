// Создание аудио контекста
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

// Функция для создания звука клика
function createClickSound() {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
}

// Функция для создания звука достижения
function createAchievementSound() {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.type = 'sine';
    
    // Мелодия достижения
    const now = audioCtx.currentTime;
    oscillator.frequency.setValueAtTime(440, now);
    oscillator.frequency.setValueAtTime(554.37, now + 0.1);
    oscillator.frequency.setValueAtTime(659.25, now + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.setValueAtTime(0.3, now + 0.2);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    oscillator.start(now);
    oscillator.stop(now + 0.3);
}

// Функция для создания звука повышения уровня
function createLevelUpSound() {
    const oscillator1 = audioCtx.createOscillator();
    const oscillator2 = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;
    
    // Первый осциллятор
    oscillator1.type = 'sine';
    oscillator1.frequency.setValueAtTime(440, now);
    oscillator1.frequency.exponentialRampToValueAtTime(880, now + 0.2);
    
    // Второй осциллятор
    oscillator2.type = 'triangle';
    oscillator2.frequency.setValueAtTime(220, now);
    oscillator2.frequency.exponentialRampToValueAtTime(440, now + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    oscillator1.start(now);
    oscillator2.start(now);
    oscillator1.stop(now + 0.3);
    oscillator2.stop(now + 0.3);
}

// Экспорт звуков
export const sounds = {
    click: () => {
        try {
            createClickSound();
        } catch (error) {
            console.error('Error playing click sound:', error);
        }
    },
    achievement: () => {
        try {
            createAchievementSound();
        } catch (error) {
            console.error('Error playing achievement sound:', error);
        }
    },
    levelUp: () => {
        try {
            createLevelUpSound();
        } catch (error) {
            console.error('Error playing level up sound:', error);
        }
    }
}; 