import express from 'express';
import { getPackages, getPackageById, createPackage, updatePackage, deletePackage } from '../controllers/packageController.js';
import { adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getPackages);
router.get('/admin/all', adminMiddleware, getPackages);
router.get('/:id', getPackageById);
router.post('/', adminMiddleware, createPackage);
router.put('/:id', adminMiddleware, updatePackage);
router.delete('/:id', adminMiddleware, deletePackage);

export default router;