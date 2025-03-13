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
            sales += item.basePrice * 1.5;
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

// Запуск игры
window.onload = initGame; 