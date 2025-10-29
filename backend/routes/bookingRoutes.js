import express from 'express';
import {
    getRooms,
    getBookingsByDate,
    getUserBookings,
    createBooking,
    updateBookingStatus,
    getAllBookings,
    getCalendarBookings,
    deleteBooking
} from '../controllers/bookingController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all rooms
router.get('/rooms', getRooms);

// Get bookings by date (optional room filter)
router.get('/bookings', getBookingsByDate);

// Get user's own bookings
router.get('/my-bookings', getUserBookings);

// Create new booking
router.post('/bookings', createBooking);

// Update booking status (admin only)
router.patch('/bookings/:bookingId/status', (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
}, updateBookingStatus);

// Get all bookings (admin only)
router.get('/admin/bookings', (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
}, getAllBookings);

// Get calendar bookings
router.get('/calendar', getCalendarBookings);

// Delete booking
router.delete('/bookings/:bookingId', deleteBooking);

export default router;
