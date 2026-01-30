#!/bin/bash
# Health check for Dashboard Daddy

URL="http://localhost:3003"
MAX_RETRIES=3
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL" --max-time 10)
    
    if [ "$STATUS" = "200" ]; then
        echo "✅ Dashboard is healthy"
        exit 0
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "⚠️ Health check failed (attempt $RETRY_COUNT/$MAX_RETRIES)"
    sleep 5
done

echo "❌ Dashboard is down! Attempting restart..."

# Kill existing processes
pkill -f "next dev" 2>/dev/null
sleep 2

# Clear corrupted cache
cd /home/dev/dashboard-daddy/frontend
rm -rf .next/cache .next/dev/lock .turbo 2>/dev/null

# Restart
npm run dev > /tmp/nextjs.log 2>&1 &
echo "🔄 Restart initiated"
