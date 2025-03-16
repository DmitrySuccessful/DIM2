# Telegram Assistant for Product Business

This Python-based assistant automatically generates topics for posts about product business, writes the posts, and schedules them for publication in your Telegram channel using OpenAI.

## Features

- 🚀 Automatically generates 10 unique topics for product business posts using OpenAI
- ✍️ Creates engaging posts (100-150 words) for each topic
- 📅 Schedules posts in your Telegram channel with customizable intervals
- 📊 Provides console output with generated topics and scheduling status

## Prerequisites

- Python 3.7 or higher
- A Telegram bot token (from [@BotFather](https://t.me/BotFather))
- Your Telegram channel ID
- OpenAI API key (from [OpenAI](https://platform.openai.com/))

## Setup

1. Clone this repository or download the files.

2. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file in the project directory with your API tokens:
   ```
   # Telegram API credentials
   TELEGRAM_BOT_TOKEN=7710421194:AAEu7C__6QTwPdXlSRDdESM6ChGF-UWvnxw
   TELEGRAM_CHAT_ID=-1002075144709
   
   # OpenAI API credentials
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. Make sure your Telegram bot:
   - Is added to your channel as an administrator
   - Has the permission to post messages

## Usage

Run the assistant with:

```bash
python telegram_assistant.py
```

Alternatively, use the provided shell script:

```bash
./run.sh
```

The assistant will:
1. Generate 10 topics for product business posts
2. Create a post for each topic
3. Schedule the posts in your Telegram channel (first post in 5 minutes, then every 10 minutes)
4. Display the generated topics and scheduling status in the console

## Customization

You can customize the assistant by modifying the following parameters in the `config.py` file:

- Number of topics to generate
- Post length and style
- Scheduling intervals
- OpenAI model and parameters
- Topic categories

## Troubleshooting

If you encounter any issues:

1. Run the test script to verify your connections:
   ```bash
   python test_connection.py
   ```

2. Check that all API tokens in the `.env` file are correct
3. Verify that your bot has admin privileges in the channel
4. Make sure the channel ID is in the correct format
5. Check the console output for error messages

## License

This project is licensed under the MIT License - see the LICENSE file for details. 