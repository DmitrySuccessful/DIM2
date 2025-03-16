#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Configuration settings for the Telegram Assistant.
Modify these settings to customize the behavior of the assistant.
"""

# OpenAI API settings
OPENAI_MODEL = "gpt-4o"                    # OpenAI model to use
OPENAI_MAX_TOKENS = 1000                   # Maximum tokens for OpenAI responses
OPENAI_TEMPERATURE = 0.7                   # Temperature for OpenAI (0.0-1.0)

# Post generation settings
NUM_TOPICS = 10                            # Number of topics to generate
POST_MIN_WORDS = 100                       # Minimum words per post
POST_MAX_WORDS = 150                       # Maximum words per post

# Scheduling settings
FIRST_POST_DELAY_MINUTES = 5               # Delay before the first post (in minutes)
POST_INTERVAL_MINUTES = 10                 # Interval between posts (in minutes)

# Topic categories
TOPIC_CATEGORIES = [
    "Product selection strategies",
    "Selling through marketplaces",
    "Product packaging and presentation",
    "Social media promotion",
    "Profit increase strategies",
    "Customer service best practices",
    "Inventory management",
    "Pricing strategies",
    "Brand building",
    "E-commerce trends"
] 