#!/bin/bash

# Startup script for Render deployment
echo "🚀 Starting Intern Job Scraper Bot..."

# Set up environment
export NODE_ENV=production
export PLAYWRIGHT_BROWSERS_PATH=/opt/render/.cache/ms-playwright

# Ensure Playwright browsers are installed
echo "📦 Checking Playwright browsers..."
echo "📥 Installing Playwright browsers..."
npx playwright install chromium --with-deps

# Start the application
echo "🎯 Starting the application..."
exec node index.js 