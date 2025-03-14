export class ImageGenerationService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.apiUrl = 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image';
    }

    async generateImage(prompt, options = {}) {
        try {
            const defaultOptions = {
                width: 1024,
                height: 1024,
                steps: 30,
                cfg_scale: 7,
                samples: 1,
                style_preset: "pixel-art"  // Для игровой графики
            };

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify({
                    text_prompts: [
                        {
                            text: prompt,
                            weight: 1
                        }
                    ],
                    ...defaultOptions,
                    ...options
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result.artifacts[0].base64; // Возвращаем base64 изображения
        } catch (error) {
            console.error('Error generating image:', error);
            throw error;
        }
    }

    async generateGameAsset(type, description) {
        const stylePrompt = "pixel art style, game asset, transparent background, high quality, detailed";
        const prompt = `${description}, ${stylePrompt}`;
        
        const options = {
            width: 512,
            height: 512,
            steps: 40,
            cfg_scale: 8,
            style_preset: "pixel-art"
        };

        return this.generateImage(prompt, options);
    }

    async generateAnimation(description, frames = 8) {
        // Генерируем несколько кадров для анимации
        const animations = [];
        for (let i = 0; i < frames; i++) {
            const frame = await this.generateGameAsset(
                'animation',
                `${description}, frame ${i + 1} of ${frames}`
            );
            animations.push(frame);
        }
        return animations;
    }
}

// Пример использования:
/*
const imageService = new ImageGenerationService('your-api-key');

// Генерация игрового ассета
const productImage = await imageService.generateGameAsset(
    'product',
    'modern smartphone with glowing screen'
);

// Генерация анимации
const explosionAnimation = await imageService.generateAnimation(
    'pixel art explosion effect',
    8
);
*/ 