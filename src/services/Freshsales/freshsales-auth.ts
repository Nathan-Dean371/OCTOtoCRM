// src/services/freshsales/freshsales-auth.ts
import axios from 'axios';

export class FreshsalesAuthService {
    private readonly apiKey: string;
    private readonly domain: string;

    constructor(config?: { apiKey: string; domain: string }) {
        this.apiKey = config?.apiKey || process.env.FRESHSALES_API_KEY || '';
        this.domain = config?.domain || process.env.FRESHSALES_DOMAIN || '';
        
        if (!this.apiKey || !this.domain) {
            throw new Error('Freshsales API key and domain are required');
        }
    }

    getAuthHeaders() {
        return {
            'Authorization': `Token token=${this.apiKey}`,
            'Content-Type': 'application/json'
        };
    }

    getBaseUrl() {
        return `https://${this.domain}.myfreshworks.com/crm/sales/api`;
    }

    async testConnection() {
        try {
            // Just a simple test endpoint to verify credentials
            await axios.get(`${this.getBaseUrl()}/selector/owners`, {
                headers: this.getAuthHeaders()
            });
            return true;
        } catch (error) {
            console.error('Failed to connect to Freshsales API:', error);
            return false;
        }
    }
}