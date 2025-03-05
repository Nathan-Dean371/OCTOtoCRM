import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import { userRole } from '../types/userRoles';
import { User } from '../types/users';

export const verifyRole = (roles : userRole[]) => (req: Request, res: Response, next: NextFunction) => {
    try 
    {
        const user = req.user;
        // Check if user exists
        if (!user) 
        {
            res.redirect('/');
            throw new AppError(401, 'Unauthorized');
        }
        // Check if user has the required role
        if (!roles.includes(user.role))
        {
            res.redirect('/');
            throw new AppError(403, 'Forbidden');
        }

        next();

    }   catch (error)
    {
        next(error);
    }
};