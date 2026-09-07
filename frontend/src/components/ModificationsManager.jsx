import React, { useMemo, useState } from 'react';
import { modificationService } from '../services/api';
import {
  Check,
  Copy,
  Edit,
  Eye,
  EyeOff,
  Filter,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';

const CATEGORIES = [
  'Performance',
  'Exterior',
  'Interior',
  'Wheels',
  'Brakes',
  'Suspension',
  'Exhaust',
  'Engine',
  'Technology',
  'Other',
];

const EMPTY_FORM = {
  name: '',
  description: '',
  category: 'Performance',
  price: 0,
  priceType: 'fixed',
  horsepower: 0,
  torque: 0,
  acceleration: 0,
  topSpeed: 0,
  weight: 0,
  availability: 'unlimited',
  stock: '',
  isActive: true,
  compatibleCarIds: [],
  requirements: [],
  conflicts: [],
};

const toNumberOrZero = (value) => {
  if (value === '' || value === null || value === undefined) return 0;
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const normalizeForm = (modification) => ({
  ...EMPTY_FORM,
  ...modification,
  category: modification.category || modification.type || 'Other',
  priceType: modification.priceType || 'fixed',
  compatibleCarIds: modification.compatibleCarIds || (modification.carId ? [modification.carId] : []),
  requirements: modification.requirements || [],
  conflicts: modification.conflicts || [],
  stock: modification.stock ?? '',
});

export const ModificationsManager = ({ modifications, cars, onChanged, onNotify }) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('newest');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [vehicleQuery, setVehicleQuery] = useState('');
  const [vehicleBrand, setVehicleBrand] = useState('all');
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);

  const brands = useMemo(() => ['all', ...new Set(cars.map((car) => car.brand).filter(Boolean))], [cars]);
  const filteredVehicles = useMemo(() => cars.filter((car) => {
    const text = `${car.brand} ${car.model}`.toLowerCase();
    return (!vehicleQuery || text.includes(vehicleQuery.toLowerCase()))
      && (vehicleBrand === 'all' || car.brand === vehicleBrand);
  }), [cars, vehicleQuery, vehicleBrand]);
  const filteredModifications = useMemo(() => modifications
    .filter((modification) => {
      const text = `${modification.name} ${modification.description || ''}`.toLowerCase();
      return (!query || text.includes(query.toLowerCase()))
        && (category === 'all' || (modification.category || modification.type) === category)
        && (status === 'all' || (status === 'active' ? modification.isActive !== false : modification.isActive === false));
    })
    .sort((first, second) => {
      if (sort === 'name') return first.name.localeCompare(second.name);
      if (sort === 'price') return Number(second.price || 0) - Number(first.price || 0);
      return new Date(second.createdAt || 0) - new Date(first.createdAt || 0);
    }), [modifications, query, category, status, sort]);

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const toggleVehicle = (carId) => setForm((current) => ({
    ...current,
    compatibleCarIds: current.compatibleCarIds.includes(carId)
      ? current.compatibleCarIds.filter((id) => id !== carId)
      : [...current.compatibleCarIds, carId],
  }));
  const toggleAllVehicles = () => {
    const ids = filteredVehicles.map((car) => car._id || car.id);
    const allSelected = ids.every((id) => form.compatibleCarIds.includes(id));
    setForm((current) => ({
      ...current,
      compatibleCarIds: allSelected
        ? current.compatibleCarIds.filter((id) => !ids.includes(id))
        : [...new Set([...current.compatibleCarIds, ...ids])],
    }));
  };
  const toggleRelation = (field, modificationId) => setForm((current) => ({
    ...current,
    [field]: current[field].includes(modificationId)
      ? current[field].filter((id) => id !== modificationId)
      : [...current[field], modificationId],
  }));

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };
  const openEdit = (modification) => {
    setEditingId(modification._id || modification.id);
    setForm(normalizeForm(modification));
    setShowForm(true);
  };
  const duplicate = (modification) => {
    setEditingId(null);
    setForm({ ...normalizeForm(modification), name: `${modification.name} Copy`, isActive: false });
    setShowForm(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.compatibleCarIds.length) {
      onNotify('Name and at least one compatible vehicle are required.', 'error');
      return;
    }
    setIsSaving(true);
    const payload = {
      ...form,
      name: form.name.trim(),
      type: form.category,
      carId: form.compatibleCarIds[0],
      price: toNumberOrZero(form.price),
      horsepower: toNumberOrZero(form.horsepower),
      torque: toNumberOrZero(form.torque),
      acceleration: toNumberOrZero(form.acceleration),
      topSpeed: toNumberOrZero(form.topSpeed),
      weight: toNumberOrZero(form.weight),
      stock: form.availability === 'in_stock' ? toNumberOrZero(form.stock) : null,
    };
    try {
      if (editingId) {
        await modificationService.updateModification(editingId, payload);
        onNotify('Modification updated successfully.', 'success');
      } else {
        await modificationService.createModification(payload);
        onNotify('Modification created successfully.', 'success');
      }
      setShowForm(false);
      await onChanged();
    } catch (error) {
      onNotify(error.response?.data?.error || 'Unable to save modification.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await modificationService.deleteModification(deleteTarget._id || deleteTarget.id);
      onNotify('Modification deleted successfully.', 'success');
      setDeleteTarget(null);
      await onChanged();
    } catch (error) {
      onNotify(error.response?.data?.error || 'Unable to delete modification.', 'error');
    }
  };

  return (
    <div className="space-y-5">
      <div className="surface-card border rounded-lg p-4 sm:p-5 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Developer settings</p>
          <h3 className="display-heading text-3xl sm:text-4xl text-white font-normal">Modifications</h3>
          <p className="text-sm text-slate-400 mt-2">Manage vehicle modifications, pricing, compatibility and performance effects.</p>
        </div>
        <button type="button" onClick={openCreate} className="accent-button px-4 py-2.5 rounded font-semibold text-sm inline-flex items-center justify-center gap-2">
          <Plus size={17} /> Add Modification
        </button>
      </div>

      <div className="surface-card border rounded-lg p-3 sm:p-4 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_auto_auto] gap-3">
        <label className="relative block">
          <span className="sr-only">Search modifications</span>
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search modifications" className="w-full bg-[#0a1521] border border-white/10 rounded px-10 py-2.5 text-sm text-white placeholder-slate-500 focus:border-orange-300 focus:outline-none" />
        </label>
        <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category" className="bg-[#0a1521] border border-white/10 rounded px-3 py-2.5 text-sm text-slate-200 focus:border-orange-300 focus:outline-none">
          <option value="all">All categories</option>
          {CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by status" className="bg-[#0a1521] border border-white/10 rounded px-3 py-2.5 text-sm text-slate-200 focus:border-orange-300 focus:outline-none">
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort modifications" className="bg-[#0a1521] border border-white/10 rounded px-3 py-2.5 text-sm text-slate-200 focus:border-orange-300 focus:outline-none">
          <option value="newest">Newest</option>
          <option value="name">Name A-Z</option>
          <option value="price">Highest price</option>
        </select>
      </div>

      {filteredModifications.length === 0 ? (
        <div className="surface-card border rounded-lg py-16 px-5 text-center">
          <Filter size={42} className="mx-auto mb-4" />
          <h4 className="display-heading text-2xl text-white font-normal">No modifications yet</h4>
          <p className="text-sm text-slate-400 mt-2">Create your first vehicle modification to start managing upgrades, compatibility and pricing.</p>
          <button type="button" onClick={openCreate} className="accent-button mt-6 px-4 py-2.5 rounded font-semibold text-sm inline-flex items-center gap-2"><Plus size={16} /> Add Modification</button>
        </div>
      ) : filteredModifications.map((modification) => {
        const compatibleCount = (modification.compatibleCarIds || (modification.carId ? [modification.carId] : [])).length;
        const modificationId = modification._id || modification.id;
        return (
          <motion.article key={modificationId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="surface-card border rounded-lg p-4 sm:p-5">
            <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h4 className="text-lg sm:text-xl font-semibold text-white">{modification.name}</h4>
                  <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs text-slate-300">{modification.category || modification.type || 'Other'}</span>
                  <span className={`px-2 py-1 rounded border text-xs ${modification.isActive === false ? 'border-slate-600 text-slate-500' : 'border-emerald-400/40 text-emerald-300'}`}>{modification.isActive === false ? 'Inactive' : 'Active'}</span>
                </div>
                <p className="text-sm text-slate-400 max-w-3xl">{modification.description || 'No description provided.'}</p>
                <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-sm text-slate-300">
                  <span>{modification.priceType === 'percentage' ? `${modification.price || 0}%` : `AED ${Number(modification.price || 0).toLocaleString()}`}</span>
                  <span>{compatibleCount} compatible vehicle{compatibleCount === 1 ? '' : 's'}</span>
                  {modification.horsepower ? <span>+{modification.horsepower} HP</span> : null}
                  {modification.torque ? <span>+{modification.torque} Nm</span> : null}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button type="button" onClick={() => setViewTarget(modification)} title="View modification" aria-label={`View ${modification.name}`} className="p-2.5 rounded bg-white/5 hover:bg-white/10"><Eye size={17} /></button>
                <button type="button" onClick={() => openEdit(modification)} title="Edit modification" aria-label={`Edit ${modification.name}`} className="p-2.5 rounded bg-white/5 hover:bg-white/10"><Edit size={17} /></button>
                <button type="button" onClick={() => duplicate(modification)} title="Duplicate modification" aria-label={`Duplicate ${modification.name}`} className="p-2.5 rounded bg-white/5 hover:bg-white/10"><Copy size={17} /></button>
                <button type="button" onClick={() => setDeleteTarget(modification)} title="Delete modification" aria-label={`Delete ${modification.name}`} className="p-2.5 rounded bg-red-900/30 hover:bg-red-900/50"><Trash2 size={17} /></button>
              </div>
            </div>
          </motion.article>
        );
      })}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/75 p-3 sm:p-6 overflow-y-auto">
          <div className="min-h-full flex items-start justify-center py-4 sm:py-10">
            <motion.form onSubmit={handleSave} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="form-surface border rounded-lg w-full max-w-5xl p-4 sm:p-6 md:p-8">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div><p className="eyebrow mb-2">{editingId ? 'Edit entity' : 'New entity'}</p><h4 className="display-heading text-3xl text-white font-normal">{editingId ? 'Edit Modification' : 'Add Modification'}</h4></div>
                <button type="button" onClick={() => setShowForm(false)} aria-label="Close modification form" className="p-2 rounded bg-white/5"><X size={19} /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="md:col-span-2 text-sm text-slate-300">Name *<input required value={form.name} onChange={(event) => updateForm('name', event.target.value)} className="mt-2 w-full bg-[#0a1521] border border-white/10 rounded px-3 py-2.5 text-white focus:border-orange-300 focus:outline-none" /></label>
                <label className="md:col-span-2 text-sm text-slate-300">Description<textarea value={form.description} onChange={(event) => updateForm('description', event.target.value)} rows="3" className="mt-2 w-full bg-[#0a1521] border border-white/10 rounded px-3 py-2.5 text-white focus:border-orange-300 focus:outline-none" /></label>
                <label className="text-sm text-slate-300">Category<select value={form.category} onChange={(event) => updateForm('category', event.target.value)} className="mt-2 w-full bg-[#0a1521] border border-white/10 rounded px-3 py-2.5 text-white focus:border-orange-300 focus:outline-none">{CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></label>
                <label className="text-sm text-slate-300">Availability<select value={form.availability} onChange={(event) => updateForm('availability', event.target.value)} className="mt-2 w-full bg-[#0a1521] border border-white/10 rounded px-3 py-2.5 text-white focus:border-orange-300 focus:outline-none"><option value="unlimited">Unlimited</option><option value="in_stock">In Stock</option><option value="made_to_order">Made to Order</option></select></label>
                <label className="text-sm text-slate-300">Base Price<input type="number" min="0" step="0.01" value={form.price} onChange={(event) => updateForm('price', event.target.value)} className="mt-2 w-full bg-[#0a1521] border border-white/10 rounded px-3 py-2.5 text-white focus:border-orange-300 focus:outline-none" /></label>
                <label className="text-sm text-slate-300">Price Type<select value={form.priceType} onChange={(event) => updateForm('priceType', event.target.value)} className="mt-2 w-full bg-[#0a1521] border border-white/10 rounded px-3 py-2.5 text-white focus:border-orange-300 focus:outline-none"><option value="fixed">Fixed Amount</option><option value="percentage">Percentage</option></select></label>
                {form.availability === 'in_stock' && <label className="text-sm text-slate-300">Stock<input type="number" min="0" value={form.stock} onChange={(event) => updateForm('stock', event.target.value)} className="mt-2 w-full bg-[#0a1521] border border-white/10 rounded px-3 py-2.5 text-white focus:border-orange-300 focus:outline-none" /></label>}
              </div>
              <div className="mt-6 border-t border-white/10 pt-5">
                <p className="text-sm font-semibold text-white mb-3">Performance Effects <span className="text-slate-500 font-normal">(optional deltas)</span></p>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                  {[['horsepower', 'Horsepower', '+ HP'], ['torque', 'Torque', '+ Nm'], ['acceleration', 'Acceleration', 'sec'], ['topSpeed', 'Top Speed', 'km/h'], ['weight', 'Weight', 'kg']].map(([field, label, suffix]) => <label key={field} className="text-xs text-slate-400">{label}<div className="relative mt-2"><input type="number" step="0.1" value={form[field]} onChange={(event) => updateForm(field, event.target.value)} className="w-full bg-[#0a1521] border border-white/10 rounded px-3 py-2.5 pr-12 text-white focus:border-orange-300 focus:outline-none" /><span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-500">{suffix}</span></div></label>)}
                </div>
              </div>
              <div className="mt-6 border-t border-white/10 pt-5">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-3"><div><p className="text-sm font-semibold text-white">Compatible Vehicles *</p><p className="text-xs text-slate-500">Select real vehicles from Inventory by ID.</p></div><button type="button" onClick={toggleAllVehicles} className="text-xs text-orange-200 hover:text-orange-100">Select / Deselect all</button></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3"><input value={vehicleQuery} onChange={(event) => setVehicleQuery(event.target.value)} placeholder="Search vehicles" className="bg-[#0a1521] border border-white/10 rounded px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-orange-300 focus:outline-none" /><select value={vehicleBrand} onChange={(event) => setVehicleBrand(event.target.value)} aria-label="Filter vehicles by brand" className="bg-[#0a1521] border border-white/10 rounded px-3 py-2.5 text-sm text-white focus:border-orange-300 focus:outline-none">{brands.map((item) => <option key={item} value={item}>{item === 'all' ? 'All brands' : item}</option>)}</select></div>
                <div className="max-h-44 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pr-1">{filteredVehicles.map((car) => { const id = car._id || car.id; return <label key={id} className="flex items-center gap-2 p-2.5 rounded bg-[#0a1521] border border-white/10 text-sm text-slate-300 cursor-pointer hover:border-orange-300/40"><input type="checkbox" checked={form.compatibleCarIds.includes(id)} onChange={() => toggleVehicle(id)} className="accent-orange-300" /><span>{car.brand} {car.model}</span></label>; })}</div>
              </div>
              <div className="mt-6 border-t border-white/10 pt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                {[['requirements', 'Requirements'], ['conflicts', 'Conflicts']].map(([field, label]) => (
                  <fieldset key={field} className="min-w-0">
                    <legend className="text-sm font-semibold text-white mb-2">{label}</legend>
                    <div className="max-h-32 overflow-y-auto space-y-2 pr-1">
                      {modifications.filter((item) => (item._id || item.id) !== editingId).map((item) => {
                        const itemId = item._id || item.id;
                        return <label key={itemId} className="flex items-center gap-2 p-2 rounded bg-[#0a1521] border border-white/10 text-xs text-slate-300 cursor-pointer"><input type="checkbox" checked={form[field].includes(itemId)} onChange={() => toggleRelation(field, itemId)} className="accent-orange-300" /><span>{item.name}</span></label>;
                      })}
                    </div>
                  </fieldset>
                ))}
              </div>
              <div className="mt-6 flex flex-col items-stretch justify-between gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center"><label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={form.isActive} onChange={(event) => updateForm('isActive', event.target.checked)} className="accent-orange-300 w-4 h-4" /> Active for customers</label><div className="flex flex-col gap-2 sm:flex-row"><button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded bg-white/5 text-slate-300">Cancel</button><button type="submit" disabled={isSaving} className="accent-button px-4 py-2.5 rounded font-semibold disabled:opacity-50">{isSaving ? 'Saving...' : editingId ? 'Update Modification' : 'Create Modification'}</button></div></div>
            </motion.form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[60] bg-black/75 flex items-center justify-center p-4">
          <div className="form-surface border rounded-lg max-w-md w-full p-6"><p className="eyebrow mb-2">Confirm action</p><h4 className="text-xl font-semibold text-white">Delete {deleteTarget.name}?</h4><p className="text-sm text-slate-400 mt-2">This removes the modification entity and its compatibility links. This action cannot be undone.</p><div className="flex justify-end gap-3 mt-6"><button type="button" onClick={() => setDeleteTarget(null)} className="px-4 py-2.5 rounded bg-white/5 text-slate-300">Cancel</button><button type="button" onClick={handleDelete} className="px-4 py-2.5 rounded bg-red-600 text-white font-semibold">Delete</button></div></div>
        </div>
      )}

      {viewTarget && (
        <div className="fixed inset-0 z-[55] bg-black/75 flex items-center justify-center p-4">
          <div className="form-surface border rounded-lg max-w-lg w-full p-6">
            <div className="flex items-start justify-between gap-3"><div><p className="eyebrow mb-2">Modification details</p><h4 className="display-heading text-3xl text-white font-normal">{viewTarget.name}</h4></div><button type="button" onClick={() => setViewTarget(null)} aria-label="Close details" className="p-2 rounded bg-white/5"><X size={18} /></button></div>
            <p className="text-sm text-slate-400 mt-4">{viewTarget.description || 'No description provided.'}</p>
            <div className="grid grid-cols-2 gap-3 mt-5 text-sm"><div><p className="text-slate-500">Category</p><p className="text-white">{viewTarget.category || viewTarget.type || 'Other'}</p></div><div><p className="text-slate-500">Status</p><p className="text-white">{viewTarget.isActive === false ? 'Inactive' : 'Active'}</p></div><div><p className="text-slate-500">Price</p><p className="text-white">{viewTarget.priceType === 'percentage' ? `${viewTarget.price || 0}%` : `AED ${Number(viewTarget.price || 0).toLocaleString()}`}</p></div><div><p className="text-slate-500">Availability</p><p className="text-white">{viewTarget.availability || 'Unlimited'}</p></div></div>
            <button type="button" onClick={() => { setViewTarget(null); openEdit(viewTarget); }} className="accent-button mt-6 px-4 py-2.5 rounded font-semibold text-sm inline-flex items-center gap-2"><Edit size={16} /> Edit modification</button>
          </div>
        </div>
      )}
    </div>
  );
};
