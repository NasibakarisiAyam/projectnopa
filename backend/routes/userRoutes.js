import express from 'express';
import { getProfile, updateProfile, uploadPhoto, deletePhoto } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';
import upload from '../middleware/uploadMiddleware.js'; // Assuming you have a multer setup for file uploads

const router = express.Router();

router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/profile/photo', authenticateToken, upload.single('profilePhoto'), uploadPhoto);
router.delete('/profile/photo', authenticateToken, deletePhoto);

export default router;