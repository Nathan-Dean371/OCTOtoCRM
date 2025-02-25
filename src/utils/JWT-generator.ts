import jwt from 'jsonwebtoken';
import { user } from '../types/users';

export function createJWTtoken(user : user)
{
    const secretKey  = process.env.JWT_SECRET as string;
    const token = jwt.sign({
        user,
    }, secretKey, { expiresIn: '1h' });
    return token;
}