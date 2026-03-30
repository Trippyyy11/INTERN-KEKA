import mongoose from 'mongoose';

const connectDB = async (retryCount = 0) => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 15000, // Wait 15s before giving up
            socketTimeoutMS: 45000,         // Close sockets after 45s of inactivity
            heartbeatFrequencyMS: 10000     // Check node status every 10s
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error (Attempt ${retryCount + 1}): ${error.message}`);
        
        if (retryCount < 5) {
            console.log(`Retrying in 5 seconds...`);
            setTimeout(() => connectDB(retryCount + 1), 5000);
        } else {
            console.error('Max connection retries reached. Exiting...');
            process.exit(1);
        }
    }
};

export default connectDB;
