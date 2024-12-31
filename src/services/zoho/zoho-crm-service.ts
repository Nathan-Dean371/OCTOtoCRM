import axios, { AxiosInstance } from 'axios';
import { ZohoContact, ZohoVentrataBooking, ZohoApiResponse } from '../../types/zoho';
import ZohoAuthService from './zoho-auth';

class ZohoCRMService {
    private readonly client: AxiosInstance;
    private readonly authService: ZohoAuthService;

    constructor() {
        this.authService = new ZohoAuthService();
        
        const apiDomain = process.env.ZOHO_API_DOMAIN;
        if (!apiDomain) {
            throw new Error('ZOHO_API_DOMAIN is not configured');
        }
    
        // Create axios instance
        this.client = axios.create({
            baseURL: apiDomain.endsWith('/') ? apiDomain : `${apiDomain}/`,
        });
    
        // Fix the interceptor to properly handle headers
        this.client.interceptors.request.use(async (config) => {
            const token = await this.authService.getAccessToken();
            if (config.headers) {
                config.headers['Authorization'] = `Zoho-oauthtoken ${token}`;
                config.headers['Content-Type'] = 'application/json';
            }
            return config;
        });
    
        // Add response interceptor for debugging
        this.client.interceptors.response.use(
            response => response,
            error => {
                console.error('Request failed:', {
                    url: error.config?.url,
                    method: error.config?.method,
                    status: error.response?.status,
                    data: error.response?.data
                });
                return Promise.reject(error);
            }
        );
    }

    // Contact Operations
    async createContact(contact: Omit<ZohoContact, 'id'>): Promise<ZohoContact> {
        try {
            // Log the request URL and data for debugging
            console.log('Making request to:', `${this.client.defaults.baseURL}/crm/v2/Contacts`);
            console.log('Request data:', {data: [contact]});
    
            const response = await this.client.post('/crm/v2/Contacts', {
                data: [contact]
            }, {
                headers: {
                    'Content-Type': 'application/json'  // Explicitly set content type
                }
            });
    
            // Log the response for debugging
            console.log('Zoho Response:', response.data);
    
            if (!response.data.data || response.data.data.length === 0) {
                throw new Error('No data returned from Zoho CRM');
            }
    
            const result = response.data.data[0];
            if (result.code !== 'SUCCESS') {
                throw new Error(`Failed to create contact: ${result.message}`);
            }
    
            return {
                id: result.details.id,
                ...contact
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Full error response:', error.response?.data);
                throw new Error(
                    `Failed to create contact in Zoho CRM: ${
                        error.response?.data?.message || 
                        error.response?.statusText || 
                        error.message
                    }`
                );
            }
            throw error;
        }
    }

    async getContact(id: string): Promise<ZohoContact> {
        // Implementation coming soon
        throw new Error('Not implemented');
    }

    // Booking Operations
    async createBooking(booking: Omit<ZohoVentrataBooking, 'id'>): Promise<ZohoVentrataBooking> {
        // Implementation coming soon
        throw new Error('Not implemented');
    }

    async getBooking(id: string): Promise<ZohoVentrataBooking> {
        // Implementation coming soon
        throw new Error('Not implemented');
    }
}

export default ZohoCRMService;