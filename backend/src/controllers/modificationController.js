import {
  getModifications as getModificationsFromStore,
  createModification as createModificationInStore,
  updateModification as updateModificationInStore,
  deleteModification as deleteModificationFromStore,
  getCarById,
} from '../services/supabaseDataService.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const validateModification = async (data, { partial = false, modificationId = null } = {}) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return 'A valid object is required';
  if (!partial && !data.name?.trim()) return 'Modification name is required';
  if (data.name !== undefined && !data.name?.trim()) return 'Modification name is required';
  if (!partial && (!Array.isArray(data.compatibleCarIds) || data.compatibleCarIds.length === 0)) {
    return 'At least one compatible vehicle is required';
  }
  if (data.compatibleCarIds !== undefined) {
    if (!Array.isArray(data.compatibleCarIds) || data.compatibleCarIds.length === 0) return 'At least one compatible vehicle is required';
    if (new Set(data.compatibleCarIds).size !== data.compatibleCarIds.length || data.compatibleCarIds.some((id) => !UUID_PATTERN.test(id))) return 'Compatible vehicle IDs are invalid';
    const cars = await Promise.all(data.compatibleCarIds.map((carId) => getCarById(carId)));
    if (cars.some((car) => !car)) return 'One or more compatible vehicles do not exist';
  }
  if (data.requirements !== undefined && (!Array.isArray(data.requirements) || data.requirements.some((id) => !UUID_PATTERN.test(id)))) return 'Requirement IDs are invalid';
  if (data.conflicts !== undefined && (!Array.isArray(data.conflicts) || data.conflicts.some((id) => !UUID_PATTERN.test(id)))) return 'Conflict IDs are invalid';
  if (modificationId && [...(data.requirements || []), ...(data.conflicts || [])].includes(modificationId)) return 'A modification cannot require or conflict with itself';
  if (data.priceType !== undefined && !['fixed', 'percentage'].includes(data.priceType)) return 'Invalid price type';
  const numericFields = ['price', 'horsepower', 'torque', 'acceleration', 'topSpeed', 'weight', 'stock'];
  if (numericFields.some((field) => data[field] !== undefined && (!Number.isFinite(Number(data[field])) || Number(data[field]) < 0))) return 'Numeric values must be finite and non-negative';
  if (data.availability !== undefined && !['unlimited', 'in_stock', 'made_to_order'].includes(data.availability)) return 'Invalid availability';
  return null;
};

export const getModifications = async (req, res) => {
  try {
    const { carId, type } = req.query;
    const modifications = await getModificationsFromStore({ carId, type });
    res.json(modifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch modifications' });
  }
};

export const createModification = async (req, res) => {
  try {
    const modData = req.body;
    const validationError = await validateModification(modData);
    if (validationError) return res.status(400).json({ error: validationError });
    const modification = await createModificationInStore(modData);
    res.status(201).json(modification);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create modification' });
  }
};

export const updateModification = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const validationError = await validateModification(updates, { partial: true, modificationId: id });
    if (validationError) return res.status(400).json({ error: validationError });

    const modification = await updateModificationInStore(id, updates);

    if (!modification) {
      return res.status(404).json({ error: 'Modification not found' });
    }

    res.json(modification);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update modification' });
  }
};

export const deleteModification = async (req, res) => {
  try {
    const { id } = req.params;
    const modification = await deleteModificationFromStore(id);

    if (!modification) {
      return res.status(404).json({ error: 'Modification not found' });
    }

    res.json({ message: 'Modification deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete modification' });
  }
};
