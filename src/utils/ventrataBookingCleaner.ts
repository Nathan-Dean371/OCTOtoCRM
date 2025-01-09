import { VentrataBooking, CleanContact, CleanBooking } from '../types/ventrata';

export function ventrataBookingCleaner(booking: VentrataBooking): { contact: CleanContact; booking: CleanBooking } 
{
     // Split the full name into first and last name
    const nameParts = booking.contact.fullName.split(' ');
     const lastName = nameParts.pop() || ''; // Get last word as last name
     const firstName = nameParts.join(' '); // Rest is first name


    //Required fields
    // 1. Contact full name
    // 2. Contact phone number or email address
    // 3. Contact supplier reference

    // 4. Booking product name
    // 5. Booking travel date
    // 6. Booking booking date
    // 7. Booking supplier reference

    //Validate the required fields
    if (!booking.contact.fullName) {
        throw new Error('Contact full name is required');
    }
    if (!booking.contact.phoneNumber && !booking.contact.emailAddress) {
        throw new Error('Contact phone number or email address is required');
    }
    if (!booking.product.internalName) {
        throw new Error('Booking product name is required');
    }
    if (!booking.availability.localDateTimeStart) {
        throw new Error('Booking travel date is required');
    }
    if (!booking.utcConfirmedAt) {
        throw new Error('Booking booking date is required');
    }
    if (!booking.supplierReference) {
        throw new Error('Booking supplier reference is required');
    }

    const cleanContact: CleanContact = {
        fullName: booking.contact.fullName,

        First_Name: firstName,
        Last_Name: lastName, // Required
        email: booking.contact.emailAddress,
        phoneNumber: booking.contact.phoneNumber,
        country: booking.contact.country,
        supplierReference: booking.supplierReference
    };

    let cleanBooking : CleanBooking = {
        productName: safeTrim(booking.product.internalName) ?? '',
        travelDate: booking.availability.localDateTimeStart,
        bookingDate: booking.utcConfirmedAt,
        supplierReference: safeTrim(booking.supplierReference) ?? ''
    };

    return {contact: cleanContact, booking: cleanBooking};
}

function safeTrim(value: string | null ): string | null {
    if (!value) return value;  // Returns null/undefined as is
    return value.trim();
}