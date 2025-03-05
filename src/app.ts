import express, { Express, Request, Response, NextFunction } from 'express';
import webhookRoutes from './routes/webhook.routes';
import apiKeyRoute from './routes/api-key.routes';
import loginRoute from './routes/login-auth.routes';
import companyRoute from './routes/inviteCompany.routes';
import inviteUserRoute from './routes/inviteUser.routes';
import { authMiddleware } from './middleware/auth';
import prismaClientInstance, { connectToDatabase } from './services/database/databaseConnector';
import path from 'path';
import { userAuthMiddleware } from './middleware/user-auth';
import cookieParser from 'cookie-parser';
import { verifyRole } from './middleware/roleVerificationMiddleware';
import { user_role } from './types/userRoles';
import { inviteCompany } from './services/companyService';
import session from 'express-session';
import { User } from './types/users';

declare module "express-session"
{
  interface SessionData
  {
    inviteCompany : {
      companyName : string
    }
    invitedManager : {
      email : string,
      firstName : string,
      lastName : string
    }
    invitedUser : {
      email : string,
      firstName : string,
      lastName : string
    }
  }
}


const app: Express = express();
app.use(session(
  {
    secret : process.env.SESSION_SECRET as string,
    saveUninitialized: false,
    resave: false
    
  }
));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', 'src/views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// Apply auth middleware to all API routes
app.use('/api', authMiddleware);
app.use('/', userAuthMiddleware);
app.use('/admin', verifyRole([user_role.ADMIN]));
app.use('/manager', verifyRole([user_role.MANAGER]));
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
app.use('/', companyRoute);
app.use('/', inviteUserRoute);
//#region Admin routes
app.get('/admin/dashboard', (req: Request, res: Response) => {
  res.render('admin', { title: 'Admin Dashboard', user: req.user });
});

app.get('/admin/dashboard/companies', (req: Request, res: Response) => {
  //Get all companies
  prismaClientInstance.companies.findMany().then((companies) => {
    res.render('admin-companies', { title: 'Admin Companies', user: req.user, companies });  
  }
  ).catch((error) => {  
    console.error(error);
    res.status(500).send('Internal server error');
  });

  
});

app.get('/admin/invite/company', (req: Request, res: Response) => {
  res.render('invite-company', { title: 'Invite Company', user: req.user });  
});

app.get('/admin/invite/company/success' , (req: Request, res: Response) => 
  {
    if(req.session.inviteCompany)
    {
      let invitedManager = req.session.invitedManager;
      res.render('invite-company-success', { title: 'Invite Company Success', user: req.user, companyName: req.session?.inviteCompany.companyName, invitedManager});
      //Clear the session data
      req.session.inviteCompany = undefined;
      req.session.invitedManager = undefined;
      
    }
  
});

app.get('/admin/invite/user/success' , (req: Request, res: Response) =>
{

  if(req.session.invitedUser)
  {
    let invitedUser = req.session.invitedUser;
    console.log("Clearing session data");
    res.render('invite-user-success', { title: 'Invite User Success', user: req.user, invitedUser});
    //Clear the session data
    console.log("Clearing session data");
    req.session.invitedUser = undefined;
  }
});

app.get('/admin/invite/user', (req: Request, res: Response) => {
  //Need a dictionary of companies to populate the dropdown
  // Key is the company id, value is the company name
   //Create dictionary
  let companyDictionary : Map<string, string> = new Map<string, string>();
  prismaClientInstance.companies.findMany().then((companies) => {
    companies.forEach((company) => 
      {
        companyDictionary.set(company.id, company.name);
      });
      
    res.render('invite-user', { title: 'Invite User', user: req.user, companyDictionary});
  });
  
});

app.get('/admin/dashboard/users', async (req: Request, res: Response) => {
  //Get all users with company name using a join

  prismaClientInstance.$queryRaw`SELECT users.*, c.name FROM users LEFT JOIN companies c ON users.company_id = c.id`.then((users) => {
    res.render('admin-users', { title: 'Admin Users', user: req.user, users });  
  }
  ).catch((error) => {  
    console.error(error);
    res.status(500).send('Internal server error');
  });
});

app.get('/admin/dashboard/user/invites', async (req: Request, res: Response) => {

  let companyDictionary : Map<string, string> = new Map<string, string>();
  const companies = prismaClientInstance.companies.findMany().then((companies) => {
    companies.forEach((company) => 
      {
        companyDictionary.set(company.id, company.name);
        
      });
    });
  prismaClientInstance.user_invitations.findMany().then((invites) => {
    res.render('admin-user-invites', { title: 'Admin User Invites', user: req.user, invites, companyDictionary });
  }).catch((error) => {
    console.error(error);
    res.status(500).send('Internal server error');
  });
});
//#endregion

//#region Manager routes

app.get('/manager/dashboard', (req: Request, res: Response) => {
  res.render('manager', { title: 'Manager Dashboard', user: req.user });
});

app.get('/manager/dashboard/users', async (req: Request, res: Response) => {
  //Get all users with for managers company
  const user = req.user as User;
  await prismaClientInstance.$queryRaw`SELECT * FROM users WHERE company_id = uuid(${user.company_id})`.then((users) => {
    res.render('manager-dashboard-users', { title: 'Manager Users', user: req.user, users });  
  }
  ).catch((error) => {  
    console.error(error);
    res.status(500).send('Internal server error');
  });

});

//#endregion



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
  
  const user = req.user as User;
  res.render('index', { title: 'Home' , user : user});
});

export default app;