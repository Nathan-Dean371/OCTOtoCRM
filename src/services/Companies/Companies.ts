import prismaClientInstance from "../database/databaseConnector";


export async function GetCompanyName(companyId: string): Promise<string> 
{   
    let companyName = "";

    //Use the companyId to get the company name
    await prismaClientInstance.companies.findUnique({where : {id : companyId}})
    .then((company) => 
        { 
            console.log("Company: ", company);
            if(company === null) throw new Error('Company not found');
            companyName = company.name;
        })
        .catch((error) => { 
            console.error(error);
        });

    return companyName;
}   