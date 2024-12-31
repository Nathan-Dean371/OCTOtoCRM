import dotenv from 'dotenv';
import ZohoCRMService from '../services/zoho/zoho-crm-service';

dotenv.config();

describe('ZohoCRMService', () => {
    let crmService: ZohoCRMService;

    beforeEach(() => {
        crmService = new ZohoCRMService();
    });

    /* describe('Contact Operations', () => {
        test('should create a new contact', async () => {
            // Create a test contact
            const testContact = {
                First_Name: 'Test',
                Last_Name: 'User',
                Email: 'test@example.com',
                Phone: '+1234567890',
                Country: 'IE'
            };

            try {
                const createdContact = await crmService.createContact(testContact);

                // Verify the response
                expect(createdContact).toBeDefined();
                expect(createdContact.id).toBeDefined();
                expect(createdContact.First_Name).toBe(testContact.First_Name);
                expect(createdContact.Last_Name).toBe(testContact.Last_Name);
                expect(createdContact.Email).toBe(testContact.Email);

                console.log('Created Contact:', createdContact);
            } catch (error) {
                console.error('Test Error:', error);
                throw error;
            }
        });

        test('should handle invalid contact data', async () => {
            // Create an invalid contact (missing required Last_Name)
            const invalidContact = {
                First_Name: 'Test',
                Email: 'test@example.com',
                Last_Name: ''  // Empty string to test validation
            };
        
            await expect(crmService.createContact(invalidContact))
                .rejects
                .toThrow();
        });

        // Optional: Test with special characters
        test('should handle special characters in contact name', async () => {
            const specialCharContact = {
                First_Name: 'Tést',
                Last_Name: 'O\'User-Name',
                Email: 'test.special@example.com',
            };

            const createdContact = await crmService.createContact(specialCharContact);
            expect(createdContact.id).toBeDefined();
            expect(createdContact.First_Name).toBe(specialCharContact.First_Name);
        });
    });
 */
    describe('Booking Operations', () => {
        test('should create a new booking', async () => 
            {
                const testBooking = {
                    Booking_Ref: 'TEST-123',
                    Name: 'Test Booking',
                    Contact_Id: '776203000000535001',
                    Option: "Test Option",
                    Booking_Date: formatDateForZoho('2021-12-31'),
                    Product: 'Test Product',
                    Travel_Date: formatDateForZoho('2022-01-01')
                }


                try 
                {
                    const createdBooking = await crmService.createBooking(testBooking);

                    expect(createdBooking).toBeDefined();
                    expect(createdBooking.id).toBeDefined();
                    expect(createdBooking.Booking_Ref).toBe(testBooking.Booking_Ref);
                    expect(createdBooking.Name).toBe(testBooking.Name);
                    expect(createdBooking.Contact_Id).toBe(testBooking.Contact_Id);
                    expect(createdBooking.Booking_Date).toBe(testBooking.Booking_Date);
                    expect(createdBooking.Product).toBe(testBooking.Product);
                    expect(createdBooking.Travel_Date).toBe(testBooking.Travel_Date);

                    console.log('Created Booking:', createdBooking);
                } catch(error)
                {
                    console.error('Test Error:', error);
                    throw error;
                }

        });
    });
});

function formatDateForZoho(date: string): string {
    const d = new Date(date);
    // Format to ISO string and add timezone offset
    return d.toISOString().split('.')[0] + '+00:00';  // removes milliseconds
}