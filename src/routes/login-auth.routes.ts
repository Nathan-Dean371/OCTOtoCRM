import { Router, RequestHandler } from "express";
import { checkLoginDetails } from '../utils/userAuth';  
import { createJWTtoken } from '../utils/JWT-generator';
import { getUserDetails } from '../services/database/databaseConnector';



const router = Router();

const tryToLoginUser: RequestHandler = async (req, res, next): Promise<void> => {
    const { email, password } = req.body;
    
    if (!email || !password) 
    {
        res.status(400).json({
        success: false,
        message: "Email and password are required",
    });
    return;
    }

    try 
    {
        const isValid = await checkLoginDetails({ email, password });
        if (isValid) 
        {
            // Generate a JWT token and send it back to the user
            const token = createJWTtoken(email);

            res.cookie('auth-token', token, { httpOnly: true });
            //Redirect to page depending on user role
            res.redirect('/admin/dashboard');
            
            return;
        } else {
            res.status(401).json({
            success: false,
            message: "Invalid login details",
        });
        return;
        }
    }  catch (error) {
        console.error("Error during login verification:", error);
        res.status(500).json({
        success: false,
        message: "An error occurred",
        });
    }
};

router.post("/login", tryToLoginUser);

export default router;
