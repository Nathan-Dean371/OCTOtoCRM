interface VentrataBooking {
    id: string;
    uuid: string;
    testMode: boolean;
    alias: string | null;
    resellerReference: string;
    supplierReference: string;
    tags: string[];
    settlementMethod: 'VOUCHER' | 'DEFERRED';  // Add other methods if they exist
    status: 'REDEEMED' | 'CONFIRMED' | 'CANCELLED';  // Add other statuses as needed
    
    // Timestamps
    utcCreatedAt: string;
    utcUpdatedAt: string;
    utcExpiresAt: string | null;
    utcRedeemedAt: string | null;
    utcNoshowedAt: string | null;
    utcConfirmedAt: string | null;
    
    // Product information
    productId: string;
    optionId: string;
    
    // Booking properties
    cancellable: boolean;
    confirmable: boolean;
    freesale: false;
    
    // Related entities
    contact: VentrataContact;
    voucher: VoucherOrTicket;
    unitItems: VentrataUnitItem[];
    
    // Additional fields
    notes: string | null;
    deliveryMethods: string[];
}

interface VentrataContact {
    fullName: string;
    firstName: string;
    lastName: string;
    emailAddress: string | null;
    phoneNumber: string | null;
    locales: string[];
    streetAddress: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    country: string | null;
    notes: string | null;
    allowMarketing: boolean;
    taxId: string | null;
}

interface DeliveryOption {
    deliveryFormat: 'QRCODE' | 'PKPASS_URL' | 'PDF_URL';
    deliveryValue: string;
}

interface VoucherOrTicket {
    redemptionMethod: 'DIGITAL';  // Could be expanded if there are other methods
    utcRedeemedAt: string | null;
    utcNoshowedAt: string | null;
    deliveryOptions: DeliveryOption[];
}

interface VentrataUnitItem {
    id: string;
    uuid: string;
    alias: string | null;
    resellerReference: string;
    supplierReference: string;
    unitId: string;
    unitType: 'ADULT' | 'CHILD' | 'SENIOR' | 'STUDENT' | 'INFANT' | 'YOUTH';
    status: 'REDEEMED' | 'CONFIRMED' | 'CANCELLED';  // Add other statuses as needed
    
    // Timestamps
    utcRedeemedAt: string | null;
    utcNoshowedAt: string | null;
    
    // Related entities
    contact: VentrataContact;
    ticket: VoucherOrTicket;
}

export { VentrataBooking };