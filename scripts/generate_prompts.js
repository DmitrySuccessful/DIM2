// Промпты для генерации изображений товаров
const PRODUCT_PROMPTS = {
    smartphone: "A modern smartphone with a sleek design, minimalist style, white background, product photography, high quality, 512x512",
    laptop: "A professional laptop computer, minimalist design, white background, product photography, high quality, 512x512",
    tshirt: "A basic white t-shirt on a white background, product photography, high quality, 512x512",
    jeans: "A pair of classic blue jeans on a white background, product photography, high quality, 512x512"
};

// Промпты для генерации изображений сотрудников
const STAFF_PROMPTS = {
    salesman: "A friendly professional salesperson, business casual attire, neutral background, portrait, high quality, 512x512",
    manager: "A professional business manager in a suit, neutral background, portrait, high quality, 512x512"
};

// Функция для генерации промптов
function generatePrompts() {
    console.log("=== Промпты для товаров ===");
    Object.entries(PRODUCT_PROMPTS).forEach(([key, prompt]) => {
        console.log(`\n${key}:`);
        console.log(prompt);
    });

    console.log("\n=== Промпты для сотрудников ===");
    Object.entries(STAFF_PROMPTS).forEach(([key, prompt]) => {
        console.log(`\n${key}:`);
        console.log(prompt);
    });
}

// Запуск генерации промптов
generatePrompts(); 