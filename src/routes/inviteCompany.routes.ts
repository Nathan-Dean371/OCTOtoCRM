import { Router, RequestHandler, Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from "@prisma/client";
import prismaClientInstance  from "../services/database/databaseConnector";
import session from "express-session";
import { user } from "../types/users";

const router = Router();



const tryInviteCompany : RequestHandler
    = async (req : Request, res : Response) =>{
        //console.log(req)
        console.log("Request body: ", req.body)
    
        try
        {
            await prismaClientInstance.$transaction(async (tx) =>{
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

                    let userInvitationDBinput : Prisma.user_invitationsUncheckedCreateInput;
                    userInvitationDBinput = {
                        email : req.body.primaryContactEmail,
                        company_id  : companyID,
                        role : "MANAGER",
                        status : "PENDING",
                        invitation_token : uuidv4(),
                        expires_at : new Date(Date.now() + 24*60*60*1000), //24 hours from now
                        created_by_user_id : (req.user as any).id,
                        first_name : req.body.primaryContactFirstName,
                        last_name : req.body.primaryContactLastName
                    }   
                    let userInviteCreation = await prismaClientInstance.user_invitations.create({data : userInvitationDBinput})
                    if (userInviteCreation === null) throw new Error('User invitation creation failed');
                    
                    if(req.session)
                    {
                        req.session.inviteCompany = {
                            companyName : req.body.companyName
                        }
                        req.session.invitedManager = {
                            email : req.body.primaryContactEmail,
                            firstName : req.body.primaryContactFirstName,
                            lastName : req.body.primaryContactLastName
                        }
                    }
                    

                    res.redirect('/admin/invite/company/success');
                });
        }
            
        catch (error)
        {
            console.error(error)
            res.status(500).send("Error inviting company")
        }
};

router.post('/admin/company/invite', tryInviteCompany);

export default router;