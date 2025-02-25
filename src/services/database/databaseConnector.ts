
import { PrismaClient } from '@prisma/client';

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

        const user = await prismaClientInstance.users.findFirst({
            where: {
                email: email,
            },
        });
        return user;
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