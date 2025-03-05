import { Router, RequestHandler, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import prismaClientInstance  from "../services/database/databaseConnector";
import { inviteUser } from "../services/Users/inviteUser";
import { UserToInvite, User } from "../types/users";
import { userRole } from "../types/userRoles";

const router = Router();



const tryInviteCompany : RequestHandler
    = async (req : Request, res : Response) =>{
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

                    const userToInvite : UserToInvite = {
                        company_id : companyID,
                        email : req.body.primaryContactEmail,
                        first_name : req.body.primaryContactFirstName,
                        last_name : req.body.primaryContactLastName,
                        role : userRole.MANAGER
                    }

                    const loggedInUser = req.user as User;
                    await inviteUser(userToInvite, loggedInUser.id, req.body.companyName);
                    
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