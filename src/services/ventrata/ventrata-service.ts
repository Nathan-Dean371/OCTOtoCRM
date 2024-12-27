import axios from 'axios';
import { VentrataBooking } from '../../types/ventrata';

interface BookingFilters {
    resellerReference?: string;
    supplierReference?: string;
    localDate?: string;
    localDateStart?: string;
    localDateEnd?: string;
    productId?: string;
    optionId?: string;
}

class VentrataService {
    private apiKey: string;
    private baseUrl: string;

    constructor() {
        // Read from environment variables
        this.apiKey = process.env.VENTRATA_API_KEY || '';
        this.baseUrl = process.env.VENTRATA_API_URL || '';

        if (!this.apiKey) {
            throw new Error('Ventrata API key is not configured');
        }
    }

    

    protected getHeaders() {
        return {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Octo-Capabilities': '',  // We'll explain capabilities in detail next
        };
    }

     // This method fetches bookings with optional filters
    async getBookings(filters?: BookingFilters): Promise<VentrataBooking[]> {
        try {
            // The documentation shows that we need at least one filter parameter
            if (!filters || Object.keys(filters).length === 0) {
                throw new Error('At least one filter parameter is required');
            }

            // Make the API request with our filters as query parameters
            const response = await axios.get(`${this.baseUrl}/bookings`, {
                headers: this.getHeaders(),
                params: filters
            });

            console.log('Raw API Response:', JSON.stringify(response.data, null, 2));
            
            // The documentation shows bookings are returned as an array
            return response.data as VentrataBooking[];

        } catch (error) {
            if (axios.isAxiosError(error)) {
                // Log the specific error information from the API
                console.error('Ventrata API Error:', {
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data
                });
            }
            throw error;
        }
    }
}

export default VentrataService;