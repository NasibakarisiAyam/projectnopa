import User from '../models/user.model.js';
import cloudinary from '../lib/cloudinary.js';

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.toJSON());
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { name, newPassword, confirmPassword } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (name) {
            user.name = name;
        }

        if (newPassword) {
            if (newPassword.length < 6) {
                return res.status(400).json({ message: 'Password must be at least 6 characters' });
            }
            if (newPassword !== confirmPassword) {
                return res.status(400).json({ message: 'Passwords do not match' });
            }
            user.password = newPassword; // The pre-save hook will hash it
        }

        await user.save();

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const uploadPhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete old photo from Cloudinary if it exists
        if (user.photo) {
            try {
                // Extract public_id from the full Cloudinary URL
                // Example URL: http://res.cloudinary.com/demo/image/upload/folder/public_id.jpg
                const publicId = user.photo.split('/').slice(-2).join('/').split('.')[0];
                if (!publicId.startsWith('user-photos/')) {
                    throw new Error('Invalid photo URL format for deletion.');
                }
                await cloudinary.uploader.destroy(publicId);
            } catch (deleteError) {
                console.warn('Could not delete old photo from Cloudinary:', deleteError.message);
            }
        }

        // Upload new photo to Cloudinary
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'user-photos',
                    public_id: `user-${req.user._id}-${Date.now()}`,
                    transformation: [{ width: 300, height: 300, crop: 'fill', gravity: 'face' }]
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
            uploadStream.end(req.file.buffer);
        });

        user.photo = result.secure_url;
        await user.save();

        res.json({
            message: 'Photo uploaded successfully',
            photoUrl: result.secure_url
        });
    } catch (error) {
        console.error('Upload photo error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deletePhoto = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete photo from Cloudinary if it exists
        if (user.photo) {
            try {
                // Extract public_id from the full Cloudinary URL
                const publicId = user.photo.split('/').slice(-2).join('/').split('.')[0];
                if (!publicId.startsWith('user-photos/')) {
                    throw new Error('Invalid photo URL format for deletion.');
                }
                await cloudinary.uploader.destroy(publicId);
            } catch (deleteError) {
                console.warn('Could not delete photo from Cloudinary:', deleteError.message);
            }
        }

        user.photo = '';
        await user.save();

        res.json({ message: 'Photo deleted successfully' });
    } catch (error) {
        console.error('Delete photo error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
