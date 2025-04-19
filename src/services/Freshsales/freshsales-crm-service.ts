// src/services/freshsales/freshsales-crm-service.ts
import axios from 'axios';
import { FreshsalesAuthService } from './freshsales-auth';

export class FreshsalesCRMService {
    private readonly authService: FreshsalesAuthService;
    
    constructor(config?: { apiKey: string; domain: string }) {
        this.authService = new FreshsalesAuthService(config);
    }
    
    async findContactByEmail(email: string) {
        try {
            const response = await axios.get(
                `${this.authService.getBaseUrl()}/contacts/lookup`,
                {
                    headers: this.authService.getAuthHeaders(),
                    params: { email }
                }
            );
            
            return response.data.contact || null;
        } catch (error) {
            // Handle 404 (not found) as a valid response (contact doesn't exist)
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    }
    
    async createContact(contactData: any) {
        try {
            const response = await axios.post(
                `${this.authService.getBaseUrl()}/contacts`,
                { contact: contactData },
                { headers: this.authService.getAuthHeaders() }
            );
            
            return response.data.contact;
        } catch (error) {
            console.error('Error creating contact in Freshsales:', error);
            throw error;
        }
    }
    
    async createDeal(dealData: any) {
        try {
            const response = await axios.post(
                `${this.authService.getBaseUrl()}/deals`,
                { deal: dealData },
                { headers: this.authService.getAuthHeaders() }
            );
            
            return response.data.deal;
        } catch (error) {
            console.error('Error creating deal in Freshsales:', error);
            throw error;
        }
    }
}