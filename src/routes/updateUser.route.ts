import { Router, RequestHandler, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import prismaClientInstance from "../services/database/databaseConnector";

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

router.post('/admin/users/:id', tryUpdateUser);
export default router;
