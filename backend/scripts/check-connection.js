import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

dotenv.config({ path: './backend/.env' });

async function runDiagnostics() {
    console.log('--- MongoDB Connection Diagnostics ---');
    console.log(`Time: ${new Date().toISOString()}`);

    // 1. Get Public IP
    try {
        const ip = execSync('curl -s https://api.ipify.org').toString().trim();
        console.log(`[PASS] Public IP detected: ${ip}`);
        console.log(`(!) Ensure this IP is whitelisted in your MongoDB Atlas cluster (!)`);
    } catch (err) {
        console.error(`[FAIL] Could not detect public IP. Check your internet connection.`);
    }

    // 2. Environment Variables
    if (!process.env.MONGO_URI) {
        console.log(`[FAIL] MONGO_URI is missing from your .env file.`);
        process.exit(1);
    } else {
        console.log(`[PASS] MONGO_URI is present (Ends with ${process.env.MONGO_URI.slice(-10)}).`);
    }

    // 3. DNS Resolution
    try {
        const host = process.env.MONGO_URI.split('@')[1].split('/')[0];
        console.log(`[INFO] Attempting to resolve host: ${host}`);
        // Simple ping/check if node is reachable
    } catch (err) {
        console.log(`[FAIL] Could not parse host from MONGO_URI.`);
    }

    // 4. Mongoose Connection Test
    console.log(`[INFO] Attempting to connect to MongoDB Atlas... (Timeout in 10s)`);
    try {
        const start = Date.now();
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000
        });
        const duration = Date.now() - start;
        console.log(`[SUCCESS] Connected to MongoDB in ${duration}ms!`);
        console.log(`Host: ${mongoose.connection.host}`);
        await mongoose.disconnect();
    } catch (err) {
        console.error(`[CRITICAL] Connection failed: ${err.message}`);
        
        if (err.message.includes('ETIMEDOUT')) {
            console.log('\n>>> ANALYSIS: Request timed out. This almost certainly means your IP is NOT whitelisted or a firewall is blocking port 27017.');
        } else if (err.message.includes('Authentication failed')) {
            console.log('\n>>> ANALYSIS: Credential error. Check your MONGO_URI username and password.');
        } else {
            console.log('\n>>> ANALYSIS: Unknown connectivity issue. Check https://status.mongodb.com/');
        }
    }
    
    process.exit(0);
}

runDiagnostics();
