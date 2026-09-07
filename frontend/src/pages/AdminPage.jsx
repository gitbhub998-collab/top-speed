import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { carService, modificationService } from '../services/api';
import { AnimatedCard, PageTransition } from '../components/Animations';
import { Header, Footer } from '../components/Layout';
import { Plus, Edit, Trash2, Upload, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [modifications, setModifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('cars');
  const [showAddCarForm, setShowAddCarForm] = useState(false);
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
    isVisible: true,
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const carsRes = await carService.getAllCars();
      setCars(carsRes.data);
      const modsRes = await modificationService.getModifications();
      setModifications(modsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCar = async (e) => {
    e.preventDefault();
    try {
      await carService.createCar(formData);
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
        isVisible: true,
      });
      setShowAddCarForm(false);
      fetchData();
    } catch (error) {
      console.error('Failed to add car:', error);
    }
  };

  const handleToggleVisibility = async (carId, currentVisibility) => {
    try {
      await carService.updateCar(carId, { isVisible: !currentVisibility });
      fetchData();
    } catch (error) {
      console.error('Failed to update car:', error);
    }
  };

  const handleDeleteCar = async (carId) => {
    if (!confirm('Are you sure you want to delete this car?')) return;
    try {
      await carService.deleteCar(carId);
      fetchData();
    } catch (error) {
      console.error('Failed to delete car:', error);
    }
  };

  return (
    <PageTransition>
      <div>
      <Header title="Admin Dashboard" subtitle="Manage your automotive platform" />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-12">
        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-gray-700 border-t-red-600 rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          <>
            <div className="flex gap-2 sm:gap-4 mb-6 sm:mb-8 border-b border-gray-800">
              <button
                onClick={() => setActiveTab('cars')}
                className={`px-2 sm:px-4 py-1 sm:py-3 text-xs sm:text-sm md:text-base font-semibold border-b-2 transition ${
                  activeTab === 'cars'
                    ? 'border-red-600 text-white'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                Cars ({cars.length})
              </button>
              <button
                onClick={() => setActiveTab('modifications')}
                className={`px-2 sm:px-4 py-1 sm:py-3 text-xs sm:text-sm md:text-base font-semibold border-b-2 transition ${
                  activeTab === 'modifications'
                    ? 'border-red-600 text-white'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                Modifications ({modifications.length})
              </button>
            </div>

            {activeTab === 'cars' && (
              <div>
                <button
                  onClick={() => setShowAddCarForm(!showAddCarForm)}
                  className="mb-4 sm:mb-8 px-3 sm:px-6 py-1.5 sm:py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold flex items-center gap-2 transition text-xs sm:text-sm md:text-base"
                >
                  <Plus size={16} />
                  Add New Car
                </button>

                {showAddCarForm && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-900 border border-gray-800 rounded-lg p-8 mb-8"
                  >
                    <h3 className="text-xl font-bold text-white mb-6">Add New Car</h3>
                    <form onSubmit={handleAddCar} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <input
                        type="text"
                        placeholder="Brand"
                        value={formData.brand}
                        onChange={(e) =>
                          setFormData({ ...formData, brand: e.target.value })
                        }
                        className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-red-600 focus:outline-none"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Model"
                        value={formData.model}
                        onChange={(e) =>
                          setFormData({ ...formData, model: e.target.value })
                        }
                        className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-red-600 focus:outline-none"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Year"
                        value={formData.year}
                        onChange={(e) =>
                          setFormData({ ...formData, year: parseInt(e.target.value) })
                        }
                        className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-red-600 focus:outline-none"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Horsepower"
                        value={formData.horsepower}
                        onChange={(e) =>
                          setFormData({ ...formData, horsepower: parseInt(e.target.value) })
                        }
                        className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-red-600 focus:outline-none"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Torque (Nm)"
                        value={formData.torque}
                        onChange={(e) =>
                          setFormData({ ...formData, torque: parseInt(e.target.value) })
                        }
                        className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-red-600 focus:outline-none"
                        required
                      />
                      <input
                        type="number"
                        placeholder="0-100 km/h (seconds)"
                        value={formData.acceleration}
                        onChange={(e) =>
                          setFormData({ ...formData, acceleration: parseFloat(e.target.value) })
                        }
                        className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-red-600 focus:outline-none"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Top Speed (km/h)"
                        value={formData.topSpeed}
                        onChange={(e) =>
                          setFormData({ ...formData, topSpeed: parseInt(e.target.value) })
                        }
                        className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-red-600 focus:outline-none"
                        required
                      />
                      <select
                        value={formData.fuelType}
                        onChange={(e) =>
                          setFormData({ ...formData, fuelType: e.target.value })
                        }
                        className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-600 focus:outline-none"
                      >
                        <option>Petrol</option>
                        <option>Diesel</option>
                        <option>Hybrid</option>
                        <option>Electric</option>
                      </select>
                      <select
                        value={formData.drivetrain}
                        onChange={(e) =>
                          setFormData({ ...formData, drivetrain: e.target.value })
                        }
                        className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-600 focus:outline-none"
                      >
                        <option>RWD</option>
                        <option>FWD</option>
                        <option>AWD</option>
                        <option>4WD</option>
                      </select>
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-600 focus:outline-none"
                      >
                        <option>Sedan</option>
                        <option>SUV</option>
                        <option>Sports</option>
                        <option>Hatchback</option>
                        <option>Coupe</option>
                        <option>Truck</option>
                      </select>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isVisible}
                          onChange={(e) =>
                            setFormData({ ...formData, isVisible: e.target.checked })
                          }
                          className="w-5 h-5 rounded accent-red-600"
                        />
                        <span className="text-white">Visible on Public Site</span>
                      </label>
                      <div className="col-span-full flex gap-4">
                        <button
                          type="submit"
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition"
                        >
                          Add Car
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddCarForm(false)}
                          className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg font-semibold transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                <div className="space-y-4">
                  {cars.map((car) => (
                    <AnimatedCard key={car._id}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                                  <h3 className="text-sm sm:text-lg font-bold text-white">
                                    {car.brand} {car.model}
                                  </h3>
                                  <p className="text-gray-400 text-xs sm:text-sm mb-2">
                                    {car.year} | {car.horsepower} HP | {car.topSpeed} km/h
                                  </p>
                          <div className="flex gap-2">
                                    {car.isVisible ? (
                                      <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-green-900/30 border border-green-600 text-green-400 text-xs rounded-full flex items-center gap-1">
                                        <Eye size={14} />
                                        Visible
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-gray-800 border border-gray-700 text-gray-400 text-xs rounded-full flex items-center gap-1">
                                        <EyeOff size={14} />
                                        Hidden
                                      </span>
                                    )}
                          </div>
                        </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleToggleVisibility(car._id, car.isVisible)}
                                    className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition text-xs sm:text-sm"
                                  >
                                    {car.isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                                  </button>
                                  <button className="p-2 bg-blue-900/30 hover:bg-blue-800/50 text-blue-400 rounded-lg transition text-xs sm:text-sm">
                                    <Edit size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCar(car._id)}
                                    className="p-2 bg-red-900/30 hover:bg-red-800/50 text-red-400 rounded-lg transition text-xs sm:text-sm"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                      </div>
                    </AnimatedCard>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'modifications' && (
              <div>
                <button className="mb-8 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold flex items-center gap-2 transition">
                  <Plus size={20} />
                  Add Modification
                </button>
                <div className="space-y-4">
                  {modifications.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">
                      No modifications yet. Add one to get started.
                    </p>
                  ) : (
                    modifications.map((mod) => (
                      <AnimatedCard key={mod._id}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-white">
                              {mod.name}
                            </h3>
                            <p className="text-gray-400 text-sm mb-2">
                              Type: {mod.type} | {mod.horsepower || 0} HP gain
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button className="p-2 bg-blue-900/30 hover:bg-blue-800/50 text-blue-400 rounded-lg transition">
                              <Edit size={18} />
                            </button>
                            <button className="p-2 bg-red-900/30 hover:bg-red-800/50 text-red-400 rounded-lg transition">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </AnimatedCard>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      </div>

      <Footer />
    </PageTransition>
  );
};
