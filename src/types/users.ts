import { user_role } from './userRoles';

export interface loginDetails
{
    email: string;
    password: string;
}

export interface User
{
    id : string,
    company_id : string,
    company_name : string,
    email : string,
    first_name : string,
    last_name : string,
    role : user_role,
}

export interface UserToInvite
{
    company_id : string,
    email : string,
    first_name : string,
    last_name : string,
    role : user_role
}
