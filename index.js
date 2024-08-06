import { getChromium } from 'playwright-aws-lambda';

export default async function handler(req, res) {
  console.log(`Received ${req.method} request to ${req.url}`);

  if (req.url === '/api/status') {
    return res.status(200).json({ status: 'OK', environment: process.env.VERCEL_ENV || 'development' });
  }

  let browser = null;
  try {
    console.log('Launching browser');
    browser = await getChromium();
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('Navigating to example.com');
    await page.goto('https://example.com', { waitUntil: 'networkidle' });

    console.log('Waiting for dynamic content');
    await page.waitForTimeout(5000); // Adjust this timeout as needed

    console.log('Getting page title');
    const title = await page.title();

    console.log('Sending response');
    res.status(200).json({ title });
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (browser) {
      console.log('Closing browser');
      await browser.close();
    }
  }
}
