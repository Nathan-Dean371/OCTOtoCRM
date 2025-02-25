// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

// Extend Express Request type to include our custom properties
declare global {
    namespace Express {
        interface Request {
            apiKey?: string;
        }
    }
}

export const API_KEY_HEADER = 'X-API-Key';

export class AuthError extends AppError {
    constructor(message: string) {
        super(401, message);
        this.name = 'AuthError';
    }
}

export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
    try {
        const apiKey = req.header(API_KEY_HEADER);
        
        // Check if API key exists in header
        if (!apiKey) {
            throw new AuthError(`${API_KEY_HEADER} header is required`);
        }

        // Get the configured API key from environment variables
        const configuredApiKey = process.env.WEBHOOK_API_KEY;
        
        if (!configuredApiKey) {
            console.error('API_KEY not configured in environment variables');
            throw new AppError(500, 'Server configuration error');
        }

        // Validate the API key
        if (apiKey !== configuredApiKey) {
            throw new AuthError('Invalid API key');
        }

        // Store the API key in the request for potential future use
        req.apiKey = apiKey;
        console.log('API key is valid');
        next();
    } catch (error) {
        next(error);
    }
};

// Combine multiple middleware functions
export const authMiddleware = [validateApiKey];