import jwt from 'jsonwebtoken';


export function createJWTtoken(email : string)
{
    const secretKey  = process.env.JWT_SECRET as string;
    const token = jwt.sign({
                    email : email
                }, secretKey, { expiresIn: '1h' });
}