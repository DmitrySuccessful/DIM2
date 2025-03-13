// Инициализация Telegram Web App
let tg = window.Telegram.WebApp;
tg.expand();

// Состояние игры
const gameState = {
    money: 1000,
    reputation: 0,
    level: 1,
    stars: 0,
    attempts: 3,
    lastAttemptReset: new Date().toDateString(),
    inventory: [],
    suppliers: [],
    marketing: [],
    employees: [],
    referralCode: generateReferralCode(),
    referrals: [],
    minigame: {
        isActive: false,
        score: 0,
        timer: 30,
        items: ['tshirt', 'jeans', 'sneakers', 'bag'],
        points: {
            tshirt: 10,
            jeans: 20,
            sneakers: 30,
            bag: 15
        }
    }
};

// Генерация реферального кода
function generateReferralCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Базовые товары
const baseProducts = {
    clothes: [
        { id: 'tshirt1', type: 'tshirt', name: 'Базовая футболка', buyPrice: 100, sellPrice: 150, quantity: 0 },
        { id: 'tshirt2', type: 'tshirt', name: 'Премиум футболка', buyPrice: 200, sellPrice: 300, quantity: 0 },
        { id: 'jeans1', type: 'jeans', name: 'Классические джинсы', buyPrice: 300, sellPrice: 450, quantity: 0 },
        { id: 'jeans2', type: 'jeans', name: 'Модные джинсы', buyPrice: 400, sellPrice: 600, quantity: 0 }
    ],
    shoes: [
        { id: 'sneakers1', type: 'sneakers', name: 'Повседневные кроссовки', buyPrice: 500, sellPrice: 750, quantity: 0 },
        { id: 'sneakers2', type: 'sneakers', name: 'Спортивные кроссовки', buyPrice: 600, sellPrice: 900, quantity: 0 }
    ],
    accessories: [
        { id: 'bag1', type: 'bag', name: 'Городской рюкзак', buyPrice: 200, sellPrice: 300, quantity: 0 },
        { id: 'bag2', type: 'bag', name: 'Модная сумка', buyPrice: 400, sellPrice: 600, quantity: 0 }
    ]
};

// Инициализация магазина
function initShop() {
    if (gameState.inventory.length === 0) {
        Object.values(baseProducts).forEach(category => {
            category.forEach(product => {
                gameState.inventory.push({ ...product });
            });
        });
    }
    updateShopUI();
}

// Обновление интерфейса магазина
function updateShopUI() {
    const shopGrid = document.querySelector('.shop-grid');
    shopGrid.innerHTML = '';

    const activeCategory = document.querySelector('.category-btn.active')?.dataset.category || 'all';
    
    Object.entries(baseProducts).forEach(([category, products]) => {
        if (activeCategory === 'all' || activeCategory === category) {
            products.forEach(product => {
                const inventoryItem = gameState.inventory.find(item => item.id === product.id);
                const productElement = createProductElement(inventoryItem || product);
                shopGrid.appendChild(productElement);
            });
        }
    });
}

// Создание элемента товара
function createProductElement(product) {
    const element = document.createElement('div');
    element.className = 'product-item';
    element.dataset.category = getProductCategory(product);
    
    element.innerHTML = `
        <div class="product-image">
            <svg viewBox="0 0 100 100" class="product-icon">
                <use href="#${product.type}"/>
            </svg>
        </div>
        <div class="product-info">
            <h3>${product.name}</h3>
            <p>Закупка: ${product.buyPrice} 💰</p>
            <p>Продажа: ${product.sellPrice} 💰</p>
            <p>В наличии: ${product.quantity}</p>
        </div>
        <div class="product-actions">
            <button onclick="buyProduct('${product.id}')" ${gameState.money < product.buyPrice ? 'disabled' : ''}>
                Купить
            </button>
            <button onclick="sellProduct('${product.id}')" ${product.quantity <= 0 ? 'disabled' : ''}>
                Продать
            </button>
        </div>
    `;
    
    return element;
}

// Определение категории товара
function getProductCategory(product) {
    for (const [category, products] of Object.entries(baseProducts)) {
        if (products.some(p => p.id === product.id)) {
            return category;
        }
    }
    return 'other';
}

// Покупка товара
function buyProduct(productId) {
    const product = gameState.inventory.find(item => item.id === productId);
    if (!product) return;
    
    if (gameState.money >= product.buyPrice) {
        gameState.money -= product.buyPrice;
        product.quantity++;
        gameState.reputation += 1;
        
        if (gameState.reputation >= 100) {
            levelUp();
        }
        
        saveGameState();
        updateUI();
        showNotification(`Куплен товар: ${product.name}`);
    } else {
        showNotification('Недостаточно денег!', 'error');
    }
}

// Продажа товара
function sellProduct(productId) {
    const product = gameState.inventory.find(item => item.id === productId);
    if (!product || product.quantity <= 0) return;
    
    gameState.money += product.sellPrice;
    product.quantity--;
    gameState.reputation += 2;
    
    if (gameState.reputation >= 100) {
        levelUp();
    }
    
    saveGameState();
    updateUI();
    showNotification(`Продан товар: ${product.name}`);
}

// Повышение уровня
function levelUp() {
    gameState.level++;
    gameState.reputation = 0;
    gameState.stars += 5;
    showNotification(`Поздравляем! Вы достигли уровня ${gameState.level}!`, 'success');
}

// Показ уведомлений
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 2000);
}

// Инициализация игры
function initGame() {
    // Инициализация Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
    }
    
    // Инициализация магазина
    initShop();
    
    // Инициализация мини-игры
    initMinigame();
    
    // Добавляем обработчики для кнопок вкладок
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Убираем активный класс у всех кнопок и вкладок
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            
            // Добавляем активный класс нажатой кнопке
            btn.classList.add('active');
            
            // Показываем соответствующую вкладку
            const tabId = btn.getAttribute('data-tab');
            document.querySelector(`#${tabId}-tab`).classList.add('active');
        });
    });
    
    // Показываем первую вкладку по умолчанию
    document.querySelector('.tab-btn').click();
}

// Загрузка состояния игры
function loadGameState() {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
        const parsedState = JSON.parse(savedState);
        Object.assign(gameState, parsedState);
    }
}

// Сохранение состояния игры
function saveGameState() {
    localStorage.setItem('gameState', JSON.stringify(gameState));
}

// Обновление интерфейса
function updateUI() {
    updateStats();
    updateInventory();
    updateSuppliers();
    updateMarketing();
    updateEmployees();
    updateReferralInfo();
    updateMinigameUI();
}

// Обновление статистики
function updateStats() {
    document.querySelector('.money').textContent = `💰 ${gameState.money}`;
    document.querySelector('.reputation').textContent = `⭐ ${gameState.reputation}`;
    document.querySelector('.level').textContent = `📈 ${gameState.level}`;
    document.querySelector('.stars').textContent = `✨ ${gameState.stars}`;
}

// Обновление инвентаря
function updateInventory() {
    const inventoryContainer = document.querySelector('.inventory');
    inventoryContainer.innerHTML = '';
    
    gameState.inventory.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'inventory-item';
        itemElement.innerHTML = `
            <img src="images/${item.type}.png" alt="${item.name}">
            <div class="item-info">
                <h3>${item.name}</h3>
                <p>Цена: ${item.price}</p>
                <p>Количество: ${item.quantity}</p>
            </div>
        `;
        inventoryContainer.appendChild(itemElement);
    });
}

// Обновление поставщиков
function updateSuppliers() {
    const suppliersContainer = document.querySelector('.suppliers-list');
    suppliersContainer.innerHTML = '';
    
    gameState.suppliers.forEach(supplier => {
        const supplierElement = document.createElement('div');
        supplierElement.className = 'supplier-item';
        supplierElement.innerHTML = `
            <h3>${supplier.name}</h3>
            <p>Специализация: ${supplier.specialization}</p>
            <p>Уровень: ${supplier.level}</p>
            <p>Стоимость: ${supplier.cost}</p>
            <button onclick="hireSupplier('${supplier.id}')">Нанять</button>
        `;
        suppliersContainer.appendChild(supplierElement);
    });
}

// Обновление маркетинга
function updateMarketing() {
    const marketingContainer = document.querySelector('.marketing-options');
    marketingContainer.innerHTML = '';
    
    gameState.marketing.forEach(option => {
        const optionElement = document.createElement('div');
        optionElement.className = 'marketing-btn';
        optionElement.innerHTML = `
            <h3>${option.name}</h3>
            <p>${option.description}</p>
            <p>Стоимость: ${option.cost}</p>
            <button onclick="launchMarketing('${option.id}')">Запустить</button>
        `;
        marketingContainer.appendChild(optionElement);
    });
}

// Обновление сотрудников
function updateEmployees() {
    const employeesContainer = document.querySelector('.employees-list');
    employeesContainer.innerHTML = '';
    
    gameState.employees.forEach(employee => {
        const employeeElement = document.createElement('div');
        employeeElement.className = 'employee-item';
        employeeElement.innerHTML = `
            <h3>${employee.name}</h3>
            <p>Должность: ${employee.position}</p>
            <p>Зарплата: ${employee.salary}</p>
            <p>Эффективность: ${employee.efficiency}%</p>
            <button onclick="fireEmployee('${employee.id}')">Уволить</button>
        `;
        employeesContainer.appendChild(employeeElement);
    });
}

// Обновление реферальной информации
function updateReferralInfo() {
    const referralInput = document.querySelector('.referral-link input');
    referralInput.value = `https://t.me/your_bot?start=${gameState.referralCode}`;
    
    const referralStats = document.querySelector('.referral-stats');
    referralStats.innerHTML = `
        <h3>Ваша реферальная статистика</h3>
        <p>Приглашено: ${gameState.referrals.length}</p>
        <p>Заработано звезд: ${gameState.referrals.length * 50}</p>
    `;
}

// Обновление интерфейса мини-игры
function updateMinigameUI() {
    document.querySelector('.minigame-attempts').textContent = `🎯 ${gameState.attempts}/3`;
    document.querySelector('.minigame-score').textContent = `🏆 ${gameState.minigame.score}`;
    document.querySelector('.minigame-timer').textContent = `⏱ ${gameState.minigame.timer}`;
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Переключение вкладок
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.querySelector(`.tab-pane[data-tab="${btn.dataset.tab}"]`).classList.add('active');
        });
    });

    // Обработчики категорий
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateShopUI();
        });
    });

    // Кнопки мини-игры
    document.querySelector('.start-btn').addEventListener('click', startMinigame);
    document.querySelector('.buy-btn').addEventListener('click', buyAttempt);
}

// Фильтрация инвентаря по категории
function filterInventory(category) {
    const items = document.querySelectorAll('.inventory-item');
    items.forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Проверка сброса попыток
function checkAttemptsReset() {
    const today = new Date().toDateString();
    if (gameState.lastAttemptReset !== today) {
        gameState.attempts = 3;
        gameState.lastAttemptReset = today;
        saveGameState();
    }
}

// Мини-игра
let gameInterval;
let itemInterval;

function startMinigame() {
    if (gameState.attempts <= 0) {
        alert('У вас закончились попытки! Купите дополнительные попытки за звезды.');
        return;
    }

    gameState.minigame.isActive = true;
    gameState.minigame.score = 0;
    gameState.minigame.timer = 30;
    gameState.attempts--;
    updateMinigameUI();

    const gameArea = document.querySelector('.minigame-area');
    const basket = document.querySelector('.player-basket');
    let basketPosition = 50;

    // Управление корзиной
    function moveBasket(e) {
        if (!gameState.minigame.isActive) return;
        
        const rect = gameArea.getBoundingClientRect();
        const x = e.clientX - rect.left;
        basketPosition = Math.max(0, Math.min(100, (x / rect.width) * 100));
        basket.style.left = `${basketPosition}%`;
    }

    // Создание падающего предмета
    function createFallingItem() {
        if (!gameState.minigame.isActive) return;

        const item = document.createElement('div');
        item.className = 'falling-item';
        const itemType = gameState.minigame.items[Math.floor(Math.random() * gameState.minigame.items.length)];
        item.innerHTML = `<svg><use href="#${itemType}"/></svg>`;
        
        const startX = Math.random() * 80 + 10;
        item.style.left = `${startX}%`;
        item.dataset.type = itemType;
        
        gameArea.appendChild(item);
        item.classList.add('falling');

        // Проверка попадания
        item.addEventListener('animationend', () => {
            const itemRect = item.getBoundingClientRect();
            const basketRect = basket.getBoundingClientRect();
            
            if (itemRect.bottom >= basketRect.top && 
                itemRect.left >= basketRect.left && 
                itemRect.right <= basketRect.right) {
                catchItem(itemType);
            }
            
            item.remove();
        });
    }

    // Ловля предмета
    function catchItem(type) {
        gameState.minigame.score += gameState.minigame.points[type];
        updateMinigameUI();
        
        const pointsEffect = document.createElement('div');
        pointsEffect.className = 'points-effect';
        pointsEffect.textContent = `+${gameState.minigame.points[type]}`;
        gameArea.appendChild(pointsEffect);
        
        setTimeout(() => pointsEffect.remove(), 1000);
    }

    // Таймер игры
    function updateTimer() {
        if (!gameState.minigame.isActive) return;
        
        gameState.minigame.timer--;
        updateMinigameUI();
        
        if (gameState.minigame.timer <= 0) {
            endMinigame();
        }
    }

    // Завершение игры
    function endMinigame() {
        gameState.minigame.isActive = false;
        clearInterval(gameInterval);
        clearInterval(itemInterval);
        
        // Начисление наград
        if (gameState.minigame.score >= 300) {
            gameState.stars += 3;
        } else if (gameState.minigame.score >= 200) {
            gameState.stars += 2;
        } else if (gameState.minigame.score >= 100) {
            gameState.stars += 1;
        }
        
        saveGameState();
        updateUI();
        
        alert(`Игра окончена! Ваш счет: ${gameState.minigame.score}`);
    }

    // Добавление обработчиков
    gameArea.addEventListener('mousemove', moveBasket);
    gameArea.addEventListener('touchmove', (e) => {
        e.preventDefault();
        moveBasket(e.touches[0]);
    });

    // Запуск игры
    gameInterval = setInterval(updateTimer, 1000);
    itemInterval = setInterval(createFallingItem, 2000);
}

// Покупка дополнительной попытки
function buyAttempt() {
    if (gameState.stars < 50) {
        alert('Недостаточно звезд!');
        return;
    }

    gameState.stars -= 50;
    gameState.attempts++;
    saveGameState();
    updateUI();
    alert('Вы купили дополнительную попытку!');
}

// Инициализация игры при загрузке страницы
document.addEventListener('DOMContentLoaded', initGame); 