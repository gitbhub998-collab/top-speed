import bcryptjs from 'bcryptjs';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { supabaseAdmin } from '../config/supabase.js';

const USERS_TABLE = 'users';
const CARS_TABLE = 'cars';
const MODIFICATIONS_TABLE = 'modifications';
const SERVICE_REQUESTS_TABLE = 'service_requests';
const PACKAGES_TABLE = 'packages';
const PACKAGE_MODIFICATIONS_TABLE = 'package_modifications';
const USER_STORE_PATH = path.resolve(process.cwd(), 'data', 'users.json');
export const DEFAULT_USER_PREFERENCES = {
  theme: 'system',
  language: 'en',
  motion: 'full',
  notifications: {
    serviceUpdates: true,
    productNews: false,
  },
};

const toCamelCase = (value) => value.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

const mapRow = (row) => {
  if (!row) return null;
  return Object.entries(row).reduce((acc, [key, value]) => {
    acc[toCamelCase(key)] = value;
    return acc;
  }, {});
};

const mapRows = (rows) => rows?.map(mapRow) ?? [];

export const normalizeCarRecord = (row, fallback = {}) => {
  const mapped = mapRow(row) ?? {};
  const id = mapped.id ?? fallback.id ?? null;
  const record = {
    ...fallback,
    ...mapped,
    id,
    _id: id,
    brand: mapped.brand ?? fallback.brand ?? null,
    model: mapped.model ?? fallback.model ?? null,
    year: mapped.year ?? fallback.year ?? null,
    horsepower: mapped.horsepower ?? fallback.horsepower ?? 0,
    torque: mapped.torque ?? fallback.torque ?? 0,
    fuelType: mapped.fuelType ?? mapped.fuel_type ?? fallback.fuelType ?? null,
    drivetrain: mapped.drivetrain ?? fallback.drivetrain ?? null,
    acceleration: mapped.acceleration ?? fallback.acceleration ?? null,
    topSpeed: mapped.topSpeed ?? mapped.top_speed ?? fallback.topSpeed ?? null,
    category: mapped.category ?? fallback.category ?? null,
    isVisible: mapped.isVisible ?? mapped.is_visible ?? fallback.isVisible ?? true,
    externalId: mapped.externalId ?? mapped.external_id ?? fallback.externalId ?? null,
    description: mapped.description ?? fallback.description ?? null,
    price: mapped.price ?? fallback.price ?? null,
    imageUrl: mapped.imageUrl ?? mapped.image_url ?? fallback.imageUrl ?? null,
    createdAt: mapped.createdAt ?? mapped.created_at ?? fallback.createdAt ?? null,
    updatedAt: mapped.updatedAt ?? mapped.updated_at ?? fallback.updatedAt ?? null,
  };

  return record;
};

const normalizeCarInput = (input) => ({
  brand: input.brand ?? null,
  model: input.model ?? null,
  year: input.year ?? null,
  engine: input.engine ?? null,
  horsepower: input.horsepower ?? 0,
  torque: input.torque ?? 0,
  fuelType: input.fuelType ?? input.fuel_type ?? null,
  drivetrain: input.drivetrain ?? null,
  acceleration: input.acceleration ?? null,
  topSpeed: input.topSpeed ?? input.top_speed ?? null,
  category: input.category ?? null,
  isVisible: input.isVisible ?? input.is_visible ?? true,
  externalId: input.externalId ?? input.external_id ?? null,
  description: input.description ?? null,
  price: input.price ?? null,
  imageUrl: input.imageUrl ?? input.image_url ?? null,
});

const toCarRow = (input) => {
  const normalized = normalizeCarInput(input);
  return {
    id: input.id ?? randomUUID(),
    brand: normalized.brand,
    model: normalized.model,
    year: normalized.year,
    engine: normalized.engine,
    horsepower: normalized.horsepower,
    torque: normalized.torque,
    fuel_type: normalized.fuelType,
    drivetrain: normalized.drivetrain,
    acceleration: normalized.acceleration,
    top_speed: normalized.topSpeed,
    category: normalized.category,
    is_visible: normalized.isVisible,
    external_id: normalized.externalId,
    description: normalized.description,
    price: normalized.price,
    image_url: normalized.imageUrl,
    created_at: input.createdAt ?? input.created_at ?? new Date().toISOString(),
    updated_at: input.updatedAt ?? input.updated_at ?? new Date().toISOString(),
  };
};

const toCarUpdateRow = (updates) => {
  const fieldMap = {
    brand: 'brand', model: 'model', year: 'year', engine: 'engine', horsepower: 'horsepower', torque: 'torque',
    fuelType: 'fuel_type', drivetrain: 'drivetrain', acceleration: 'acceleration', topSpeed: 'top_speed',
    category: 'category', isVisible: 'is_visible', externalId: 'external_id', description: 'description',
    price: 'price', imageUrl: 'image_url',
  };
  return Object.entries(fieldMap).reduce((payload, [inputKey, databaseKey]) => {
    if (Object.prototype.hasOwnProperty.call(updates, inputKey)) payload[databaseKey] = updates[inputKey];
    return payload;
  }, {});
};

const normalizeModificationInput = (input) => ({
  carId: input.carId ?? input.car_id ?? null,
  compatibleCarIds: input.compatibleCarIds ?? input.compatible_car_ids ?? (input.carId ? [input.carId] : []),
  type: input.type ?? null,
  name: input.name ?? null,
  description: input.description ?? null,
  category: input.category ?? input.type ?? 'Other',
  price: input.price ?? 0,
  priceType: input.priceType ?? input.price_type ?? 'fixed',
  horsepower: input.horsepower ?? 0,
  torque: input.torque ?? 0,
  acceleration: input.acceleration ?? input.accelerationDelta ?? input.acceleration_delta ?? 0,
  topSpeed: input.topSpeed ?? input.topSpeedDelta ?? input.top_speed_delta ?? 0,
  weight: input.weight ?? input.weightDelta ?? input.weight_delta ?? 0,
  availability: input.availability ?? 'unlimited',
  stock: input.stock ?? null,
  isActive: input.isActive ?? input.is_active ?? true,
  requirements: input.requirements ?? [],
  conflicts: input.conflicts ?? [],
});

const toModificationRow = (input) => {
  const normalized = normalizeModificationInput(input);
  return {
    id: input.id ?? randomUUID(),
    car_id: normalized.carId,
    compatible_car_ids: normalized.compatibleCarIds,
    type: normalized.type,
    name: normalized.name,
    description: normalized.description,
    category: normalized.category,
    price: normalized.price,
    price_type: normalized.priceType,
    horsepower: normalized.horsepower,
    torque: normalized.torque,
    acceleration_delta: normalized.acceleration,
    top_speed_delta: normalized.topSpeed,
    weight_delta: normalized.weight,
    availability: normalized.availability,
    stock: normalized.stock,
    is_active: normalized.isActive,
    requirements: normalized.requirements,
    conflicts: normalized.conflicts,
    created_at: input.createdAt ?? input.created_at ?? new Date().toISOString(),
    updated_at: input.updatedAt ?? input.updated_at ?? new Date().toISOString(),
  };
};

const applyError = (error) => {
  if (error?.message) {
    throw new Error(error.message);
  }
  throw new Error('Supabase request failed');
};

const isSupabaseUnavailableError = (error) => {
  if (!error) return false;
  const message = `${error.message || ''} ${error.details || ''}`.toLowerCase();
  return (
    message.includes('fetch failed') ||
    message.includes('enotfound') ||
    message.includes('econnrefused') ||
    message.includes('socket hang up') ||
    message.includes('network')
  );
};

const normalizeUserRecord = (user) => {
  if (!user) return null;
  return {
    ...user,
    id: user.id ?? user._id ?? null,
    name: user.name ?? null,
    email: user.email ?? null,
    passwordHash: user.passwordHash ?? user.password_hash ?? null,
    role: user.role ?? 'user',
    isActive: user.isActive ?? user.is_active ?? false,
    isEmailVerified: user.isEmailVerified ?? user.is_email_verified ?? false,
    sessionVersion: user.sessionVersion ?? user.session_version ?? 0,
    otp: user.otp ?? null,
    otpExpiresAt: user.otpExpiresAt ?? user.otp_expires_at ?? null,
    phone: user.phone ?? null,
    avatarUrl: user.avatarUrl ?? user.avatar_url ?? null,
    preferences: user.preferences ?? DEFAULT_USER_PREFERENCES,
    createdAt: user.createdAt ?? user.created_at ?? null,
    updatedAt: user.updatedAt ?? user.updated_at ?? null,
  };
};

const readUserStore = async () => {
  try {
    const content = await fs.readFile(USER_STORE_PATH, 'utf8');
    if (!content.trim()) return [];
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error?.code === 'ENOENT') {
      await fs.mkdir(path.dirname(USER_STORE_PATH), { recursive: true });
      await fs.writeFile(USER_STORE_PATH, '[]', 'utf8');
      return [];
    }
    throw error;
  }
};

const writeUserStore = async (users) => {
  await fs.mkdir(path.dirname(USER_STORE_PATH), { recursive: true });
  await fs.writeFile(USER_STORE_PATH, JSON.stringify(users, null, 2), 'utf8');
};

const getUserFallback = async (matcher) => {
  const users = await readUserStore();
  return users.find(matcher) ?? null;
};

export const getUserByEmail = async (email) => {
  if (!email) return null;

  try {
    const { data, error } = await supabaseAdmin
      .from(USERS_TABLE)
      .select('*')
      .ilike('email', email)
      .maybeSingle();

    if (error) throw error;
    return data ? mapRow(data) : null;
  } catch (error) {
    if (isSupabaseUnavailableError(error)) {
      const normalizedEmail = email.toLowerCase();
      const storedUser = await getUserFallback((user) => (user.email || '').toLowerCase() === normalizedEmail);
      return normalizeUserRecord(storedUser);
    }
    applyError(error);
  }
};

export const getUserById = async (id) => {
  if (!id) return null;

  try {
    const { data, error } = await supabaseAdmin.from(USERS_TABLE).select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? mapRow(data) : null;
  } catch (error) {
    if (isSupabaseUnavailableError(error)) {
      const storedUser = await getUserFallback((user) => user.id === id);
      return normalizeUserRecord(storedUser);
    }
    applyError(error);
  }
};

export const createUser = async (userData) => {
  const passwordHash = await bcryptjs.hash(userData.password, 10);
  const payload = {
    id: userData.id ?? randomUUID(),
    name: userData.name ?? null,
    email: (userData.email || '').toLowerCase(),
    password_hash: passwordHash,
    role: userData.role ?? 'user',
    is_active: userData.isActive ?? userData.is_active ?? false,
    is_email_verified: userData.isEmailVerified ?? userData.is_email_verified ?? false,
    session_version: userData.sessionVersion ?? userData.session_version ?? 0,
    otp: userData.otp ?? null,
    otp_expires_at: userData.otpExpiresAt ?? userData.otp_expires_at ?? null,
    phone: userData.phone ?? null,
    avatar_url: userData.avatarUrl ?? userData.avatar_url ?? null,
    preferences: userData.preferences ?? DEFAULT_USER_PREFERENCES,
    created_at: userData.createdAt ?? userData.created_at ?? new Date().toISOString(),
    updated_at: userData.updatedAt ?? userData.updated_at ?? new Date().toISOString(),
  };

  try {
    const { data, error } = await supabaseAdmin.from(USERS_TABLE).insert(payload).select('*').single();
    if (error) throw error;
    return mapRow(data);
  } catch (error) {
    if (isSupabaseUnavailableError(error)) {
      const users = await readUserStore();
      const existing = users.find((user) => (user.email || '').toLowerCase() === payload.email.toLowerCase());
      if (existing) {
        return normalizeUserRecord(existing);
      }

      const storedUser = {
        id: payload.id,
        name: payload.name,
        email: payload.email,
        passwordHash,
        role: userData.role ?? 'user',
        isActive: userData.isActive ?? userData.is_active ?? false,
        isEmailVerified: userData.isEmailVerified ?? userData.is_email_verified ?? false,
        sessionVersion: userData.sessionVersion ?? userData.session_version ?? 0,
        otp: userData.otp ?? null,
        otpExpiresAt: userData.otpExpiresAt ?? userData.otp_expires_at ?? null,
        phone: userData.phone ?? null,
        avatarUrl: userData.avatarUrl ?? userData.avatar_url ?? null,
        preferences: userData.preferences ?? DEFAULT_USER_PREFERENCES,
        createdAt: payload.created_at,
        updatedAt: payload.updated_at,
      };
      users.push(storedUser);
      await writeUserStore(users);
      return normalizeUserRecord(storedUser);
    }
    applyError(error);
  }
};

export const updateUser = async (id, updates) => {
  const payload = { updated_at: new Date().toISOString() };
  if (updates.password) payload.password_hash = await bcryptjs.hash(updates.password, 10);
  if (updates.email !== undefined) payload.email = updates.email.toLowerCase();
  if (updates.isActive !== undefined || updates.is_active !== undefined) payload.is_active = updates.isActive ?? updates.is_active;
  if (updates.isEmailVerified !== undefined || updates.is_email_verified !== undefined) payload.is_email_verified = updates.isEmailVerified ?? updates.is_email_verified;
  if (updates.otpExpiresAt !== undefined || updates.otp_expires_at !== undefined) payload.otp_expires_at = updates.otpExpiresAt ?? updates.otp_expires_at;
  if (updates.sessionVersion !== undefined || updates.session_version !== undefined) payload.session_version = updates.sessionVersion ?? updates.session_version;
  if (updates.otp !== undefined) payload.otp = updates.otp;
  if (updates.phone !== undefined) payload.phone = updates.phone;
  if (updates.avatarUrl !== undefined || updates.avatar_url !== undefined) payload.avatar_url = updates.avatarUrl ?? updates.avatar_url;
  if (updates.preferences !== undefined) payload.preferences = updates.preferences;
  if (updates.role !== undefined) payload.role = updates.role;
  if (updates.name !== undefined) payload.name = updates.name;

  try {
    const { data, error } = await supabaseAdmin.from(USERS_TABLE).update(payload).eq('id', id).select('*').single();
    if (error) throw error;
    return mapRow(data);
  } catch (error) {
    if (isSupabaseUnavailableError(error)) {
      const users = await readUserStore();
      const index = users.findIndex((user) => user.id === id);
      if (index === -1) {
        return null;
      }

      const storedUser = users[index];
      const updatedUser = {
        ...storedUser,
        ...updates,
        id,
        passwordHash: payload.password_hash ?? storedUser.passwordHash,
        sessionVersion: updates.sessionVersion ?? updates.session_version ?? storedUser.sessionVersion ?? 0,
        isActive: updates.isActive ?? updates.is_active ?? storedUser.isActive,
        isEmailVerified: updates.isEmailVerified ?? updates.is_email_verified ?? storedUser.isEmailVerified,
        otpExpiresAt: updates.otpExpiresAt ?? updates.otp_expires_at ?? storedUser.otpExpiresAt,
        otp: Object.prototype.hasOwnProperty.call(updates, 'otp') ? updates.otp : storedUser.otp,
        phone: updates.phone ?? storedUser.phone,
        avatarUrl: updates.avatarUrl ?? updates.avatar_url ?? storedUser.avatarUrl,
        preferences: updates.preferences ?? storedUser.preferences ?? DEFAULT_USER_PREFERENCES,
        role: updates.role ?? storedUser.role,
        name: updates.name ?? storedUser.name,
        updatedAt: new Date().toISOString(),
      };
      if (updates.email) {
        updatedUser.email = updates.email.toLowerCase();
      }
      users[index] = updatedUser;
      await writeUserStore(users);
      return normalizeUserRecord(updatedUser);
    }
    applyError(error);
  }
};

export const uploadUserAvatar = async (userId, buffer, contentType) => {
  const objectPath = `${userId}/avatar`;
  const { error: uploadError } = await supabaseAdmin.storage.from('avatars').upload(objectPath, buffer, {
    contentType,
    upsert: true,
    cacheControl: '3600',
  });
  if (uploadError) applyError(uploadError);
  const { data } = supabaseAdmin.storage.from('avatars').getPublicUrl(objectPath);
  return `${data.publicUrl}?v=${Date.now()}`;
};

export const uploadCarImage = async (carId, buffer, contentType) => {
  const objectPath = `${carId}/image`;
  const { error: uploadError } = await supabaseAdmin.storage.from('car-images').upload(objectPath, buffer, {
    contentType,
    upsert: true,
    cacheControl: '3600',
  });
  if (uploadError) applyError(uploadError);
  const { data } = supabaseAdmin.storage.from('car-images').getPublicUrl(objectPath);
  return `${data.publicUrl}?v=${Date.now()}`;
};

export const compareUserPassword = async (passwordHash, password) => {
  return bcryptjs.compare(password, passwordHash);
};

export const deleteUser = async (id) => {
  try {
    const { error } = await supabaseAdmin.from(USERS_TABLE).delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    if (isSupabaseUnavailableError(error)) {
      const users = await readUserStore();
      const filtered = users.filter((user) => user.id !== id);
      await writeUserStore(filtered);
      return;
    }
    applyError(error);
  }
};

export const getCars = async ({ brand, isVisible, includeHidden }) => {
  let query = supabaseAdmin.from(CARS_TABLE).select('*');

  if (brand) query = query.eq('brand', brand);
  if (includeHidden !== 'true') {
    if (isVisible !== undefined) {
      query = query.eq('is_visible', isVisible === 'true');
    } else {
      query = query.eq('is_visible', true);
    }
  }

  const { data, error } = await query.order('created_at', { ascending: false }).limit(100);
  if (error) applyError(error);
  return (data ?? []).map((row) => normalizeCarRecord(row));
};

export const getCarById = async (id, { includeHidden = false } = {}) => {
  let query = supabaseAdmin.from(CARS_TABLE).select('*').eq('id', id);
  if (!includeHidden) query = query.eq('is_visible', true);
  const { data, error } = await query.maybeSingle();
  if (error) applyError(error);
  return data ? normalizeCarRecord(data) : null;
};

export const findCarByIdentity = async ({ brand, model, year }) => {
  const { data, error } = await supabaseAdmin.from(CARS_TABLE).select('*').eq('brand', brand).eq('model', model).eq('year', year).maybeSingle();
  if (error) applyError(error);
  return data ? mapRow(data) : null;
};

export const createCar = async (carData) => {
  const row = toCarRow(carData);
  const { data, error } = await supabaseAdmin.from(CARS_TABLE).insert(row).select('*').single();
  if (error) applyError(error);
  return normalizeCarRecord(data);
};

export const updateCar = async (id, updates) => {
  const payload = toCarUpdateRow(updates);
  payload.updated_at = new Date().toISOString();
  const { data, error } = await supabaseAdmin.from(CARS_TABLE).update(payload).eq('id', id).select('*').single();
  if (error) applyError(error);
  return normalizeCarRecord(data);
};

export const deleteCar = async (id) => {
  const { error: modError } = await supabaseAdmin.from(MODIFICATIONS_TABLE).delete().eq('car_id', id);
  if (modError) applyError(modError);
  const { error } = await supabaseAdmin.from(CARS_TABLE).delete().eq('id', id);
  if (error) applyError(error);
};

export const getModifications = async ({ carId, type, activeOnly = false }) => {
  let query = supabaseAdmin.from(MODIFICATIONS_TABLE).select('*');
  if (carId) {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(carId)) {
      return [];
    }
    query = query.or(`car_id.eq.${carId},compatible_car_ids.cs.{${carId}}`);
  }
  if (type) query = query.eq('type', type);
  if (activeOnly) query = query.eq('is_active', true);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) applyError(error);
  return mapRows(data).map((mod) => ({
    ...mod,
    carId: mod.carId ?? mod.car_id,
    compatibleCarIds: mod.compatibleCarIds ?? mod.compatible_car_ids ?? (mod.carId ? [mod.carId] : []),
    category: mod.category ?? mod.type ?? 'Other',
    priceType: mod.priceType ?? mod.price_type ?? 'fixed',
    acceleration: mod.acceleration ?? mod.accelerationDelta ?? mod.acceleration_delta ?? 0,
    topSpeed: mod.topSpeed ?? mod.topSpeedDelta ?? mod.top_speed_delta ?? 0,
    weight: mod.weight ?? mod.weightDelta ?? mod.weight_delta ?? 0,
    availability: mod.availability ?? 'unlimited',
    isActive: mod.isActive ?? mod.is_active ?? true,
    requirements: mod.requirements ?? [],
    conflicts: mod.conflicts ?? [],
  }));
};

export const createModification = async (modData) => {
  const row = toModificationRow(modData);
  const { data, error } = await supabaseAdmin.from(MODIFICATIONS_TABLE).insert(row).select('*').single();
  if (error) applyError(error);
  return mapRow(data);
};

export const updateModification = async (id, updates) => {
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from(MODIFICATIONS_TABLE)
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (fetchError) applyError(fetchError);
  if (!existing) return null;

  const payload = toModificationRow({ ...mapRow(existing), ...updates, id });
  delete payload.id;
  payload.updated_at = new Date().toISOString();
  const { data, error } = await supabaseAdmin.from(MODIFICATIONS_TABLE).update(payload).eq('id', id).select('*').single();
  if (error) applyError(error);
  return mapRow(data);
};

export const deleteModification = async (id) => {
  const { data, error } = await supabaseAdmin
    .from(MODIFICATIONS_TABLE)
    .delete()
    .eq('id', id)
    .select('id')
    .maybeSingle();
  if (error) applyError(error);
  return data;
};

export const deleteModificationsByCarId = async (carId) => {
  const { error } = await supabaseAdmin.from(MODIFICATIONS_TABLE).delete().eq('car_id', carId);
  if (error) applyError(error);
};

const normalizePackageInput = (input) => ({
  name: input.name?.trim() ?? null,
  description: input.description ?? null,
  price: input.price ?? 0,
  discountPercentage: input.discountPercentage ?? input.discount_percentage ?? 0,
  imageUrl: input.imageUrl ?? input.image_url ?? null,
  isActive: input.isActive ?? input.is_active ?? true,
  modificationIds: [...new Set(input.modificationIds ?? input.modification_ids ?? [])],
});

const mapPackage = (row, modificationIds = []) => ({ ...mapRow(row), modificationIds });

const getPackageModificationIds = async (packageId) => {
  const { data, error } = await supabaseAdmin
    .from(PACKAGE_MODIFICATIONS_TABLE)
    .select('modification_id, sort_order')
    .eq('package_id', packageId)
    .order('sort_order', { ascending: true });
  if (error) applyError(error);
  return (data ?? []).map((row) => row.modification_id);
};

export const getPackages = async ({ includeInactive = false } = {}) => {
  let query = supabaseAdmin.from(PACKAGES_TABLE).select('*');
  if (!includeInactive) query = query.eq('is_active', true);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) applyError(error);
  return Promise.all((data ?? []).map(async (row) => mapPackage(row, await getPackageModificationIds(row.id))));
};

export const getPackageById = async (id, { includeInactive = false } = {}) => {
  let query = supabaseAdmin.from(PACKAGES_TABLE).select('*').eq('id', id);
  if (!includeInactive) query = query.eq('is_active', true);
  const { data, error } = await query.maybeSingle();
  if (error) applyError(error);
  return data ? mapPackage(data, await getPackageModificationIds(id)) : null;
};

export const createPackage = async (input) => {
  const normalized = normalizePackageInput(input);
  const payload = {
    id: input.id ?? randomUUID(),
    name: normalized.name,
    description: normalized.description,
    price: normalized.price,
    discount_percentage: normalized.discountPercentage,
    image_url: normalized.imageUrl,
    is_active: normalized.isActive,
  };
  const { data, error } = await supabaseAdmin.rpc('upsert_package', {
    p_package: payload,
    p_modification_ids: normalized.modificationIds,
  });
  if (error) applyError(error);
  return mapPackage(data, normalized.modificationIds);
};

export const updatePackage = async (id, input) => {
  const existing = await getPackageById(id);
  if (!existing) return null;
  const normalized = normalizePackageInput({ ...existing, ...input });
  const payload = {
    name: normalized.name,
    description: normalized.description,
    price: normalized.price,
    discount_percentage: normalized.discountPercentage,
    image_url: normalized.imageUrl,
    is_active: normalized.isActive,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabaseAdmin.rpc('upsert_package', {
    p_package: { ...payload, id },
    p_modification_ids: normalized.modificationIds,
  });
  if (error) applyError(error);
  return mapPackage(data, normalized.modificationIds);
};

export const deletePackage = async (id) => {
  const { data, error } = await supabaseAdmin.from(PACKAGES_TABLE).delete().eq('id', id).select('id').maybeSingle();
  if (error) applyError(error);
  return data;
};

export const createServiceRequest = async (payload) => {
  const dataToInsert = {
    id: randomUUID(),
    name: payload.name ?? null,
    email: payload.email ?? null,
    phone: payload.phone ?? null,
    request_type: payload.requestType ?? payload.request_type ?? null,
    details: payload.details ?? null,
    status: payload.status ?? 'pending',
    created_at: new Date().toISOString(),
  };
  const { data, error } = await supabaseAdmin.from(SERVICE_REQUESTS_TABLE).insert(dataToInsert).select('*').single();
  if (error) applyError(error);
  return mapRow(data);
};
