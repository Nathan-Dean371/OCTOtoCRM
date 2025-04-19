// src/services/freshsales/freshsales-contact-service.ts
import axios from 'axios';
import { FreshsalesAuthService } from './freshsales-auth';
import { FreshsalesContact } from '../../types/Freshsales';


export class FreshsalesContactService {
    private readonly authService: FreshsalesAuthService;
    
    constructor(config?: { apiKey: string; domain: string }) {
        this.authService = new FreshsalesAuthService(config);
    }
    
    async findContactByEmail(email: string): Promise<FreshsalesContact | null> {
        if (!email) {
            return null;
        }
        
        try {
            const response = await axios.get(
                `${this.authService.getBaseUrl()}/contacts/lookup`,
                {
                    headers: this.authService.getAuthHeaders(),
                    params: { email }
                }
            );
            
            return response.data?.contact || null;
        } catch (error) {
            // If 404, it means contact wasn't found
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                return null;
            }
            console.error('Error finding contact by email:', error);
            throw error;
        }
    }
    
    async createContact(contactData: Partial<FreshsalesContact>): Promise<FreshsalesContact> {
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
    
    async updateContact(id: number, contactData: Partial<FreshsalesContact>): Promise<FreshsalesContact> {
        try {
            const response = await axios.put(
                `${this.authService.getBaseUrl()}/contacts/${id}`,
                { contact: contactData },
                { headers: this.authService.getAuthHeaders() }
            );
            
            return response.data.contact;
        } catch (error) {
            console.error(`Error updating contact ${id} in Freshsales:`, error);
            throw error;
        }
    }
    
    async findOrCreateContact(contactData: Partial<FreshsalesContact>): Promise<FreshsalesContact> {
        // Try to find by email first
        if (contactData.email) {
            const existingContact = await this.findContactByEmail(contactData.email);
            if (existingContact) {
                // Update existing contact with any new information
                return await this.updateContact(existingContact.id, contactData);
            }
        }
        
        // If no email or contact not found, create new
        return await this.createContact(contactData);
    }
}