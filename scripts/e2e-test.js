#!/usr/bin/env node
/**
 * Dashboard Daddy E2E Test Script
 * Records video of full user flow with load times
 * 
 * Usage: node scripts/e2e-test.js [baseUrl]
 * Output: /tmp/dd-test-{timestamp}.webm
 */

const puppeteer = require('puppeteer');
const path = require('path');

const BASE_URL = process.argv[2] || 'https://d.dashboard-daddy.com';
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');
const VIDEO_PATH = `/tmp/dd-test-${TIMESTAMP}`;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function measureLoad(page, url, name) {
  const start = Date.now();
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  const loadTime = Date.now() - start;
  console.log(`✓ ${name}: ${loadTime}ms`);
  return loadTime;
}

async function runTests() {
  console.log('🎬 Starting E2E Test with Screen Recording');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`📹 Video will be saved to: ${VIDEO_PATH}/\n`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  
  // Set mobile viewport
  await page.setViewport({ width: 390, height: 844 });
  
  // Start screen recording
  const recorder = await page.screencast({ path: `${VIDEO_PATH}.webm` });
  
  const results = {
    loadTimes: {},
    errors: [],
    screenshots: []
  };

  try {
    // ============ PAGE LOAD TESTS ============
    console.log('📊 Testing Page Loads...\n');

    // 1. Home Page
    results.loadTimes.home = await measureLoad(page, BASE_URL, 'Home');
    await page.screenshot({ path: `${VIDEO_PATH}-1-home.png` });
    await sleep(2000); // Let user see the page in video

    // 2. People/Relationships Page
    results.loadTimes.people = await measureLoad(page, `${BASE_URL}/relationships`, 'People');
    await page.screenshot({ path: `${VIDEO_PATH}-2-people.png` });
    await sleep(2000);

    // 3. Kanban Page
    results.loadTimes.kanban = await measureLoad(page, `${BASE_URL}/kanban`, 'Kanban');
    await page.screenshot({ path: `${VIDEO_PATH}-3-kanban.png` });
    await sleep(2000);

    // 4. Agents Page
    results.loadTimes.agents = await measureLoad(page, `${BASE_URL}/agents`, 'Agents');
    await page.screenshot({ path: `${VIDEO_PATH}-4-agents.png` });
    await sleep(2000);

    // 5. Concierge Page
    results.loadTimes.concierge = await measureLoad(page, `${BASE_URL}/concierge`, 'Concierge');
    await page.screenshot({ path: `${VIDEO_PATH}-5-concierge.png` });
    await sleep(2000);

    // 6. Outreach Page
    results.loadTimes.outreach = await measureLoad(page, `${BASE_URL}/outreach`, 'Outreach');
    await page.screenshot({ path: `${VIDEO_PATH}-6-outreach.png` });
    await sleep(2000);

    // ============ INTERACTION TESTS ============
    console.log('\n🖱️  Testing Interactions...\n');

    // Go back to People page for interaction tests
    await page.goto(`${BASE_URL}/relationships`, { waitUntil: 'networkidle0' });
    await sleep(1000);

    // Test: Click on Outreach Queue button
    try {
      const outreachBtn = await page.$('button:has-text("Outreach Queue"), a:has-text("Outreach Queue"), [class*="outreach"]');
      if (outreachBtn) {
        await outreachBtn.click();
        await sleep(2000);
        console.log('✓ Outreach Queue button clicked');
        await page.screenshot({ path: `${VIDEO_PATH}-7-outreach-queue.png` });
      }
    } catch (e) {
      console.log('⚠ Outreach Queue button not found or not clickable');
    }

    // Test: Click on Daily Outreach button
    await page.goto(`${BASE_URL}/relationships`, { waitUntil: 'networkidle0' });
    try {
      const dailyBtn = await page.$('button:has-text("Daily Outreach"), a:has-text("Daily Outreach")');
      if (dailyBtn) {
        await dailyBtn.click();
        await sleep(2000);
        console.log('✓ Daily Outreach button clicked');
        await page.screenshot({ path: `${VIDEO_PATH}-8-daily-outreach.png` });
      }
    } catch (e) {
      console.log('⚠ Daily Outreach button not found');
    }

    // Test: Mobile Navigation
    console.log('\n📱 Testing Mobile Navigation...\n');
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await sleep(1000);

    // Click through bottom nav items
    const navItems = ['People', 'Kanban', 'Agents'];
    for (const item of navItems) {
      try {
        await page.click(`nav a:has-text("${item}"), [class*="nav"] a:has-text("${item}")`);
        await sleep(1500);
        console.log(`✓ Nav: ${item}`);
      } catch (e) {
        console.log(`⚠ Nav ${item} not clickable`);
      }
    }

    // ============ DATA VERIFICATION ============
    console.log('\n🔍 Verifying Data Display...\n');

    // Check People page has data
    await page.goto(`${BASE_URL}/relationships`, { waitUntil: 'networkidle0' });
    await sleep(2000);
    
    const statsText = await page.evaluate(() => {
      const stats = document.querySelectorAll('[class*="stat"], [class*="card"] p');
      return Array.from(stats).map(s => s.textContent).join(' ');
    });
    
    if (statsText.includes('0') && !statsText.match(/[1-9]/)) {
      results.errors.push('People page showing all zeros - possible data issue');
      console.log('❌ People stats showing zeros');
    } else {
      console.log('✓ People page has data');
    }

    // Check Agents page has agents
    await page.goto(`${BASE_URL}/agents`, { waitUntil: 'networkidle0' });
    await sleep(2000);
    
    const agentCards = await page.$$('[class*="agent"], [class*="card"]');
    if (agentCards.length < 1) {
      results.errors.push('Agents page showing no agent cards');
      console.log('❌ No agent cards found');
    } else {
      console.log(`✓ Found ${agentCards.length} agent cards`);
    }

    // Check for any JS errors
    const errors = await page.evaluate(() => {
      return window.__e2eErrors || [];
    });
    if (errors.length > 0) {
      results.errors.push(...errors);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    results.errors.push(error.message);
    await page.screenshot({ path: `${VIDEO_PATH}-error.png` });
  }

  // Stop recording
  await recorder.stop();
  
  await browser.close();

  // ============ SUMMARY ============
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  
  console.log('\n⏱️  Load Times:');
  for (const [page, time] of Object.entries(results.loadTimes)) {
    const status = time < 3000 ? '✅' : time < 5000 ? '⚠️' : '❌';
    console.log(`   ${status} ${page}: ${time}ms`);
  }

  if (results.errors.length > 0) {
    console.log('\n❌ Errors Found:');
    results.errors.forEach(e => console.log(`   - ${e}`));
  } else {
    console.log('\n✅ No errors detected');
  }

  console.log(`\n📹 Video saved: ${VIDEO_PATH}.webm`);
  console.log(`📸 Screenshots saved: ${VIDEO_PATH}-*.png`);
  
  // Return exit code based on errors
  process.exit(results.errors.length > 0 ? 1 : 0);
}

runTests().catch(console.error);
