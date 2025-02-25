import { userRole } from './userRoles';

export interface loginDetails
{
    email: string;
    password: string;
}

export interface user
{
    id : string,
    company_id : string,
    email : string,
    first_name : string,
    last_name : string,
    role : userRole
}
