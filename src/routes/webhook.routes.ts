import { Router, RequestHandler } from 'express';
import { WebhookEvent } from '../types/ventrata';
import VentrataWebhookHandler from '../services/ventrata/ventrata-webhook-handler';

const router = Router();
const webhookHandler = new VentrataWebhookHandler();

// Our handler explicitly declares that it returns Promise<void>
const handleWebhook: RequestHandler = async (req, res): Promise<void> => {
    try {
        const webhookData = req.body as WebhookEvent;
        
        console.log('Received Ventrata webhook:', {
            event: webhookData.webhook?.event,
            bookingId: webhookData.booking?.uuid
        });

        // Validation check
        if (!webhookData.webhook || !webhookData.webhook.event) {
            console.error('Invalid webhook payload received');
            res.status(400).json({
                success: false,
                error: 'Invalid webhook payload'
            });
            // Explicit void return
            return;
        }

        // Process webhook
        await webhookHandler.handleWebhook(webhookData);

        // Send success response
        res.status(200).json({
            success: true,
            message: 'Webhook processed successfully'
        });
        // No return needed here - function will return undefined (void)
        
    } catch (error) {
        console.error('Error processing webhook:', error);
        
        // Send error response
        res.status(200).json({
            success: false,
            message: 'Error logged for review',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        // No return needed here either
    }
};

// Register the route
router.post('/ventrata-webhook', handleWebhook);

export default router;