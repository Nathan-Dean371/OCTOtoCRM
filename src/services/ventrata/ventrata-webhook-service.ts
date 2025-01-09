import axios from 'axios';
import { VentrataWebhook, WebhookEvent } from '../../types/ventrata';

class VentrataWebhookService {
    private readonly apiKey: string;
    private readonly baseUrl: string;

    constructor() {
        this.apiKey = process.env.VENTRATA_API_KEY || '';
        this.baseUrl = 'https://api.ventrata.com/octo';

        if (!this.apiKey) {
            throw new Error('Ventrata API key is not configured');
        }
    }

    async createWebhook(url: string): Promise<VentrataWebhook> {
        try {
            const response = await axios.post(
                `${this.baseUrl}/webhooks`,
                {
                    event: 'booking_update',
                    url: url,
                    retryOnError: true,
                    useContactLanguage: true
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                        'Octo-Capabilities': 'ventrata/webhooks'
                    }
                }
            );

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Failed to create webhook: ${error.response?.data?.message || error.message}`);
            }
            throw error;
        }
    }
}

export default VentrataWebhookService;