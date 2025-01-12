import { Router, RequestHandler } from 'express';
import { WebhookEvent } from '../types/ventrata';

const router = Router();

const checkAPIkey: RequestHandler = async (req, res, next): Promise<void> => {

    try
    {
        const apiKey = req.header('X-API-Key');
        if (!apiKey) {
            res.status(401).json({
                success: false,
                message: 'API key is required'
            });
            return;
        }
        const configuredApiKey = process.env.WEBHOOK_API_KEY;

        if (!configuredApiKey) {
            console.error('API_KEY not configured in environment variables');
            res.status(500).json({
                success: false,
                message: 'Server configuration error'
            });
            return;
        }

        if (apiKey !== configuredApiKey) {
            res.status(401).json({
                success: false,
                message: 'Invalid API key'
            });
            return;
        }

        if(apiKey === configuredApiKey)
        {
            console.log('API key is valid');
            res.status(200).json({
                success: true,
                message: 'API key is valid'
            });
        }
    } catch (error) {
        console.log('Error processing API key:', error);

        res.status(500).json({  
            success: false,
            message: 'Error processing API key'
        });
    }
};

router.post('/api-key-check', checkAPIkey);

export default router;