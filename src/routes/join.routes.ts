import { Router, RequestHandler, Request, Response } from "express";
import prismaClientInstance from "../services/database/databaseConnector";
import { invitation_status, user_role } from "@prisma/client";
import bcrypt from 'bcrypt';

const router = Router();

const acceptInvitation: RequestHandler = async (req: Request, res: Response) => {
    try {
        const { token, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).render('error', {
                title: 'Error',
                message: 'Passwords do not match',
                user: req.user
            });
        }

        // Get invitation details
        const invitation = await prismaClientInstance.user_invitations.findFirst({
            where: {
                invitation_token: token,
                status: invitation_status.PENDING,
                expires_at: {
                    gt: new Date()
                }
            }
        });

        if (!invitation) {
            return res.status(400).render('error', {
                title: 'Invalid Invitation',
                message: 'Invitation not found or has expired',
                user: req.user
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user and update invitation in transaction
        await prismaClientInstance.$transaction(async (tx) => {
            // Create new user
            const newUser = await tx.users.create({
                data: {
                    email: invitation.email,
                    hashed_password: hashedPassword,
                    first_name: invitation.first_name,
                    last_name: invitation.last_name,
                    company_id: invitation.company_id,
                    role: invitation.role as user_role,
                    is_active: true,
                    email_verified: false
                }
            });

            // Update invitation status
            await tx.user_invitations.update({
                where: { id: invitation.id },
                data: { status: invitation_status.ACCEPTED }
            });
        });

        res.redirect('/');
    } catch (error) {
        console.error('Error accepting invitation:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'An error occurred while accepting the invitation',
            user: req.user
        });
    }
};

const declineInvitation: RequestHandler = async (req: Request, res: Response) => {
    try {
        const token = req.params.token;

        const invitation = await prismaClientInstance.user_invitations.findFirst({
            where: {
                invitation_token: token,
                status: invitation_status.PENDING
            }
        });

        if (!invitation) {
            return res.status(400).render('error', {
                title: 'Invalid Invitation',
                message: 'Invitation not found',
                user: req.user
            });
        }

        await prismaClientInstance.user_invitations.update({
            where: { id: invitation.id },
            data: { status: invitation_status.CANCELLED }
        });

        res.redirect('/invite/decline/:token');
    } catch (error) {
        console.error('Error declining invitation:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'An error occurred while declining the invitation',
            user: req.user
        });
    }
};

const joinPage: RequestHandler = async (req: Request, res: Response) => {
    try {
        const token = req.query.token as string;

        if (!token) {
            return res.status(400).render('error', {
                title: 'Invalid Token',
                message: 'No invitation token provided',
                user: req.user
            });
        }

        const invitation = await prismaClientInstance.user_invitations.findFirst({
            where: {
                invitation_token: token,
                status: invitation_status.PENDING,
                expires_at: {
                    gt: new Date()
                }
            }
        });

        if (!invitation) {
            return res.status(400).render('error', {
                title: 'Invalid Invitation',
                message: 'Invitation not found or has expired',
                user: req.user
            });
        }

        res.render('invitation', {
            title: 'Accept Invitation',
            invitation,
            token,
            user: req.user
        });
    } catch (error) {
        console.error('Error loading invitation page:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'An error occurred while loading the invitation',
            user: req.user
        });
    }
};


router.get('/join', joinPage);
router.post('/invite/accept', acceptInvitation);
router.get('/invite/decline/:token', declineInvitation);


export default router;