import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import webhookRoutes from './routes/webhook.routes';
import apiKeyRoute from './routes/api-key.routes';
import { authMiddleware } from './middleware/auth';
import { PrismaClient } from '@prisma/client';

// Load environment variables
const result = dotenv.config();
if(result.error) {
  console.error(result.error);
}
console.log('Loaded environment variables:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  ZOHO_DOMAIN: process.env.ZOHO_DOMAIN ? 'Set' : 'Not Set',
  // Add other variables you want to check
});


const app: Express = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply auth middleware to all API routes
app.use('/api', authMiddleware);

//Mount the webhook routes
app.use('/api/', webhookRoutes);

// Mount the API key check route
app.use('/api/', apiKeyRoute)

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

app.get("/", (req: Request, res: Response) => {
  //Serve home page
  res.sendFile('pages/index.html', { root: __dirname });
});


  app.get("/test-connection", async (req: Request, res: Response) => {
    const prisma = new PrismaClient();
    try {
      await prisma.$connect();
      console.log('Successfully connected to database');
      const result = await prisma.$queryRaw`select * from companies;`;
      console.log(result);
      res.status(200).json({ result});
    } catch (error) {
      console.error('Failed to connect to database:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ success: false, error: errorMessage });
    } finally {
      await prisma.$disconnect();
    }
  });

export default app;