// src/controllers/webhook-controller.ts
import { WebhookEvent } from '../types/ventrata';
import { ventrataBookingCleaner } from '../utils/ventrataBookingCleaner';
import ZohoCRMService from '../services/zoho/zoho-crm-service';
import { ZohoVentrataBooking } from '../types/zoho';

const crmService = new ZohoCRMService();
export async function handleBookingWebhook(webhookEvent: WebhookEvent) {
    if (webhookEvent.booking?.status !== 'CONFIRMED') {
        return;
    }

    const { contact, booking } = ventrataBookingCleaner(webhookEvent.booking);

    try {
        // Find existing contact
        const existingContact = await crmService.findContactByEmail(contact.email);

        let contactId;
        if (existingContact) {
            contactId = existingContact.id;
        } else {
            const newContact = await crmService.createContact(contact);
            contactId = newContact.id;
        }

        const zohoBooking: Omit<ZohoVentrataBooking, 'id'> = {
            Booking_Ref: booking.supplierReference,
            Name: `Booking ${booking.supplierReference}`,
            Contact_Id: contactId,  // Changed from Contact object to just the ID
            Booking_Date: booking.bookingDate,
            Product: booking.productName,
            Travel_Date: booking.travelDate
        };

        await crmService.createBooking(zohoBooking);

    } catch (error) {
        console.error('Failed to process webhook:', error);
        throw error;
    }
}