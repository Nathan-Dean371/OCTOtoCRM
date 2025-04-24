import { UUID } from 'crypto';
import { DestinationConfig, SourceConfig, ZOHOConfig, BitrixConfig } from '../../types/tunnel';
import { v4 as uuidv4 } from 'uuid';
import  VentrataService  from '../ventrata/ventrata-service';
import { Tunnel } from '../../types/tunnel';
import { VentrataAPIError } from '../../utils/errors';
import  BitrixAuthService  from '../Bitrix/Bitrix-auth';
import axios from 'axios';
import { FreshsalesAuthService } from '../Freshsales/freshsales-auth';
import { FreshsalesConfig } from '../../types/tunnel';

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



function CreateBitrixDestination(tunnelData : any) : DestinationConfig
{
    const bitrixConfig: BitrixConfig = {
        "destinationType": "bitrix",
        "client_id": tunnelData.bitrix_client_id,
        "client_secret": tunnelData.bitrix_client_secret,
        "refresh_token": tunnelData.bitrix_refresh_token || "",  // May be empty initially
        "portal_domain": tunnelData.bitrix_portal_domain,
        "modules": {
            "contacts": "CRM_CONTACT",
            "bookings": "Tour_Bookings"  // The name you'll give your SPA
        }
    };

    return bitrixConfig;
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

export function generateWebhookUrl(tunnelId : string, req? : any) : string
{
  // First try to use request info if available
    if (req && req.protocol && req.get) {
        return `${req.protocol}://${req.get('host')}/webhook/${tunnelId}`;
    }
    
    // Fall back to environment variable
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/api/${tunnelId}/webhook`;
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
    if(!TestDestinationConfig(tunnel.destinationConfig))
    {
        throw new Error("Invalid destination configuration");
    }

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
        // Delete the webhook
        const deleteWebhookResult = await ventrataService.TryToDeleteWebhook(webhookResult.id);

        if(deleteWebhookResult == 200)
            return true;
        else
            return false;
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
            break;
        case "bitrix":
            return await TestBitrixDestination(destinationConfig as BitrixConfig);
            break;
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

async function TestBitrixDestination(destinationConfig : BitrixConfig) : Promise<boolean>
{
    try {
        console.log("Testing Bitrix destination configuration");
        
        // Create the auth service using configuration
        const bitrixAuth = new BitrixAuthService({
            clientId: destinationConfig.client_id,
            clientSecret: destinationConfig.client_secret,
            refreshToken: destinationConfig.refresh_token,
            portalDomain: destinationConfig.portal_domain
        });
        
        // Test authentication by getting an access token
        const accessToken = await bitrixAuth.getAccessToken();
        
        // If we have an entity_type_id, verify it exists
        if (destinationConfig.entity_type_id) {
            const apiEndpoint = await bitrixAuth.getPortalEndpoint();
            
            // Test entity type existence
            const response = await axios.post(`${apiEndpoint}crm.type.get`, {
                auth: accessToken,
                id: destinationConfig.entity_type_id
            });
            
            if (!response.data.result) {
                console.log("Bitrix entity type not found:", destinationConfig.entity_type_id);
                return false;
            }
            
            console.log("Bitrix entity type verified:", response.data.result.title);
        }
        
        console.log("Bitrix destination configuration is valid");
        return true;
        
    } catch (error) {
        console.error("Bitrix destination test failed:", error);
        if (axios.isAxiosError(error)) {
            console.error("API response:", error.response?.data);
        }
        return false;
    }
}

export async function testVentrataAPIKey(apiKey: string): Promise<boolean> {
    if (!apiKey || apiKey.trim() === '') {
        return false;
    }
    
    try {
        // Create a temporary Ventrata service instance with the provided key
        const ventrataService = new VentrataService(apiKey);
        
        // Try to make a simple request (get suppliers list)
        // This will throw an error if the API key is invalid
        await axios.get('https://api.ventrata.com/octo/suppliers', {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Octo-Capabilities': '' // Empty capabilities for a simple test
            }
        });
        
        // If we got here, the request was successful
        return true;
    } catch (error) {
        console.error('Error testing Ventrata API key:', error);
        
        // Check if the error is specifically an authentication error
        if (axios.isAxiosError(error) && error.response) {
            // 401 Unauthorized or 403 Forbidden indicate an invalid API key
            if (error.response.status === 401 || error.response.status === 403) {
                return false;
            }
        }
        
        // For any other type of error, we'll consider the test as failed
        return false;
    }
}

export async function testFreshsalesAPIKey(apiKey: string, domain: string): Promise<boolean> {
    if (!apiKey || apiKey.trim() === '' || !domain || domain.trim() === '') {
        return false;
    }
    
    try {
        // Create a temporary Freshsales service instance with the provided credentials
        const freshsalesAuth = new FreshsalesAuthService({
            apiKey,
            domain
        });
        
        // Test the connection
        return await freshsalesAuth.testConnection();
    } catch (error) {
        console.error('Error testing Freshsales API credentials:', error);
        return false;
    }
}

// Add Freshsales destination config creator
function createFreshsalesDestination(tunnelData: any): DestinationConfig {
    const freshsalesConfig: FreshsalesConfig = {
        destinationType: "freshsales",
        api_key: tunnelData.freshsales_api_key,
        domain: tunnelData.freshsales_domain,
        modules: {
            contacts: "contacts",
            bookings: tunnelData.freshsales_module_name || "cm_ventrata_booking"
        }
    };

    return freshsalesConfig;
}

// Update createDestinationConfig to include Freshsales
function createDestinationConfig(tunnelData: any): DestinationConfig {
    var destinationConfig: DestinationConfig;
    switch (tunnelData.tunnelDestination) {
        case "zoho":
            destinationConfig = createZohoDestination(tunnelData);
            return destinationConfig;
        case "bitrix":
            destinationConfig = CreateBitrixDestination(tunnelData);
            return destinationConfig;
        case "freshsales":
            destinationConfig = createFreshsalesDestination(tunnelData);
            return destinationConfig;
        default:
            throw new Error("Invalid destination");
    }
}