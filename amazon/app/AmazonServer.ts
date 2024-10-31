import express, {Request, Response, RequestHandler} from 'express';
import { AmazonScrapper } from '../scrapper/AmazonScrapper';
import { books } from '../types/index';

const app = express();
const port= 3000;

const amazonHandler: RequestHandler = async (req: Request, res: Response) => {
    const pageNumber = parseInt(req.query.page as string, 10)

    if (isNaN(pageNumber) || pageNumber < 0) {
        res.status(400).send('Invalid Page Number');
        return;
    }

    try {
        const dataAmazon: books[] = await AmazonScrapper(pageNumber);
        res.json(dataAmazon);
    } catch (error) {
        console.error('Error during scrapping: ', (error as Error).message);
        res.status(500).send(`Error during scrapping: ${(error as Error).message}`);
        
    }
    
};

app.get('/amazon', amazonHandler);
app.listen(port, () =>{
    console.log(`Server is running at: http://localhost:${port}/amazon`);
    
})