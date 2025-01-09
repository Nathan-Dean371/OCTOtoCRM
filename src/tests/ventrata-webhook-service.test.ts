import dotenv from 'dotenv';
import VentrataWebhookService from '../services/ventrata/ventrata-webhook-service';

dotenv.config();

describe('VentrataWebhookService', () => {
    let webhookService: VentrataWebhookService;

    beforeEach(() => {
        webhookService = new VentrataWebhookService();
    });

    test('should create a webhook', async () => {
        try {
            // Use a test URL - in production this would be your actual endpoint
            const testUrl = 'https://webhook.site/your-test-id';
            
            const webhook = await webhookService.createWebhook(testUrl);

            // Verify the webhook response
            expect(webhook).toBeDefined();
            expect(webhook.id).toBeDefined();
            expect(webhook.url).toBe(testUrl);
            expect(webhook.event).toBe('booking_update');
            
            console.log('Created Webhook:', webhook);
        } catch (error) {
            console.error('Test Error:', error);
            throw error;
        }
    });
});