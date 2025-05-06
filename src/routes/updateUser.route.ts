import { Router, RequestHandler, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import prismaClientInstance from "../services/database/databaseConnector";
import { User } from "../types/users"; // Add this import


const router = Router();

const tryUpdateUser: RequestHandler = async (req: Request, res: Response) => {
    const user: Prisma.usersUpdateInput = {
        first_name: req.body.firstName,
        last_name: req.body.lastName,
        email: req.body.email,
        role: req.body.role
    };

    try {
        console.log('Updating user with id: ', req.params.id);
        const updatedUser = await prismaClientInstance.users.update({
            where: {
                id: req.params.id
            },
            data: user
        });

        if (req.xhr || req.headers.accept?.includes('application/json')) {
            res.status(200).json({
                message: 'User updated successfully',
                user: updatedUser,
                success: true
            });
        } else {
            res.redirect('/admin/dashboard/users');
        }
    } catch (error) {
        console.error('Error updating user: ', error);

        if (req.xhr || req.headers.accept?.includes('application/json')) {
            res.status(500).json({
                success: false,
                message: 'Error updating user: ' + error
            });
        } else {
            res.redirect('/admin/dashboard/users');
        }
    }
};

const tryManagerUpdateUser: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const requestingUser = req.user as User;
    
    try {
        const targetUser = await prismaClientInstance.users.findUnique({
            where: { id: req.params.id }
        });

        if (!targetUser || targetUser.company_id !== requestingUser.company_id) {
            res.status(403).json({
                success: false,
                message: 'Not authorized to update this user'
            });
            return;
        }

        // Only allow managers to update to OPERATOR role
        if (req.body.role && req.body.role !== 'OPERATOR') {
            res.status(403).json({
                success: false,
                message: 'Managers can only assign OPERATOR role'
            });
            return;
        }

        const user: Prisma.usersUpdateInput = {
            first_name: req.body.firstName,
            last_name: req.body.lastName,
            email: req.body.email,
            role: req.body.role
        };

        const updatedUser = await prismaClientInstance.users.update({
            where: { id: req.params.id },
            data: user
        });

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            user: updatedUser
        });
        return;

    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user'
        });
        return;
    }
};

router.post('/admin/users/:id', tryUpdateUser);
router.post('/manager/users/:id', tryManagerUpdateUser);

export default router;
