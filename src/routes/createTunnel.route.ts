import { Router, RequestHandler, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import prismaClientInstance  from "../services/database/databaseConnector";
import { createTunnel } from "../services/Tunnels/TunnelService";

const router = Router();

const tryCreateTunnel = async (req: Request, res: Response) => 
{    
    const tunnelData = req.body;
    createTunnel(tunnelData);
}

router.post('/manager/tunnel/create', tryCreateTunnel);

export default router;