import express from 'express';
import { register, login, getProfile } from '../controllers/authController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);

// Role-based protected routes (examples)
router.get('/admin', authenticateToken, authorizeRoles('admin'), (req, res) => {
    res.json({ message: 'Welcome to admin panel' });
});

router.get('/guru', authenticateToken, authorizeRoles('guru', 'admin'), (req, res) => {
    res.json({ message: 'Welcome to teacher panel' });
});

router.get('/siswa', authenticateToken, authorizeRoles('siswa', 'guru', 'admin'), (req, res) => {
    res.json({ message: 'Welcome to student panel' });
});

export default router;
