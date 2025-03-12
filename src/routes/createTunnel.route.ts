import { Router, RequestHandler, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import prismaClientInstance  from "../services/database/databaseConnector";
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
    res.render('create-tunnel-configure-source', { title: 'Create Tunnel', user: req.user, tunnelId: req.params.tunnelId });
});

export default router;