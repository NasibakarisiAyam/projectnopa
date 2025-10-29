import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    timeSlots: [{
        type: Number,
        required: true,
        min: 0,
        max: 10
    }],
    reason: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    },
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Index for efficient queries
bookingSchema.index({ room: 1, date: 1 });
bookingSchema.index({ user: 1, date: -1 });

// Virtual for checking conflicts
bookingSchema.methods.checkTimeSlotConflict = async function() {
    const conflictingBookings = await this.constructor.find({
        room: this.room,
        date: this.date,
        status: 'approved',
        timeSlots: { $in: this.timeSlots }
    });

    return conflictingBookings.length > 0;
};

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
