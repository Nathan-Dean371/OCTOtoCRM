// src/services/freshsales/freshsales-webhook-handler.ts
import { WebhookEvent } from '../../types/ventrata';
import { ventrataBookingCleaner } from '../../utils/ventrataBookingCleaner';
import { FreshsalesContactService } from './freshsales-contact-service';
import { FreshsalesCustomModuleService } from './custom-module-service';
import { FreshsalesConfig } from '../../types/tunnel';

export class FreshsalesWebhookHandler {
    private readonly contactService: FreshsalesContactService;
    private readonly bookingService: FreshsalesCustomModuleService;
    
    constructor(config: FreshsalesConfig) {
        // Initialize services
        this.contactService = new FreshsalesContactService({
            apiKey: config.api_key,
            domain: config.domain
        });
        
        this.bookingService = new FreshsalesCustomModuleService({
            apiKey: config.api_key,
            domain: config.domain,
            entityName: config.modules.bookings // This would be your custom module entity name like "cm_ventrata_booking"
        });
    }
    
    /**
     * Main handler for Ventrata webhook events
     */
    async handleWebhook(event: WebhookEvent): Promise<void> {
        try {
            // Only process confirmed bookings
            if (event.webhook.event !== 'booking_update' || event.booking?.status !== 'CONFIRMED') {
                console.log('Skipping webhook - not a confirmed booking update');
                return;
            }
            
            // Clean and transform the booking data
            const { contact, booking } = ventrataBookingCleaner(event.booking);
            
            // Process the contact and booking
            await this.processBooking(contact, booking);
            
        } catch (error) {
            console.error('Error processing webhook for Freshsales:', error);
            throw error;
        }
    }
    
    /**
     * Process contact and booking data
     */
    private async processBooking(contactData: any, bookingData: any): Promise<void> {
        try {
            // Step 1: Process contact
            const freshsalesContact = await this.processContact(contactData);
            
            // Step 2: Check if booking already exists
            const existingBooking = await this.bookingService.findRecordByField(
                'cf_supplier_reference',
                bookingData.supplierReference
            );
            
            if (existingBooking) {
                // Update existing booking
                await this.updateBooking(existingBooking.id, bookingData, freshsalesContact.id);
                console.log(`Updated existing booking ${existingBooking.id}`);
            } else {
                // Create new booking
                const newBooking = await this.createBooking(bookingData, freshsalesContact.id);
                console.log(`Created new booking ${newBooking.id}`);
            }
        } catch (error) {
            console.error('Error processing booking:', error);
            throw error;
        }
    }
    
    /**
     * Process contact information
     */
    private async processContact(contactData: any) {
        const freshsalesContactData = {
            first_name: contactData.First_Name || '',
            last_name: contactData.Last_Name || 'Unknown',
            email: contactData.email,
            work_number: contactData.phoneNumber,
            address: {
                country: contactData.country
            }
        };
        
        return await this.contactService.findOrCreateContact(freshsalesContactData);
    }
    
    /**
     * Create a new booking record
     */
    private async createBooking(bookingData: any, contactId: number) {
        const bookingRecord = {
            name: `Booking ${bookingData.supplierReference}`, // The main "name" field
            owner_id: null, // Set if needed
            custom_field: {
                cf_product_name: bookingData.productName,
                cf_contact: contactId,
                cf_travel_date: this.formatDate(bookingData.travelDate),
                cf_booking_date: this.formatDate(bookingData.bookingDate),
                cf_supplier_reference: bookingData.supplierReference
                // Add more custom fields as needed
            }
        };
        
        return await this.bookingService.createRecord(bookingRecord);
    }
    
    /**
     * Update an existing booking record
     */
    private async updateBooking(bookingId: number, bookingData: any, contactId: number) {
        const bookingRecord = {
            custom_field: {
                cf_product_name: bookingData.productName,
                cf_contact: contactId,
                cf_travel_date: this.formatDate(bookingData.travelDate),
                cf_booking_date: this.formatDate(bookingData.bookingDate),
                cf_supplier_reference: bookingData.supplierReference
                // Add more custom fields as needed
            }
        };
        
        return await this.bookingService.updateRecord(bookingId, bookingRecord);
    }
    
    /**
     * Format date for Freshsales API
     */
    private formatDate(dateString: string | null | undefined): string | null | undefined {
        if (!dateString) return undefined;
        
        try {
          const date = new Date(dateString);
          return date.toISOString().split('T')[0];
        } catch (error) {
          console.error('Error formatting date:', error);
          return undefined;
        }
      }
}