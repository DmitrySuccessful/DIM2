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
    // Система развития магазина
    shop: {
        level: 1,
        size: 1, // 1 - маленький, 2 - средний, 3 - большой
        upgrades: {
            storage: 1, // Увеличивает количество товаров
            display: 1, // Увеличивает привлекательность
            automation: 1 // Увеличивает скорость продаж
        }
    },
    // Система персонала
    staff: {
        cashiers: [], // Кассиры
        managers: [], // Менеджеры
        warehouse: [], // Складские работники
        lastSalaryPayment: new Date().toDateString(),
        autoSellEnabled: false
    },
    // Система подработки
    work: {
        tasks: [
            { id: 'inventory', name: 'Учет товаров', reward: 50, time: 30 },
            { id: 'pricing', name: 'Установка цен', reward: 75, time: 45 },
            { id: 'display', name: 'Выкладка товаров', reward: 100, time: 60 },
            { id: 'analysis', name: 'Анализ продаж', reward: 150, time: 90 }
        ],
        activeTask: null,
        lastTaskTime: null
    },
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
    if (!shopGrid) return;
    
    shopGrid.innerHTML = '';

    const activeCategory = document.querySelector('.category-btn.active')?.dataset.category || 'clothes';
    
    if (baseProducts[activeCategory]) {
        baseProducts[activeCategory].forEach(product => {
            const inventoryItem = gameState.inventory.find(item => item.id === product.id);
            const productElement = createProductElement(inventoryItem || product);
            shopGrid.appendChild(productElement);
        });
    }
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
    
    // Добавляем обработчики для навигационных кнопок
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const windowId = btn.getAttribute('data-window');
            openWindow(windowId);
        });
    });
    
    // Добавляем обработчики для кнопок закрытия окон
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const window = btn.closest('.window');
            if (window) {
                closeWindow(window.id);
            }
        });
    });
    
    // Добавляем обработчики для кнопок категорий
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Убираем активный класс у всех кнопок категорий
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            
            // Добавляем активный класс нажатой кнопке
            btn.classList.add('active');
            
            // Обновляем отображение товаров
            updateShopUI();
        });
    });
    
    // Открываем окно магазина по умолчанию
    openWindow('shop-window');
    
    // Активируем первую категорию по умолчанию
    const firstCategory = document.querySelector('.category-btn');
    if (firstCategory) {
        firstCategory.click();
    }
    
    // Загружаем сохраненное состояние игры
    loadGameState();
    
    // Обновляем интерфейс
    updateUI();
}

// Открытие окна
function openWindow(windowId) {
    // Закрываем все окна
    document.querySelectorAll('.window').forEach(w => w.classList.remove('active'));
    
    // Убираем активный класс у всех навигационных кнопок
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    // Открываем нужное окно
    const window = document.getElementById(windowId);
    if (window) {
        window.classList.add('active');
        
        // Активируем соответствующую навигационную кнопку
        const navBtn = document.querySelector(`.nav-btn[data-window="${windowId}"]`);
        if (navBtn) {
            navBtn.classList.add('active');
        }
        
        // Обновляем содержимое окна
        updateWindowContent(windowId);
    }
}

// Закрытие окна
function closeWindow(windowId) {
    const window = document.getElementById(windowId);
    if (window) {
        window.classList.remove('active');
        
        // Убираем активный класс у навигационной кнопки
        const navBtn = document.querySelector(`.nav-btn[data-window="${windowId}"]`);
        if (navBtn) {
            navBtn.classList.remove('active');
        }
    }
}

// Обновление содержимого окна
function updateWindowContent(windowId) {
    switch (windowId) {
        case 'shop-window':
            updateShopUI();
            break;
        case 'suppliers-window':
            updateSuppliers();
            break;
        case 'marketing-window':
            updateMarketing();
            break;
        case 'employees-window':
            updateEmployees();
            break;
        case 'referral-window':
            updateReferralInfo();
            break;
        case 'minigame-window':
            updateMinigameUI();
            break;
    }
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

// Система автоматических продаж
function updateAutoSales() {
    if (!gameState.staff.autoSellEnabled) return;
    
    const totalStaff = gameState.staff.cashiers.length + 
                      gameState.staff.managers.length + 
                      gameState.staff.warehouse.length;
    
    if (totalStaff === 0) return;
    
    // Базовый шанс продажи
    let saleChance = 0.1 + (totalStaff * 0.05);
    
    // Учитываем уровень магазина и улучшения
    saleChance *= (1 + (gameState.shop.level - 1) * 0.2);
    saleChance *= (1 + (gameState.shop.upgrades.automation - 1) * 0.1);
    
    // Проверяем каждый товар
    gameState.inventory.forEach(product => {
        if (product.quantity > 0 && Math.random() < saleChance) {
            // Продаем товар
            gameState.money += product.sellPrice;
            product.quantity--;
            gameState.reputation += 1;
            
            // Обновляем статистику
            updateUI();
        }
    });
}

// Система зарплаты персонала
function payStaffSalaries() {
    const today = new Date().toDateString();
    if (gameState.staff.lastSalaryPayment === today) return;
    
    let totalSalary = 0;
    
    // Зарплата кассиров
    gameState.staff.cashiers.forEach(cashier => {
        totalSalary += 100 * cashier.level;
    });
    
    // Зарплата менеджеров
    gameState.staff.managers.forEach(manager => {
        totalSalary += 200 * manager.level;
    });
    
    // Зарплата складских работников
    gameState.staff.warehouse.forEach(worker => {
        totalSalary += 150 * worker.level;
    });
    
    // Проверяем, достаточно ли денег
    if (gameState.money >= totalSalary) {
        gameState.money -= totalSalary;
        gameState.staff.lastSalaryPayment = today;
        updateUI();
        showNotification(`Выплачена зарплата персоналу: ${totalSalary} 💰`);
    } else {
        showNotification('Недостаточно денег для выплаты зарплаты!', 'error');
    }
}

// Обновление игры
function updateGame() {
    updateAutoSales();
    payStaffSalaries();
}

// Запуск обновления игры каждую минуту
setInterval(updateGame, 60000);

// Инициализация игры при загрузке страницы
document.addEventListener('DOMContentLoaded', initGame);

// Управление персоналом
function hireStaff(type) {
    const costs = {
        cashier: 500,
        manager: 1000,
        warehouse: 800
    };
    
    if (gameState.money >= costs[type]) {
        gameState.money -= costs[type];
        
        const newStaff = {
            id: Date.now(),
            type: type,
            level: 1,
            experience: 0,
            salary: costs[type] / 5
        };
        
        switch(type) {
            case 'cashier':
                gameState.staff.cashiers.push(newStaff);
                break;
            case 'manager':
                gameState.staff.managers.push(newStaff);
                break;
            case 'warehouse':
                gameState.staff.warehouse.push(newStaff);
                break;
        }
        
        updateUI();
        showNotification(`Нанят новый ${getStaffName(type)}!`);
    } else {
        showNotification('Недостаточно денег!', 'error');
    }
}

function getStaffName(type) {
    const names = {
        cashier: 'кассир',
        manager: 'менеджер',
        warehouse: 'складской работник'
    };
    return names[type] || type;
}

function toggleAutoSell() {
    gameState.staff.autoSellEnabled = !gameState.staff.autoSellEnabled;
    const btn = document.querySelector('.staff-btn:last-child');
    btn.textContent = gameState.staff.autoSellEnabled ? 'Выключить автопродажи' : 'Включить автопродажи';
    showNotification(gameState.staff.autoSellEnabled ? 'Автопродажи включены!' : 'Автопродажи выключены');
}

// Система работы
let workTimer;
let currentTask = null;

function startTask(taskId) {
    if (currentTask) {
        showNotification('У вас уже есть активное задание!', 'error');
        return;
    }
    
    const task = gameState.work.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    currentTask = task;
    gameState.work.activeTask = task;
    gameState.work.lastTaskTime = Date.now();
    
    // Обновляем UI
    document.querySelector('.work-timer').textContent = `⏱ ${task.time}с`;
    document.querySelector('.work-reward').textContent = `💰 ${task.reward}`;
    document.querySelector('.progress-fill').style.width = '0%';
    
    // Запускаем таймер
    let timeLeft = task.time;
    workTimer = setInterval(() => {
        timeLeft--;
        const progress = ((task.time - timeLeft) / task.time) * 100;
        document.querySelector('.progress-fill').style.width = `${progress}%`;
        document.querySelector('.work-timer').textContent = `⏱ ${timeLeft}с`;
        
        if (timeLeft <= 0) {
            completeTask();
        }
    }, 1000);
    
    // Деактивируем кнопки
    document.querySelectorAll('.task-btn').forEach(btn => btn.disabled = true);
}

function completeTask() {
    clearInterval(workTimer);
    
    if (currentTask) {
        gameState.money += currentTask.reward;
        gameState.reputation += 5;
        
        showNotification(`Задание выполнено! Награда: ${currentTask.reward} 💰`);
        
        // Активируем кнопки
        document.querySelectorAll('.task-btn').forEach(btn => btn.disabled = false);
        
        currentTask = null;
        gameState.work.activeTask = null;
        gameState.work.lastTaskTime = null;
        
        updateUI();
    }
}

// Обновление UI для персонала
function updateStaffUI() {
    // Обновляем статистику
    document.getElementById('cashiers-count').textContent = gameState.staff.cashiers.length;
    document.getElementById('managers-count').textContent = gameState.staff.managers.length;
    document.getElementById('warehouse-count').textContent = gameState.staff.warehouse.length;
    
    // Рассчитываем ежедневную зарплату
    const dailySalary = calculateDailySalary();
    document.getElementById('daily-salary').textContent = `${dailySalary} 💰`;
    
    // Обновляем список персонала
    const staffList = document.getElementById('staff-list');
    staffList.innerHTML = '';
    
    [...gameState.staff.cashiers, ...gameState.staff.managers, ...gameState.staff.warehouse]
        .forEach(staff => {
            const staffElement = document.createElement('div');
            staffElement.className = 'staff-member';
            staffElement.innerHTML = `
                <div class="staff-info">
                    <h4>${getStaffName(staff.type)}</h4>
                    <p>Уровень: ${staff.level}</p>
                    <p>Опыт: ${staff.experience}/100</p>
                    <p>Зарплата: ${staff.salary} 💰/день</p>
                </div>
            `;
            staffList.appendChild(staffElement);
        });
}

function calculateDailySalary() {
    let total = 0;
    gameState.staff.cashiers.forEach(cashier => total += cashier.salary);
    gameState.staff.managers.forEach(manager => total += manager.salary);
    gameState.staff.warehouse.forEach(worker => total += worker.salary);
    return total;
}

// Обновление UI для работы
function updateWorkUI() {
    if (currentTask) {
        const timeLeft = Math.max(0, currentTask.time - Math.floor((Date.now() - gameState.work.lastTaskTime) / 1000));
        document.querySelector('.work-timer').textContent = `⏱ ${timeLeft}с`;
    }
}

// Обновляем основную функцию updateUI
function updateUI() {
    updateStats();
    updateInventory();
    updateSuppliers();
    updateMarketing();
    updateStaffUI();
    updateWorkUI();
    updateReferralInfo();
}

// Добавляем обработчики для кнопок заданий
document.addEventListener('DOMContentLoaded', () => {
    // ... existing code ...
    
    // Добавляем обработчики для кнопок заданий
    document.querySelectorAll('.task-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const taskItem = btn.closest('.task-item');
            if (taskItem) {
                startTask(taskItem.dataset.task);
            }
        });
    });
}); 