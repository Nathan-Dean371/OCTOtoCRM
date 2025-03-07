import { UUID } from 'crypto';
import { DestinationConfig, SourceConfig, ZOHOConfig } from '../../types/tunnel';
import { v4 as uuidv4 } from 'uuid';
import  VentrataService  from '../ventrata/ventrata-service';

export function createTunnel(tunnelData : any)
{
    console.log(tunnelData);
        
        //Create webhook on Ventrata
        registerSubscription(tunnelData.api_key);


        //Create and test "source" end of the tunnel
        const sourceConfig: SourceConfig = 
        {
            "api_key": tunnelData.api_key,
            "api_url": "https://api.ventrata.com/octo",
            //Generate a subscriptionid using uuidv4
            "subscription_id": uuidv4()
        }

        //destination config - will be different for each CRM
        const zohoConfig : ZOHOConfig = 
        {
            "client_id": "",
            "client_secret": "",
            "refresh_token": "",
            "api_domain": "https://accounts.zoho.eu",
            "modules": 
            {
                "contacts": "Contacts",
                "bookings": "Ventrata_Bookings"
            }
        }

        //destination config
}

export function registerSubscription(ventrataApiKey : string)   
{
    //Register subscriber on Ventrata
    const ventrataService : VentrataService = new VentrataService(ventrataApiKey.api_key);
    const subscriberId : string =  ventrataService.registerSubscriber();

    //Step 1: Create subscriber
    //POST https://api.ventrata.com/octo/notifications/subcriptions to register a new subscriber


    



    //Step 2: Store the webhook id in the tunnel
    //Step 3: Test the webhook
}

export function generateWebhookUrl(tunnelId : UUID)
{
    
}