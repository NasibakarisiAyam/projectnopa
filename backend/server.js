import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/authRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js"; // Import rute admin
import Room from "./models/room.model.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Konfigurasi CORS yang lebih dinamis
const allowedOrigins = [
    'http://localhost:5173', // Untuk development lokal
    process.env.FRONTEND_URL // Untuk production di Vercel
];

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        // Izinkan request tanpa origin (seperti dari Postman atau mobile apps)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(new Error('CORS policy does not allow access from the specified Origin.'), false);
        }
        return callback(null, true);
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes); // Gunakan rute admin


// Health check route
app.get('/api/health', (req, res) => {
    res.json({ message: 'Server is running', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await connectDB();
    // Initialize rooms if they don't exist
    try {
        await Room.initializeRooms();
        console.log('Rooms initialized successfully');
    } catch (error) {
        console.error('Error initializing rooms:', error);
    }
});
