import express from 'express';
import {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
} from '../controllers/adminController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Semua rute di file ini memerlukan otentikasi dan peran 'admin'
router.use(authenticateToken, authorizeRoles('admin'));

router.route('/users').get(getAllUsers).post(createUser);
router.route('/users/:id').put(updateUser).delete(deleteUser);

export default router;