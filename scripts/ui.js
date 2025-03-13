import { CONFIG } from './config.js';

/**
 * Класс для управления пользовательским интерфейсом
 */
export class UI {
    constructor(gameState, services) {
        this.gameState = gameState;
        this.services = services;
        this.notifications = [];
        this.activeModals = new Set();
        this.initializeUI();
        this.bindEvents();
    }

    /**
     * Инициализация UI
     * @private
     */
    initializeUI() {
        try {
            this.updateStats();
            this.renderShop();
            this.renderStaff();
            this.renderMarketing();
            this.setupMinigame();
        } catch (error) {
            console.error('Failed to initialize UI:', error);
            this.showError('Ошибка инициализации интерфейса');
        }
    }

    /**
     * Привязка событий
     * @private
     */
    bindEvents() {
        try {
            // Навигация
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.addEventListener('click', () => this.switchSection(btn.dataset.section));
            });

            // Кнопки действий
            document.getElementById('settings-btn')?.addEventListener('click', () => this.showSettings());
            document.getElementById('help-btn')?.addEventListener('click', () => this.showHelp());

            // Обработка клавиш
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeAllModals();
                }
            });
        } catch (error) {
            console.error('Failed to bind events:', error);
        }
    }

    /**
     * Обновление статистики
     */
    updateStats() {
        try {
            const stats = {
                money: document.getElementById('money'),
                level: document.getElementById('level'),
                reputation: document.getElementById('reputation')
            };

            if (stats.money) stats.money.textContent = this.formatNumber(this.gameState.money);
            if (stats.level) stats.level.textContent = this.gameState.level;
            if (stats.reputation) stats.reputation.textContent = this.gameState.reputation;
        } catch (error) {
            console.error('Failed to update stats:', error);
        }
    }

    /**
     * Форматирование числа
     * @private
     * @param {number} number - Число для форматирования
     * @returns {string} Отформатированное число
     */
    formatNumber(number) {
        return new Intl.NumberFormat('ru-RU').format(number);
    }

    /**
     * Переключение разделов
     * @param {string} sectionId - ID раздела
     */
    switchSection(sectionId) {
        try {
            // Скрываем все разделы
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
            });

            // Показываем выбранный раздел
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
            }

            // Обновляем активную кнопку навигации
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.section === sectionId);
            });
        } catch (error) {
            console.error('Failed to switch section:', error);
            this.showError('Ошибка при переключении раздела');
        }
    }

    /**
     * Рендеринг магазина
     */
    renderShop() {
        try {
            const shopGrid = document.getElementById('shop-grid');
            if (!shopGrid) return;

            shopGrid.innerHTML = '';
            const fragment = document.createDocumentFragment();

            this.services.productService.getAllProducts().forEach(product => {
                const productCard = this.createProductCard(product);
                fragment.appendChild(productCard);
            });

            shopGrid.appendChild(fragment);
        } catch (error) {
            console.error('Failed to render shop:', error);
            this.showError('Ошибка при загрузке магазина');
        }
    }

    /**
     * Создание карточки товара
     * @private
     * @param {Object} product - Данные товара
     * @returns {HTMLElement} Элемент карточки товара
     */
    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        const canBuy = this.gameState.money >= product.basePrice;
        
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">Цена: ${this.formatNumber(product.basePrice)}</p>
                <p class="product-sell-price">Продажа: ${this.formatNumber(product.sellPrice)}</p>
                <button class="buy-btn" data-product-id="${product.id}" ${canBuy ? '' : 'disabled'}>
                    ${canBuy ? 'Купить' : 'Недостаточно денег'}
                </button>
            </div>
        `;

        card.querySelector('.buy-btn').addEventListener('click', () => {
            this.buyProduct(product);
        });

        return card;
    }

    /**
     * Покупка товара
     * @param {Object} product - Товар для покупки
     */
    buyProduct(product) {
        try {
            if (this.gameState.spendMoney(product.basePrice)) {
                this.gameState.addToInventory(product);
                this.updateStats();
                this.showNotification(`Товар "${product.name}" куплен!`);
                this.renderShop(); // Обновляем магазин для обновления кнопок
            } else {
                this.showNotification('Недостаточно денег!', 'error');
            }
        } catch (error) {
            console.error('Failed to buy product:', error);
            this.showError('Ошибка при покупке товара');
        }
    }

    /**
     * Рендеринг персонала
     */
    renderStaff() {
        try {
            const staffList = document.getElementById('staff-list');
            if (!staffList) return;

            staffList.innerHTML = '';
            const fragment = document.createDocumentFragment();

            this.services.staffService.getAllStaff().forEach(staff => {
                const staffCard = this.createStaffCard(staff);
                fragment.appendChild(staffCard);
            });

            staffList.appendChild(fragment);
        } catch (error) {
            console.error('Failed to render staff:', error);
            this.showError('Ошибка при загрузке персонала');
        }
    }

    /**
     * Создание карточки сотрудника
     * @private
     * @param {Object} staff - Данные сотрудника
     * @returns {HTMLElement} Элемент карточки сотрудника
     */
    createStaffCard(staff) {
        const card = document.createElement('div');
        card.className = 'staff-card';
        
        const canHire = this.gameState.money >= staff.baseSalary;
        
        card.innerHTML = `
            <img src="${staff.image}" alt="${staff.name}" class="staff-image">
            <div class="staff-info">
                <h3 class="staff-name">${staff.name}</h3>
                <p class="staff-salary">Зарплата: ${this.formatNumber(staff.baseSalary)}</p>
                <p class="staff-efficiency">Эффективность: ${(staff.efficiency * 100).toFixed(0)}%</p>
                <button class="hire-btn" data-staff-id="${staff.id}" ${canHire ? '' : 'disabled'}>
                    ${canHire ? 'Нанять' : 'Недостаточно денег'}
                </button>
            </div>
        `;

        card.querySelector('.hire-btn').addEventListener('click', () => {
            this.hireStaff(staff);
        });

        return card;
    }

    /**
     * Найм сотрудника
     * @param {Object} staff - Сотрудник для найма
     */
    hireStaff(staff) {
        try {
            if (this.gameState.hireStaff(staff)) {
                this.updateStats();
                this.showNotification(`Сотрудник "${staff.name}" нанят!`);
                this.renderStaff(); // Обновляем список персонала
            } else {
                this.showNotification('Недостаточно денег!', 'error');
            }
        } catch (error) {
            console.error('Failed to hire staff:', error);
            this.showError('Ошибка при найме сотрудника');
        }
    }

    /**
     * Рендеринг маркетинга
     */
    renderMarketing() {
        try {
            const marketingOptions = document.querySelector('.marketing-options');
            if (!marketingOptions) return;

            marketingOptions.innerHTML = '';
            const fragment = document.createDocumentFragment();

            this.services.marketingService.getAllCampaigns().forEach(campaign => {
                const campaignCard = this.createMarketingCard(campaign);
                fragment.appendChild(campaignCard);
            });

            marketingOptions.appendChild(fragment);
        } catch (error) {
            console.error('Failed to render marketing:', error);
            this.showError('Ошибка при загрузке маркетинга');
        }
    }

    /**
     * Создание карточки маркетинговой кампании
     * @private
     * @param {Object} campaign - Данные кампании
     * @returns {HTMLElement} Элемент карточки кампании
     */
    createMarketingCard(campaign) {
        const card = document.createElement('div');
        card.className = 'marketing-card';
        
        const canStart = this.gameState.money >= campaign.cost;
        
        card.innerHTML = `
            <h3 class="campaign-name">${campaign.name}</h3>
            <p class="campaign-description">${campaign.description}</p>
            <p class="campaign-cost">Стоимость: ${this.formatNumber(campaign.cost)}</p>
            <button class="marketing-btn" data-campaign-id="${campaign.id}" ${canStart ? '' : 'disabled'}>
                ${canStart ? 'Запустить' : 'Недостаточно денег'}
            </button>
        `;

        card.querySelector('.marketing-btn').addEventListener('click', () => {
            this.startMarketing(campaign);
        });

        return card;
    }

    /**
     * Запуск маркетинговой кампании
     * @param {Object} campaign - Кампания для запуска
     */
    startMarketing(campaign) {
        try {
            if (this.gameState.startMarketing(campaign)) {
                this.updateStats();
                this.showNotification(`Маркетинговая кампания "${campaign.name}" запущена!`);
                this.renderMarketing(); // Обновляем список кампаний
            } else {
                this.showNotification('Недостаточно денег!', 'error');
            }
        } catch (error) {
            console.error('Failed to start marketing campaign:', error);
            this.showError('Ошибка при запуске кампании');
        }
    }

    /**
     * Настройка мини-игры
     * @private
     */
    setupMinigame() {
        try {
            const canvas = document.getElementById('minigame-canvas');
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            canvas.width = CONFIG.MINIGAME.canvasWidth;
            canvas.height = CONFIG.MINIGAME.canvasHeight;

            document.getElementById('start-game')?.addEventListener('click', () => {
                this.startMinigame(canvas, ctx);
            });
        } catch (error) {
            console.error('Failed to setup minigame:', error);
            this.showError('Ошибка при настройке мини-игры');
        }
    }

    /**
     * Запуск мини-игры
     * @param {HTMLCanvasElement} canvas - Canvas элемент
     * @param {CanvasRenderingContext2D} ctx - Контекст canvas
     */
    startMinigame(canvas, ctx) {
        try {
            // Здесь будет логика мини-игры
            this.showNotification('Мини-игра "Ловец Товаров" запущена!');
        } catch (error) {
            console.error('Failed to start minigame:', error);
            this.showError('Ошибка при запуске мини-игры');
        }
    }

    /**
     * Показ уведомления
     * @param {string} message - Текст уведомления
     * @param {string} type - Тип уведомления (success/error)
     */
    showNotification(message, type = 'success') {
        try {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;

            // Удаляем старые уведомления того же типа
            this.notifications = this.notifications.filter(n => {
                if (n.type === type) {
                    n.element.remove();
                    return false;
                }
                return true;
            });

            document.body.appendChild(notification);

            // Добавляем новое уведомление
            const notificationObj = {
                element: notification,
                type: type,
                timeout: setTimeout(() => {
                    notification.remove();
                    this.notifications = this.notifications.filter(n => n !== notificationObj);
                }, 3000)
            };

            this.notifications.push(notificationObj);
        } catch (error) {
            console.error('Failed to show notification:', error);
        }
    }

    /**
     * Показ ошибки
     * @param {string} message - Текст ошибки
     */
    showError(message) {
        this.showNotification(message, 'error');
    }

    /**
     * Показ настроек
     */
    showSettings() {
        try {
            const modal = this.createModal('Настройки', `
                <div class="settings-content">
                    <h3>Настройки игры</h3>
                    <button id="clear-save" class="danger-btn">Очистить сохранение</button>
                    <button id="close-settings" class="secondary-btn">Закрыть</button>
                </div>
            `);

            modal.querySelector('#clear-save').addEventListener('click', () => {
                if (confirm('Вы уверены, что хотите очистить сохранение? Это действие нельзя отменить.')) {
                    this.services.saveService.clearSave();
                    this.showNotification('Сохранение очищено!');
                    this.closeModal(modal);
                    location.reload();
                }
            });

            modal.querySelector('#close-settings').addEventListener('click', () => {
                this.closeModal(modal);
            });
        } catch (error) {
            console.error('Failed to show settings:', error);
            this.showError('Ошибка при открытии настроек');
        }
    }

    /**
     * Показ помощи
     */
    showHelp() {
        try {
            const modal = this.createModal('Помощь', `
                <div class="help-content">
                    <h3>Как играть</h3>
                    <div class="help-section">
                        <h4>Основы игры:</h4>
                        <ul>
                            <li>Покупайте товары в магазине для перепродажи</li>
                            <li>Нанимайте сотрудников для увеличения эффективности</li>
                            <li>Запускайте маркетинговые кампании для увеличения продаж</li>
                            <li>Играйте в мини-игру для дополнительного заработка</li>
                        </ul>
                    </div>
                    <div class="help-section">
                        <h4>Советы:</h4>
                        <ul>
                            <li>Следите за балансом между расходами и доходами</li>
                            <li>Используйте маркетинг для увеличения прибыли</li>
                            <li>Нанимайте персонал для автоматизации процессов</li>
                            <li>Регулярно сохраняйте прогресс</li>
                        </ul>
                    </div>
                    <button id="close-help" class="secondary-btn">Закрыть</button>
                </div>
            `);

            modal.querySelector('#close-help').addEventListener('click', () => {
                this.closeModal(modal);
            });
        } catch (error) {
            console.error('Failed to show help:', error);
            this.showError('Ошибка при открытии помощи');
        }
    }

    /**
     * Создание модального окна
     * @private
     * @param {string} title - Заголовок окна
     * @param {string} content - HTML-содержимое окна
     * @returns {HTMLElement} Элемент модального окна
     */
    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal-container';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="modal-close">✕</button>
                </div>
                <div class="modal-content">
                    ${content}
                </div>
            </div>
        `;

        modal.querySelector('.modal-close').addEventListener('click', () => {
            this.closeModal(modal);
        });

        document.body.appendChild(modal);
        this.activeModals.add(modal);

        return modal;
    }

    /**
     * Закрытие модального окна
     * @private
     * @param {HTMLElement} modal - Элемент модального окна
     */
    closeModal(modal) {
        if (modal && document.body.contains(modal)) {
            modal.remove();
            this.activeModals.delete(modal);
        }
    }

    /**
     * Закрытие всех модальных окон
     * @private
     */
    closeAllModals() {
        this.activeModals.forEach(modal => this.closeModal(modal));
    }

    /**
     * Очистка ресурсов UI
     */
    dispose() {
        // Очищаем все таймауты уведомлений
        this.notifications.forEach(notification => {
            clearTimeout(notification.timeout);
            notification.element.remove();
        });
        this.notifications = [];

        // Закрываем все модальные окна
        this.closeAllModals();
    }
} 