import crypto from 'node:crypto';
import { getCarsByBrand } from '../services/carApiService.js';
import { fileTypeFromBuffer } from 'file-type';
import {
  getCars,
  getCarById as getCarByIdFromStore,
  createCar as createCarInStore,
  updateCar as updateCarInStore,
  deleteCar as deleteCarInStore,
  findCarByIdentity,
  getModifications,
  deleteModificationsByCarId,
  uploadCarImage,
} from '../services/supabaseDataService.js';

const IMAGE_DATA_URL_PATTERN = /^data:(image\/(?:png|jpeg|jpg|webp));base64,([A-Za-z0-9+/=]+)$/;
const MAX_CAR_IMAGE_BYTES = 2 * 1024 * 1024;

const persistCarImage = async (carId, image) => {
  if (typeof image !== 'string' || !image.startsWith('data:')) return image || null;
  const match = image.match(IMAGE_DATA_URL_PATTERN);
  if (!match) {
    const error = new Error('Upload a PNG, JPEG, or WebP image');
    error.status = 400;
    throw error;
  }
  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length === 0 || buffer.length > MAX_CAR_IMAGE_BYTES) {
    const error = new Error('Image must be smaller than 2MB after compression');
    error.status = 400;
    throw error;
  }
  const expectedMime = match[1] === 'image/jpg' ? 'image/jpeg' : match[1];
  const detectedType = await fileTypeFromBuffer(buffer);
  if (!detectedType || detectedType.mime !== expectedMime) {
    const error = new Error('The uploaded file type is invalid');
    error.status = 400;
    throw error;
  }
  return uploadCarImage(carId, buffer, expectedMime);
};

export const getAllCars = async (req, res) => {
  try {
    const { brand, isVisible, includeHidden } = req.query;
    if ((includeHidden === 'true' || isVisible === 'false') && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const cars = await getCars({ brand, isVisible, includeHidden });
    const modifications = await getModifications({ activeOnly: true });
    const carsWithModifications = cars.map((car) => ({
      ...car,
      modifications: modifications.filter((modification) => (
        modification.carId === car.id || modification.compatibleCarIds?.includes(car.id)
      )),
    }));
    res.json(carsWithModifications);
  } catch (error) {
    console.error('Error fetching cars:', error);
    res.status(500).json({ error: 'Failed to fetch cars from database' });
  }
};

export const getCarById = async (req, res) => {
  try {
    const { id } = req.params;
    const car = await getCarByIdFromStore(id, { includeHidden: req.user?.role === 'admin' });

    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    const modifications = await getModifications({ carId: id, activeOnly: true });
    res.json({ car, modifications });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch car details' });
  }
};

export const createCar = async (req, res) => {
  try {
    const carId = req.body?.id || crypto.randomUUID();
    const imageUrl = await persistCarImage(carId, req.body?.imageUrl);
    const carData = { ...req.body, id: carId, imageUrl };
    const car = await createCarInStore(carData);
    res.status(201).json(car);
  } catch (error) {
    console.error('Error creating car:', error);
    res.status(error.status || 500).json({ error: error.status ? error.message : 'Failed to create car' });
  }
};

export const updateCar = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (Object.prototype.hasOwnProperty.call(req.body || {}, 'imageUrl')) {
      updates.imageUrl = await persistCarImage(id, req.body.imageUrl);
    }

    const car = await updateCarInStore(id, updates);

    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    res.json(car);
  } catch (error) {
    console.error('Error updating car:', error);
    res.status(error.status || 500).json({ error: error.status ? error.message : 'Failed to update car' });
  }
};

export const deleteCar = async (req, res) => {
  try {
    const { id } = req.params;
    const car = await getCarByIdFromStore(id, { includeHidden: true });
    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    await deleteModificationsByCarId(id);
    await deleteCarInStore(id);
    res.json({ message: 'Car deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete car' });
  }
};

export const importFromAPI = async (req, res) => {
  try {
    const { brand } = req.body;

    if (!brand) {
      return res.status(400).json({ error: 'Brand required' });
    }

    const apiCars = await getCarsByBrand(brand);
    const savedCars = [];

    for (const carData of apiCars) {
      const existingCar = await findCarByIdentity({
        brand: carData.brand,
        model: carData.model,
        year: carData.year,
      });

      if (!existingCar) {
        const saved = await createCarInStore(carData);
        savedCars.push(saved);
      }
    }

    res.status(201).json({
      message: `Imported ${savedCars.length} new cars`,
      cars: savedCars,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to import cars' });
  }
};
