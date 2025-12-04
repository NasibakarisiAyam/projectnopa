import Booking from '../models/booking.model.js';
import Room from '../models/room.model.js';
import User from '../models/user.model.js';

// Get all rooms
export const getRooms = async (req, res) => {
    try {
        const rooms = await Room.find({ isActive: true }).sort({ name: 1 });
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching rooms', error: error.message });
    }
};

// Get bookings for a specific date and room
export const getBookingsByDate = async (req, res) => {
    try {
        const { date, roomId } = req.query;
        if (!date) {
            return res.status(400).json({ message: 'Date parameter is required' });
        }

        // Create a date range for the entire day to avoid timezone issues
        const startDate = new Date(date);
        startDate.setUTCHours(0, 0, 0, 0);

        const endDate = new Date(date);
        endDate.setUTCHours(23, 59, 59, 999);

        const query = { date: { $gte: startDate, $lte: endDate } };

        if (roomId) {
            query.room = roomId;
        }

        const bookings = await Booking.find(query)
            .populate('user', 'name nis kelas role')
            .populate('room', 'name')
            .populate('approvedBy', 'name')
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings', error: error.message });
    }
};

// Get user's bookings
export const getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate('room', 'name')
            .populate('approvedBy', 'name')
            .sort({ date: -1, createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user bookings', error: error.message });
    }
};

// Create a new booking
export const createBooking = async (req, res) => {
    try {
        const { roomId, date, timeSlots, reason, purpose, purposeDetails } = req.body;
        const userId = req.user._id;

        // Validate required fields
        if (!roomId || !date || !timeSlots || timeSlots.length === 0) {
            console.log('Validation failed:', { roomId, date, timeSlots });
            return res.status(400).json({ message: 'Room, date, and time slots are required' });
        }

        // Load user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Require purpose for all bookings; if 'lainnya' require purposeDetails
        if (!purpose || purpose.trim() === '') {
            return res.status(400).json({ message: 'Purpose (tujuan) is required' });
        }

        if (purpose === 'lainnya' && (!purposeDetails || purposeDetails.trim() === '')) {
            return res.status(400).json({ message: 'Detail tujuan diperlukan ketika memilih "Lainnya"' });
        }

        // Check for time slot conflicts
        // Prevent double-booking: consider both approved and pending bookings as conflicts
        const conflictingBookings = await Booking.find({
            room: roomId,
            date: new Date(date),
            status: { $in: ['approved', 'pending'] },
            timeSlots: { $in: timeSlots }
        });

        if (conflictingBookings.length > 0) {
            return res.status(409).json({ message: 'Selected time slots are already booked or pending approval' });
        }

        // Create booking
        const bookingData = {
            user: userId,
            room: roomId,
            date: new Date(date),
            timeSlots,
            // reason is optional now
            reason: reason ? reason.trim() : undefined,
            purpose,
            purposeDetails,
            status: user.role === 'guru' ? 'approved' : 'pending'
        };
        console.log('Creating booking with data:', bookingData);

        const booking = new Booking(bookingData);

        await booking.save();
        console.log('Booking saved successfully:', booking._id);

        const populatedBooking = await Booking.findById(booking._id)
            .populate('user', 'name nis kelas role')
            .populate('room', 'name');

        res.status(201).json(populatedBooking);
    } catch (error) {
        res.status(500).json({ message: 'Error creating booking', error: error.message });
    }
};

// Approve or reject booking (admin only)
export const updateBookingStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { status, notes } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check for conflicts if approving
        if (status === 'approved') {
            const conflictingBookings = await Booking.find({
                room: booking.room,
                date: booking.date,
                status: 'approved',
                timeSlots: { $in: booking.timeSlots },
                _id: { $ne: bookingId }
            });

            if (conflictingBookings.length > 0) {
                return res.status(409).json({ message: 'Cannot approve: time slots conflict with existing bookings' });
            }
        }

        booking.status = status;
        booking.approvedBy = req.user._id;
        booking.approvedAt = new Date();
        if (notes) booking.notes = notes;

        await booking.save();

        const updatedBooking = await Booking.findById(bookingId)
            .populate('user', 'name nis kelas role')
            .populate('room', 'name')
            .populate('approvedBy', 'name');

        res.json(updatedBooking);
    } catch (error) {
        res.status(500).json({ message: 'Error updating booking status', error: error.message });
    }
};

// Get all bookings (admin only)
export const getAllBookings = async (req, res) => {
    try {
        const { status, date, roomId } = req.query;
        const query = {};

        if (status) query.status = status;
        if (date) query.date = new Date(date);
        if (roomId) query.room = roomId;

        const bookings = await Booking.find(query)
            .populate('user', 'name nis kelas role')
            .populate('room', 'name')
            .populate('approvedBy', 'name')
            .sort({ date: -1, createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings', error: error.message });
    }
};

// Get bookings for calendar view
export const getCalendarBookings = async (req, res) => {
    try {
        const { month, year } = req.query;
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const bookings = await Booking.find({
            date: { $gte: startDate, $lte: endDate },
            status: 'approved'
        })
        .populate('room', 'name')
        .select('date room timeSlots')
        .sort({ date: 1 });

        // Group by date
        const calendarData = {};
        bookings.forEach(booking => {
            const dateKey = booking.date.toISOString().split('T')[0];
            if (!calendarData[dateKey]) {
                calendarData[dateKey] = [];
            }
            calendarData[dateKey].push({
                room: booking.room.name,
                timeSlots: booking.timeSlots
            });
        });

        res.json(calendarData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching calendar bookings', error: error.message });
    }
};

// Delete booking
export const deleteBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if user owns the booking or is admin
        if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this booking' });
        }

        await Booking.findByIdAndDelete(bookingId);
        res.json({ message: 'Booking deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting booking', error: error.message });
    }
};
