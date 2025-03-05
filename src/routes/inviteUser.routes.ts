import { Router, RequestHandler, Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from "@prisma/client";
import prismaClientInstance  from "../services/database/databaseConnector";
import session from "express-session";
import { UserToInvite } from "../types/users";
import { inviteUser } from "../services/Users/inviteUser";
import { GetCompanyName } from "../services/Companies/Companies";

const router = Router();

const tryInviteUser : RequestHandler = async ( req : Request, res : Response) => {
    
    if(!req.user)
        {
            console.error("User not logged in");
            res.redirect('/admin/invite/user/error');
            return;
        }
    const createdByUserID = req.user.id as string;

    console.log(req.body);
    ;

    let companyName = await GetCompanyName(req.body.companyId);
    console.log("Company name: ", companyName);

    let userToInvite : UserToInvite = {
        email : req.body.primaryContactEmail || req.body.email,
        first_name : req.body.primaryContactFirstName || req.body.firstName,
        last_name : req.body.primaryContactLastName || req.body.lastName,
        company_id : req.body.companyId,
        role : req.body.role 

    }

    await prismaClientInstance.$transaction(async (tx) =>
    {
        try
        {
            let userInvited = await inviteUser(userToInvite, createdByUserID, companyName);
            console.log("User invited: ", userInvited);
        } catch (error)
        {
            console.log("Redirect to error");
            res.redirect('/admin/invite/user/error');
            console.error("Error inviting user: ", error);
            
        }
        if(req.session)
            {
                req.session.invitedUser = {
                    email : req.body.email,
                    firstName : req.body.firstName,
                    lastName : req.body.lastName
                }
            }
        res.redirect('/admin/invite/user/success');
    });

    
}

router.post('/admin/invite/user', tryInviteUser);
export default router;
