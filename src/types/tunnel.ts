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

