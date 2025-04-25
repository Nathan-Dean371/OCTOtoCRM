import { Router, RequestHandler, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import prismaClientInstance  from "../services/database/databaseConnector";
import { createUserInvitation, sendInvitationEmail } from "../services/Users/inviteUser";
import { UserToInvite, User } from "../types/users";
import { user_role } from "../types/userRoles";

const router = Router();

const tryInviteCompany : RequestHandler
    = async (req : Request, res : Response) =>{
        try
        {
            
                    let companyDBinput : Prisma.companiesCreateInput;
                    companyDBinput = {
                        name : req.body.companyName,
                        website : req.body.companyWebsite,
                        primary_contact_phone : req.body.primaryContactPhone,
                        primary_contact_email : req.body.primaryContactEmail,
                        company_status : "INVITED"
                    };
                    await prismaClientInstance.companies.create({data : companyDBinput})
                    //If company invite is successful, start to try and create a manager user for the company
                    console.log("logged in user id: ", (req.user as any).id)
                    //Get company ID 
                    let companyID : string;
                    companyID = await prismaClientInstance.companies.findFirst({where : {name : req.body.companyName}}).then((company) => {
                        if (company === null) throw new Error('Company not found');
                        return company.id;
                    })

                    const userToInvite : UserToInvite = {
                        company_id : companyID,
                        email : req.body.primaryContactEmail,
                        first_name : req.body.primaryContactFirstName,
                        last_name : req.body.primaryContactLastName,
                        role : user_role.MANAGER
                    }

                    const loggedInUser = req.user as User;
                    try {
                        // Step 1: Perform the database operation within a transaction
                        let invitationToken: string | null = null;
                        
                        await prismaClientInstance.$transaction(async (tx) => {
                            // Create the user invitation in the database
                            invitationToken = await createUserInvitation(userToInvite, req.body.user.id);
                            
                            if (!invitationToken) {
                                throw new Error("Failed to create user invitation");
                            }
                        });
                
                        // Step 2: Send the email outside the transaction
                        if (invitationToken) {
                            await sendInvitationEmail(userToInvite, req.body.companyName, invitationToken);
                        }
                
                        // Step 3: Update session and redirect
                        if (req.session) {
                            req.session.invitedUser = {
                                email: req.body.email,
                                firstName: req.body.firstName,
                                lastName: req.body.lastName
                            }
                        }
                    }catch (error) {
                        console.error("Error inviting user: ", error);
                        res.redirect('/admin/invite/company/error');
                    }
                    
                    res.redirect('/admin/invite/company/success');
                }
            
        
            
        catch (error)
        {
            console.error(error)
            res.status(500).send("Error inviting company")
        }
};

router.post('/admin/company/invite', tryInviteCompany);

export default router;