import axios from 'axios';

interface BitrixToken {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    expires_at?: number;  // We'll calculate this
    client_endpoint: string;
    member_id: string;
    domain: string;
    server_endpoint: string;
    status: string;
}

interface BitrixAuthConfig {
    clientId: string;
    clientSecret: string;
    refreshToken?: string;  // Optional during initial setup
    portalDomain: string;
}

class BitrixAuthService
{
    private token: BitrixToken | null = null;
    private readonly clientId: string;
    private readonly clientSecret: string;
    private refreshToken: string | null;
    private readonly authServerUrl: string = 'https://oauth.bitrix.info';
    private readonly portalDomain: string;



    constructor(config?: BitrixAuthConfig)
    {
        if (config)
        {
            this.clientId = config.clientId;
            this.clientSecret = config.clientSecret;
            this.refreshToken = config.refreshToken || null;
            this.portalDomain = config.portalDomain;
        }
        else
        {
            this.clientId = process.env.BITRIX_CLIENT_ID || '';
            this.clientSecret = process.env.BITRIX_CLIENT_SECRET || '';
            this.refreshToken = process.env.BITRIX_REFRESH_TOKEN || null;
            this.portalDomain = process.env.BITRIX_PORTAL_DOMAIN || '';
        }

        if (!this.clientId || !this.clientSecret || !this.portalDomain)
        {
            throw new Error('BitrixAuthService requires clientId, clientSecret, and portalDomain');
        }
    }

    setRefreshToken(refreshToken: string): void {
        this.refreshToken = refreshToken;
    }

    private isTokenExpired(): boolean {
        if (!this.token?.expires_at) return true;
        // Add 30-second buffer to prevent edge cases
        return Date.now() >= (this.token.expires_at - 30000);
    }

    private async refreshAccessToken(): Promise<void> {
        if (!this.refreshToken) {
            throw new Error('No refresh token available. Please authorize first.');
        }

        try {
            console.log('Attempting to refresh Bitrix token');
    
            const response = await axios.post(`${this.authServerUrl}/oauth/token/`, null, {
                params: {
                    grant_type: 'refresh_token',
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    refresh_token: this.refreshToken
                }
            });
    
            // Store the new token with an expiration timestamp
            this.token = {
                ...response.data,
                expires_at: Date.now() + (response.data.expires_in * 1000)
            };

            // Save the new refresh token for future use
            this.refreshToken = response.data.refresh_token;
            
            console.log('Bitrix token refreshed successfully');
    
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Bitrix token refresh error details:', {
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data,
                    url: error.config?.url
                });
                
                throw new Error(`Failed to refresh Bitrix access token: ${error.response?.data?.error || error.message}`);
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
    
    async getPortalEndpoint(): Promise<string> {
        if (!this.token || this.isTokenExpired()) {
            await this.refreshAccessToken();
        }
        return this.token!.client_endpoint;
    }

    async authorizeWithCode(code: string): Promise<BitrixToken> {
        try {
            console.log('Authorizing with Bitrix using code');
            
            const response = await axios.post(`${this.authServerUrl}/oauth/token/`, null, {
                params: {
                    grant_type: 'authorization_code',
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    code: code
                }
            });
            
            // Store the token with expiration timestamp
            this.token = {
                ...response.data,
                expires_at: Date.now() + (response.data.expires_in * 1000)
            };
            
            // Save the refresh token
            this.refreshToken = response.data.refresh_token;
            
            return this.token as BitrixToken;
            
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Bitrix authorization error:', {
                    status: error.response?.status,
                    data: error.response?.data
                });
                
                throw new Error(`Failed to authorize with Bitrix: ${error.response?.data?.error_description || error.message}`);
            }
            throw error;
        }
    }

    getAuthorizationUrl(state: string = ''): string {
        return `https://${this.portalDomain}/oauth/authorize/?client_id=${this.clientId}&state=${state}`;
    }

     // Get the current configuration
     getConfig(): BitrixAuthConfig {
        return {
            clientId: this.clientId,
            clientSecret: this.clientSecret,
            refreshToken: this.refreshToken || undefined,
            portalDomain: this.portalDomain
        };
    }
}

export default BitrixAuthService;