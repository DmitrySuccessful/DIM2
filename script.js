// Инициализация Telegram Web App
let tg = window.Telegram.WebApp;
tg.expand();

// Игровое состояние
const gameState = {
    money: 1000,
    reputation: 0,
    level: 1,
    day: 1,
    inventory: [],
    suppliers: [],
    employees: [],
    marketing: {
        social: 0,
        bloggers: 0,
        targeted: 0
    },
    referral: {
        points: 0,
        count: 0,
        earnings: 0,
        link: '',
        bonuses: {
            sales: 0
        }
    }
};

// Категории товаров
const categories = {
    clothes: {
        name: 'Одежда',
        items: [
            { id: 'tshirt', name: 'Футболка', basePrice: 100, quality: 1 },
            { id: 'jeans', name: 'Джинсы', basePrice: 300, quality: 2 },
            { id: 'jacket', name: 'Куртка', basePrice: 500, quality: 3 }
        ]
    },
    shoes: {
        name: 'Обувь',
        items: [
            { id: 'sneakers', name: 'Кроссовки', basePrice: 200, quality: 1 },
            { id: 'boots', name: 'Ботинки', basePrice: 400, quality: 2 },
            { id: 'heels', name: 'Туфли', basePrice: 600, quality: 3 }
        ]
    },
    accessories: {
        name: 'Аксессуары',
        items: [
            { id: 'bag', name: 'Сумка', basePrice: 150, quality: 1 },
            { id: 'watch', name: 'Часы', basePrice: 250, quality: 2 },
            { id: 'jewelry', name: 'Украшения', basePrice: 350, quality: 3 }
        ]
    }
};

// Поставщики
const suppliers = [
    { id: 'cheap', name: 'Бюджетный', quality: 1, priceMultiplier: 0.8 },
    { id: 'standard', name: 'Стандартный', quality: 2, priceMultiplier: 1.0 },
    { id: 'premium', name: 'Премиум', quality: 3, priceMultiplier: 1.5 }
];

// Инициализация игры
function initGame() {
    updateUI();
    setupEventListeners();
    startGameLoop();
    initReferralSystem();
    initMinigame();
}

// Обновление интерфейса
function updateUI() {
    document.getElementById('money').textContent = gameState.money;
    document.getElementById('reputation').textContent = gameState.reputation;
    document.getElementById('level').textContent = gameState.level;
    document.getElementById('game-time').textContent = `День ${gameState.day}`;
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Переключение вкладок
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });

    // Выбор категории
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            showCategory(btn.dataset.category);
        });
    });

    // Маркетинг
    document.querySelectorAll('.marketing-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            handleMarketing(btn.dataset.action);
        });
    });
}

// Переключение вкладок
function switchTab(tabId) {
    // Убираем активный класс у всех вкладок
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });

    // Активируем нужную вкладку
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(`${tabId}-tab`).classList.add('active');
}

// Показ категории товаров
function showCategory(categoryId) {
    const category = categories[categoryId];
    const inventory = document.getElementById('inventory');
    inventory.innerHTML = '';

    category.items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'inventory-item';
        itemElement.innerHTML = `
            <h3>${item.name}</h3>
            <p>Цена: ${item.basePrice}</p>
            <p>Качество: ${item.quality}</p>
            <button onclick="buyItem('${categoryId}', '${item.id}')">Купить</button>
        `;
        inventory.appendChild(itemElement);
    });
}

// Покупка товара
function buyItem(categoryId, itemId) {
    const item = categories[categoryId].items.find(i => i.id === itemId);
    if (gameState.money >= item.basePrice) {
        gameState.money -= item.basePrice;
        gameState.inventory.push({ ...item, category: categoryId });
        updateUI();
    } else {
        alert('Недостаточно денег!');
    }
}

// Обработка маркетинга
function handleMarketing(action) {
    const costs = {
        social: 100,
        bloggers: 300,
        targeted: 500
    };

    if (gameState.money >= costs[action]) {
        gameState.money -= costs[action];
        gameState.marketing[action]++;
        updateUI();
    } else {
        alert('Недостаточно денег!');
    }
}

// Игровой цикл
function startGameLoop() {
    setInterval(() => {
        gameState.day++;
        updateUI();
        processDay();
    }, 60000); // Каждый день = 1 минута
}

// Обработка дня
function processDay() {
    // Генерация продаж
    const sales = calculateSales();
    gameState.money += sales;

    // Обновление репутации
    updateReputation();

    // Проверка уровня
    checkLevel();
}

// Расчет продаж
function calculateSales() {
    let sales = 0;
    const marketingBonus = 
        gameState.marketing.social * 0.1 +
        gameState.marketing.bloggers * 0.2 +
        gameState.marketing.targeted * 0.3;

    gameState.inventory.forEach(item => {
        const baseChance = 0.3 + marketingBonus;
        if (Math.random() < baseChance) {
            const saleAmount = item.basePrice * 1.5;
            // Учитываем реферальный бонус
            sales += saleAmount * (1 + gameState.referral.bonuses.sales);
        }
    });

    return Math.round(sales);
}

// Обновление репутации
function updateReputation() {
    const qualitySum = gameState.inventory.reduce((sum, item) => sum + item.quality, 0);
    const avgQuality = qualitySum / (gameState.inventory.length || 1);
    gameState.reputation = Math.round(avgQuality * 10);
}

// Проверка уровня
function checkLevel() {
    const newLevel = Math.floor(gameState.reputation / 100) + 1;
    if (newLevel > gameState.level) {
        gameState.level = newLevel;
        alert(`Поздравляем! Вы достигли уровня ${newLevel}!`);
    }
}

// Инициализация реферальной системы
function initReferralSystem() {
    // Генерируем уникальную реферальную ссылку
    const userId = tg.initDataUnsafe.user?.id || Math.random().toString(36).substr(2, 9);
    gameState.referral.link = `https://t.me/your_bot?start=ref_${userId}`;
    
    // Проверяем, пришел ли пользователь по реферальной ссылке
    const startParam = tg.initDataUnsafe.start_param;
    if (startParam && startParam.startsWith('ref_')) {
        const referrerId = startParam.split('_')[1];
        handleReferral(referrerId);
    }
    
    updateReferralUI();
}

// Обработка реферала
function handleReferral(referrerId) {
    // Здесь должна быть логика проверки и начисления наград
    // В реальном приложении это должно быть на сервере
    gameState.referral.count++;
    gameState.referral.points += 100;
    gameState.referral.earnings += 100;
    
    // Обновляем бонусы
    if (gameState.referral.count >= 10) {
        gameState.referral.bonuses.sales = 0.2;
    } else if (gameState.referral.count >= 5) {
        gameState.referral.bonuses.sales = 0.1;
    }
    
    updateReferralUI();
}

// Обновление UI реферальной системы
function updateReferralUI() {
    document.getElementById('referral-link').value = gameState.referral.link;
    document.getElementById('referral-count').textContent = gameState.referral.count;
    document.getElementById('referral-earnings').textContent = gameState.referral.earnings;
    document.getElementById('referral-points').textContent = gameState.referral.points;
}

// Копирование реферальной ссылки
function copyReferralLink() {
    const input = document.getElementById('referral-link');
    input.select();
    document.execCommand('copy');
    alert('Ссылка скопирована!');
}

// Обновляем объект мини-игры
const minigame = {
    isActive: false,
    score: 0,
    timeLeft: 20,
    attemptsLeft: 3,
    lastReset: new Date().toDateString(),
    items: [
        { id: 'tshirt', name: 'Футболка', points: 10 },
        { id: 'jeans', name: 'Джинсы', points: 20 },
        { id: 'sneakers', name: 'Кроссовки', points: 30 },
        { id: 'bag', name: 'Сумка', points: 15 }
    ]
};

// Проверка и сброс попыток
function checkAndResetAttempts() {
    const today = new Date().toDateString();
    if (minigame.lastReset !== today) {
        minigame.attemptsLeft = 3;
        minigame.lastReset = today;
        updateMinigameUI();
    }
}

// Покупка попытки
function buyAttempt() {
    if (gameState.reputation >= 50) {
        gameState.reputation -= 50;
        minigame.attemptsLeft++;
        updateUI();
        updateMinigameUI();
        showNotification('Попытка куплена за 50 звезд!');
    } else {
        showNotification('Недостаточно звезд! Нужно 50 звезд.');
    }
}

// Показ уведомлений
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Обновление UI мини-игры
function updateMinigameUI() {
    document.getElementById('minigame-timer').textContent = minigame.timeLeft;
    document.getElementById('minigame-score').textContent = minigame.score;
    document.getElementById('minigame-attempts').textContent = minigame.attemptsLeft;
    
    // Обновляем состояние кнопок
    const startButton = document.getElementById('start-minigame');
    const buyButton = document.getElementById('buy-attempt');
    
    startButton.disabled = minigame.attemptsLeft <= 0;
    buyButton.disabled = gameState.reputation < 50;
    
    if (startButton.disabled) {
        startButton.classList.add('disabled');
    } else {
        startButton.classList.remove('disabled');
    }
    
    if (buyButton.disabled) {
        buyButton.classList.add('disabled');
    } else {
        buyButton.classList.remove('disabled');
    }
}

// Запуск мини-игры
function startMinigame() {
    if (minigame.isActive || minigame.attemptsLeft <= 0) return;
    
    minigame.isActive = true;
    minigame.score = 0;
    minigame.timeLeft = 20;
    minigame.attemptsLeft--;
    
    updateMinigameUI();
    startMinigameTimer();
    startDroppingItems();
}

// Таймер мини-игры
function startMinigameTimer() {
    const timer = setInterval(() => {
        if (!minigame.isActive) {
            clearInterval(timer);
            return;
        }
        
        minigame.timeLeft--;
        updateMinigameUI();
        
        if (minigame.timeLeft <= 0) {
            endMinigame();
        }
    }, 1000);
}

// Обновляем функцию создания падающих предметов
function startDroppingItems() {
    const createItem = () => {
        if (!minigame.isActive) return;
        
        const item = minigame.items[Math.floor(Math.random() * minigame.items.length)];
        const itemElement = document.createElement('div');
        itemElement.className = 'falling-item';
        itemElement.style.left = Math.random() * (document.getElementById('minigame-area').offsetWidth - 60) + 'px';
        
        // Создаем SVG-иконку
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        use.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `#${item.id}`);
        svg.appendChild(use);
        itemElement.appendChild(svg);
        
        itemElement.dataset.points = item.points;
        itemElement.dataset.name = item.name;
        
        itemElement.addEventListener('click', () => catchItem(itemElement));
        
        document.getElementById('minigame-area').appendChild(itemElement);
        itemElement.classList.add('falling');
        
        // Добавляем случайное вращение
        itemElement.style.transform = `rotate(${Math.random() * 360}deg)`;
        
        setTimeout(() => {
            if (itemElement.parentNode) {
                itemElement.remove();
            }
        }, 2000);
    };
    
    const dropInterval = setInterval(() => {
        if (!minigame.isActive) {
            clearInterval(dropInterval);
            return;
        }
        createItem();
    }, 1000);
}

// Обновляем функцию ловли предмета
function catchItem(itemElement) {
    if (!minigame.isActive) return;
    
    const points = parseInt(itemElement.dataset.points);
    const name = itemElement.dataset.name;
    
    // Добавляем эффект пойманного предмета
    itemElement.classList.add('caught');
    
    // Добавляем визуальный эффект очков
    showPointsEffect(points, itemElement);
    
    minigame.score += points;
    updateMinigameUI();
    
    // Удаляем предмет после анимации
    setTimeout(() => {
        if (itemElement.parentNode) {
            itemElement.remove();
        }
    }, 300);
}

// Добавляем эффект очков
function showPointsEffect(points, element) {
    const pointsElement = document.createElement('div');
    pointsElement.className = 'points-effect';
    pointsElement.textContent = `+${points}`;
    
    const rect = element.getBoundingClientRect();
    const gameArea = document.getElementById('minigame-area');
    const gameRect = gameArea.getBoundingClientRect();
    
    pointsElement.style.left = `${rect.left - gameRect.left + rect.width / 2}px`;
    pointsElement.style.top = `${rect.top - gameRect.top}px`;
    
    gameArea.appendChild(pointsElement);
    
    setTimeout(() => {
        pointsElement.remove();
    }, 1000);
}

// Обновляем функцию завершения игры
function endMinigame() {
    minigame.isActive = false;
    
    // Добавляем анимацию завершения
    const gameArea = document.getElementById('minigame-area');
    gameArea.style.animation = 'fadeOut 0.5s ease';
    
    // Показываем результаты
    setTimeout(() => {
        const results = document.createElement('div');
        results.className = 'game-results';
        
        // Рассчитываем награду
        let reward = 0;
        if (minigame.score >= 300) {
            reward = 50;
        } else if (minigame.score >= 200) {
            reward = 25;
        } else if (minigame.score >= 100) {
            reward = 10;
        }
        
        results.innerHTML = `
            <h3>Игра окончена!</h3>
            <p>Вы заработали ${minigame.score} очков!</p>
            ${reward > 0 ? `<p class="reward">Награда: ${reward} ⭐</p>` : ''}
            <button class="minigame-btn" onclick="startMinigame()">
                <span class="btn-icon">🔄</span>
                Играть снова
            </button>
        `;
        
        gameArea.innerHTML = '';
        gameArea.appendChild(results);
        gameArea.style.animation = 'fadeIn 0.5s ease';
        
        // Начисляем награду
        if (reward > 0) {
            gameState.reputation += reward;
            updateUI();
        }
    }, 500);
}

// Инициализация мини-игры
function initMinigame() {
    const startButton = document.getElementById('start-minigame');
    const buyButton = document.getElementById('buy-attempt');
    
    startButton.addEventListener('click', startMinigame);
    buyButton.addEventListener('click', buyAttempt);
    
    // Проверяем попытки при загрузке
    checkAndResetAttempts();
    
    // Добавляем поддержку тач-событий
    const gameArea = document.getElementById('minigame-area');
    gameArea.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        if (element && element.classList.contains('falling-item')) {
            catchItem(element);
        }
    }, { passive: false });
}

// Добавляем стили для эффектов
const style = document.createElement('style');
style.textContent = `
    .points-effect {
        position: absolute;
        color: #2ecc71;
        font-size: 1.5rem;
        font-weight: bold;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        animation: floatUp 1s ease-out;
        pointer-events: none;
    }

    @keyframes floatUp {
        0% {
            transform: translateY(0);
            opacity: 1;
        }
        100% {
            transform: translateY(-50px);
            opacity: 0;
        }
    }

    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    .game-results {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        background: rgba(255, 255, 255, 0.9);
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .game-results h3 {
        color: #2c3e50;
        margin-bottom: 1rem;
    }

    .game-results p {
        color: #7f8c8d;
        font-size: 1.2rem;
        margin-bottom: 1.5rem;
    }
`;
document.head.appendChild(style);

// Добавляем стили для уведомлений
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 1rem 2rem;
        border-radius: 50px;
        z-index: 1000;
        animation: slideDown 0.3s ease-out;
    }

    @keyframes slideDown {
        from {
            transform: translate(-50%, -100%);
        }
        to {
            transform: translate(-50%, 0);
        }
    }

    .disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .reward {
        color: #f1c40f;
        font-size: 1.2rem;
        font-weight: bold;
        margin: 1rem 0;
    }
`;
document.head.appendChild(notificationStyle);

// Запуск игры
window.onload = initGame; 