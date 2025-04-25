import { Prisma } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid';
import { Request } from "express";
import prismaClientInstance from "../database/databaseConnector";
import { DevEmailService } from "../../services/email/devEmailService";
import { UserToInvite } from "../../types/users";

export async function createUserInvitation(user: UserToInvite, createdByUserID: string): Promise<string | null> {
    try {
        let userInvitationDBinput: Prisma.user_invitationsUncheckedCreateInput = {
            email: user.email,
            company_id: user.company_id,
            role: user.role,
            status: "PENDING",
            invitation_token: uuidv4(),
            expires_at: new Date(Date.now() + 24*60*60*1000), // 24 hours from now
            created_by_user_id: createdByUserID,
            first_name: user.first_name,
            last_name: user.last_name
        };  

        let userInviteCreation = await prismaClientInstance.user_invitations.create({data: userInvitationDBinput});
        if (userInviteCreation === null) throw new Error('User invitation creation failed');
        
        return userInvitationDBinput.invitation_token;
    } catch (error) {
        console.error("Error creating user invitation: ", error);
        return null;
    }
}


// Separate function to send invitation email
export async function sendInvitationEmail(user: UserToInvite, companyName: string, invitationToken: string): Promise<boolean> {
    try {
        const emailService = new DevEmailService();
        const emailResult = await emailService.sendUserInvite({
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            invitationToken: invitationToken,
            companyName: companyName,
            expiresAt: new Date(Date.now() + 24*60*60*1000)
        });
        
        console.log("Preview email at:", emailResult.previewUrl);
        return true;
    } catch (error) {
        console.error("Error sending invitation email: ", error);
        return false;
    }
}