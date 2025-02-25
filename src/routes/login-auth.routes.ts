import { Router, RequestHandler } from "express";
import { checkLoginDetails } from '../utils/userAuth';  

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

        if (isValid) {
            res.json({
            success: true,
            message: "Login successful",
        });
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
