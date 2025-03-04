import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getUserDetails } from '../services/database/databaseConnector';
import { user } from '../types/users';
import { userRole } from '../types/userRoles';


const checkForAuthToken = async (req : Request, res : Response, next : NextFunction) => {
    try {
        
        console.log('Checking for auth token on route ', req.path); 
        
        if(req.cookies['auth-token'] === undefined)
        {
            console.log('No auth token found');
            next();
            return;
        }
        
        const decode = <jwt.JwtPayload> jwt.verify(req.cookies['auth-token'], process.env.JWT_SECRET as string);
        console.log('Decoded JWT: ', decode);
        console.log(decode.user);

        const userFromDb  = await getUserDetails(decode.user);
        console.log('User from db: ', userFromDb);

        var loggedInUser : user; 
        if(userFromDb)
        {
            loggedInUser = {
                id : userFromDb.id,
                company_id : userFromDb.company_id,
                email : userFromDb.email,
                first_name : userFromDb.first_name,
                last_name : userFromDb.last_name,
                role : userRole[userFromDb.role],

            };

            req.user = loggedInUser;
            console.log('User is logged in: ', loggedInUser);
        }

        next();
    } catch(error) 
    {
        if(error instanceof jwt.TokenExpiredError)
        { 
            console.log('Token expired');
            res.clearCookie('auth-token');
            res.redirect('/');
        }
        else
        {
            console.log('Unhandeled error: ', error);
        }
    }
};

export const userAuthMiddleware = checkForAuthToken;


