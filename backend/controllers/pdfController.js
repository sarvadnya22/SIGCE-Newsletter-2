const puppeteer = require('puppeteer');

exports.generatePdf = async (req, res) => {
  let browser;
  try {
    const { newsletterId } = req.params;
    // Use env variable if set, otherwise default to the fixed Vite port 5174
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
    const targetUrl = `${frontendUrl}/public-preview/${newsletterId}`;

    console.log(`[PDF] Generating PDF for: ${targetUrl}`);

    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',            // Required on some Windows environments
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage', // Prevents crashes in limited memory envs
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote'
      ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1600 });

    // Navigate and wait for the React app to be ready
    await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 45000 });

    // Wait for the newsletter wrapper element to appear
    await page.waitForSelector('.wrapper', { timeout: 30000 });

    // Wait for all images to load (or fail gracefully)
    await page.evaluate(async () => {
      const imgs = Array.from(document.querySelectorAll('img'));
      await Promise.all(
        imgs.map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise(resolve => {
            img.addEventListener('load', resolve);
            img.addEventListener('error', resolve);
          });
        })
      );
    });

    // Extra settle time for CSS rendering
    await new Promise(r => setTimeout(r, 1500));

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
    });

    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="newsletter-${newsletterId}.pdf"`
    });
    res.send(pdfBuffer);

  } catch (error) {
    if (browser) await browser.close().catch(() => {});
    console.error('[PDF] Generation Error:', error.message);
    res.status(500).json({ message: 'Error generating PDF', error: error.message });
  }
};

