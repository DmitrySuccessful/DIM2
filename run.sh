#!/bin/bash

# Run script for the Telegram Assistant
# This script helps users run the Telegram Assistant

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=======================================================${NC}"
echo -e "${YELLOW}            TELEGRAM ASSISTANT LAUNCHER                ${NC}"
echo -e "${YELLOW}=======================================================${NC}"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python 3 is not installed.${NC}"
    echo "Please install Python 3 and try again."
    exit 1
fi

# Check if the virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating virtual environment...${NC}"
    python3 -m venv venv
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error: Failed to create virtual environment.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}Virtual environment created successfully.${NC}"
fi

# Activate the virtual environment
echo -e "${YELLOW}Activating virtual environment...${NC}"
source venv/bin/activate

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to activate virtual environment.${NC}"
    exit 1
fi

# Install dependencies if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    pip install -r requirements.txt
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error: Failed to install dependencies.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}Dependencies installed successfully.${NC}"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Environment file not found. Running setup...${NC}"
    python setup.py
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error: Failed to run setup.${NC}"
        exit 1
    fi
fi

# Test Telegram connection
echo -e "${YELLOW}Testing Telegram connection...${NC}"
python test_connection.py

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Telegram connection test failed.${NC}"
    exit 1
fi

# Run the assistant
echo -e "${YELLOW}Running Telegram Assistant...${NC}"
python telegram_assistant.py

# Deactivate the virtual environment
deactivate 