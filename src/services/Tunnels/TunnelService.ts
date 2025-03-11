import { UUID } from 'crypto';
import { DestinationConfig, SourceConfig, ZOHOConfig } from '../../types/tunnel';
import { v4 as uuidv4 } from 'uuid';
import  VentrataService  from '../ventrata/ventrata-service';
import { Tunnel } from '../../types/tunnel';
import { VentrataAPIError } from '../../utils/errors';
import axios from 'axios';

export function CreateTunnel(tunnelData : any)
{
    console.log("Creating tunnel - in TunnelService");

        
        //Create webhook on Ventrata
        //registerSubscription(tunnelData.api_key);
        //Create tunnel object
        tunnelData.tunnelId = uuidv4();

        const tunnel : Tunnel =
        {
            tunnelId: tunnelData.tunnelId,
            tunnelName: tunnelData.tunnelName,
            tunnelSource: tunnelData.tunnelSource,
            tunnelDestination: tunnelData.tunnelDestination,
            sourceConfig: createSourceConfig(tunnelData),
            destinationConfig: createDestinationConfig(tunnelData)
        }

        console.log("Tunnel created: ", tunnel);
        TestTunnelConfig(tunnel);

        //destination config
}

function createDestinationConfig(tunnelData: any) : DestinationConfig{
    var destinationConfig: DestinationConfig;
    switch (tunnelData.tunnelDestination) {
        case "zoho":
            destinationConfig = createZohoDestination(tunnelData);
            return destinationConfig;
        default:
            throw new Error("Invalid destination");
    }
}

function createSourceConfig(tunnelData: any) : SourceConfig{
    var sourceConfig: SourceConfig;
    switch (tunnelData.tunnelSource) {
        case "ventrata":
            sourceConfig = createVentrataSource(tunnelData);
            return sourceConfig;
        default:
            throw new Error("Invalid source");
    }
}

export function registerSubscription(ventrataApiKey : string)   
{
    //Register subscriber on Ventrata
    const ventrataService : VentrataService = new VentrataService(ventrataApiKey);
    //const subscriberId : string =  ventrataService.registerSubscriber();

    //Step 1: Create subscriber
    //POST https://api.ventrata.com/octo/notifications/subcriptions to register a new subscriber
    //Step 2: Store the webhook id in the tunnel
    //Step 3: Test the webhook
}

export function generateWebhookUrl(tunnelId : UUID, req? : any) : string
{
  // First try to use request info if available
    if (req && req.protocol && req.get) {
        return `${req.protocol}://${req.get('host')}/webhook/${tunnelId}`;
    }
    
    // Fall back to environment variable
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/webhook/${tunnelId}`;
}

function createVentrataSource(tunnelData : any) : SourceConfig
{
    const sourceConfig: SourceConfig = 
    {
        "sourceType": "ventrata",
        "api_key": tunnelData.sourceAPIkey,
        "api_url": "https://api.ventrata.com/octo",
        "webhook_url": generateWebhookUrl(tunnelData.tunnelId)
    }

    return sourceConfig;
}

function createZohoDestination(tunnelData : any) : DestinationConfig
{
    const zohoConfig : ZOHOConfig = 
    {
        "destinationType": "zoho",
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

    return zohoConfig;
}

function TestTunnelConfig(tunnel : Tunnel)
{
    //Test the tunnel configuration
    //Step 1: Test the source configuration
    if(!TestSourceConfig(tunnel.sourceConfig))
    {
        throw new Error("Invalid source configuration");
    }
    //Step 2: Test the destination configuration

}

async function TestSourceConfig(sourceConfig : SourceConfig) : Promise<boolean>
{
    //Test the source configuration
    //Step 1: Test the api key
    //Step 2: Test the api url
    //Step 3: Test the subscription id
    switch(sourceConfig.sourceType)
    {
        case "ventrata":
            return await TestVentrataSource(sourceConfig);
        default:
            throw new Error("Invalid source");
    }
}

async function TestVentrataSource(sourceConfig : SourceConfig) : Promise<boolean>
{
    try
    {
        //Try to create a webhook to test the source configuration
        //Step 1: Create a webhook
        //Step 2: Test the webhook
        const ventrataService = new VentrataService(sourceConfig.api_key);
        // 3. Generate a webhook URL for testing
        // Use environment variable with fallback
        const baseUrl = process.env.API_BASE_URL || 'https://yourapp.example.com';
        const testWebhookId = crypto.randomUUID();
        const webhookUrl = sourceConfig.webhook_url || `${baseUrl}/api/${testWebhookId}/webhook`;
        // 4. Test webhook creation
        const webhookResult = await ventrataService.TryToCreateWebhook(webhookUrl);
        console.log("Webhook created: ", webhookResult);
        return true;
    } catch (error) 
    {
        console.error("Ventrata API test failed:", error);
        if (error instanceof VentrataAPIError) 
        {
            return false;
        }
        return false;
    }
}

async function TestDestinationConfig(destinationConfig : DestinationConfig) : Promise<boolean>
{
    //Test the destination configuration
    //Step 1: Test the client id
    //Step 2: Test the client secret
    //Step 3: Test the refresh token
    //Step 4: Test the api domain
    //Step 5: Test the modules
    switch(destinationConfig.destinationType)
    {
        case "zoho":
            return await TestZohoDestination(destinationConfig);
        default:
            throw new Error("Invalid destination");
    }
}
async function TestZohoDestination(destinationConfig : DestinationConfig) : Promise<boolean>
{
    try
    {

        //const zohoService = new zohoService(destinationConfig.client_id, destinationConfig.client_secret, destinationConfig.refresh_token);
        // 3. Test Zoho API connection
        //const testResult = await zohoService.TestConnection();
        return true;
    } catch (error) 
    {
        console.error("Zoho API test failed:", error);
        return false;
    }
}