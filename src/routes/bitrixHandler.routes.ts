import { Router, RequestHandler, Request, Response } from "express";
import BitrixAuthService from "../services/Bitrix/Bitrix-auth";
import { generateBitrixEntityIfNeeded } from "../services/Bitrix/bitrixEntityService"
import prismaClientInstance from "../services/database/databaseConnector";
import { AppError } from "../middleware/errorHandler";
import { JsonValue } from "@prisma/client/runtime/library";
import { BitrixConfig } from "../types/tunnel";

const router = Router();

const handleBitrixCallback: RequestHandler = async (req: Request, res: Response) => {
    // Extract parameters from the query string
    const { code, state } = req.query;
    const tunnelId = state as string;

      // Validate required parameters
    if (!code || !tunnelId) {
        res.status(400).json({
            success: false,
            message: "Missing required parameters (code or state)"
        });
        return;
    }

    try {
        // Retrieve tunnel data from database
        const tunnel = await prismaClientInstance.tunnels.findUnique({
            where: { id: tunnelId }
        });

        if (!tunnel) {
            throw new AppError(404, "Tunnel not found");
        }

        // Safely parse JSON with error handling
        let parsedConfig: any;
        try {
        parsedConfig = JSON.parse(tunnel.destination_config as string || '{}');
        } catch (error) {
        throw new AppError(400, "Invalid tunnel configuration format");
        }
        
        // Validate and cast to BitrixConfig
        if (!isBitrixConfig(parsedConfig)) {
        throw new AppError(400, "Invalid Bitrix configuration structure");
        }
        
        // Parse with proper type checking
        const destinationConfig: BitrixConfig = parsedConfig;

        if (!destinationConfig || destinationConfig.destinationType !== "bitrix") {
        throw new AppError(400, "Invalid tunnel destination type");
    }
 
        // Create Bitrix auth service with tunnel config
        const bitrixAuth = new BitrixAuthService({
            clientId: destinationConfig.client_id,
            clientSecret: destinationConfig.client_secret,
            portalDomain: destinationConfig.portal_domain
        });

        // Exchange authorization code for tokens
        const tokenData = await bitrixAuth.authorizeWithCode(code as string);

        // Update tunnel with refresh token and API endpoint
        const updatedConfig = {
            ...destinationConfig,
            refresh_token: tokenData.refresh_token,
            api_endpoint: tokenData.client_endpoint
        };

        // Create the custom SPA entity if it doesn't exist yet
        if (!updatedConfig.entity_type_id) {
            const entityTypeId = await generateBitrixEntityIfNeeded(
                tokenData.access_token,
                tokenData.client_endpoint,
                "Tour Bookings"
            );
            
            updatedConfig.entity_type_id = entityTypeId;
        }

        // Save updated configuration to database
        await prismaClientInstance.tunnels.update({
            where: { id: tunnelId },
            data: {
                destination_config: JSON.stringify(updatedConfig),
                status: "ACTIVE"
            }
        });

        // Redirect user to success page
        res.redirect(`/manager/dashboard/tunnels/success?id=${tunnelId}`);
        
        
    }catch (error) {
        console.error("Error handling Bitrix callback:", error);
        
        // Update tunnel status to ERROR
        await prismaClientInstance.tunnels.update({
            where: { id: tunnelId },
            data: { status: "ERROR" }
        }).catch(err => {
            console.error("Failed to update tunnel status:", err);
        });

        // Redirect to error page
        res.redirect(`/manager/dashboard/tunnels/error`);
        
    }
};

// Define route for Bitrix OAuth callback
router.get('/api/bitrix/callback', handleBitrixCallback);
// Define route for handling Bitrix webhook events
router.post('/api/bitrix/:tunnelId/handler', async (req: Request, res: Response) => {
    const { tunnelId } = req.params;
    
    try {
        // Process Bitrix webhook event
        console.log(`Received Bitrix webhook for tunnel ${tunnelId}`);
        console.log('Webhook payload:', req.body);
        
        // TODO: Implement webhook processing logic
        
        res.status(200).json({
            success: true,
            message: "Webhook received"
        });
    } catch (error) {
        console.error(`Error processing Bitrix webhook for tunnel ${tunnelId}:`, error);
        res.status(500).json({
            success: false,
            message: "Error processing webhook"
        });
    }
});

function isBitrixConfig(obj: any): obj is BitrixConfig {
    return (
      obj &&
      typeof obj === 'object' &&
      obj.destinationType === 'bitrix' &&
      typeof obj.client_id === 'string' &&
      typeof obj.client_secret === 'string' &&
      typeof obj.portal_domain === 'string' &&
      (obj.refresh_token === undefined || typeof obj.refresh_token === 'string') &&
      (obj.entity_type_id === undefined || typeof obj.entity_type_id === 'string') &&
      (obj.api_endpoint === undefined || typeof obj.api_endpoint === 'string') &&
      obj.modules &&
      typeof obj.modules === 'object'
    );
  }

export default router;