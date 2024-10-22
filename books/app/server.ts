import express, { Request, Response, RequestHandler } from 'express';
import { bookScrapper } from '../scrapper/books';
import { Book } from '../types/index';

const app = express();
const port = 3000;

const bookHandler: RequestHandler = async (req: Request, res: Response ) => {
  const pageNumber = parseInt(req.query.pageNumber as string, 10);

  if (isNaN(pageNumber) || pageNumber < 0) {
     res.status(400).json({ error: 'Invalid page number' });
     return
    
  }
  try {
    const data: Book[] = await bookScrapper(pageNumber);
    res.json(data);
  } catch (error) {
    console.error('Error fetching books:', (error as Error).message);
     res.status(500).send(`Error during scrapping: ${(error as Error).message}`);
  }
};
app.get('/book', bookHandler);
app.listen(port, () => {
  console.log(`Server is running at: http://localhost:${port}`);
});
