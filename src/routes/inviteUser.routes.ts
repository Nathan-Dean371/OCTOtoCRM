import { Router, RequestHandler, Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from "@prisma/client";
import prismaClientInstance  from "../services/database/databaseConnector";
import session from "express-session";
import { UserToInvite } from "../types/users";
import { createUserInvitation, sendInvitationEmail } from "../services/Users/inviteUser";
import { GetCompanyName } from "../services/Companies/Companies";
import { DevEmailService } from "../services/email/devEmailService";

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

    try {
        // Step 1: Perform the database operation within a transaction
        let invitationToken: string | null = null;
        
        await prismaClientInstance.$transaction(async (tx) => {
            // Create the user invitation in the database
            invitationToken = await createUserInvitation(userToInvite, createdByUserID);
            
            if (!invitationToken) {
                throw new Error("Failed to create user invitation");
            }
        });

        // Step 2: Send the email outside the transaction
        if (invitationToken) {
            await sendInvitationEmail(userToInvite, companyName, invitationToken);
        }

        // Step 3: Update session and redirect
        if (req.session) {
            req.session.invitedUser = {
                email: req.body.email,
                firstName: req.body.firstName,
                lastName: req.body.lastName
            }
        }
        
        res.redirect('/admin/invite/user/success');
        
    } catch (error) {
        console.error("Error inviting user: ", error);
        res.redirect('/admin/invite/user/error');
    }
    
}

router.post('/admin/invite/user', tryInviteUser);
export default router;
