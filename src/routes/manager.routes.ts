import { Router, Request, Response } from "express";
import prismaClientInstance from "../services/database/databaseConnector";

const router = Router();

router.get('/manager/company/manage', async (req: Request, res: Response) => {
    try {
        if (!req.user?.company_id) {
            return res.status(403).render('error', {
                title: 'Error',
                message: 'No company associated with user',
                user: req.user
            });
        }

        const company = await prismaClientInstance.companies.findUnique({
            where: { id: req.user.company_id }
        });

        if (!company) {
            return res.status(404).render('error', {
                title: 'Error',
                message: 'Company not found',
                user: req.user
            });
        }

        res.render('manager-company', {
            title: 'Manage Company',
            company,
            user: req.user
        });
    } catch (error) {
        console.error('Error loading company management:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'An error occurred while loading company details',
            user: req.user
        });
    }
});

export default router;
