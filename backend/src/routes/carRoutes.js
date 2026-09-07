import express from 'express';
import {
  getAllCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  importFromAPI,
} from '../controllers/carController.js';
import { adminMiddleware, optionalAuthMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuthMiddleware, getAllCars);
router.get('/:id', optionalAuthMiddleware, getCarById);
router.post('/', adminMiddleware, createCar);
router.put('/:id', adminMiddleware, updateCar);
router.delete('/:id', adminMiddleware, deleteCar);
router.post('/admin/import', adminMiddleware, importFromAPI);

export default router;
