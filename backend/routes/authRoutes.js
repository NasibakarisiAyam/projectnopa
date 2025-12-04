import express from 'express';
import { register, login } from '../controllers/authController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js'; // Keep these for other role-based routes if needed

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

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
