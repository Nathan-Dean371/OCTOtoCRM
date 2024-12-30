import { VentrataBooking } from '../types/ventrata';
import { ventrataBookingCleaner } from '../utils/ventrataBookingCleaner';

describe('ventrataBookingCleaner', () => {
    
    // Test successful cleaning
    test('should clean valid booking data correctly', () => {
        const mockBooking = {
            contact: {
                fullName: "  John Doe  ",
                phoneNumber: " +1234567890 ",
                emailAddress: " john@example.com ",
                country: "IE"
            },
            product: {
                internalName: "  Test Tour  "
            },
            availability: {
                localDateTimeStart: "2024-12-30T09:30:00+00:00"
            },
            utcConfirmedAt: "2024-12-29T15:00:00Z",
            supplierReference: "  REF123  "
        } as VentrataBooking;  // Type assertion for our mock

        const result = ventrataBookingCleaner(mockBooking);

        // Check if strings are trimmed
        expect(result.contact.fullName).toBe("John Doe");
        expect(result.contact.phoneNumber).toBe("+1234567890");
        expect(result.contact.emailAddress).toBe("john@example.com");
        expect(result.booking.productName).toBe("Test Tour");
        expect(result.booking.supplierReference).toBe("REF123");
    });

    // Test handling of missing contact methods
    test('should accept booking with email but no phone', () => {
        const mockBooking = {
            contact: {
                fullName: "John Doe",
                phoneNumber: null,
                emailAddress: "john@example.com",
                country: "IE"
            },
            product: {
                internalName: "Test Tour"
            },
            availability: {
                localDateTimeStart: "2024-12-30T09:30:00+00:00"
            },
            utcConfirmedAt: "2024-12-29T15:00:00Z",
            supplierReference: "REF123"
        } as VentrataBooking;

        expect(() => ventrataBookingCleaner(mockBooking)).not.toThrow();
    });

    // Test error handling
    test('should throw error when required fields are missing', () => {
        const invalidBooking = {
            contact: {
                fullName: "",  // Empty name
                phoneNumber: null,
                emailAddress: null,  // No contact method
                country: "IE"
            },
            product: {
                internalName: "Test Tour"
            },
            availability: {
                localDateTimeStart: "2024-12-30T09:30:00+00:00"
            },
            utcConfirmedAt: "2024-12-29T15:00:00Z",
            supplierReference: "REF123"
        } as VentrataBooking;

        expect(() => ventrataBookingCleaner(invalidBooking)).toThrow();
    });
});