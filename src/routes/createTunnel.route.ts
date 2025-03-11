import { Router, RequestHandler, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import prismaClientInstance  from "../services/database/databaseConnector";
import { CreateTunnel } from "../services/Tunnels/TunnelService";

const router = Router();

const tryCreateTunnel = async (req: Request, res: Response) => 
{    
    const tunnelData = req.body;

    console.log(tunnelData);
    CreateTunnel(tunnelData);

    
    //createTunnel(tunnelData);
}

router.post('/manager/dashboard/tunnels/create', tryCreateTunnel);

export default router;