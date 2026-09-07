import {
  getCarById as getCarByIdFromStore,
  getModifications,
} from '../services/supabaseDataService.js';
import { calculateModificationImpact } from '../utils/performanceCalculator.js';

export const calculateConfiguration = async (req, res) => {
  try {
    const { carId, modifications } = req.body;

    if (!carId || !modifications) {
      return res.status(400).json({ error: 'Car ID and modifications required' });
    }

    const car = await getCarByIdFromStore(carId);
    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    if (!Array.isArray(modifications)) {
      return res.status(400).json({ error: 'Modifications must be an array' });
    }

    const requestedIds = modifications
      .map((modification) => typeof modification === 'string' ? modification : modification?.id || modification?._id)
      .filter(Boolean);
    const compatibleModifications = await getModifications({ carId, activeOnly: true });
    const selectedModifications = compatibleModifications.filter((modification) => requestedIds.includes(modification.id || modification._id));

    if (selectedModifications.length !== requestedIds.length) {
      return res.status(400).json({ error: 'One or more modifications are not active or compatible with this vehicle' });
    }

    const selectedIds = new Set(requestedIds);
    for (const modification of selectedModifications) {
      const missingRequirement = (modification.requirements || []).find((id) => !selectedIds.has(id));
      if (missingRequirement) {
        return res.status(400).json({ error: `${modification.name} requires another selected modification` });
      }
      const conflict = (modification.conflicts || []).find((id) => selectedIds.has(id));
      if (conflict) {
        return res.status(400).json({ error: `${modification.name} conflicts with another selected modification` });
      }
      if (modification.availability === 'in_stock' && Number(modification.stock) <= 0) {
        return res.status(400).json({ error: `${modification.name} is currently out of stock` });
      }
    }

    const impact = calculateModificationImpact(car, selectedModifications);
    res.json(impact);
  } catch (error) {
    res.status(500).json({ error: 'Unable to calculate this configuration' });
  }
};
