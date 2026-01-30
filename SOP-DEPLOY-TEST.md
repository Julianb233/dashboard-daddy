# SOP: Dashboard Daddy Deploy & Test

## Before Claiming "Done"

### 1. Run E2E Test with Video Recording
```bash
cd /home/dev/dashboard-daddy/frontend
node ../scripts/e2e-test.js
```

This will:
- Record video of full user flow
- Measure load times for each page
- Take screenshots at each step
- Output: `/tmp/dd-test-{timestamp}.webm`

### 2. Load Time Benchmarks
| Page | Target | Warning | Critical |
|------|--------|---------|----------|
| Home | <2s | 2-4s | >4s |
| People | <2s | 2-4s | >4s |
| Agents | <2s | 2-4s | >4s |
| Others | <2s | 2-4s | >4s |

### 3. Visual Verification Checklist
- [ ] Home: Stats cards show real data (not zeros)
- [ ] People: Contact count matches database
- [ ] People: Circle breakdown (Inner/Key/Outer) shows numbers
- [ ] Agents: All 8 agents display with correct status
- [ ] Agents: No JavaScript errors in console
- [ ] Kanban: Columns render properly
- [ ] Navigation: All nav links work
- [ ] Mobile: Layout looks correct at 390x844

### 4. Interactive Testing
- [ ] Click Outreach Queue button
- [ ] Click Daily Outreach button
- [ ] Click Add Person button (modal opens)
- [ ] Click on a person card (detail panel opens)
- [ ] Click Start/Stop on an agent

### 5. Send Proof to Julian
After test passes:
1. Review the video recording
2. Check all screenshots
3. Send video + summary to Telegram

## Quick Test Commands

```bash
# Full E2E test with recording
cd /home/dev/dashboard-daddy/frontend && node ../scripts/e2e-test.js

# Quick screenshot check
node -e "
const puppeteer = require('puppeteer');
(async () => {
  const b = await puppeteer.launch({headless:true,args:['--no-sandbox']});
  const p = await b.newPage();
  await p.setViewport({width:390,height:844});
  await p.goto('https://d.dashboard-daddy.com/relationships',{waitUntil:'networkidle0'});
  await p.screenshot({path:'/tmp/quick-check.png'});
  await b.close();
  console.log('Screenshot: /tmp/quick-check.png');
})();
"

# Check tunnel status
pgrep -f cloudflared && echo "Tunnel running" || echo "Tunnel DOWN"

# Check server status
curl -s -o /dev/null -w "%{http_code}" https://d.dashboard-daddy.com/
```

## Never Again
- ❌ Don't claim "working" based on HTTP 200 alone
- ❌ Don't skip visual verification
- ❌ Don't deploy without running full test
- ✅ Always provide screenshot/video proof
- ✅ Always verify data displays correctly
- ✅ Always test on mobile viewport
