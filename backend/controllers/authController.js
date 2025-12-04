import User from '../models/user.model.js';

export const register = async (req, res) => {
    try {
        const { name, nis, kelas, password, role } = req.body;

        
        const existingUser = await User.findOne({ nis });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this NIS already exists' });
        }

        
        const user = new User({
            name,
            nis,
            kelas,
            password,
            role: role || 'siswa'
        });

        await user.save();

        
        const token = user.generateAuthToken();

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: user.toJSON()
        });
    } catch (error) {
        console.error('Registration error:', error);
        // Memberikan pesan error yang lebih spesifik jika ada error validasi
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Terjadi kesalahan pada server saat registrasi' });
    }
};

export const login = async (req, res) => {
    try {
        const { nis, password } = req.body;

        
        const user = await User.findOne({ nis });
        if (!user) {
            return res.status(401).json({ message: 'Invalid NIS or password' });
        }

        
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid NIS or password' });
        }

        
        const token = user.generateAuthToken();

        res.json({
            message: 'Login successful',
            token,
            user: user.toJSON()
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server saat login' });
    }
}