// src/server.ts
import dotenv from 'dotenv';
import path from 'path';

console.log('Starting server initialization...');
console.log('Current directory:', __dirname);

// Load environment variables first
const envPath = path.resolve(__dirname, '../.env');
console.log('Loading .env file from:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error('Error loading .env file:', result.error);
    process.exit(1);
} else {
    console.log('Environment variables loaded successfully');
}

// Now import app after environment variables are loaded
import app from './app';

const port = process.env.PORT || 3000;

console.log('Environment variables status:', {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    ZOHO_DOMAIN: process.env.ZOHO_DOMAIN ? 'Set' : 'Not Set',
    ZOHO_CLIENT_ID: process.env.ZOHO_CLIENT_ID ? 'Set' : 'Not Set',
    ZOHO_CLIENT_SECRET: process.env.ZOHO_CLIENT_SECRET ? 'Set' : 'Not Set',
    ZOHO_REFRESH_TOKEN: process.env.ZOHO_REFRESH_TOKEN ? 'Set' : 'Not Set',
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});