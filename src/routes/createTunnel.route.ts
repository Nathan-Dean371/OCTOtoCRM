import { Router, RequestHandler, Request, Response } from "express";
import crypto from 'crypto';
import { CreateTunnel } from "../services/Tunnels/TunnelService";

const router = Router();

const tryCreateTunnel = async (req: Request, res: Response) => 
{    
    const tunnelData = req.body;
    CreateTunnel(tunnelData);

    
    //createTunnel(tunnelData);
}

router.post('/manager/dashboard/tunnels/create', tryCreateTunnel);


router.get('/manager/dashboard/tunnels/create/new/:tunnerlID/configureSetup/', (req: Request, res: Response) => {
    
     // Ensure CSRF token exists
    if (!req.session.csrfToken) 
    {
        req.session.csrfToken = crypto.randomBytes(16).toString('hex');
    }
    
    res.render('create-tunnel-configure-source', 
        { 
        title: 'Create Tunnel', 
        user: req.user,
        csrfToken: req.session.csrfToken
        });
});

export default router;