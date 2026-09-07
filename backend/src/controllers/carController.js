import { getCarsByBrand } from '../services/carApiService.js';
import {
  getCars,
  getCarById as getCarByIdFromStore,
  createCar as createCarInStore,
  updateCar as updateCarInStore,
  deleteCar as deleteCarInStore,
  findCarByIdentity,
  getModifications,
  deleteModificationsByCarId,
} from '../services/supabaseDataService.js';

export const getAllCars = async (req, res) => {
  try {
    const { brand, isVisible, includeHidden } = req.query;
    if ((includeHidden === 'true' || isVisible === 'false') && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const cars = await getCars({ brand, isVisible, includeHidden });
    res.json(cars);
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
    const carData = req.body;
    const car = await createCarInStore(carData);
    res.status(201).json(car);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create car' });
  }
};

export const updateCar = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const car = await updateCarInStore(id, updates);

    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    res.json(car);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update car' });
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
