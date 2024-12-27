import dotenv from 'dotenv';
import VentrataService from './services/ventrata/ventrata-service';

// Load environment variables
dotenv.config();

async function testVentrataBookings() {
    try {
        const ventrataService = new VentrataService();
        
        // The documentation requires at least one filter
        // Let's get bookings for today
        const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
        
        console.log(`Fetching bookings for date: ${today}`);
        
        const bookings = await ventrataService.getBookings({
            localDate: today
        });
        
        if (bookings.length > 0) {
            console.log(`Found ${bookings.length} bookings`);
            console.log('\nFirst booking details:');
            console.log(JSON.stringify(bookings[0], null, 2));
        } else {
            console.log('No bookings found for today');
        }
    } catch (error) {
        console.error('Error testing Ventrata service:', error);
    }
}

async function examineBookingStructure() {
    try {
        const ventrataService = new VentrataService();
        const today = new Date().toISOString().split('T')[0];
        
        console.log('Fetching a booking to examine its structure...');
        
        const bookings = await ventrataService.getBookings({
            localDate: today
        });
        
        if (bookings.length > 0) {
            // Get the first booking
            const booking = bookings[0];
            
            // Simple structure examination
            console.log('\nBooking Properties:');
            console.log('Top-level properties:', Object.keys(booking));
            
            // Log the complete booking object
            console.log('\nComplete Booking Structure:');
            console.log(JSON.stringify(booking, null, 2));
        } else {
            console.log('No bookings found to examine');
        }
    } catch (error) {
        console.error('Error examining booking structure:', error);
    }
}

examineBookingStructure();
// Run the test
//testVentrataBookings();