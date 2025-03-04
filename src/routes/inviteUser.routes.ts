import { Router, RequestHandler, Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from "@prisma/client";
import prismaClientInstance  from "../services/database/databaseConnector";
import session from "express-session";
import { user } from "../types/users";

const router = Router();

const tryInviteUser : RequestHandler = async ( req : Request, res : Response) => {
    console.log(req.body);
    try
    {
        await prismaClientInstance.$transaction(async (tx) =>
        {
            let userInvitationDBinput : Prisma.user_invitationsUncheckedCreateInput;
                    userInvitationDBinput = {
                        email : req.body.email,
                        company_id  : req.body.company,
                        role : req.body.role,
                        status : "PENDING",
                        invitation_token : uuidv4(),
                        expires_at : new Date(Date.now() + 24*60*60*1000), //24 hours from now
                        created_by_user_id : (req.user as any).id,
                        first_name : req.body.firstName,
                        last_name : req.body.lastName
                    } 
            let userInviteCreation = await prismaClientInstance.user_invitations.create({data : userInvitationDBinput})
            if (userInviteCreation === null) throw new Error('User invitation creation failed');        
        });

        res.redirect('/admin/invite/user/success');
    }
    catch(error)
    {
        console.error(error);
    }
}

router.post('/admin/invite/user', tryInviteUser);
export default router;
