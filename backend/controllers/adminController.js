import User from '../models/user.model.js';

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * @desc    Create a new user
 * @route   POST /api/admin/users
 * @access  Private/Admin
 */
export const createUser = async (req, res) => {
    const { name, nis, kelas, password, role } = req.body;

    try {
        const userExists = await User.findOne({ nis });
        if (userExists) {
            return res.status(400).json({ message: 'Pengguna dengan NIS ini sudah ada' });
        }

        const user = await User.create({ name, nis, kelas, password, role });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                nis: user.nis,
                role: user.role,
            });
        } else {
            res.status(400).json({ message: 'Data pengguna tidak valid' });
        }
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * @desc    Update a user
 * @route   PUT /api/admin/users/:id
 * @access  Private/Admin
 */
export const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.nis = req.body.nis || user.nis;
            user.kelas = req.body.kelas || user.kelas;
            user.role = req.body.role || user.role;

            if (req.body.password) {
                user.password = req.body.password; // Hook pre-save akan melakukan hashing
            }

            const updatedUser = await user.save();
            res.json(updatedUser.toJSON());
        } else {
            res.status(404).json({ message: 'Pengguna tidak ditemukan' });
        }
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * @desc    Delete a user
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
export const deleteUser = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Pengguna tidak ditemukan' });

    await user.deleteOne();
    res.json({ message: 'Pengguna berhasil dihapus' });
};