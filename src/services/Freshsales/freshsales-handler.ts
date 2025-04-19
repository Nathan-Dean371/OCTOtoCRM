// src/services/freshsales/freshsales-handler.ts
import { WebhookEvent } from '../../types/ventrata';
import { ventrataBookingCleaner } from '../../utils/ventrataBookingCleaner';
import { FreshsalesCustomModuleService } from './custom-module-service';

export class FreshsalesHandler {
  private readonly apiKey: string;
  private readonly domain: string;
  private readonly moduleService: FreshsalesCustomModuleService;
  
  constructor(config: { apiKey: string; domain: string }) {
    this.apiKey = config.apiKey;
    this.domain = config.domain;
    
    // Create the custom module service
    this.moduleService = new FreshsalesCustomModuleService({
      apiKey: this.apiKey,
      domain: this.domain,
      entityName: 'cm_tour_booking' // Replace with your actual entity name
    });
  }
  
  async handleBookingWebhook(event: WebhookEvent) {
    if (event.booking?.status !== 'CONFIRMED') {
      return;
    }
    
    const { contact, booking } = ventrataBookingCleaner(event.booking);
    
    // Step 1: Find or create contact
    let freshsalesContact = await this.findOrCreateContact(contact);
    
    // Step 2: Find or create booking
    await this.createOrUpdateBooking(booking, freshsalesContact.id);
  }
  
  private async findOrCreateContact(contactData: any) {
    // Implementation of contact handling logic
    // ...
  }
  
  private async createOrUpdateBooking(bookingData: any, contactId: string) {
    try {
      // Check if booking already exists using the supplier reference
      const existingBooking = await this.moduleService.findRecordByField(
        'cf_supplier_reference',
        bookingData.supplierReference
      );
      
      if (existingBooking) {
        // Update logic would go here
        console.log('Booking already exists, would update here');
        return existingBooking;
      }
      
      // Create new booking
      const bookingRecord = {
        name: bookingData.supplierReference, // Booking Reference field (primary field)
        owner_id: null, // Can be set if needed
        custom_field: {
          cf_product_name: bookingData.productName,
          cf_contact: contactId,
          cf_travel_date: bookingData.travelDate,
          cf_booking_date: bookingData.bookingDate,
          cf_supplier_reference: bookingData.supplierReference
        }
      };
      
      const createdBooking = await this.moduleService.createRecord(bookingRecord);
      console.log('Created new booking:', createdBooking.id);
      
      return createdBooking;
    } catch (error) {
      console.error('Error creating/updating booking:', error);
      throw error;
    }
  }
}