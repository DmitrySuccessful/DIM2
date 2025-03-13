export const GAME_CONFIG = {
    // Shop Management
    shop: {
        startingMoney: 10000,
        startingReputation: 50,
        maxReputation: 100,
        staffTypes: {
            SELLER: {
                baseSalary: 1000,
                efficiency: 1.2,
                customerService: 1.1
            },
            COURIER: {
                baseSalary: 800,
                deliverySpeed: 1.3,
                reliability: 1.1
            },
            MARKETER: {
                baseSalary: 1500,
                campaignEfficiency: 1.4,
                marketResearch: 1.2
            }
        },
        marketingChannels: {
            CONTEXTUAL: {
                baseCost: 500,
                efficiency: 1.3,
                duration: 7
            },
            BLOGGERS: {
                baseCost: 2000,
                efficiency: 1.8,
                duration: 3
            },
            TARGETING: {
                baseCost: 1000,
                efficiency: 1.5,
                duration: 5
            }
        }
    },

    // Mini-game Configuration
    minigame: {
        itemTypes: {
            BRONZE: {
                value: 10,
                probability: 0.5,
                sprite: 'bronze_item.png'
            },
            SILVER: {
                value: 25,
                probability: 0.3,
                sprite: 'silver_item.png'
            },
            GOLD: {
                value: 50,
                probability: 0.15,
                sprite: 'gold_item.png'
            },
            RARE: {
                value: 100,
                probability: 0.05,
                sprite: 'rare_item.png',
                specialEffect: 'glow'
            }
        },
        powerUps: {
            MAGNET: {
                duration: 5000,
                radius: 100,
                probability: 0.1
            },
            SLOW_TIME: {
                duration: 3000,
                slowFactor: 0.5,
                probability: 0.08
            },
            MULTIPLIER: {
                duration: 4000,
                factor: 2,
                probability: 0.06
            }
        },
        obstacles: {
            BROKEN_ITEM: {
                penalty: -20,
                probability: 0.1,
                sprite: 'broken_item.png'
            }
        },
        backgrounds: [
            'warehouse.jpg',
            'store_front.jpg',
            'auction_house.jpg'
        ],
        comboSystem: {
            baseMultiplier: 1.1,
            maxMultiplier: 5,
            comboTimeout: 1000
        }
    },

    // Game Progression
    progression: {
        levels: {
            1: { requirement: 0, title: "Начинающий продавец" },
            2: { requirement: 1000, title: "Опытный продавец" },
            3: { requirement: 5000, title: "Менеджер магазина" },
            4: { requirement: 20000, title: "Владелец сети" },
            5: { requirement: 100000, title: "Магнат торговли" }
        },
        achievements: {
            FIRST_SALE: { name: "Первая продажа", reward: 100 },
            COMBO_MASTER: { name: "Мастер комбо", reward: 500 },
            STAFF_LEADER: { name: "Лидер персонала", reward: 1000 }
        }
    },

    // Market Dynamics
    market: {
        seasonalEvents: {
            SUMMER_SALE: { discount: 0.3, duration: 7 },
            BLACK_FRIDAY: { discount: 0.5, duration: 3 },
            HOLIDAY_SEASON: { priceIncrease: 0.2, duration: 14 }
        },
        competitorBehavior: {
            AGGRESSIVE: { priceChange: -0.2, marketingBoost: 1.5 },
            NORMAL: { priceChange: -0.1, marketingBoost: 1.2 },
            PASSIVE: { priceChange: -0.05, marketingBoost: 1.1 }
        }
    }
}; 