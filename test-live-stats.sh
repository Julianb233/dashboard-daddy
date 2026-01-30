#!/bin/bash

echo "🚀 Testing Live Dashboard Stats"
echo "================================"
echo

echo "📊 Current Stats:"
curl -s "http://localhost:3003/api/dashboard/stats" | jq '{
  activeAgents: .activeAgents,
  totalMessages: .totalMessages,
  tokensUsed: .details.clawdbot.tokensUsed,
  monthlyCost: .monthlyCost,
  lastUpdated: .lastUpdated
}'

echo
echo "⏱️  Waiting 5 seconds..."
sleep 5

echo
echo "📊 Stats After 5 seconds:"
curl -s "http://localhost:3003/api/dashboard/stats" | jq '{
  activeAgents: .activeAgents,
  totalMessages: .totalMessages,
  tokensUsed: .details.clawdbot.tokensUsed,
  monthlyCost: .monthlyCost,
  lastUpdated: .lastUpdated
}'

echo
echo "✅ Live Stats Test Complete!"
echo
echo "🌐 Frontend Dashboard: http://localhost:3003"
echo "📊 API Endpoint: http://localhost:3003/api/dashboard/stats"
echo "🔧 Debug Logs: http://localhost:3003/api/debug/logs"
echo