import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Pre-populate rooms if not exist
roomSchema.statics.initializeRooms = async function() {
    const rooms = [
        { name: 'Danau Jempang', description: 'Ruangan di area Danau Jempang' },
        { name: 'Danau Melintang', description: 'Ruangan di area Danau Melintang' },
        { name: 'Kakaban', description: 'Ruangan Kakaban' },
        { name: 'Lab Komputer', description: 'Laboratorium Komputer' },
        { name: 'Perpustakaan', description: 'Ruangan Perpustakaan' },
        { name: 'Lab Fisika', description: 'Laboratorium Fisika' },
        { name: 'Lab Informatika', description: 'Laboratorium Informatika' },
        { name: 'Lab Kimia', description: 'Laboratorium Kimia' },
        { name: 'Lab Biologi', description: 'Laboratorium Biologi' }
    ];

    for (const room of rooms) {
        const existing = await this.findOne({ name: room.name });
        if (!existing) {
            await this.create(room);
        }
    }
};

const Room = mongoose.model('Room', roomSchema);

export default Room;
