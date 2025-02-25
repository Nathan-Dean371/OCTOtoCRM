import prismaClientInstance  from "../services/database/databaseConnector";
import { loginDetails } from "../types/users"; 
import bcrypt from 'bcrypt';



export async function checkLoginDetails(loginDetails: loginDetails): Promise<boolean>
{
    try
    {
        let email = loginDetails.email;
        console.log(email);
        
        //Check if the user exists in the database
        const user = await prismaClientInstance.users.findMany({
            where: {
                email: email,  
            },
        });

        if(user.length == 0)
        {
            return false;
        }

        //Compare the password
        const password = loginDetails.password;
        const hash = user[0].hashed_password;
        const result = await bcrypt.compare(password, hash);

        if(result)
        {
            return true;
        }
        return false;
    } catch (error)
    {
        console.error("Error during login verification:", error);
        return false;
    }
    
}