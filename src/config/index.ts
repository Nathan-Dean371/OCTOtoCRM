export const config = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    ventrata: {
      apiKey: process.env.VENTRATA_API_KEY,
      apiUrl: process.env.VENTRATA_API_URL,
    },
    zoho: {
      clientId: process.env.ZOHO_CLIENT_ID,
      clientSecret: process.env.ZOHO_CLIENT_SECRET,
      refreshToken: process.env.ZOHO_REFRESH_TOKEN,
    },
    database: {
      url: process.env.DATABASE_URL,
    },
  };