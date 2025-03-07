import { Router, RequestHandler, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import prismaClientInstance  from "../services/database/databaseConnector";

const router = Router();

const tryUpdateCompany : RequestHandler = async (req : Request, res : Response) =>
{
    //Get the company details from the request body
    const company : Prisma.companiesUpdateInput = {
        name : req.body.name,
        website : req.body.website,
        primary_contact_email : req.body.primary_contact_email,
        primary_contact_phone : req.body.primary_contact_phone
    };
    try
    {
        console.log('Updating company with id: ', req.params.id);
        const updatedCompany = await prismaClientInstance.companies.update({
            where : {
                id : req.params.id
            },
            data : company
            });

        if(req.xhr || req.headers.accept?.includes('application/json'))
        {
            res.status(200).json(
            {
                message : 'Company updated successfully',
                company : updatedCompany,
                success : true
            });
        } 
        else
        {
            res.redirect('/admin/dashboard/companies');
        } 
    }
    catch (error)
    {
        console.error('Error updating company: ', error);

        if(req.xhr || req.headers.accept?.includes('application/json'))
        {
            res.status(500).json(
            {
                success : false,
                message : 'Error updating company' + error
            });
        }
        else
        {
            res.redirect('/admin/dashboard/companies');
        }
    }
};

router.post('/admin/companies/:id', tryUpdateCompany);
export default router;