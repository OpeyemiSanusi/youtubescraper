const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

async function getBrowser() {
  console.log('Initializing browser');
  let browser;
  if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    console.log('Running in Vercel production environment');
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
  } else {
    console.log('Running in development environment');
    browser = await puppeteer.launch();
  }
  return browser;
}

module.exports = async (req, res) => {
  console.log(`Received ${req.method} request to ${req.url}`);
  
  if (req.url === '/api/status') {
    return res.status(200).json({ status: 'OK', environment: process.env.AWS_LAMBDA_FUNCTION_VERSION ? 'production' : 'development' });
  }

  try {
    console.log('Launching browser');
    const browser = await getBrowser();
    console.log('Creating new page');
    const page = await browser.newPage();
    console.log('Navigating to example.com');
    await page.goto('https://example.com');
    
    console.log('Getting page title');
    const title = await page.title();
    
    console.log('Closing browser');
    await browser.close();
    
    console.log('Sending response');
    res.status(200).json({ title });
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ error: error.message });
  }
};
