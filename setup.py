#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Setup script for the Telegram Assistant.
This script helps users configure their environment variables.
"""

import os
import sys
from pathlib import Path

def clear_screen():
    """Clear the terminal screen."""
    os.system('cls' if os.name == 'nt' else 'clear')

def print_header():
    """Print the setup header."""
    clear_screen()
    print("=" * 80)
    print("                  TELEGRAM ASSISTANT SETUP")
    print("=" * 80)
    print("\nThis script will help you configure your environment variables for the Telegram Assistant.\n")

def get_input(prompt, default=None):
    """Get user input with an optional default value."""
    if default:
        user_input = input(f"{prompt} [{default}]: ")
        return user_input if user_input else default
    else:
        return input(f"{prompt}: ")

def create_env_file():
    """Create the .env file with user-provided values."""
    print_header()
    
    print("1. Telegram Bot Setup:")
    print("   - Create a bot using @BotFather on Telegram")
    print("   - Get the bot token")
    print("   - Add the bot to your channel as an administrator\n")
    
    telegram_bot_token = get_input("Enter your Telegram Bot Token")
    
    print("\n2. Telegram Channel Setup:")
    print("   - Find your channel ID (usually starts with -100)")
    print("   - Make sure your bot has permission to post messages\n")
    
    telegram_chat_id = get_input("Enter your Telegram Channel ID")
    
    print("\n3. OpenAI API Setup:")
    print("   - Get your OpenAI API key from OpenAI")
    print("   - Visit https://platform.openai.com/api-keys to create an API key if you don't have one\n")
    
    openai_api_key = get_input("Enter your OpenAI API Key")
    
    # Create the .env file
    env_path = Path('.env')
    
    with open(env_path, 'w') as f:
        f.write("# Telegram API credentials\n")
        f.write(f"TELEGRAM_BOT_TOKEN={telegram_bot_token}\n")
        f.write(f"TELEGRAM_CHAT_ID={telegram_chat_id}\n")
        f.write("\n# OpenAI API credentials\n")
        f.write(f"OPENAI_API_KEY={openai_api_key}\n")
    
    print("\n.env file created successfully!")
    print(f"File location: {env_path.absolute()}\n")
    
    print("Next steps:")
    print("1. Install the required dependencies: pip install -r requirements.txt")
    print("2. Run the assistant: python telegram_assistant.py")

if __name__ == "__main__":
    try:
        create_env_file()
    except KeyboardInterrupt:
        print("\n\nSetup cancelled by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nAn error occurred: {e}")
        sys.exit(1) 