// Interface for a Zoho CRM Contact
export interface ZohoContact {
    id?: string;
    First_Name?: string;
    Last_Name: string;        // This is typically required in Zoho CRM
    Email?: string | null;
    Phone?: string | null;
    Mobile?: string | null;   // Added for mobile numbers
    Country?: string | null;
    Owner?: {                 // System field for record ownership
        id: string;
        name?: string;
    };
    Created_Time?: string;
    Modified_Time?: string;
    Ventrata_Bookings?: ZohoVentrataBooking[];  // One-to-Many relationship
}

// Interface for our custom Ventrata Booking object
export interface ZohoVentrataBooking {
    id?: string;           // Optional as it won't exist for new bookings
    Booking_Ref: string;   // From Ventrata supplierReference
    Name: string;          // Booking Name
    Contact_Id : string
    Option: string;        // From Ventrata option.internalName
    Booking_Date: string;  // From Ventrata utcConfirmedAt
    Product: string;       // From Ventrata product.internalName
    Travel_Date: string;   // From Ventrata availability.localDateTimeStart
    Owner?: {              // System field for record ownership
        id: string;
        name?: string;
    };
}

// Interface for the specific structure Zoho returns when creating/updating records
export interface ZohoApiResponseData {
    code: string;          // 'SUCCESS' or error code
    details: {
        id: string;
        // Other potential details...
    };
    message: string;       // 'record added' or error message
    status: string;        // 'success' or 'error'
}

// Update our API response interface
export interface ZohoApiResponse<T> {
    data: ZohoApiResponseData[];
    info?: {
        per_page: number;
        count: number;
        page: number;
        more_records: boolean;
    };
}