import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import webhookRoutes from './routes/webhook.routes';
import apiKeyRoute from './routes/api-key.routes';
import loginRoute from './routes/login-auth.routes';
import { authMiddleware } from './middleware/auth';

import { connectToDatabase } from './services/database/databaseConnector';

const app: Express = express();
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', 'src/views');

// Apply auth middleware to all API routes
app.use('/api', authMiddleware);

//Connect to postgres database
connectToDatabase();

//Mount the webhook routes
app.use('/api/', webhookRoutes);

// Mount the API key check route
app.use('/api/', apiKeyRoute)

// Routes will be added here
// app.use('/api/v1', routes);
app.use('/', loginRoute);
app.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('auth-token');
  res.redirect('/');
});

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
  res.render('index', { title: 'Home' , user : null});
});

export default app;