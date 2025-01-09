// src/scripts/tunnel.ts
import ngrok from 'ngrok';
import dotenv from 'dotenv';

dotenv.config();

async function startTunnel() {
    try {
        console.log('Starting ngrok tunnel...');
        
        const url = await ngrok.connect({
            addr: process.env.PORT || 3000,
            authtoken: process.env.NGROK_AUTHTOKEN
        });

        console.log('Ngrok tunnel established:');
        console.log('Public URL:', url);
        
        // Keep the process alive
        process.stdin.resume();

        // Handle cleanup
        process.on('SIGINT', async () => {
            console.log('Closing ngrok tunnel...');
            await ngrok.kill();
            process.exit(0);
        });

    } catch (error) {
        console.error('Error starting ngrok tunnel:', error);
        console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
    }
}

// Start the tunnel
startTunnel().catch(error => {
    console.error('Failed to start tunnel:', error);
    process.exit(1);
});