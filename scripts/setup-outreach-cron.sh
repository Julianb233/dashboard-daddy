#!/bin/bash

# Setup cron job for outreach queue processing
# Runs every 5 minutes to check for messages due to be sent

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
CRON_JOB="*/5 * * * * cd $PROJECT_DIR && node scripts/process-outreach-queue.js >> logs/outreach-queue.log 2>&1"

echo "Setting up outreach queue cron job..."
echo "Script location: $SCRIPT_DIR/process-outreach-queue.js"

# Create logs directory if it doesn't exist
mkdir -p "$PROJECT_DIR/logs"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "process-outreach-queue.js"; then
    echo "⚠️  Cron job already exists. Removing old version..."
    crontab -l 2>/dev/null | grep -v "process-outreach-queue.js" | crontab -
fi

# Add new cron job
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

echo "✅ Cron job installed successfully!"
echo "📅 Schedule: Every 5 minutes"
echo "📝 Logs: $PROJECT_DIR/logs/outreach-queue.log"

# Test the script
echo ""
echo "🧪 Testing script execution..."
cd "$PROJECT_DIR"
if node scripts/process-outreach-queue.js; then
    echo "✅ Script test successful!"
else
    echo "❌ Script test failed. Please check the setup."
    exit 1
fi

echo ""
echo "📋 To monitor the queue:"
echo "  - View logs: tail -f $PROJECT_DIR/logs/outreach-queue.log"
echo "  - Check cron: crontab -l"
echo "  - Remove cron: crontab -e (delete the line manually)"

echo ""
echo "🎉 Outreach queue automation is now active!"