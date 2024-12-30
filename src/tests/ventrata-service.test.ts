import dotenv from 'dotenv';
import VentrataService from '../services/ventrata/ventrata-service';

// Load environment variables
dotenv.config();

describe('VentrataService', () => {
    let ventrataService: VentrataService;

    // Run before each test
    beforeEach(() => {
        ventrataService = new VentrataService();
    });

    test('getBookings should fetch bookings for today', async () => {
        try {
            // Get today's date in YYYY-MM-DD format
            const today = new Date().toISOString().split('T')[0];
            
            const bookings = await ventrataService.getBookings({
                localDate: today
            });

            // Basic validation
            expect(Array.isArray(bookings)).toBe(true);
            
            // If we have any bookings, verify their structure
            if (bookings.length > 0) {
                const firstBooking = bookings[0];
                expect(firstBooking).toHaveProperty('id');
                expect(firstBooking).toHaveProperty('status');
                expect(firstBooking).toHaveProperty('contact');
            }

            console.log(`Retrieved ${bookings.length} bookings for ${today}`);
            
        } catch (error) {
            console.error('Test failed:', error);
            throw error;
        }
    });
});