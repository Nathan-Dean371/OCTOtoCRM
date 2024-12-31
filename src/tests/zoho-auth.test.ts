import dotenv from 'dotenv';
import ZohoAuthService from '../services/zoho/zoho-auth';

dotenv.config();

describe('ZohoAuthService', () => {
    let authService: ZohoAuthService;

    beforeEach(() => {
        authService = new ZohoAuthService();
    });

    test('should get access token', async () => {
        const token = await authService.getAccessToken();
        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
        expect(token.length).toBeGreaterThan(0);
    });
});