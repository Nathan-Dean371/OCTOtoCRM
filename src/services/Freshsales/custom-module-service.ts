// src/services/freshsales/freshsales-custom-module-service.ts
import axios from 'axios';
import { FreshsalesAuthService } from './freshsales-auth';
import { FreshsalesCustomRecord } from '../../types/Freshsales';

export class FreshsalesCustomModuleService {
    private readonly authService: FreshsalesAuthService;
    private readonly entityName: string;
    
    constructor(config: { apiKey?: string; domain?: string; entityName: string }) {
        this.authService = new FreshsalesAuthService({
            apiKey: config.apiKey || process.env.FRESHSALES_API_KEY || '',
            domain: config.domain || process.env.FRESHSALES_DOMAIN || ''
        });
        this.entityName = config.entityName;
    }
    
    /**
     * Creates a new record in the custom module
     */
    async createRecord(recordData: any) : Promise<any> {
        try {
            const response = await axios.post(
                `${this.authService.getBaseUrl()}/custom_module/${this.entityName}`,
                { [this.entityName]: recordData },
                { headers: this.authService.getAuthHeaders() }
            );
            
            return response.data[this.entityName];
        } catch (error) {
            console.error(`Error creating record in ${this.entityName}:`, error);
            throw error;
        }
    }
    
    /**
     * Updates an existing record in the custom module
     */
    async updateRecord(id: number, recordData: any) : Promise<any> {
        try {
            const response = await axios.put(
                `${this.authService.getBaseUrl()}/custom_module/${this.entityName}/${id}`,
                { [this.entityName]: recordData },
                { headers: this.authService.getAuthHeaders() }
            );
            
            return response.data[this.entityName];
        } catch (error) {
            console.error(`Error updating record ${id} in ${this.entityName}:`, error);
            throw error;
        }
    }
    
    /**
     * Finds a record by a specific field value
     * Note: This is a bit hacky as we need to get all records and filter client-side
     * You should implement more efficient filtering based on Freshsales API capabilities
     */
    async findRecordByField(fieldName: string, fieldValue: any) {
        try {
            // Get the "All" view of records
            const response = await axios.get(
                `${this.authService.getBaseUrl()}/custom_module/${this.entityName}/view/1`,
                { headers: this.authService.getAuthHeaders() }
            );
            
            const records = response.data[this.entityName] || [];
            
            // For custom fields, we need to check inside the custom_field object
            if (fieldName.startsWith('cf_')) {
                return records.find(record => 
                    record.custom_field && record.custom_field[fieldName] === fieldValue
                ) || null;
            }
            
            // For standard fields, check the record directly
            return records.find(record => record[fieldName] === fieldValue) || null;
        } catch (error) {
            console.error(`Error finding record by ${fieldName} in ${this.entityName}:`, error);
            throw error;
        }
    }
    
    /**
     * Gets a record by ID
     */
    async getRecord(id: number) {
        try {
            const response = await axios.get(
                `${this.authService.getBaseUrl()}/custom_module/${this.entityName}/${id}`,
                { headers: this.authService.getAuthHeaders() }
            );
            
            return response.data[this.entityName];
        } catch (error) {
            console.error(`Error getting record ${id} from ${this.entityName}:`, error);
            throw error;
        }
    }
}