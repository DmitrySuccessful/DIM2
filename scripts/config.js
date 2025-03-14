/**
 * @typedef {Object} LevelConfig
 * @property {number} requiredExp - Required experience for level
 * @property {string} name - Level name
 */

/**
 * @typedef {Object} ProductConfig
 * @property {number} id - Product unique identifier
 * @property {string} name - Product name
 * @property {number} basePrice - Base purchase price
 * @property {number} sellPrice - Base selling price
 * @property {string} image - Path to product image
 * @property {string} category - Product category
 */

/**
 * @typedef {Object} MarketingConfig
 * @property {number} id - Campaign unique identifier
 * @property {string} name - Campaign name
 * @property {number} cost - Campaign cost
 * @property {number} duration - Campaign duration in hours
 * @property {number} effect - Sales multiplier
 * @property {string} description - Campaign description
 */

/**
 * @typedef {Object} StaffConfig
 * @property {number} id - Staff member unique identifier
 * @property {string} name - Staff member name
 * @property {number} baseSalary - Base salary
 * @property {number} efficiency - Base efficiency multiplier
 * @property {string} image - Path to staff member image
 */

/**
 * @typedef {Object} MinigameConfig
 * @property {number} canvasWidth - Canvas width
 * @property {number} canvasHeight - Canvas height
 * @property {number} playerSpeed - Player movement speed
 * @property {number} itemSpeed - Item movement speed
 * @property {number} spawnInterval - Time between item spawns
 * @property {number} gameDuration - Game duration in seconds
 * @property {Object} rewards - Reward amounts for different item types
 */

/**
 * @typedef {Object} ReferralConfig
 * @property {number} bonus - Bonus for inviting a friend
 * @property {number} commission - Commission from referral purchases
 */

/**
 * Game configuration object
 * @type {Object}
 */
export const CONFIG = Object.freeze({
    // Initial settings
    INITIAL_MONEY: 1000,
    INITIAL_LEVEL: 1,
    INITIAL_REPUTATION: 0,
    
    // Level settings
    LEVELS: Object.freeze({
        1: { requiredExp: 0, name: "Начинающий" },
        2: { requiredExp: 1000, name: "Любитель" },
        3: { requiredExp: 3000, name: "Профессионал" },
        4: { requiredExp: 6000, name: "Эксперт" },
        5: { requiredExp: 10000, name: "Мастер" }
    }),

    // Products
    PRODUCTS: Object.freeze([
        {
            id: 1,
            name: "Смартфон",
            basePrice: 500,
            sellPrice: 800,
            image: "/MyShop/images/products/smartphone.svg",
            category: "electronics"
        },
        {
            id: 2,
            name: "Ноутбук",
            basePrice: 1000,
            sellPrice: 1500,
            image: "/MyShop/images/products/laptop.svg",
            category: "electronics"
        },
        {
            id: 3,
            name: "Футболка",
            basePrice: 20,
            sellPrice: 40,
            image: "/MyShop/images/products/tshirt.svg",
            category: "clothing"
        },
        {
            id: 4,
            name: "Джинсы",
            basePrice: 50,
            sellPrice: 100,
            image: "/MyShop/images/products/jeans.svg",
            category: "clothing"
        }
    ]),

    // Marketing campaigns
    MARKETING: Object.freeze([
        {
            id: 1,
            name: "Реклама в соцсетях",
            cost: 100,
            duration: 24,
            effect: 1.5,
            description: "Увеличивает продажи на 50% на 24 часа"
        },
        {
            id: 2,
            name: "Email-рассылка",
            cost: 50,
            duration: 12,
            effect: 1.3,
            description: "Увеличивает продажи на 30% на 12 часов"
        }
    ]),

    // Staff
    STAFF: Object.freeze([
        {
            id: 1,
            name: "Продавец",
            baseSalary: 100,
            efficiency: 1.2,
            image: "https://via.placeholder.com/150?text=Salesman"
        },
        {
            id: 2,
            name: "Менеджер",
            baseSalary: 200,
            efficiency: 1.5,
            image: "https://via.placeholder.com/150?text=Manager"
        }
    ]),

    // Minigame settings
    MINIGAME: Object.freeze({
        canvasWidth: 800,
        canvasHeight: 600,
        playerSpeed: 8,
        itemSpeed: 4,
        spawnInterval: 1000,
        gameDuration: 60,
        rewards: Object.freeze({
            common: 10,
            rare: 25,
            epic: 50
        }),
        powerups: Object.freeze({
            magnet: {
                duration: 5,
                radius: 100
            },
            slowdown: {
                duration: 5,
                factor: 0.5
            },
            multiplier: {
                duration: 5,
                factor: 2
            }
        })
    }),

    // Save settings
    SAVE_INTERVAL: 300000, // 5 minutes in milliseconds
    STORAGE_KEY: "myshop_game_data",

    // Referral system settings
    REFERRAL: Object.freeze({
        bonus: 100,
        commission: 0.1
    }),

    // AI Generation settings
    AI_GENERATION: Object.freeze({
        enabled: true,
        apiKey: '', // Ключ API нужно будет получить от пользователя
        defaultStyle: "pixel-art",
        cacheEnabled: true,
        regenerationCooldown: 3600000, // 1 час в миллисекундах
        prompts: {
            products: {
                smartphone: "modern sleek smartphone with glowing screen, minimalist design",
                laptop: "professional laptop computer with illuminated keyboard",
                tshirt: "trendy casual t-shirt with modern design",
                jeans: "classic blue denim jeans, fashionable cut"
            },
            staff: {
                salesman: "friendly professional salesperson in business casual attire",
                manager: "confident business manager in formal suit"
            },
            animations: {
                reward: "sparkling golden coins and stars explosion effect",
                purchase: "shopping bag with sparkles and checkmark",
                levelUp: "colorful level up celebration effect"
            }
        }
    })
}); 