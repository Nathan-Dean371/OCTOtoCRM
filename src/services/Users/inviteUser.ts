import { Prisma } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid';
import { Request } from "express";
import prismaClientInstance from "../database/databaseConnector";
import { DevEmailService } from "../../services/email/devEmailService";
import { UserToInvite } from "../../types/users";

export async function inviteUser(user : UserToInvite, createdByUserID : string, companyName : string)
{
    try
    {
        let userInvitationDBinput : Prisma.user_invitationsUncheckedCreateInput;
            userInvitationDBinput = {
                email : user.email,
                company_id  : user.company_id,
                role : "MANAGER",
                status : "PENDING",
                invitation_token : uuidv4(),
                expires_at : new Date(Date.now() + 24*60*60*1000), //24 hours from now
                created_by_user_id : createdByUserID,
                first_name :user.first_name,
                last_name : user.last_name
            }  

        let userInviteCreation = await prismaClientInstance.user_invitations.create({data : userInvitationDBinput})
        if (userInviteCreation === null) throw new Error('User invitation creation failed');

        // Send invitation email
        const emailService = new DevEmailService();
        const emailResult = await emailService.sendUserInvite({
            email : userInvitationDBinput.email,
            firstName : userInvitationDBinput.first_name,
            lastName : userInvitationDBinput.last_name,
            invitationToken : userInvitationDBinput.invitation_token,
            companyName : companyName,
            expiresAt : userInvitationDBinput.expires_at as Date
        });

        
        console.log("Preview email at:", emailResult.previewUrl)
        return true;
        
    } catch (error)
    {
        console.error("Error inviting user - invite service: ", error)
        return false;
    }
}