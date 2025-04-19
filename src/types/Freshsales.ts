export interface FreshsalesContact {
    id: number;
    first_name?: string;
    last_name: string;
    email?: string;
    work_number?: string;
    mobile_number?: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        zipcode?: string;
        country?: string;
    };
    owner_id?: number;
    custom_field?: Record<string, any>;
}

export interface FreshsalesCustomRecord {
    id: number;
    name: string;
    owner_id?: number;
    custom_field?: Record<string, any>;
    created_at?: string;
    updated_at?: string;
}