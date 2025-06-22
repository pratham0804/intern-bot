const express = require('express');
const { chromium } = require('playwright');
const cors = require('cors');
const cron = require('node-cron');
const { execSync } = require('child_process');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Flag to track if browsers are installed
let browsersInstalled = false;

// Function to ensure Playwright browsers are installed
async function ensureBrowsersInstalled() {
  if (browsersInstalled) return true;

  try {
    console.log('🔍 Checking if Playwright browsers are installed...');
    
    // Try to create a browser instance to test if it's available
    try {
      const testBrowser = await chromium.launch({ headless: true });
      await testBrowser.close();
      console.log('✅ Playwright browsers are already installed');
      browsersInstalled = true;
      return true;
    } catch (testError) {
      console.log('📥 Installing Playwright browsers...');
      
      // Install browsers
      execSync('npx playwright install chromium --with-deps', { 
        stdio: 'inherit',
        timeout: 300000 // 5 minutes timeout
      });
      
      console.log('✅ Playwright browsers installed successfully');
      browsersInstalled = true;
      return true;
    }
  } catch (error) {
    console.error('❌ Failed to install Playwright browsers:', error.message);
    return false;
  }
}

// Browser configuration for Render
const getBrowserConfig = () => {
  return {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--disable-extensions',
      '--disable-default-apps',
      '--disable-sync',
      '--disable-translate',
      '--hide-scrollbars',
      '--mute-audio',
      '--disable-background-networking',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--disable-backgrounding-occluded-windows',
      '--disable-ipc-flooding-protection',
      '--disable-hang-monitor',
      '--disable-prompt-on-repost',
      '--disable-client-side-phishing-detection',
      '--disable-component-update',
      '--disable-default-browser-check',
      '--memory-pressure-off',
      '--max_old_space_size=4096'
    ],
    devtools: false,
    ignoreDefaultArgs: [
      '--enable-automation',
      '--enable-blink-features=IdleDetection'
    ]
  };
};

// Utility function to create browser instance
async function createBrowser() {
  try {
    // Ensure browsers are installed before creating instance
    const installed = await ensureBrowsersInstalled();
    if (!installed) {
      throw new Error('Failed to install Playwright browsers');
    }

    console.log('Attempting to launch browser...');
    const browser = await chromium.launch(getBrowserConfig());
    console.log('✅ Browser launched successfully');
    return browser;
  } catch (error) {
    console.error('❌ Browser launch failed:', error.message);
    throw new Error(`Browser launch failed: ${error.message}`);
  }
}

// Utility function to create page with proper context
async function createPage(browser) {
  try {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      ignoreHTTPSErrors: true,
      bypassCSP: true
    });

    const page = await context.newPage();

    // Set additional page properties
    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    });

    return page;
  } catch (error) {
    console.error('Failed to create page context:', error);
    // Fallback to simple page creation
    return await browser.newPage();
  }
}

// Utility function for safe page navigation
async function navigateToPage(page, url, timeout = 30000) {
  try {
    console.log(`Navigating to: ${url}`);
    await page.goto(url, { 
      waitUntil: 'domcontentloaded', 
      timeout 
    });

    // Wait a bit for dynamic content
    await page.waitForTimeout(2000);

    console.log('✅ Navigation successful');
    return true;
  } catch (error) {
    console.error(`❌ Navigation failed for ${url}:`, error.message);
    return false;
  }
}

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Intern Job Scraper Bot is running',
    endpoints: ['/test', '/internshala', '/letsintern', '/linkedin', '/all'],
    browsers_installed: browsersInstalled
  });
});

// Browser setup endpoint
app.get('/setup', async (req, res) => {
  try {
    console.log('🔧 Setting up browsers...');
    const installed = await ensureBrowsersInstalled();
    
    if (installed) {
      res.json({
        success: true,
        message: 'Browsers installed and ready',
        browsers_installed: true
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to install browsers',
        browsers_installed: false
      });
    }
  } catch (error) {
    console.error('Setup failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      browsers_installed: false
    });
  }
});

// Automated job scraping function
async function runDailyJobScrape() {
  console.log('🔄 Starting automated daily job scrape...');
  
  try {
    const axios = require('axios');
    const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;
    
    // Scrape jobs from all sources
    const sources = [
      { name: 'Internshala', endpoint: '/internshala?category=web-development' },
      { name: 'LinkedIn', endpoint: '/linkedin?keywords=internship&location=India' }
    ];
    
    for (const source of sources) {
      try {
        console.log(`📊 Scraping ${source.name}...`);
        const response = await axios.get(`${baseUrl}${source.endpoint}`, { timeout: 60000 });
        console.log(`✅ ${source.name}: ${response.data.count || 0} jobs found`);
      } catch (error) {
        console.error(`❌ ${source.name} scraping failed:`, error.message);
      }
    }
    
    console.log('✅ Daily job scrape completed');
  } catch (error) {
    console.error('❌ Daily job scrape failed:', error.message);
  }
}

// Schedule daily job scraping at 9:00 AM IST (3:30 AM UTC)
// IST is UTC+5:30, so 9:00 AM IST = 3:30 AM UTC
cron.schedule('30 3 * * *', () => {
  console.log('⏰ Daily 9 AM IST trigger activated');
  runDailyJobScrape();
}, {
  timezone: "Asia/Kolkata"
});

// Test browser functionality
app.get('/test', async (req, res) => {
  let browser;
  try {
    console.log('Testing browser launch...');
    browser = await createBrowser();

    const page = await createPage(browser);
    await page.goto('https://httpbin.org/headers');

    const content = await page.textContent('body');

    res.json({
      success: true,
      message: 'Browser test successful',
      sample: content.substring(0, 200) + '...'
    });
  } catch (error) {
    console.error('Browser test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

// Scrape Internshala
app.get('/internshala', async (req, res) => {
  let browser;
  try {
    const { category = 'web-development', location = '' } = req.query;
    console.log(`Starting Internshala scraping: category=${category}, location=${location}`);

    browser = await createBrowser();
    const page = await createPage(browser);

    const url = `https://internshala.com/internships/${category}${location ? `-internship-in-${location}` : ''}`;
    console.log(`Target URL: ${url}`);

    const navigated = await navigateToPage(page, url);
    if (!navigated) {
      throw new Error('Failed to navigate to Internshala');
    }

    // Try multiple selectors for job listings
    let jobsFound = false;
    const selectors = [
      '.internship_meta',
      '.individual_internship',
      '.internship-tile',
      '.search_results .internship_meta'
    ];

    for (const selector of selectors) {
      try {
        console.log(`Trying selector: ${selector}`);
        await page.waitForSelector(selector, { timeout: 10000 });
        jobsFound = true;
        console.log(`✅ Found elements with selector: ${selector}`);
        break;
      } catch (e) {
        console.log(`❌ Selector ${selector} not found`);
        continue;
      }
    }

    if (!jobsFound) {
      // Try to get page content for debugging
      const pageContent = await page.content();
      console.log('Page title:', await page.title());
      console.log('Page URL:', page.url());

      // Check if we're blocked or redirected
      if (pageContent.includes('blocked') || pageContent.includes('captcha')) {
        throw new Error('Page blocked or requires captcha');
      }

      throw new Error('No job listings found on page');
    }

    const jobs = await page.evaluate(() => {
      const jobElements = document.querySelectorAll('.individual_internship, .internship-tile');
      const results = [];

      console.log(`Found ${jobElements.length} job elements`);

      jobElements.forEach((element, index) => {
        if (index >= 10) return; // Limit to 10 results

        try {
          // Try multiple selectors for each field
          const title = element.querySelector('.job-internship-name, .profile h3, .profile-name')?.textContent?.trim() || 
                       element.querySelector('h3')?.textContent?.trim() || 'N/A';

          const company = element.querySelector('.company-name, .company h4, .company-name a')?.textContent?.trim() || 
                         element.querySelector('.link_display_like_text')?.textContent?.trim() || 'N/A';

          const location = element.querySelector('.location-names, .location, .locations')?.textContent?.trim() || 'N/A';

          const stipend = element.querySelector('.stipend, .stipend-salary')?.textContent?.trim() || 'N/A';

          const duration = element.querySelector('.duration, .internship-duration')?.textContent?.trim() || 'N/A';

          const linkElement = element.querySelector('a, .view-internship');
          const link = linkElement?.href || '';

          if (title !== 'N/A' || company !== 'N/A') {
            results.push({
              title,
              company,
              location,
              stipend,
              duration,
              link: link.startsWith('http') ? link : `https://internshala.com${link}`,
              source: 'Internshala'
            });
          }
        } catch (err) {
          console.error('Error parsing job element:', err);
        }
      });

      return results;
    });

    console.log(`✅ Successfully scraped ${jobs.length} jobs from Internshala`);

    res.json({
      success: true,
      count: jobs.length,
      jobs,
      scraped_at: new Date().toISOString(),
      url_scraped: url
    });

  } catch (error) {
    console.error('Internshala scraping failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.stack
    });
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.error('Error closing browser:', e);
      }
    }
  }
});

// Scrape LetsIntern
app.get('/letsintern', async (req, res) => {
  let browser;
  try {
    const { category = 'technology', location = '' } = req.query;
    console.log(`Starting LetsIntern scraping: category=${category}`);

    browser = await createBrowser();
    const page = await createPage(browser);

    const url = `https://letsintern.com/internships/${category}`;
    console.log(`Target URL: ${url}`);

    const navigated = await navigateToPage(page, url);
    if (!navigated) {
      throw new Error('Failed to navigate to LetsIntern');
    }

    // Try multiple selectors for job listings
    let jobsFound = false;
    const selectors = [
      '.internship-card',
      '.job-card',
      '.opportunity-card',
      '.internship-list-item'
    ];

    for (const selector of selectors) {
      try {
        console.log(`Trying selector: ${selector}`);
        await page.waitForSelector(selector, { timeout: 10000 });
        jobsFound = true;
        console.log(`✅ Found elements with selector: ${selector}`);
        break;
      } catch (e) {
        console.log(`❌ Selector ${selector} not found`);
        continue;
      }
    }

    if (!jobsFound) {
      const pageContent = await page.content();
      console.log('Page title:', await page.title());
      console.log('Page URL:', page.url());

      if (pageContent.includes('blocked') || pageContent.includes('captcha')) {
        throw new Error('Page blocked or requires captcha');
      }

      throw new Error('No job listings found on page');
    }

    const jobs = await page.evaluate(() => {
      const jobElements = document.querySelectorAll('.internship-card, .job-card, .opportunity-card, .internship-list-item');
      const results = [];

      console.log(`Found ${jobElements.length} job elements`);

      jobElements.forEach((element, index) => {
        if (index >= 10) return;

        try {
          const title = element.querySelector('h3, .title, .job-title, .internship-title')?.textContent?.trim() || 'N/A';
          const company = element.querySelector('.company, .company-name, .org-name')?.textContent?.trim() || 'N/A';
          const location = element.querySelector('.location, .job-location')?.textContent?.trim() || 'Remote';
          const stipend = element.querySelector('.stipend, .salary, .compensation')?.textContent?.trim() || 'N/A';
          const linkElement = element.querySelector('a');
          const link = linkElement?.href || '';

          if (title !== 'N/A' || company !== 'N/A') {
            results.push({
              title,
              company,
              location,
              stipend,
              duration: 'N/A',
              link: link.startsWith('http') ? link : `https://letsintern.com${link}`,
              source: 'LetsIntern'
            });
          }
        } catch (err) {
          console.error('Error parsing job element:', err);
        }
      });

      return results;
    });

    console.log(`✅ Successfully scraped ${jobs.length} jobs from LetsIntern`);

    res.json({
      success: true,
      count: jobs.length,
      jobs,
      scraped_at: new Date().toISOString(),
      url_scraped: url
    });

  } catch (error) {
    console.error('LetsIntern scraping failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.stack
    });
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.error('Error closing browser:', e);
      }
    }
  }
});

// Scrape LinkedIn (limited due to anti-bot measures)
app.get('/linkedin', async (req, res) => {
  let browser;
  try {
    const { keywords = 'internship', location = 'India' } = req.query;
    console.log(`Starting LinkedIn scraping: keywords=${keywords}, location=${location}`);

    browser = await createBrowser();
    const page = await createPage(browser);

    // LinkedIn public job search (no login required)
    const url = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(keywords)}&location=${encodeURIComponent(location)}`;
    console.log(`Target URL: ${url}`);

    const navigated = await navigateToPage(page, url);
    if (!navigated) {
      throw new Error('Failed to navigate to LinkedIn');
    }

    // Wait for job listings
    try {
      await page.waitForSelector('.job-search-card, .jobs-search-results-list', { timeout: 15000 });
    } catch (e) {
      console.log('LinkedIn may have anti-bot measures in place');
      throw new Error('LinkedIn blocked the request or changed their structure');
    }

    const jobs = await page.evaluate(() => {
      const jobElements = document.querySelectorAll('.job-search-card, .job-result-card');
      const results = [];

      console.log(`Found ${jobElements.length} job elements`);

      jobElements.forEach((element, index) => {
        if (index >= 5) return; // Limited results for LinkedIn

        try {
          const title = element.querySelector('h3 .sr-only, h3 a, .job-title')?.textContent?.trim() || 
                       element.querySelector('h3')?.textContent?.trim() || 'N/A';
          const company = element.querySelector('h4 .sr-only, h4 a, .company-name')?.textContent?.trim() || 
                         element.querySelector('h4')?.textContent?.trim() || 'N/A';
          const location = element.querySelector('.job-search-card__location, .job-location')?.textContent?.trim() || 'N/A';
          const linkElement = element.querySelector('a');
          const link = linkElement?.href || '';

          if (title !== 'N/A' || company !== 'N/A') {
            results.push({
              title,
              company,
              location,
              stipend: 'N/A',
              duration: 'N/A',
              link,
              source: 'LinkedIn'
            });
          }
        } catch (err) {
          console.error('Error parsing job element:', err);
        }
      });

      return results;
    });

    console.log(`✅ Successfully scraped ${jobs.length} jobs from LinkedIn`);

    res.json({
      success: true,
      count: jobs.length,
      jobs,
      scraped_at: new Date().toISOString(),
      url_scraped: url,
      note: 'LinkedIn results are limited due to anti-bot measures'
    });

  } catch (error) {
    console.error('LinkedIn scraping failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.stack,
      note: 'LinkedIn has strict anti-bot measures. Consider using their API instead.'
    });
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.error('Error closing browser:', e);
      }
    }
  }
});

// Combined endpoint for all sources
app.get('/all', async (req, res) => {
  try {
    const results = {
      success: true,
      sources: {},
      total_jobs: 0,
      scraped_at: new Date().toISOString()
    };

    results.sources = {
      internshala: { status: 'Use /internshala endpoint' },
      letsintern: { status: 'Use /letsintern endpoint' },
      linkedin: { status: 'Use /linkedin endpoint' }
    };

    res.json(results);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Initialize browsers on startup
async function initializeApp() {
  console.log('🚀 Initializing Intern Job Scraper Bot...');
  
  // Install browsers in the background
  ensureBrowsersInstalled().catch(error => {
    console.error('⚠️ Warning: Failed to install browsers on startup:', error.message);
    console.log('🔧 Browsers will be installed on first use');
  });
}

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Intern Job Scraper Bot running on port ${PORT}`);
  console.log(`📍 Available endpoints:`);
  console.log(`   GET / - Health check`);
  console.log(`   GET /setup - Install browsers`);
  console.log(`   GET /test - Test browser functionality`);
  console.log(`   GET /internshala?category=web-development&location=mumbai`);
  console.log(`   GET /letsintern?category=technology`);
  console.log(`   GET /linkedin?keywords=internship&location=India`);
  console.log(`   GET /all - Combined results info`);
  console.log(`⏰ Daily automation scheduled for 9:00 AM IST`);
  console.log(`🤖 Telegram channel: @RemoteInternIndia`);
  
  // Initialize the app
  initializeApp();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});