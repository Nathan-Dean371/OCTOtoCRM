import axios from 'axios';
import { VentrataBooking } from '../../types/ventrata';
import { VentrataAPIError } from '../../utils/errors';

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

            const headers =
            {
                ...this.getHeaders(),
                'Octo-Capabilities': 'octo/booking'
            }

            // Make the API request with our filters as query parameters
            const response = await axios.get(`${this.baseUrl}/bookings`, {
                headers: this.getHeaders(),
                params: filters
            });

            // Add validation to ensure we received the expected data structure
            if (!Array.isArray(response.data)) {
                throw new VentrataAPIError(
                    500,
                    'Unexpected response format from Ventrata API',
                    'INVALID_RESPONSE_FORMAT'
                );
            }

            return response.data;

        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                // Log the specific error information from the API
                const errorData = error.response.data;
                throw new VentrataAPIError(
                    error.response.status,
                    errorData.errorMessage || 'An error occurred with the Ventrata API',
                    errorData.errorCode,
                    error
                );
            }
            // Handle other types of errors
            throw new VentrataAPIError(
                500,
                'Failed to fetch bookings from Ventrata',
                'UNKNOWN_ERROR',
                error
            );
        }
    }

    
}

export default VentrataService;