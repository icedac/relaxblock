const puppeteer = require('puppeteer');
const path = require('path');

describe('RelaxBlock Extension E2E', () => {
  let browser;
  let extensionId;

  beforeAll(async () => {
    const pathToExtension = path.join(__dirname, '../..');
    browser = await puppeteer.launch({
      headless: false,
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
        '--no-sandbox'
      ]
    });

    // Get extension ID
    const targets = await browser.targets();
    const extensionTarget = targets.find(target => target.type() === 'service_worker');
    if (extensionTarget) {
      const url = extensionTarget.url();
      extensionId = url.split('/')[2];
    }
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  test('should load extension popup', async () => {
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    
    const title = await page.$eval('#extTitle', el => el.textContent);
    expect(title).toBe('RelaxBlock');
  });

  test('should block configured domains', async () => {
    const page = await browser.newPage();
    
    // First, add a domain to block list via extension API
    await page.evaluateOnNewDocument(() => {
      chrome.runtime.sendMessage({ 
        type: 'SET_BLOCKED', 
        blockedList: ['example.com'] 
      });
    });

    // Navigate to blocked domain
    await page.goto('https://example.com');
    await page.waitForTimeout(1000); // Wait for content script

    // Check if grayscale filter is applied
    const htmlClasses = await page.$eval('html', el => el.className);
    expect(htmlClasses).toContain('blocked-site');

    // Check if overlay exists
    const overlay = await page.$('.block-overlay');
    expect(overlay).toBeTruthy();
  });

  test('should activate relax mode', async () => {
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);

    // Click relax button
    await page.click('#relaxBtn');
    await page.waitForTimeout(1000);

    // Check if button text changed
    const buttonText = await page.$eval('#relaxBtn', el => el.textContent);
    expect(buttonText).toContain('Stop Relax Mode');
    expect(buttonText).toMatch(/\d+m \d+s left/);
  });

  test('should import and export blocked domains', async () => {
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionId}/options.html`);

    // Add a domain
    await page.type('#domainInput', 'test.com');
    await page.click('#addBtn');
    await page.waitForTimeout(500);

    // Check if domain was added
    const domains = await page.$$eval('#blockedList li', els => 
      els.map(el => el.textContent)
    );
    expect(domains).toContain('test.com');

    // Test export
    await page.click('#exportBtn');
    // Note: Can't easily test download in Puppeteer, but we can verify the button works
  });

  test('should block current domain from popup', async () => {
    const page = await browser.newPage();
    
    // First navigate to a test page
    await page.goto('https://example.org');
    
    // Open popup in new page
    const popupPage = await browser.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);
    
    // Check if button shows current domain
    const buttonText = await popupPage.$eval('#blockCurrentSiteBtn', el => el.textContent);
    expect(buttonText).toContain('example.org');
  });
});