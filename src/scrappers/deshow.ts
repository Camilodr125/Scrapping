import puppeteer,  { Browser} from 'puppeteer';
import express, { Request, Response } from 'express';
import { DeshowProduct } from '../types/index';

const app = express();
const port = 3000;

// Define route for scraping Deshow products
app.get('/deshow', async (req: Request, res: Response) => {
  const pageNumber = parseInt(req.query.page as string, 10);

  if (pageNumber < 0 || isNaN(pageNumber)) {
    //return res.status(400).send('Invalid page number');
  }

  let browser: Browser | null = null;

  try {
    // Launch browser in non-headless mode
    browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    const url = `https://deshow.com/advance-search/page/${pageNumber}`
    // Navigate to the target URL and wait for network to be idle
    await page.goto(url, { waitUntil: 'networkidle2' });
    // Evaluate page content to extract product data
    const data = await page.evaluate(() => {
      const products: DeshowProduct[] = [];

      // Select all product elements and extract information
      document.querySelectorAll('li.col-lg-4').forEach((product: any) => {
        const name = product.querySelector('.description h3') ? product.querySelector('.description h3').textContent : null;
        const price = product.querySelector('.number') ? product.querySelector('.number').textContent : null;
        const features: string[] = [];
        // Extract features from span elements
        const spans = product.querySelectorAll('.properties span');
        spans.forEach((span: any) => features.push(span.textContent?.trim() || ''))
        const url = product.querySelector('.card a') ? product.querySelector('.card a').href : null;
        const status = product.querySelector('.tag') ? product.querySelector('.tag').textContent.trim() : null;

        // Push extracted product data to array
        products.push({
          name,
          price,
          features,
          url,
          status
        });
    
      });
      return products;
    });
    // Send scraped data as JSON response
    res.json(data);
    
  } catch (error) {
    // Handle errors and send appropriate response
    res.status(500).send(`Error during scraping: ${(error as Error).message}`);
    console.error('Error during scrapping: ',(error as Error).message);
    
  } finally {
    // Ensure browser is closed after scraping
    if (browser) {
      await browser.close();
    }
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on: http://localhost:${port}/deshow`);
});
