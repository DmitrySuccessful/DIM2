#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Test script for the Telegram Assistant.
This script helps users verify their Telegram bot and OpenAI API connections.
"""

import os
import sys
import requests
import json
from datetime import datetime
from dotenv import load_dotenv
from openai import OpenAI

def print_header():
    """Print the test header."""
    print("=" * 80)
    print("                  CONNECTION TEST")
    print("=" * 80)
    print("\nThis script will test your Telegram bot and OpenAI API connections.\n")

def test_connections():
    """Test the Telegram bot and OpenAI API connections."""
    print_header()
    
    # Load environment variables
    load_dotenv()
    
    # Get API tokens from environment variables
    telegram_bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
    telegram_chat_id = os.getenv('TELEGRAM_CHAT_ID')
    openai_api_key = os.getenv('OPENAI_API_KEY')
    
    # Check if all required environment variables are set
    if not all([telegram_bot_token, telegram_chat_id, openai_api_key]):
        print("❌ ERROR: Missing required environment variables.")
        print("Please run setup.py to configure your environment variables.")
        return False
    
    print(f"✓ Environment variables loaded successfully.")
    
    # Test OpenAI API connection
    print("\nTesting OpenAI API connection...")
    
    try:
        client = OpenAI(api_key=openai_api_key)
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Say 'OpenAI connection successful' in one short sentence."}
            ],
            max_tokens=20
        )
        
        response_text = response.choices[0].message.content.strip()
        
        print(f"✓ OpenAI API connection is valid.")
        print(f"  Response: {response_text}")
    
    except Exception as e:
        print(f"❌ ERROR: Failed to connect to OpenAI API.")
        print(f"  Error: {e}")
        return False
    
    # Test the bot token
    print("\nTesting Telegram bot token...")
    bot_url = f"https://api.telegram.org/bot{telegram_bot_token}/getMe"
    
    try:
        response = requests.get(bot_url)
        response_data = response.json()
        
        if response.status_code == 200 and response_data.get('ok'):
            bot_info = response_data.get('result', {})
            bot_name = bot_info.get('first_name', 'Unknown')
            bot_username = bot_info.get('username', 'Unknown')
            
            print(f"✓ Bot token is valid.")
            print(f"  Bot name: {bot_name}")
            print(f"  Bot username: @{bot_username}")
        else:
            print(f"❌ ERROR: Invalid bot token.")
            print(f"  Response: {response_data}")
            return False
    
    except Exception as e:
        print(f"❌ ERROR: Failed to connect to Telegram API.")
        print(f"  Error: {e}")
        return False
    
    # Test the chat ID
    print("\nTesting Telegram chat ID...")
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    test_message = f"🔍 Test message from Telegram Assistant\nTime: {current_time}"
    
    chat_url = f"https://api.telegram.org/bot{telegram_bot_token}/sendMessage"
    payload = {
        'chat_id': telegram_chat_id,
        'text': test_message,
        'parse_mode': 'HTML'
    }
    
    try:
        response = requests.post(chat_url, json=payload)
        response_data = response.json()
        
        if response.status_code == 200 and response_data.get('ok'):
            print(f"✓ Chat ID is valid.")
            print(f"  Test message sent successfully.")
        else:
            print(f"❌ ERROR: Invalid chat ID or insufficient permissions.")
            print(f"  Response: {response_data}")
            return False
    
    except Exception as e:
        print(f"❌ ERROR: Failed to send test message.")
        print(f"  Error: {e}")
        return False
    
    # All tests passed
    print("\n✅ All tests passed! Your connections are configured correctly.")
    print("You can now run the Telegram Assistant with: python telegram_assistant.py")
    
    return True

if __name__ == "__main__":
    try:
        test_connections()
    except KeyboardInterrupt:
        print("\n\nTest cancelled by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nAn unexpected error occurred: {e}")
        sys.exit(1) 