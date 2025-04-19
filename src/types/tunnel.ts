export interface SourceConfig 
{
    "sourceType": string,
    "api_key": string,
    "api_url": string,
    "webhook_url": string
}

export interface DestinationConfig 
{
    "destinationType": string
}

export interface BitrixConfig extends DestinationConfig
{
    "client_id": string,
    "client_secret": string,
    "refresh_token": string,
    "portal_domain": string,
    "entity_type_id"?: string,  // ID of the custom SPA entity (optional until created)
    "api_endpoint"?: string,    // The REST API endpoint URL (will be populated after auth)
    "modules": {
        "contacts": string,     // Usually "CRM_CONTACT"
        "bookings": string      // Your custom SPA entity name
    }
}


export interface ZOHOConfig extends DestinationConfig
{
    "client_id": string,
    "client_secret":string,
    "refresh_token": string,
    "api_domain": string,
    "modules": {
        "contacts": string,
        "bookings": string
    }
}

export interface Tunnel 
{
    tunnelId: string,
    tunnelName: string,
    tunnelSource: string,
    tunnelDestination: string,
    sourceConfig: SourceConfig,
    destinationConfig: DestinationConfig
}

// src/types/tunnel.ts - Add to existing file
export interface FreshsalesConfig extends DestinationConfig {
    "destinationType": "freshsales",
    "api_key": string,
    "domain": string,  // Your Freshsales domain (without .freshsales.io)
    "modules": {
        "contacts": string,     // Usually "contacts"
        "bookings": string      // Usually "deals"
    }
}