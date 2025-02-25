import { Request, Response, NextFunction } from 'express';

const checkForAuthToken = (req : Request, res : Response, next : NextFunction) => {
    try {
        const authToken = req.cookies.authToken;
        if (!authToken) 
            {
                throw new Error('Auth token is required');
            }
    }
    catch(error) 
    {
        console.log(error);
        next(error);
    }
};

export const userAuthMiddleware = checkForAuthToken;