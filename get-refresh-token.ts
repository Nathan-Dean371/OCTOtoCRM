import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

async function getRefreshToken() {
    // Configuration from environment variables
    const accountsUrl = process.env.ZOHO_DOMAIN;
    const clientId = process.env.ZOHO_CLIENT_ID;
    const clientSecret = process.env.ZOHO_CLIENT_SECRET;
    const grantToken = process.env.ZOHO_GRANT_TOKEN;  // You'll need to add this to your .env

    if (!accountsUrl || !clientId || !clientSecret || !grantToken) {
        console.error('Missing required environment variables');
        return;
    }

    try {
        const response = await axios.post(`${accountsUrl}/oauth/v2/token`, null, {
            params: {
                grant_type: 'authorization_code',
                client_id: clientId,
                client_secret: clientSecret,
                code: grantToken
            }
        });

        console.log('Refresh Token Response:', response.data);
        console.log('\nAdd this refresh token to your .env file as ZOHO_REFRESH_TOKEN');
        
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error getting refresh token:', {
                status: error.response?.status,
                data: error.response?.data
            });
        } else {
            console.error('Error:', error);
        }
    }
}

// Run the function
getRefreshToken();