import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import webhookRoutes from './routes/webhook.routes';

// Load environment variables
dotenv.config();

const app: Express = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Mount the webhook routes
app.use('/api/', webhookRoutes);

// Routes will be added here
// app.use('/api/v1', routes);

// Basic error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

// Basic health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });
  

export default app;