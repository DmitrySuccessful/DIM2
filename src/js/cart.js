import { state, updateState } from './state.js';
import { showNotification } from './utils.js';

class CartManager {
    constructor() {
        this.cartModal = document.getElementById('cart-modal');
        this.cartItems = document.getElementById('cart-items');
        this.cartTotal = document.getElementById('cart-total');
        this.cartCount = document.getElementById('cart-count');
        this.checkoutBtn = document.getElementById('checkout');
        this.applyBonusBtn = document.getElementById('apply-bonus');
        this.availableBonusElement = document.getElementById('available-bonus');

        this.setupEventListeners();
        this.updateCartDisplay();
    }

    setupEventListeners() {
        // Обработчик кнопки применения бонусов
        this.applyBonusBtn.addEventListener('click', () => this.applyBonus());

        // Обработчик кнопки оформления заказа
        this.checkoutBtn.addEventListener('click', () => this.checkout());

        // Обработчик удаления товаров
        this.cartItems.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-item')) {
                const itemId = parseInt(e.target.dataset.id);
                this.removeItem(itemId);
            }
        });

        // Обработчик изменения количества товаров
        this.cartItems.addEventListener('change', (e) => {
            if (e.target.classList.contains('item-quantity')) {
                const itemId = parseInt(e.target.dataset.id);
                const quantity = parseInt(e.target.value);
                this.updateItemQuantity(itemId, quantity);
            }
        });
    }

    updateCartDisplay() {
        const cart = state.cart || [];
        const bonus = state.bonus || 0;

        // Обновляем счетчик товаров
        this.cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

        // Обновляем доступные бонусы
        this.availableBonusElement.textContent = bonus;

        // Если корзина пуста
        if (cart.length === 0) {
            this.cartItems.innerHTML = '<p class="empty-cart">Корзина пуста</p>';
            this.cartTotal.textContent = '0';
            this.checkoutBtn.disabled = true;
            this.applyBonusBtn.disabled = true;
            return;
        }

        // Отображаем товары
        this.cartItems.innerHTML = cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p class="item-price">${item.price} ₽</p>
                </div>
                <div class="item-controls">
                    <input type="number" 
                           class="item-quantity" 
                           data-id="${item.id}" 
                           value="${item.quantity}" 
                           min="1" 
                           max="99">
                    <button class="remove-item" data-id="${item.id}">&times;</button>
                </div>
            </div>
        `).join('');

        // Обновляем общую сумму
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        this.cartTotal.textContent = total;

        // Обновляем состояние кнопок
        this.checkoutBtn.disabled = false;
        this.applyBonusBtn.disabled = bonus === 0;

        // Анимируем новые элементы
        gsap.from('.cart-item', {
            y: 20,
            opacity: 0,
            duration: 0.3,
            stagger: 0.1
        });
    }

    addItem(product) {
        const cart = state.cart || [];
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1
            });
        }

        updateState({ cart });
        this.updateCartDisplay();
        showNotification('Товар добавлен в корзину');
        playSound('src/assets/sounds/add-to-cart.mp3', 0.3);
    }

    removeItem(productId) {
        const cart = state.cart || [];
        const updatedCart = cart.filter(item => item.id !== productId);
        
        updateState({ cart: updatedCart });
        this.updateCartDisplay();
        showNotification('Товар удален из корзины');
        playSound('src/assets/sounds/remove-from-cart.mp3', 0.3);
    }

    updateItemQuantity(productId, quantity) {
        if (quantity < 1) return;

        const cart = state.cart || [];
        const item = cart.find(item => item.id === productId);
        
        if (item) {
            item.quantity = quantity;
            updateState({ cart });
            this.updateCartDisplay();
        }
    }

    applyBonus() {
        const total = parseFloat(this.cartTotal.textContent);
        const bonus = state.bonus || 0;

        if (bonus === 0 || total === 0) return;

        // Максимальная скидка - 30% от суммы заказа
        const maxDiscount = Math.min(total * 0.3, bonus);
        const newTotal = total - maxDiscount;
        const remainingBonus = bonus - maxDiscount;

        updateState({ bonus: remainingBonus });
        this.cartTotal.textContent = Math.round(newTotal);
        this.availableBonusElement.textContent = remainingBonus;

        showNotification(`Применена скидка ${maxDiscount} ₽`);
        playSound('src/assets/sounds/bonus-applied.mp3', 0.3);
    }

    checkout() {
        const cart = state.cart || [];
        if (cart.length === 0) return;

        // Здесь будет логика оформления заказа
        // Например, отправка данных на сервер

        // Очищаем корзину
        updateState({ cart: [] });
        this.updateCartDisplay();

        showNotification('Заказ успешно оформлен!', 'success');
        playSound('src/assets/sounds/order-complete.mp3', 0.5);

        // Закрываем модальное окно
        this.cartModal.classList.remove('active');
    }
}

// Экспортируем класс для использования в других модулях
export default CartManager; 