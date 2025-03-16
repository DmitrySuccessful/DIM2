#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import time
import requests
import json
import logging
from datetime import datetime, timedelta
from dotenv import load_dotenv
from openai import OpenAI

# Import configuration settings
from config import (
    OPENAI_MODEL, OPENAI_MAX_TOKENS, OPENAI_TEMPERATURE,
    NUM_TOPICS, POST_MIN_WORDS, POST_MAX_WORDS,
    FIRST_POST_DELAY_MINUTES, POST_INTERVAL_MINUTES,
    TOPIC_CATEGORIES
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Get API tokens from environment variables
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
TELEGRAM_CHAT_ID = os.getenv('TELEGRAM_CHAT_ID')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

# Check if all required environment variables are set
if not all([TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, OPENAI_API_KEY]):
    logger.error("Missing required environment variables. Please check your .env file.")
    exit(1)

# Initialize OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)

def generate_topics():
    """Generate unique topics for product business posts using OpenAI."""
    logger.info(f"Generating {NUM_TOPICS} topics...")
    
    categories_text = "\n".join([f"- {category}" for category in TOPIC_CATEGORIES])
    
    prompt = f"""
    Generate {NUM_TOPICS} unique and engaging topics for posts about product business. 
    The topics should cover these categories:
    {categories_text}
    
    Format the response as a numbered list with only the topics, no additional text.
    Each topic should be specific, actionable, and interesting to entrepreneurs.
    """
    
    try:
        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            max_tokens=OPENAI_MAX_TOKENS,
            temperature=OPENAI_TEMPERATURE,
            messages=[
                {"role": "system", "content": "You are a business consultant specializing in product business and e-commerce."},
                {"role": "user", "content": prompt}
            ]
        )
        
        # Extract topics from the response
        topics_text = response.choices[0].message.content
        topics_list = []
        
        for line in topics_text.strip().split('\n'):
            if line.strip() and any(line.strip().startswith(str(i) + '.') for i in range(1, NUM_TOPICS + 1)):
                # Remove the number and period at the beginning
                topic = line.strip().split('.', 1)[1].strip()
                topics_list.append(topic)
        
        logger.info(f"Generated {len(topics_list)} topics")
        return topics_list
    
    except Exception as e:
        logger.error(f"Error generating topics: {e}")
        return []

def generate_post(topic):
    """Generate a post for a given topic using OpenAI."""
    logger.info(f"Generating post for topic: {topic}")
    
    prompt = f"""
    Write a compelling post about the following topic related to product business:
    
    "{topic}"
    
    The post should:
    - Be {POST_MIN_WORDS}-{POST_MAX_WORDS} words in length
    - Provide practical, actionable advice
    - Include real-world examples
    - End with a gentle call to action
    - Use a friendly, professional tone
    - Be formatted for Telegram (use emoji sparingly)
    
    Write only the post content, no additional text.
    """
    
    try:
        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            max_tokens=OPENAI_MAX_TOKENS,
            temperature=OPENAI_TEMPERATURE,
            messages=[
                {"role": "system", "content": "You are a business consultant specializing in product business and e-commerce."},
                {"role": "user", "content": prompt}
            ]
        )
        
        post_text = response.choices[0].message.content.strip()
        word_count = len(post_text.split())
        logger.info(f"Generated post of {word_count} words")
        
        # Verify word count is within the desired range
        if word_count < POST_MIN_WORDS:
            logger.warning(f"Post is shorter than the minimum {POST_MIN_WORDS} words")
        elif word_count > POST_MAX_WORDS:
            logger.warning(f"Post is longer than the maximum {POST_MAX_WORDS} words")
            
        return post_text
    
    except Exception as e:
        logger.error(f"Error generating post: {e}")
        return ""

def schedule_telegram_post(text, schedule_time):
    """Schedule a post to be published in a Telegram channel at a specific time."""
    logger.info(f"Scheduling post for {schedule_time.strftime('%Y-%m-%d %H:%M:%S')}")
    
    unix_time = int(schedule_time.timestamp())
    
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        'chat_id': TELEGRAM_CHAT_ID,
        'text': text,
        'parse_mode': 'HTML',
        'disable_web_page_preview': False,
        'schedule_date': unix_time
    }
    
    try:
        response = requests.post(url, json=payload)
        response_data = response.json()
        
        if response.status_code == 200 and response_data.get('ok'):
            logger.info(f"Post successfully scheduled for {schedule_time.strftime('%Y-%m-%d %H:%M:%S')}")
            return True, response_data
        else:
            logger.error(f"Failed to schedule post: {response_data}")
            return False, response_data
    
    except Exception as e:
        logger.error(f"Error scheduling post: {e}")
        return False, str(e)

def main():
    """Main function to run the Telegram Assistant."""
    logger.info("Starting Telegram Assistant...")
    
    # Generate topics
    topics = generate_topics()
    
    if not topics:
        logger.error("No topics were generated. Exiting.")
        return
    
    # Print all generated topics
    print("\n=== Generated Topics ===")
    for i, topic in enumerate(topics, 1):
        print(f"{i}. {topic}")
    print()
    
    # Generate and schedule posts
    current_time = datetime.now()
    schedule_time = current_time + timedelta(minutes=FIRST_POST_DELAY_MINUTES)
    
    print("\n=== Scheduled Posts ===")
    for i, topic in enumerate(topics, 1):
        # Generate post content
        post_content = generate_post(topic)
        
        if not post_content:
            logger.warning(f"Skipping topic {i} due to empty post content")
            continue
        
        # Add topic as a header to the post
        full_post = f"<b>{topic}</b>\n\n{post_content}"
        
        # Schedule the post
        success, response = schedule_telegram_post(full_post, schedule_time)
        
        # Print status
        status = "✅ Scheduled" if success else "❌ Failed"
        print(f"{i}. {topic} - {status} for {schedule_time.strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Increment schedule time for the next post
        schedule_time += timedelta(minutes=POST_INTERVAL_MINUTES)
        
        # Small delay to avoid API rate limits
        time.sleep(1)
    
    logger.info("Telegram Assistant completed successfully")

if __name__ == "__main__":
    main() 