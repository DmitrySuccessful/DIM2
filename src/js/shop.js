// Импорт зависимостей
import { state, updateState } from './state.js';
import { showNotification } from './utils.js';

// Данные о продуктах
const products = [
    {
        id: 1,
        name: 'Игровая мышь Razer DeathAdder V2',
        price: 4990,
        image: 'src/assets/images/mouse.jpg',
        description: 'Профессиональная игровая мышь с сенсором 20000 DPI'
    },
    {
        id: 2,
        name: 'Механическая клавиатура Corsair K70',
        price: 12990,
        image: 'src/assets/images/keyboard.jpg',
        description: 'RGB механическая клавиатура с переключателями Cherry MX'
    },
    {
        id: 3,
        name: 'Игровые наушники HyperX Cloud II',
        price: 7990,
        image: 'src/assets/images/headphones.jpg',
        description: '7.1 виртуальный звук, память с эффектом памяти'
    }
];

// Класс для управления магазином
class ShopManager {
    constructor() {
        this.productsContainer = document.getElementById('products-container');
        this.cartBtn = document.getElementById('cart-btn');
        this.cartModal = document.getElementById('cart-modal');
        this.cartItems = document.getElementById('cart-items');
        this.cartTotal = document.getElementById('cart-total');
        this.closeModal = document.querySelector('.close-modal');
        this.checkoutBtn = document.getElementById('checkout');
        this.applyBonusBtn = document.getElementById('apply-bonus');
        
        this.initializeShop();
    }

    initializeShop() {
        this.renderProducts();
        this.setupEventListeners();
        this.updateCartCount();
    }

    renderProducts() {
        this.productsContainer.innerHTML = products.map(product => `
            <div class="product-card" data-id="${product.id}">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <p>${product.description}</p>
                    <p class="product-price">${product.price} ₽</p>
                    <button class="add-to-cart">В корзину</button>
                </div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Обработчики для добавления товаров в корзину
        this.productsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart')) {
                const productCard = e.target.closest('.product-card');
                const productId = parseInt(productCard.dataset.id);
                this.addToCart(productId);
            }
        });

        // Обработчики модального окна корзины
        this.cartBtn.addEventListener('click', () => this.openCart());
        this.closeModal.addEventListener('click', () => this.closeCart());
        this.checkoutBtn.addEventListener('click', () => this.checkout());
        this.applyBonusBtn.addEventListener('click', () => this.applyBonus());

        // Закрытие модального окна при клике вне его
        window.addEventListener('click', (e) => {
            if (e.target === this.cartModal) {
                this.closeCart();
            }
        });
    }

    addToCart(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const cart = state.cart || [];
        const existingItem = cart.find(item => item.id === productId);

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
        this.updateCartCount();
        showNotification('Товар добавлен в корзину');
    }

    updateCartCount() {
        const count = (state.cart || []).reduce((sum, item) => sum + item.quantity, 0);
        document.getElementById('cart-count').textContent = count;
    }

    openCart() {
        this.renderCart();
        this.cartModal.classList.add('active');
    }

    closeCart() {
        this.cartModal.classList.remove('active');
    }

    renderCart() {
        const cart = state.cart || [];
        
        if (cart.length === 0) {
            this.cartItems.innerHTML = '<p>Корзина пуста</p>';
            this.cartTotal.textContent = '0';
            return;
        }

        this.cartItems.innerHTML = cart.map(item => {
            const product = products.find(p => p.id === item.id);
            return `
                <div class="cart-item">
                    <div>
                        <h4>${item.name}</h4>
                        <p>${item.price} ₽ x ${item.quantity}</p>
                    </div>
                    <div>
                        <button class="remove-item" data-id="${item.id}">&times;</button>
                    </div>
                </div>
            `;
        }).join('');

        // Добавляем обработчики для кнопок удаления
        this.cartItems.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.removeFromCart(id);
            });
        });

        this.updateCartTotal();
    }

    removeFromCart(productId) {
        const cart = state.cart || [];
        const updatedCart = cart.filter(item => item.id !== productId);
        updateState({ cart: updatedCart });
        this.renderCart();
        this.updateCartCount();
        showNotification('Товар удален из корзины');
    }

    updateCartTotal() {
        const cart = state.cart || [];
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        this.cartTotal.textContent = total;

        // Обновляем состояние кнопки применения бонусов
        const availableBonus = state.bonus || 0;
        this.applyBonusBtn.disabled = availableBonus === 0 || total === 0;
    }

    applyBonus() {
        const total = parseFloat(this.cartTotal.textContent);
        const availableBonus = state.bonus || 0;

        if (availableBonus === 0 || total === 0) return;

        const maxDiscount = Math.min(total * 0.3, availableBonus); // Максимальная скидка 30%
        const newTotal = total - maxDiscount;
        const remainingBonus = availableBonus - maxDiscount;

        updateState({ bonus: remainingBonus });
        this.cartTotal.textContent = Math.round(newTotal);
        document.getElementById('bonus-amount').textContent = remainingBonus;
        document.getElementById('available-bonus').textContent = remainingBonus;

        showNotification(`Применена скидка ${maxDiscount} ₽`);
    }

    checkout() {
        const cart = state.cart || [];
        if (cart.length === 0) return;

        // Здесь будет логика оформления заказа
        showNotification('Заказ успешно оформлен!', 'success');
        updateState({ cart: [] });
        this.closeCart();
        this.updateCartCount();
    }
}

// Инициализация магазина после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    // Скрываем loader
    document.getElementById('loader').style.display = 'none';
    
    // Инициализируем магазин
    window.shopManager = new ShopManager();
}); 