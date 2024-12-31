import axios from 'axios';

interface ZohoToken {
    access_token: string;
    expires_in: number;
    expires_at?: number;  // We'll calculate this
    api_domain: string;
    token_type: string;
}

class ZohoAuthService {
    private token: ZohoToken | null = null;
    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly refreshToken: string;
    private readonly accountsUrl: string;

    constructor() {
        // Get required environment variables
        this.clientId = process.env.ZOHO_CLIENT_ID || '';
        this.clientSecret = process.env.ZOHO_CLIENT_SECRET || '';
        this.refreshToken = process.env.ZOHO_REFRESH_TOKEN || '';
        this.accountsUrl = process.env.ZOHO_DOMAIN || '';

        // Validate required configuration
        if (!this.clientId || !this.clientSecret || !this.refreshToken || !this.accountsUrl) {
            throw new Error('Missing required Zoho configuration');
        }
    }

    private isTokenExpired(): boolean {
        if (!this.token?.expires_at) return true;
        // Add 30-second buffer to prevent edge cases
        return Date.now() >= (this.token.expires_at - 30000);
    }

    private async refreshAccessToken(): Promise<void> {
        try {
            const response = await axios.post(`${this.accountsUrl}/oauth/v2/token`, null, {
                params: {
                    refresh_token: this.refreshToken,
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    grant_type: 'refresh_token'
                }
            });

            this.token = {
                ...response.data,
                // Calculate absolute expiry time
                expires_at: Date.now() + (response.data.expires_in * 1000)
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Failed to refresh access token: ${error.response?.data?.error || error.message}`);
            }
            throw error;
        }
    }

    async getAccessToken(): Promise<string> {
        if (!this.token || this.isTokenExpired()) {
            await this.refreshAccessToken();
        }
        return this.token!.access_token;
    }
}

export default ZohoAuthService;