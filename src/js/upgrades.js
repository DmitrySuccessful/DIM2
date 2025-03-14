import { state, updateBalance } from './state.js';

// Интервалы для автокликера
const autoClickerIntervals = new Map();

// Получение цены улучшения
function getUpgradePrice(upgrade) {
    return Math.floor(upgrade.basePrice * Math.pow(upgrade.priceMultiplier, upgrade.level));
}

// Покупка улучшения
export function buyUpgrade(type) {
    const upgrade = state.upgrades[type];
    const price = getUpgradePrice(upgrade);
    
    if (state.balance >= price) {
        // Списание средств
        updateBalance(-price);
        
        // Увеличение уровня
        upgrade.level++;
        
        // Применение эффекта улучшения
        applyUpgradeEffect(type);
        
        // Обновление интерфейса
        updateUpgradeUI(type);
        
        // Воспроизведение звука
        if (window.sounds && sounds.levelUp) {
            sounds.levelUp.play();
        }
        
        return true;
    }
    
    return false;
}

// Применение эффекта улучшения
function applyUpgradeEffect(type) {
    switch (type) {
        case 'autoClicker':
            updateAutoClicker();
            break;
        case 'clickMultiplier':
            updateClickMultiplier();
            break;
    }
}

// Обновление автокликера
function updateAutoClicker() {
    const autoClicker = state.upgrades.autoClicker;
    
    // Очистка предыдущего интервала
    if (autoClickerIntervals.has(autoClicker.level - 1)) {
        clearInterval(autoClickerIntervals.get(autoClicker.level - 1));
    }
    
    // Создание нового интервала
    if (autoClicker.level > 0) {
        const interval = setInterval(() => {
            const income = autoClicker.baseIncome * autoClicker.level;
            updateBalance(income);
            
            // Создание частиц для визуального эффекта
            const coin = document.getElementById('coin');
            if (coin) {
                const rect = coin.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                createParticles(x - rect.left, y - rect.top);
            }
        }, autoClicker.interval);
        
        autoClickerIntervals.set(autoClicker.level, interval);
    }
}

// Обновление множителя клика
function updateClickMultiplier() {
    const multiplier = state.upgrades.clickMultiplier;
    state.clickValue = state.baseClickValue * Math.pow(multiplier.multiplier, multiplier.level);
    
    // Обновление интерфейса
    document.getElementById('per-click').textContent = state.clickValue;
}

// Обновление интерфейса улучшений
function updateUpgradeUI(type) {
    const upgrade = state.upgrades[type];
    const element = document.querySelector(`[data-upgrade="${type}"]`);
    
    if (element) {
        const price = getUpgradePrice(upgrade);
        const priceElement = element.querySelector('.upgrade-price');
        const levelElement = element.querySelector('.upgrade-level');
        
        if (priceElement) {
            priceElement.textContent = price;
        }
        
        if (levelElement) {
            levelElement.textContent = upgrade.level;
        }
        
        // Анимация обновления
        gsap.from(element, {
            scale: 1.1,
            duration: 0.3,
            ease: 'power2.out'
        });
    }
}

// Инициализация улучшений
export function initUpgrades() {
    // Создание элементов улучшений
    const container = document.createElement('div');
    container.className = 'upgrades-container';
    
    // Автокликер
    const autoClicker = createUpgradeElement({
        type: 'autoClicker',
        name: 'Автокликер',
        description: 'Автоматически кликает каждую секунду',
        icon: '🤖'
    });
    
    // Множитель клика
    const clickMultiplier = createUpgradeElement({
        type: 'clickMultiplier',
        name: 'Множитель клика',
        description: 'Увеличивает количество монет за клик',
        icon: '✨'
    });
    
    container.appendChild(autoClicker);
    container.appendChild(clickMultiplier);
    
    // Добавление контейнера на страницу
    const main = document.getElementById('main');
    if (main) {
        main.appendChild(container);
    }
    
    // Восстановление состояния улучшений
    Object.keys(state.upgrades).forEach(type => {
        if (state.upgrades[type].level > 0) {
            applyUpgradeEffect(type);
        }
        updateUpgradeUI(type);
    });
}

// Создание элемента улучшения
function createUpgradeElement({ type, name, description, icon }) {
    const upgrade = state.upgrades[type];
    const price = getUpgradePrice(upgrade);
    
    const element = document.createElement('div');
    element.className = 'upgrade';
    element.dataset.upgrade = type;
    
    element.innerHTML = `
        <div class="upgrade-icon">${icon}</div>
        <div class="upgrade-info">
            <h3>${name}</h3>
            <p>${description}</p>
            <div class="upgrade-stats">
                <span>Уровень: <span class="upgrade-level">${upgrade.level}</span></span>
                <span>Цена: <span class="upgrade-price">${price}</span></span>
            </div>
        </div>
        <button class="upgrade-button">Купить</button>
    `;
    
    // Добавление обработчика клика
    const button = element.querySelector('.upgrade-button');
    button.addEventListener('click', () => {
        if (buyUpgrade(type)) {
            // Анимация кнопки
            gsap.from(button, {
                scale: 0.9,
                duration: 0.2,
                ease: 'power2.out'
            });
        } else {
            // Анимация отказа
            gsap.to(button, {
                x: [-5, 5, -5, 5, 0],
                duration: 0.3,
                ease: 'power2.out'
            });
        }
    });
    
    return element;
} 