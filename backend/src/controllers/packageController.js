import {
  getPackages as getPackagesFromStore,
  getPackageById as getPackageByIdFromStore,
  createPackage as createPackageInStore,
  updatePackage as updatePackageInStore,
  deletePackage as deletePackageFromStore,
} from '../services/supabaseDataService.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const validatePackage = (data, { partial = false } = {}) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return 'A valid object is required';
  if (!partial && !data.name?.trim()) return 'Package name is required';
  if (data.name !== undefined && !data.name?.trim()) return 'Package name is required';
  if (!partial && !Array.isArray(data.modificationIds)) return 'Modification IDs are required';
  if (data.modificationIds !== undefined && (!Array.isArray(data.modificationIds) || data.modificationIds.some((id) => !UUID_PATTERN.test(id)))) return 'Modification IDs are invalid';
  for (const field of ['price', 'discountPercentage']) {
    if (data[field] !== undefined && (!Number.isFinite(Number(data[field])) || Number(data[field]) < 0 || (field === 'discountPercentage' && Number(data[field]) > 100))) {
      return field === 'price' ? 'Price must be non-negative' : 'Discount percentage must be between 0 and 100';
    }
  }
  return null;
};

export const getPackages = async (req, res) => {
  try {
    res.json(await getPackagesFromStore({ includeInactive: req.user?.role === 'admin' }));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
};

export const getPackageById = async (req, res) => {
  try {
    const packageRecord = await getPackageByIdFromStore(req.params.id, { includeInactive: req.user?.role === 'admin' });
    if (!packageRecord) return res.status(404).json({ error: 'Package not found' });
    res.json(packageRecord);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch package details' });
  }
};

export const createPackage = async (req, res) => {
  try {
    const validationError = validatePackage(req.body);
    if (validationError) return res.status(400).json({ error: validationError });
    res.status(201).json(await createPackageInStore(req.body));
  } catch (error) {
    res.status(500).json({ error: 'Failed to create package' });
  }
};

export const updatePackage = async (req, res) => {
  try {
    const validationError = validatePackage(req.body, { partial: true });
    if (validationError) return res.status(400).json({ error: validationError });
    const packageRecord = await updatePackageInStore(req.params.id, req.body);
    if (!packageRecord) return res.status(404).json({ error: 'Package not found' });
    res.json(packageRecord);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update package' });
  }
};

export const deletePackage = async (req, res) => {
  try {
    const packageRecord = await deletePackageFromStore(req.params.id);
    if (!packageRecord) return res.status(404).json({ error: 'Package not found' });
    res.json({ message: 'Package deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete package' });
  }
};