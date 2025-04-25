
import { PrismaClient } from '@prisma/client';
import { User } from '../../types/users';
import { user_role } from '../../types/userRoles';

const prismaClientInstance : PrismaClient = new PrismaClient();

export async function connectToDatabase()
{
    try 
    {
        await prismaClientInstance.$connect();
        console.log('Successfully connected to database');
        return 'Successfully connected to database';
    } 
    catch (error) 
    {
        console.error('Failed to connect to database:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return errorMessage;
    } 
    finally 
    {
        await prismaClientInstance.$disconnect();
    }
}

export async function getUserDetails(email : string)
{
    try 
    {
        
        const userFromDb  = await prismaClientInstance.users.findFirst({
            where: {
                email: email
            }
        });
        
        //console.log('User from db - in databaseConnector: ', userFromDb);

        if(!userFromDb)
            return;

        const companyNameFromDb = await prismaClientInstance.$queryRaw<Array<{ name: string}>>`SELECT name FROM companies WHERE id = uuid(${userFromDb.company_id}) LIMIT 1`;
        const companyName = companyNameFromDb[0].name;

        if(userFromDb)
        {
            const user : User = {
                id : userFromDb.id,
                company_id : userFromDb.company_id,
                company_name : companyName,
                email : userFromDb.email,
                first_name : userFromDb.first_name,
                last_name : userFromDb.last_name,
                role : user_role[userFromDb.role as keyof typeof user_role]
            };

            return user;
        }
    } 
    catch (error) 
    {
        console.error('Failed to get user details:', error);
        return null;
    } 
    finally 
    {
        await prismaClientInstance.$disconnect();
    }
}

export default prismaClientInstance;