const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Конфигурация обработки изображений
const IMAGE_CONFIG = {
    products: {
        width: 512,
        height: 512,
        format: 'png',
        quality: 80
    },
    staff: {
        width: 512,
        height: 512,
        format: 'png',
        quality: 80
    }
};

// Функция для обработки изображения
async function processImage(inputPath, outputPath, config) {
    try {
        await sharp(inputPath)
            .resize(config.width, config.height, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            })
            .png({ quality: config.quality })
            .toFile(outputPath);
        console.log(`Обработано: ${outputPath}`);
    } catch (error) {
        console.error(`Ошибка при обработке ${inputPath}:`, error);
    }
}

// Функция для обработки всех изображений в директории
async function processDirectory(inputDir, outputDir, config) {
    // Создаем выходную директорию, если она не существует
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Получаем список файлов
    const files = fs.readdirSync(inputDir);

    // Обрабатываем каждый файл
    for (const file of files) {
        if (file.match(/\.(jpg|jpeg|png)$/i)) {
            const inputPath = path.join(inputDir, file);
            const outputPath = path.join(outputDir, file);
            await processImage(inputPath, outputPath, config);
        }
    }
}

// Обработка изображений товаров
processDirectory(
    path.join(__dirname, '../assets/products/raw'),
    path.join(__dirname, '../assets/products'),
    IMAGE_CONFIG.products
);

// Обработка изображений сотрудников
processDirectory(
    path.join(__dirname, '../assets/staff/raw'),
    path.join(__dirname, '../assets/staff'),
    IMAGE_CONFIG.staff
); 