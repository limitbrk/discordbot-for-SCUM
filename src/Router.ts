import express, { Request, Response } from 'express';
import { logger } from './Logger';

export class Router {
    public static init(port: number) {
        const app = express();
        app.get('/', (req: Request, res: Response) => {
            logger.info("Invocation!");
            const greeting = `
                Hello, this is a bot for a 1:1 server only<BR>
            `;
            res.send(greeting);
        });

        app.get('/health', (req: Request, res: Response) => {
            res.send("OK");
        });

        app.listen(port, () => {
            logger.info(`Server running at PORT:${port}`);
        });
    }
}