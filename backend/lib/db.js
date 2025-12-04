import mongoose from 'mongoose';

export const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        console.error('FATAL ERROR: MONGO_URI is not defined in the .env file.');
        process.exit(1); // Keluar dari aplikasi dengan kode error
    }

    try {
        await mongoose.connect(mongoUri);
        console.log(`MongoDB connected successfully to: ${mongoose.connection.host}`);
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error.message);
        // Keluar dari aplikasi jika koneksi awal gagal
        process.exit(1);
    }
};