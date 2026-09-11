import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { carService, modificationService } from '../services/api';
import { AnimatedCard, PageTransition } from '../components/Animations';
import { Header, Footer } from '../components/Layout';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
  DollarSign,
  Search,
  RefreshCw,
  Database,
  Check,
  Car as CarIcon,
  Settings as SettingsIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { isAdminUser } from '../utils/adminAccess';
import { ModificationsManager } from '../components/ModificationsManager';

const CAR_FIELD_DEFAULTS = {
  brand: { label: 'Brand', enabled: true, required: true },
  model: { label: 'Model', enabled: true, required: true },
  year: { label: 'Year', enabled: true, required: true },
  engine: { label: 'Engine', enabled: true, required: true },
  horsepower: { label: 'Horsepower', enabled: true, required: true },
  torque: { label: 'Torque', enabled: true, required: true },
  fuelType: { label: 'Fuel Type', enabled: true, required: true },
  drivetrain: { label: 'Drivetrain', enabled: true, required: true },
  acceleration: { label: 'Acceleration', enabled: true, required: true },
  topSpeed: { label: 'Top Speed', enabled: true, required: true },
  category: { label: 'Category', enabled: true, required: true },
  price: { label: 'Price', enabled: true, required: false },
  description: { label: 'Description', enabled: true, required: false },
  images: { label: 'Images', enabled: true, required: false },
};

const FIELD_CONFIG_STORAGE_KEY = 'top-speed-admin-car-fields';
const BACKEND_REQUIRED_NUMERIC_FIELDS = new Set([
  'year',
  'horsepower',
  'torque',
  'topSpeed',
  'engine',
]);

export const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [modifications, setModifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('cars');
  const [showAddCarForm, setShowAddCarForm] = useState(false);
  const [editingCarId, setEditingCarId] = useState(null);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [priceEditingCarId, setPriceEditingCarId] = useState(null);
  const [priceValue, setPriceValue] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [importBrand, setImportBrand] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [fieldConfig, setFieldConfig] = useState(() => {
    try {
      const savedConfig = JSON.parse(localStorage.getItem(FIELD_CONFIG_STORAGE_KEY));
      if (!savedConfig || typeof savedConfig !== 'object') return CAR_FIELD_DEFAULTS;

      return Object.keys(CAR_FIELD_DEFAULTS).reduce((config, fieldName) => {
        const savedField = savedConfig[fieldName];
        config[fieldName] = savedField && typeof savedField === 'object'
          ? {
              ...CAR_FIELD_DEFAULTS[fieldName],
              enabled: savedField.enabled !== false,
              required: savedField.required === true,
            }
          : CAR_FIELD_DEFAULTS[fieldName];
        return config;
      }, {});
    } catch {
      return CAR_FIELD_DEFAULTS;
    }
  });

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    horsepower: 0,
    torque: 0,
    fuelType: 'Petrol',
    drivetrain: 'RWD',
    acceleration: 10,
    topSpeed: 200,
    category: 'Sedan',
    price: 0,
    description: '',
    imageUrl: '',
    engine: {
      displacement: 0,
      cylinders: 0,
      type: 'V6',
    },
    isVisible: true,
  });

  // Verify admin access
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!isAdminUser(user)) {
      navigate('/home');
      return;
    }

    fetchData().catch(() => {});
  }, [user, navigate]);

  useEffect(() => {
    try {
      localStorage.setItem(FIELD_CONFIG_STORAGE_KEY, JSON.stringify(fieldConfig));
    } catch {
      return;
    }
  }, [fieldConfig]);

  const isFieldEnabled = (fieldName) => editingCarId || fieldConfig[fieldName]?.enabled !== false;
  const isFieldRequired = (fieldName) => !editingCarId && isFieldEnabled(fieldName) && fieldConfig[fieldName]?.required;
  const isFormFieldRequired = (fieldName) =>
    BACKEND_REQUIRED_NUMERIC_FIELDS.has(fieldName) || isFieldRequired(fieldName);

  const updateFieldConfig = (fieldName, updates) => {
    setFieldConfig((currentConfig) => ({
      ...currentConfig,
      [fieldName]: { ...currentConfig[fieldName], ...updates },
    }));
  };
  const handleCarImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type) || file.size > 4 * 1024 * 1024) {
      alert('Choose a PNG, JPG, JPEG, or WebP image smaller than 4MB.');
      return;
    }

    const image = new Image();
    const reader = new FileReader();
    reader.onload = () => { image.src = reader.result; };
    image.onload = () => {
      const maxDimension = 1200;
      const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext('2d');
      if (!context) {
        alert('Unable to prepare this image.');
        return;
      }
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      setFormData((current) => ({ ...current, imageUrl: canvas.toDataURL('image/jpeg', 0.78) }));
    };
    image.onerror = () => alert('Unable to read this image.');
    reader.readAsDataURL(file);
  };

  const fetchData = async () => {
    try {
      const carsRes = await carService.getAllCarsIncludingHidden();
      setCars(Array.isArray(carsRes.data) ? carsRes.data : []);
      const modsRes = await modificationService.getModifications();
      setModifications(Array.isArray(modsRes.data) ? modsRes.data : []);
      setLoadError('');
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setLoadError('Unable to load dashboard data. Your existing data was kept intact.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboard = async () => {
    setIsRefreshing(true);
    try {
      await fetchData();
      showSuccess('Dashboard refreshed successfully');
    } catch (error) {
      alert('Refresh failed: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleImportCars = async (e) => {
    e.preventDefault();
    if (!importBrand.trim()) return;

    setIsImporting(true);
    try {
      const response = await carService.importFromAPI(importBrand.trim());
      const importedCount = response.data?.cars?.length ?? response.data?.imported ?? response.data?.count ?? 0;
      showSuccess(`${importedCount} car${importedCount === 1 ? '' : 's'} imported successfully`);
      setImportBrand('');
      await fetchData();
    } catch (error) {
      alert('Import failed: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsImporting(false);
    }
  };

  const visibleCars = cars.filter((car) => car.isVisible);
  const hiddenCars = cars.filter((car) => !car.isVisible);
  const pricedCars = cars.filter((car) => Number(car.price) > 0);
  const filteredInventory = cars
    .filter((car) => {
      const normalizedQuery = searchQuery.trim().toLowerCase();
      const matchesSearch = !normalizedQuery || `${car.brand} ${car.model}`.toLowerCase().includes(normalizedQuery);
      const matchesVisibility = visibilityFilter === 'all'
        || (visibilityFilter === 'visible' && car.isVisible)
        || (visibilityFilter === 'hidden' && !car.isVisible);
      return matchesSearch && matchesVisibility;
    })
    .sort((firstCar, secondCar) => {
      if (sortOrder === 'price-high') return (secondCar.price || 0) - (firstCar.price || 0);
      if (sortOrder === 'power-high') return (secondCar.horsepower || 0) - (firstCar.horsepower || 0);
      if (sortOrder === 'name') return `${firstCar.brand} ${firstCar.model}`.localeCompare(`${secondCar.brand} ${secondCar.model}`);
      return (secondCar.year || 0) - (firstCar.year || 0);
    });

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const resetFormData = () => {
    setFormData({
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      horsepower: 0,
      torque: 0,
      fuelType: 'Petrol',
      drivetrain: 'RWD',
      acceleration: 10,
      topSpeed: 200,
      category: 'Sedan',
      price: 0,
      description: '',
      imageUrl: '',
      engine: {
        displacement: 0,
        cylinders: 0,
        type: 'V6',
      },
      isVisible: true,
    });
  };

  const handleAddCar = async (e) => {
    e.preventDefault();
    const numericValues = [
      ['year', formData.year],
      ['price', formData.price],
      ['horsepower', formData.horsepower],
      ['torque', formData.torque],
      ['acceleration', formData.acceleration],
      ['topSpeed', formData.topSpeed],
      ['engine', formData.engine.displacement],
      ['engine', formData.engine.cylinders],
    ].filter(([fieldName]) => isFieldEnabled(fieldName));
    if (numericValues.some(([fieldName, value]) => {
      const isEmptyOptionalField = !isFormFieldRequired(fieldName) && (value === '' || Number.isNaN(Number(value)));
      return !isEmptyOptionalField && (!Number.isFinite(Number(value)) || Number(value) < 0);
    })) {
      alert('Please enter valid non-negative numeric values for the car specifications.');
      return;
    }
    try {
      if (editingCarId) {
        await carService.updateCar(editingCarId, formData);
        showSuccess('Car updated successfully!');
        setEditingCarId(null);
      } else {
        await carService.createCar(formData);
        showSuccess('Car added successfully!');
      }
      resetFormData();
      setShowAddCarForm(false);
      fetchData();
    } catch (error) {
      console.error('Failed to save car:', error);
      alert('Error saving car: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEditCar = (car) => {
    setFormData({
      ...car,
      engine: {
        displacement: 0,
        cylinders: 0,
        type: 'V6',
        ...car.engine,
      },
    });
    setEditingCarId(car._id);
    setShowAddCarForm(true);
    window.scrollTo(0, 0);
  };

  const handleCancelEdit = () => {
    resetFormData();
    setEditingCarId(null);
    setShowAddCarForm(false);
  };

  const handlePriceEdit = (car) => {
    setPriceEditingCarId(car._id);
    setPriceValue(car.price || 0);
    setShowPriceModal(true);
  };

  const handleSavePrice = async () => {
    const parsedPrice = parseFloat(priceValue);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      alert('Please enter a valid non-negative price.');
      return;
    }

    try {
      const carToUpdate = cars.find((c) => c._id === priceEditingCarId);
      await carService.updateCar(priceEditingCarId, {
        ...carToUpdate,
        price: parsedPrice,
      });
      showSuccess('Price updated successfully!');
      setShowPriceModal(false);
      setPriceEditingCarId(null);
      setPriceValue('');
      fetchData();
    } catch (error) {
      console.error('Failed to update price:', error);
      alert('Error updating price: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleToggleVisibility = async (carId, currentVisibility) => {
    try {
      const car = cars.find((c) => c._id === carId);
      await carService.updateCar(carId, { ...car, isVisible: !currentVisibility });
      showSuccess(
        `Car ${!currentVisibility ? 'shown' : 'hidden'} successfully!`
      );
      fetchData();
    } catch (error) {
      console.error('Failed to update car:', error);
    }
  };

  const handleDeleteCar = async (carId) => {
    if (!confirm('Are you sure you want to delete this car? This action cannot be undone.'))
      return;
    try {
      await carService.deleteCar(carId);
      showSuccess('Car deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Failed to delete car:', error);
      alert('Error deleting car: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <PageTransition>
      <div className="dashboard-surface">
        <Header
          title="Admin Dashboard"
          subtitle="Manage your showroom inventory and pricing"
        />

        <div className="page-surface max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {[
              { label: 'Total cars', value: cars.length, icon: CarIcon },
              { label: 'Visible', value: visibleCars.length, icon: Eye },
              { label: 'Hidden', value: hiddenCars.length, icon: EyeOff },
              { label: 'Priced', value: pricedCars.length, icon: DollarSign },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="metric-tile border rounded-lg p-4 sm:p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
                  <Icon size={19} aria-hidden="true" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-white mt-3">{value}</p>
              </div>
            ))}
          </div>

          <div className="surface-card border rounded-lg p-4 sm:p-5 mb-6 sm:mb-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div>
                <p className="eyebrow mb-2">Control room</p>
                <h2 className="display-heading text-2xl sm:text-3xl text-white font-normal">Manage the showroom</h2>
                <p className="text-sm text-slate-400 mt-2">Search, sort, refresh, and import inventory from one place.</p>
              </div>
              <button
                type="button"
                onClick={refreshDashboard}
                disabled={isRefreshing}
                className="accent-button px-4 py-2.5 rounded font-semibold text-sm inline-flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                {isRefreshing ? 'Refreshing...' : 'Refresh data'}
              </button>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-900/20 border border-green-600 text-green-400 rounded-lg text-sm sm:text-base"
            >
              <Check size={17} aria-hidden="true" /> {successMessage}
            </motion.div>
          )}

          {loadError && (
            <div role="alert" className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-900/20 border border-red-500/50 text-red-300 rounded-lg text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span>{loadError}</span>
              <button type="button" onClick={refreshDashboard} className="accent-button px-3 py-2 rounded font-semibold text-sm inline-flex items-center justify-center gap-2">
                <RefreshCw size={15} /> Retry
              </button>
            </div>
          )}

          {actionError && (
            <div role="alert" className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-900/20 border border-red-500/50 text-red-300 rounded-lg text-sm flex items-center justify-between gap-3">
              <span>{actionError}</span>
              <button type="button" onClick={() => setActionError('')} aria-label="Dismiss error" className="p-1 rounded hover:bg-white/10"><X size={16} /></button>
            </div>
          )}

          {loading ? (
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-gray-700 border-t-red-600 rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-400 mt-4">Loading inventory...</p>
            </div>
          ) : (
            <>
              {/* Tab Navigation */}
              <div className="flex gap-2 sm:gap-4 mb-6 sm:mb-8 border-b border-gray-800 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('cars')}
                  className={`px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm md:text-base font-semibold border-b-2 transition whitespace-nowrap ${
                    activeTab === 'cars'
                      ? 'border-red-600 text-white'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <CarIcon className="inline mr-1 sm:mr-2" size={16} />
                  <span className="hidden sm:inline">Inventory ({cars.length})</span>
                  <span className="sm:hidden">Cars</span>
                </button>
                <button
                  onClick={() => setActiveTab('pricing')}
                  className={`px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm md:text-base font-semibold border-b-2 transition whitespace-nowrap ${
                    activeTab === 'pricing'
                      ? 'border-red-600 text-white'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <DollarSign className="inline mr-1 sm:mr-2" size={16} />
                  <span className="hidden sm:inline">Pricing</span>
                  <span className="sm:hidden">Price</span>
                </button>
                <button
                  onClick={() => setActiveTab('modifications')}
                  className={`px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm md:text-base font-semibold border-b-2 transition whitespace-nowrap ${
                    activeTab === 'modifications'
                      ? 'border-red-600 text-white'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <SettingsIcon className="inline mr-1 sm:mr-2" size={16} />
                  <span className="hidden sm:inline">Modifications</span>
                  <span className="sm:hidden">Mods</span>
                </button>
                <button
                  onClick={() => setActiveTab('fields')}
                  className={`px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm md:text-base font-semibold border-b-2 transition whitespace-nowrap ${
                    activeTab === 'fields'
                      ? 'border-orange-300 text-white'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <SettingsIcon className="inline mr-1 sm:mr-2" size={16} />
                  <span className="hidden sm:inline">Fields</span>
                  <span className="sm:hidden">Fields</span>
                </button>
              </div>

              {/* CARS TAB */}
              {activeTab === 'cars' && (
                <div>
                  <div className="surface-card border rounded-lg p-3 sm:p-4 mb-5 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_auto] gap-3">
                    <label className="relative block">
                      <span className="sr-only">Search cars</span>
                      <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by brand or model"
                        className="w-full bg-[#0a1521] border border-white/10 rounded px-10 py-2.5 text-sm text-white placeholder-slate-500 focus:border-orange-300 focus:outline-none"
                      />
                    </label>
                    <select
                      value={visibilityFilter}
                      onChange={(e) => setVisibilityFilter(e.target.value)}
                      className="bg-[#0a1521] border border-white/10 rounded px-3 py-2.5 text-sm text-slate-200 focus:border-orange-300 focus:outline-none"
                      aria-label="Filter by visibility"
                    >
                      <option value="all">All visibility</option>
                      <option value="visible">Visible only</option>
                      <option value="hidden">Hidden only</option>
                    </select>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="bg-[#0a1521] border border-white/10 rounded px-3 py-2.5 text-sm text-slate-200 focus:border-orange-300 focus:outline-none"
                      aria-label="Sort inventory"
                    >
                      <option value="newest">Newest year</option>
                      <option value="price-high">Highest price</option>
                      <option value="power-high">Highest power</option>
                      <option value="name">Name A-Z</option>
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      resetFormData();
                      setEditingCarId(null);
                      setShowAddCarForm(!showAddCarForm);
                    }}
                    className="mb-6 sm:mb-8 px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-semibold flex items-center gap-1 sm:gap-2 transition w-full sm:w-auto justify-center sm:justify-start"
                  >
                    <Plus size={18} />
                    <span className="hidden sm:inline">{showAddCarForm ? 'Cancel' : 'Add New Car'}</span>
                    <span className="sm:hidden">{showAddCarForm ? 'Cancel' : 'Add'}</span>
                  </button>

                  {/* Add/Edit Car Form */}
                  {showAddCarForm && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-lg p-4 sm:p-6 md:p-8 mb-6 sm:mb-8"
                    >
                      <h3 className="text-lg sm:text-2xl font-bold text-white mb-4 sm:mb-6">
                        {editingCarId ? 'Edit Car' : 'Add New Car'}
                      </h3>
                      <form onSubmit={handleAddCar} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                        {/* Brand */}
                        <div hidden={!isFieldEnabled('brand')}>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Brand {isFieldRequired('brand') && '*'}
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., BMW, Tesla, Nissan"
                            value={formData.brand}
                            onChange={(e) =>
                              setFormData({ ...formData, brand: e.target.value })
                            }
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-red-600 focus:outline-none transition"
                            required={isFieldRequired('brand')}
                          />
                        </div>

                        {/* Model */}
                        <div hidden={!isFieldEnabled('model')}>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Model {isFieldRequired('model') && '*'}
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., M340i, Model 3, 370Z"
                            value={formData.model}
                            onChange={(e) =>
                              setFormData({ ...formData, model: e.target.value })
                            }
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-red-600 focus:outline-none transition"
                            required={isFieldRequired('model')}
                          />
                        </div>

                        {/* Year */}
                        <div hidden={!isFieldEnabled('year')}>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Year {isFieldRequired('year') && '*'}
                          </label>
                          <input
                            type="number"
                            placeholder="2024"
                            value={formData.year}
                            onChange={(e) =>
                              setFormData({ ...formData, year: parseInt(e.target.value) })
                            }
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-red-600 focus:outline-none transition"
                            required={isFormFieldRequired('year')}
                          />
                        </div>

                        {/* Price */}
                        <div hidden={!isFieldEnabled('price')}>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Price (AED)
                          </label>
                          <input
                            type="number"
                            placeholder="0"
                            value={formData.price}
                            onChange={(e) =>
                              setFormData({ ...formData, price: parseInt(e.target.value) })
                            }
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-red-600 focus:outline-none transition"
                            required={isFieldRequired('price')}
                          />
                        </div>

                        {/* Horsepower */}
                        <div hidden={!isFieldEnabled('horsepower')}>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Horsepower {isFieldRequired('horsepower') && '*'}
                          </label>
                          <input
                            type="number"
                            placeholder="350"
                            value={formData.horsepower}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                horsepower: parseInt(e.target.value),
                              })
                            }
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-red-600 focus:outline-none transition"
                            required={isFormFieldRequired('horsepower')}
                          />
                        </div>

                        {/* Torque */}
                        <div hidden={!isFieldEnabled('torque')}>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Torque (Nm) {isFieldRequired('torque') && '*'}
                          </label>
                          <input
                            type="number"
                            placeholder="500"
                            value={formData.torque}
                            onChange={(e) =>
                              setFormData({ ...formData, torque: parseInt(e.target.value) })
                            }
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-red-600 focus:outline-none transition"
                            required={isFormFieldRequired('torque')}
                          />
                        </div>

                        {/* 0-100 Acceleration */}
                        <div hidden={!isFieldEnabled('acceleration')}>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">
                            0-100 km/h (seconds) {isFieldRequired('acceleration') && '*'}
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            placeholder="5.5"
                            value={formData.acceleration}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                acceleration: parseFloat(e.target.value),
                              })
                            }
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-red-600 focus:outline-none transition"
                            required={isFieldRequired('acceleration')}
                          />
                        </div>

                        {/* Top Speed */}
                        <div hidden={!isFieldEnabled('topSpeed')}>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Top Speed (km/h) {isFieldRequired('topSpeed') && '*'}
                          </label>
                          <input
                            type="number"
                            placeholder="250"
                            value={formData.topSpeed}
                            onChange={(e) =>
                              setFormData({ ...formData, topSpeed: parseInt(e.target.value) })
                            }
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-red-600 focus:outline-none transition"
                            required={isFormFieldRequired('topSpeed')}
                          />
                        </div>

                        {/* Fuel Type */}
                        <div hidden={!isFieldEnabled('fuelType')}>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Fuel Type {isFieldRequired('fuelType') && '*'}
                          </label>
                          <select
                            value={formData.fuelType}
                            onChange={(e) =>
                              setFormData({ ...formData, fuelType: e.target.value })
                            }
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-600 focus:outline-none transition"
                            required={isFieldRequired('fuelType')}
                          >
                            <option>Petrol</option>
                            <option>Diesel</option>
                            <option>Hybrid</option>
                            <option>Electric</option>
                          </select>
                        </div>

                        {/* Drivetrain */}
                        <div hidden={!isFieldEnabled('drivetrain')}>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Drivetrain {isFieldRequired('drivetrain') && '*'}
                          </label>
                          <select
                            value={formData.drivetrain}
                            onChange={(e) =>
                              setFormData({ ...formData, drivetrain: e.target.value })
                            }
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-600 focus:outline-none transition"
                            required={isFieldRequired('drivetrain')}
                          >
                            <option>RWD</option>
                            <option>FWD</option>
                            <option>AWD</option>
                            <option>4WD</option>
                          </select>
                        </div>

                        {/* Category */}
                        <div hidden={!isFieldEnabled('category')}>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Category {isFieldRequired('category') && '*'}
                          </label>
                          <select
                            value={formData.category}
                            onChange={(e) =>
                              setFormData({ ...formData, category: e.target.value })
                            }
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-600 focus:outline-none transition"
                            required={isFieldRequired('category')}
                          >
                            <option>Sedan</option>
                            <option>SUV</option>
                            <option>Sports</option>
                            <option>Hatchback</option>
                            <option>Coupe</option>
                            <option>Truck</option>
                          </select>
                        </div>

                        {/* Engine Displacement */}
                        <div hidden={!isFieldEnabled('engine')}>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Engine Displacement (cc) {isFieldRequired('engine') && '*'}
                          </label>
                          <input
                            type="number"
                            placeholder="3000"
                            value={formData.engine.displacement}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                engine: {
                                  ...formData.engine,
                                  displacement: parseInt(e.target.value),
                                },
                              })
                            }
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-red-600 focus:outline-none transition"
                            required={isFormFieldRequired('engine')}
                          />
                        </div>

                        {/* Engine Cylinders */}
                        <div hidden={!isFieldEnabled('engine')}>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Cylinders {isFieldRequired('engine') && '*'}
                          </label>
                          <input
                            type="number"
                            placeholder="6"
                            value={formData.engine.cylinders}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                engine: {
                                  ...formData.engine,
                                  cylinders: parseInt(e.target.value),
                                },
                              })
                            }
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-red-600 focus:outline-none transition"
                            required={isFormFieldRequired('engine')}
                          />
                        </div>

                        {/* Engine Type */}
                        <div hidden={!isFieldEnabled('engine')}>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Engine Type
                          </label>
                          <input
                            type="text"
                            placeholder="V6, V8, I4, etc."
                            value={formData.engine.type}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                engine: {
                                  ...formData.engine,
                                  type: e.target.value,
                                },
                              })
                            }
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-red-600 focus:outline-none transition"
                          />
                        </div>

                        {/* Car image */}
                        <div className="md:col-span-2" hidden={!isFieldEnabled('images')}>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Car image
                          </label>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                            onChange={handleCarImageUpload}
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white file:mr-3 file:rounded file:border-0 file:bg-orange-300 file:px-3 file:py-1 file:font-semibold file:text-[#08111c]"
                            required={isFormFieldRequired('images') && !formData.imageUrl}
                          />
                          <p className="mt-2 text-xs text-gray-500">Upload once; the image is stored permanently and reused across the catalog.</p>
                          <input
                            type="text"
                            placeholder="Or paste an existing image URL"
                            value={formData.imageUrl}
                            onChange={(e) =>
                              setFormData({ ...formData, imageUrl: e.target.value })
                            }
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-red-600 focus:outline-none transition"
                          />
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2" hidden={!isFieldEnabled('description')}>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Description
                          </label>
                          <textarea
                            placeholder="Enter car description..."
                            value={formData.description}
                            onChange={(e) =>
                              setFormData({ ...formData, description: e.target.value })
                            }
                            rows="4"
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-red-600 focus:outline-none transition resize-none"
                            required={isFieldRequired('description')}
                          />
                        </div>

                        {/* Visibility */}
                        <div className="md:col-span-2">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.isVisible}
                              onChange={(e) =>
                                setFormData({ ...formData, isVisible: e.target.checked })
                              }
                              className="w-5 h-5 rounded accent-red-600"
                            />
                            <span className="text-white font-semibold">
                              Visible on Public Website
                            </span>
                          </label>
                        </div>

                        {/* Form Actions */}
                        <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3 sm:gap-4">
                          <button
                            type="submit"
                            className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-2 sm:py-3 text-sm sm:text-base rounded-lg font-semibold transition flex items-center justify-center gap-1 sm:gap-2"
                          >
                            <Save size={16} className="sm:w-5 sm:h-5" />
                            <span className="hidden sm:inline">{editingCarId ? 'Update Car' : 'Add Car'}</span>
                            <span className="sm:hidden">{editingCarId ? 'Update' : 'Add'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 sm:py-3 text-sm sm:text-base rounded-lg font-semibold transition flex items-center justify-center gap-1 sm:gap-2"
                          >
                            <X size={16} className="sm:w-5 sm:h-5" />
                            Cancel
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  <form onSubmit={handleImportCars} className="surface-card border rounded-lg p-4 mb-6 flex flex-col sm:flex-row gap-3 sm:items-end">
                    <div className="flex-1">
                      <label htmlFor="import-brand" className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-400 mb-2">Import by brand</label>
                      <input
                        id="import-brand"
                        type="text"
                        value={importBrand}
                        onChange={(e) => setImportBrand(e.target.value)}
                        placeholder="e.g. BMW"
                        className="w-full bg-[#0a1521] border border-white/10 rounded px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-orange-300 focus:outline-none"
                      />
                    </div>
                    <button type="submit" disabled={isImporting || !importBrand.trim()} className="bg-[#315f82] hover:bg-[#42799f] disabled:opacity-50 text-white px-4 py-2.5 rounded font-semibold text-sm inline-flex items-center justify-center gap-2">
                      <Database size={16} />
                      {isImporting ? 'Importing...' : 'Import cars'}
                    </button>
                  </form>

                  {/* Cars List */}
                  <div className="space-y-4">
                    {cars.length === 0 ? (
                      <div className="text-center py-12 bg-gray-900/50 border border-gray-800 rounded-lg">
                        <CarIcon size={48} className="mx-auto text-gray-600 mb-4" />
                        <p className="text-gray-400 text-lg">No cars in inventory yet.</p>
                        <p className="text-gray-500 text-sm mt-2">
                          Add your first car to get started!
                        </p>
                      </div>
                    ) : filteredInventory.length === 0 ? (
                      <div className="text-center py-12 bg-gray-900/50 border border-gray-800 rounded-lg">
                        <Search size={40} className="mx-auto text-gray-600 mb-4" />
                        <p className="text-gray-400 text-lg">No matching cars found.</p>
                        <p className="text-gray-500 text-sm mt-2">Try changing your search or filters.</p>
                      </div>
                    ) : (
                      filteredInventory.map((car) => (
                        <AnimatedCard key={car._id}>
                          <div className="flex flex-col gap-3 sm:gap-4">
                            <div className="flex-1">
                              <h3 className="text-base sm:text-lg md:text-xl font-bold text-white">
                                {car.brand} {car.model}
                              </h3>
                              <p className="text-gray-400 text-xs sm:text-sm mb-3">
                                {car.year} | {car.horsepower} HP | {car.topSpeed} km/h |{' '}
                                {car.category}
                              </p>
                              {car.price > 0 && (
                                <p className="text-red-400 font-semibold mb-3 text-sm sm:text-base">
                                  AED {Number(car.price || 0).toLocaleString()}
                                </p>
                              )}
                              <div className="flex gap-2 flex-wrap">
                                <span className="px-2 sm:px-3 py-1 bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded-full">
                                  {car.fuelType}
                                </span>
                                <span className="px-2 sm:px-3 py-1 bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded-full">
                                  {car.drivetrain}
                                </span>
                                {car.isVisible ? (
                                  <span className="px-2 sm:px-3 py-1 bg-green-900/30 border border-green-600 text-green-400 text-xs rounded-full flex items-center gap-1">
                                    <Eye size={12} />
                                    <span className="hidden sm:inline">Visible</span>
                                  </span>
                                ) : (
                                  <span className="px-2 sm:px-3 py-1 bg-gray-800 border border-gray-700 text-gray-400 text-xs rounded-full flex items-center gap-1">
                                    <EyeOff size={12} />
                                    <span className="hidden sm:inline">Hidden</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 flex-wrap w-full">
                              <button
                                onClick={() => handlePriceEdit(car)}
                                className="flex-1 min-w-12 px-2 sm:px-4 py-2 bg-green-900/30 hover:bg-green-800/50 text-green-400 rounded-lg transition flex items-center justify-center gap-1 text-xs sm:text-sm"
                                title="Edit Price"
                              >
                                <DollarSign size={14} />
                                <span className="hidden sm:inline">Price</span>
                              </button>
                              <button
                                onClick={() => handleEditCar(car)}
                                className="flex-1 min-w-12 px-2 sm:px-4 py-2 bg-blue-900/30 hover:bg-blue-800/50 text-blue-400 rounded-lg transition flex items-center justify-center gap-1 text-xs sm:text-sm"
                                title="Edit Car"
                              >
                                <Edit size={14} />
                                <span className="hidden sm:inline">Edit</span>
                              </button>
                              <button
                                onClick={() =>
                                  handleToggleVisibility(car._id, car.isVisible)
                                }
                                className="flex-1 min-w-12 px-2 sm:px-4 py-2 bg-yellow-900/30 hover:bg-yellow-800/50 text-yellow-400 rounded-lg transition flex items-center justify-center gap-1 text-xs sm:text-sm"
                                title="Toggle Visibility"
                              >
                                {car.isVisible ? (
                                  <EyeOff size={14} />
                                ) : (
                                  <Eye size={14} />
                                )}
                                <span className="hidden sm:inline">{car.isVisible ? 'Hide' : 'Show'}</span>
                              </button>
                              <button
                                onClick={() => handleDeleteCar(car._id)}
                                className="flex-1 min-w-12 px-2 sm:px-4 py-2 bg-red-900/30 hover:bg-red-800/50 text-red-400 rounded-lg transition flex items-center justify-center gap-1 text-xs sm:text-sm"
                                title="Delete Car"
                              >
                                <Trash2 size={14} />
                                <span className="hidden sm:inline">Delete</span>
                              </button>
                            </div>
                          </div>
                        </AnimatedCard>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* PRICING TAB */}
              {activeTab === 'pricing' && (
                <div>
                  <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-3 sm:p-6 mb-4 sm:mb-6">
                    <h3 className="text-base sm:text-xl font-bold text-white mb-2">
                      Price Management
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-400">
                      Click the price button on any car in the Inventory tab, or use the quick
                      pricing table below.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {cars.length === 0 ? (
                      <div className="text-center py-12 bg-gray-900/50 border border-gray-800 rounded-lg">
                        <DollarSign size={40} className="mx-auto text-gray-600 mb-4" />
                        <p className="text-gray-400 text-sm sm:text-lg">No cars available for pricing.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm sm:text-base">
                          <thead>
                            <tr className="border-b border-gray-800">
                              <th className="text-left py-2 sm:py-4 px-2 sm:px-4 text-gray-300 font-semibold text-xs sm:text-sm">
                                Car
                              </th>
                              <th className="text-left py-2 sm:py-4 px-2 sm:px-4 text-gray-300 font-semibold text-xs sm:text-sm">
                                Category
                              </th>
                              <th className="text-right py-2 sm:py-4 px-2 sm:px-4 text-gray-300 font-semibold text-xs sm:text-sm">
                                Price
                              </th>
                              <th className="text-center py-2 sm:py-4 px-2 sm:px-4 text-gray-300 font-semibold text-xs sm:text-sm">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {cars.map((car) => (
                              <tr
                                key={car._id}
                                className="border-b border-gray-800 hover:bg-gray-900/50 transition"
                              >
                                <td className="py-2 sm:py-4 px-2 sm:px-4 text-white text-xs sm:text-sm">
                                  {car.brand} {car.model}
                                </td>
                                <td className="py-2 sm:py-4 px-2 sm:px-4 text-gray-400 text-xs sm:text-sm">{car.category}</td>
                                <td className="py-2 sm:py-4 px-2 sm:px-4 text-right text-xs sm:text-sm">
                                  <span
                                    className={
                                      car.price > 0
                                        ? 'text-red-400 font-semibold'
                                        : 'text-gray-500'
                                    }
                                  >
                                    {car.price > 0
                                      ? `AED ${Number(car.price || 0).toLocaleString()}`
                                      : 'Not set'}
                                  </span>
                                </td>
                                <td className="py-2 sm:py-4 px-2 sm:px-4 text-center">
                                  <button
                                    onClick={() => handlePriceEdit(car)}
                                    className="px-2 sm:px-4 py-1 sm:py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs sm:text-sm font-semibold transition"
                                  >
                                    Edit
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* MODIFICATIONS TAB */}
              {activeTab === 'modifications' && (
                <ModificationsManager
                  modifications={modifications}
                  cars={cars}
                  onChanged={fetchData}
                  onNotify={(message, type) => {
                    if (type === 'success') {
                      showSuccess(message);
                      setActionError('');
                    } else {
                      setActionError(message);
                    }
                  }}
                />
              )}

              {activeTab === 'fields' && (
                <div>
                  <div className="surface-card border rounded-lg p-5 sm:p-6 mb-5">
                    <p className="eyebrow mb-2">Car configuration</p>
                    <h3 className="display-heading text-2xl sm:text-3xl text-white font-normal">Fields management</h3>
                    <p className="text-sm text-slate-400 mt-2 max-w-2xl">
                      Choose which information appears in the add-car form and whether enabled fields must be completed.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(fieldConfig).map(([fieldName, field]) => (
                      <div key={fieldName} className="surface-card border rounded-lg p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded bg-[#0a1521] border border-white/10 flex items-center justify-center shrink-0">
                            <SettingsIcon size={17} aria-hidden="true" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-white font-semibold truncate">{field.label}</p>
                            <p className="text-xs text-slate-500">
                              {!field.enabled ? 'Hidden from form' : field.required ? 'Enabled · Required' : 'Enabled · Optional'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={field.enabled}
                              onChange={(event) => updateFieldConfig(fieldName, { enabled: event.target.checked })}
                              className="accent-orange-300 w-4 h-4"
                            />
                            Enabled
                          </label>
                          <button
                            type="button"
                            disabled={!field.enabled}
                            onClick={() => updateFieldConfig(fieldName, { required: !field.required })}
                            className={`px-3 py-1.5 rounded text-xs font-semibold border transition disabled:opacity-40 ${
                              field.required && field.enabled
                                ? 'bg-orange-300/15 text-orange-200 border-orange-300/40'
                                : 'bg-white/5 text-slate-400 border-white/10'
                            }`}
                            aria-pressed={field.required && field.enabled}
                            aria-label={`Make ${field.label} ${field.required ? 'optional' : 'required'}`}
                          >
                            {field.required ? 'Required' : 'Optional'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex items-start gap-3 surface-card border border-orange-300/20 rounded-lg p-4">
                    <Check size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                    <p className="text-xs sm:text-sm text-slate-400">
                      These settings are saved on this browser and apply immediately to the Add New Car form.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Price Edit Modal */}
        {showPriceModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-8 max-w-sm w-full"
            >
              <h3 className="text-lg sm:text-2xl font-bold text-white mb-4">Edit Price</h3>
              <div className="mb-6">
                <label className="block text-xs sm:text-sm font-semibold text-gray-300 mb-2">
                  Price (AED)
                </label>
                <input
                  type="number"
                  value={priceValue}
                  onChange={(e) => setPriceValue(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-red-600 focus:outline-none transition text-sm sm:text-base"
                  placeholder="Enter price"
                  min="0"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={handleSavePrice}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-2 sm:py-3 rounded-lg font-semibold transition text-sm sm:text-base"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowPriceModal(false);
                    setPriceEditingCarId(null);
                    setPriceValue('');
                  }}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 sm:py-3 rounded-lg font-semibold transition text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}

        <Footer />
      </div>
    </PageTransition>
  );
};
