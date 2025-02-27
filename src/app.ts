import express, { Express, Request, Response, NextFunction } from 'express';
import webhookRoutes from './routes/webhook.routes';
import apiKeyRoute from './routes/api-key.routes';
import loginRoute from './routes/login-auth.routes';
import { authMiddleware } from './middleware/auth';
import { connectToDatabase } from './services/database/databaseConnector';
import path from 'path';
import { userAuthMiddleware } from './middleware/user-auth';
import cookieParser from 'cookie-parser';
import { verifyRole } from './middleware/roleVerificationMiddleware';
import { userRole } from './types/userRoles';

const app: Express = express();
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', 'src/views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// Apply auth middleware to all API routes
app.use('/api', authMiddleware);
// Apply role checking middlewate to all API routes

//Connect to postgres database
connectToDatabase();

//Mount the webhook routes
app.use('/api/', webhookRoutes);

// Mount the API key check route
app.use('/api/', apiKeyRoute)

// Routes will be added here
// app.use('/api/v1', routes);
app.use('/', loginRoute);

//Admin routes
app.get('/admin/dashboard', userAuthMiddleware, verifyRole([userRole.ADMIN]), (req: Request, res: Response) => {
  res.render('admin', { title: 'Admin Dashboard', user: req.user });
});

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


app.get("/", userAuthMiddleware, (req: Request, res: Response) => {
  //Serve home page
  const user = req.user;
  res.render('index', { title: 'Home' , user : user});
});

export default app;