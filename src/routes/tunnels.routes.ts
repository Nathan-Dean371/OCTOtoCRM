// src/routes/api/tunnels.routes.ts

import { Router, Request, Response } from "express";
import prismaClientInstance from "../services/database/databaseConnector";
import { testVentrataAPIKey, generateWebhookUrl } from "../services/Tunnels/TunnelService";
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import BitrixAuthService from "../services/Bitrix/Bitrix-auth";

const router = Router();

// Test Ventrata API key
router.post('/test-ventrata-key', async (req: Request, res: Response) => {
    // CSRF protection
    const sentToken = req.headers['x-csrf-token'];
    if (!sentToken || sentToken !== req.session.csrfToken) {
        res.status(403).json({
            success: false,
            message: 'Invalid CSRF token'
        });
    }
    
    const { apiKey } = req.body;
    
    if (!apiKey) {
        res.status(400).json({
            success: false,
            message: 'API key is required'
        });
    }
    
    try {
        const isValid = await testVentrataAPIKey(apiKey);
        
        if (isValid) {
            // Generate a step token for the next step
            const stepToken = crypto.randomBytes(32).toString('hex');
            
            // Store the step token in session
            req.session.tunnelSetup = {
                tunnelId: req.body.tunnelId || uuidv4(),
                currentStep: 1,
                stepToken,
                apiKeyValidated: true
            };
            
            res.json({
                success: true,
                message: 'API key is valid',
                tunnelId: req.session.tunnelSetup.tunnelId,
                stepToken
            });
        } else {
            res.json({
                success: false,
                message: 'Invalid API key'
            });
        }
    } catch (error) {
        console.error('Error testing Ventrata API key:', error);
        res.status(500).json({
            success: false,
            message: 'Error testing API key'
        });
    }
});

// Create a new tunnel (after validating API key)
router.post('/create', async (req: Request, res: Response) => {
    // CSRF protection
    const sentToken = req.headers['x-csrf-token'];
    if (!sentToken || sentToken !== req.session.csrfToken) {
        res.status(403).json({
            success: false,
            message: 'Invalid CSRF token'
        });
    }
    
    // Step token validation
    const { stepToken } = req.body;
    if (!stepToken || !req.session.tunnelSetup || stepToken !== req.session.tunnelSetup.stepToken) {
        res.status(403).json({
            success: false,
            message: 'Invalid step token'
        });
    }
    
    if(!req.session.tunnelSetup || !req.user)
    {
        throw new Error("Invalid session");
    }

    // Verify the correct step and API key validation
    if (req.session.tunnelSetup.currentStep !== 1 || !req.session.tunnelSetup.apiKeyValidated) {
        res.status(400).json({
            success: false,
            message: 'Invalid step sequence'
        });
    }
    
    const { tunnelName, sourceAPIkey } = req.body;
    const tunnelId = req.session.tunnelSetup.tunnelId;
    
    try {
        // Create pending tunnel in database
        await prismaClientInstance.tunnels.create({
            data: {
                id: tunnelId,
                name: tunnelName,
                source_type: 'ventrata',      // Updated to match your schema field name
                destination_type: 'bitrix24', // Updated to match your schema field name
                status: 'PENDING',
                setup_step: 1,                // Track the current setup step
                created_by: req.user.id,
                company_id: req.user.company_id, // Make sure to include company_id
                source_config: 
                {              // No JSON.stringify needed
                    sourceType: 'ventrata',
                    api_key: sourceAPIkey,
                    api_url: 'https://api.ventrata.com/octo',
                    webhook_url: generateWebhookUrl(tunnelId, req)
                },
                destination_config: {},       // Empty object for now, will be populated in step 2
                field_mappings: {},           // Empty object for default field mappings
                webhook_url: generateWebhookUrl(tunnelId, req) // Set the webhook_url field directly
            }
        });
        
        // Generate a new step token for the next step
        const newStepToken = crypto.randomBytes(32).toString('hex');
        
        // Update session
        req.session.tunnelSetup = {
            ...req.session.tunnelSetup,
            currentStep: 2,
            stepToken: newStepToken
        };
        
        res.json({
            success: true,
            tunnelId,
            stepToken: newStepToken
        });
    } catch (error) {
        console.error('Error creating tunnel:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating tunnel'
        });
    }
});

router.post('/:tunnelId/update-bitrix', async (req: Request, res: Response) => {
    // CSRF protection

    if(!req.session.tunnelSetup || !req.user)
    {
        throw new Error("Invalid session");
    }

    const sentToken = req.headers['x-csrf-token'];
    if (!sentToken || sentToken !== req.session.csrfToken) {
        res.status(403).json({
            success: false,
            message: 'Invalid CSRF token'
        });
    }
    
    // Step token validation
    const { stepToken } = req.body;
    if (!stepToken || !req.session.tunnelSetup || stepToken !== req.session.tunnelSetup.stepToken) {
        res.status(403).json({
            success: false,
            message: 'Invalid step token'
        });
    }
    
    // Verify the correct step
    if (req.session.tunnelSetup.currentStep !== 2) {
        res.status(400).json({
            success: false,
            message: 'Invalid step sequence'
        });
    }
    
    const { tunnelId } = req.params;
    const { portalDomain, clientId, clientSecret } = req.body;
    
    // Validate inputs
    if (!portalDomain || !clientId || !clientSecret) {
        res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }
    
    // Domain format validation
    if (!/^[a-zA-Z0-9][-a-zA-Z0-9.]*\.[a-zA-Z0-9][-a-zA-Z0-9.]*$/.test(portalDomain)) {
        res.status(400).json({
            success: false,
            message: 'Invalid portal domain format'
        });
    }
    
    try {
        // Check if tunnel exists and belongs to current user
        const tunnel = await prismaClientInstance.tunnels.findUnique({
            where: { 
                id: tunnelId,
                created_by: req.user.id,
                setup_step: 1  // Must be at step 1 to proceed to step 2
            }
        });
        
        if (!tunnel) {
            res.status(404).json({
                success: false,
                message: 'Tunnel not found or access denied'
            });
        }
        
        // Update tunnel in database
        await prismaClientInstance.tunnels.update({
            where: { id: tunnelId },
            data: {
                setup_step: 2,
                destination_config: JSON.stringify({
                    destinationType: 'bitrix',
                    client_id: clientId,
                    client_secret: clientSecret,
                    portal_domain: portalDomain,
                    modules: {
                        contacts: 'CRM_CONTACT',
                        bookings: 'Tour_Bookings'
                    }
                })
            }
        });
        
        // Generate a new step token for the next step
        const newStepToken = crypto.randomBytes(32).toString('hex');
        
        // Update session
        req.session.tunnelSetup = {
            ...req.session.tunnelSetup,
            currentStep: 3,
            stepToken: newStepToken
        };
        
        // Get Bitrix24 authorization URL
        const bitrixAuthService = new BitrixAuthService({
            clientId,
            clientSecret,
            portalDomain
        });
        
        const authUrl = bitrixAuthService.getAuthorizationUrl(tunnelId);
        
        res.json({
            success: true,
            authUrl,
            stepToken: newStepToken
        });
    } catch (error) {
        console.error('Error updating Bitrix configuration:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating Bitrix configuration'
        });
    }
});

export default router;