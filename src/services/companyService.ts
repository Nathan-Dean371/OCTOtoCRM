import { Prisma } from "@prisma/client";
import prismaClientInstance  from "../services/database/databaseConnector";
import { Company } from "../types/company";
import { companyStatus } from "../types/companyStatus";

export function inviteCompany()
{

}

//Takes in a company object, and tries to create a new company
export async function createCompany(company : Company)
{   
    try
    {
        let companyDBinput : Prisma.companiesCreateInput;
        companyDBinput = {
        name : company.name,
        website : company.website,
        primary_contact_phone : company.primary_contact_phone,
        primary_contact_email : company.primary_contact_email,
        company_status : "INVITED"

        }
        await prismaClientInstance.companies.create({data : companyDBinput})


    } catch (error)
    {
        console.error(error)
    }
}

