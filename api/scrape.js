import { getChromium } from 'playwright-aws-lambda';

export default async function (req, res) {
  const { v } = req.query;
  if (!v) {
    return res.status(400).json({ error: 'YouTube video ID (v) is required' });
  }

  const url = `https://youtubetranscript.com/?v=${v}`;
  let browser = null;

  try {
    browser = await getChromium();
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await page.goto(url, { waitUntil: 'networkidle' });

    // Wait for 7 seconds
    await page.waitForTimeout(7000);

    const transcriptText = await page.evaluate(() => {
      const links = document.querySelectorAll('#demo a');
      return Array.from(links).map(link => link.textContent).join(' ');
    });

    res.status(200).json({ transcript: transcriptText });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
