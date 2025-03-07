export interface SourceConfig 
{
    "api_key": string,
    "api_url": string,
    "subscription_id": string
}

export interface DestinationConfig 
{
    
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