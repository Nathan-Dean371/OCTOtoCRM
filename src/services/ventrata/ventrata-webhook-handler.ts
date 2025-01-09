import { WebhookEvent, VentrataBooking, CleanContact, CleanBooking } from '../../types/ventrata';
import { ZohoContact, ZohoVentrataBooking } from '../../types/zoho';
import ZohoCRMService from '../zoho/zoho-crm-service';

class VentrataWebhookHandler {
    private readonly zohoService: ZohoCRMService;

    constructor() {
        this.zohoService = new ZohoCRMService();
    }

    /**
     * Main handler for incoming Ventrata webhooks
     * Only processes confirmed bookings and creates/updates corresponding Zoho records
     */
    async handleWebhook(event: WebhookEvent): Promise<void> {
        try {
            console.log('Received webhook event:', {
                type: event.webhook.event,
                bookingStatus: event.booking?.status
            });

            // Only process booking_update events for confirmed bookings
            if (event.webhook.event !== 'booking_update' || event.booking?.status !== 'CONFIRMED') {
                console.log('Skipping webhook - not a confirmed booking update');
                return;
            }

            await this.processConfirmedBooking(event.booking);

        } catch (error) {
            console.error('Error processing webhook:', error);
            throw error;
        }
    }

    /**
     * Processes a confirmed booking by creating/updating contact and booking records in Zoho
     */
    private async processConfirmedBooking(booking: VentrataBooking): Promise<void> {
        console.log('Processing confirmed booking:', booking.uuid);

        // Step 1: Extract contact information from the booking
        const contactData = this.extractContactData(booking);

        // Step 2: Create or update the contact in Zoho
        const zohoContact = await this.zohoService.upsertContact({
            First_Name: contactData.First_Name,
            Last_Name: contactData.Last_Name,
            Email: contactData.email,
            Phone: contactData.phoneNumber,
            Country: contactData.country
        });

        console.log('Contact processed in Zoho:', {
            id: zohoContact.id,
            email: zohoContact.Email
        });

        // Step 3: Create the booking record in Zoho
        const bookingData = this.extractBookingData(booking);
        const zohoBooking = await this.zohoService.createBooking({
            Name: bookingData.productName,
            Booking_Ref: booking.uuid,
            Contact_Id: zohoContact.id,  // Link to the contact
            Booking_Date: booking.utcConfirmedAt,
            Product: bookingData.productName,
            Travel_Date: bookingData.travelDate
        });

        console.log('Booking created in Zoho:', {
            id: zohoBooking.id,
            ref: zohoBooking.Booking_Ref
        });
    }

    /**
     * Extracts and formats contact information from a Ventrata booking
     */
    private extractContactData(booking: VentrataBooking): CleanContact {
        const contact = booking.contact;

        return {
            fullName: contact.fullName,
            First_Name: contact.firstName || '',
            Last_Name: contact.lastName || contact.fullName.split(' ').pop() || 'Unknown',
            email: contact.emailAddress,
            phoneNumber: contact.phoneNumber,
            country: contact.country,
            supplierReference: booking.supplierReference
        };
    }

    /**
     * Extracts and formats booking information from a Ventrata booking
     */
    private extractBookingData(booking: VentrataBooking): CleanBooking {
        return {
            productName: booking.product.internalName || booking.productName,
            travelDate: booking.availability.localDateTimeStart,
            bookingDate: booking.utcConfirmedAt,
            supplierReference: booking.supplierReference
        };
    }
}

export default VentrataWebhookHandler;