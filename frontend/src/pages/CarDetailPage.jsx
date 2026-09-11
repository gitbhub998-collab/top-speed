import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { carService, configuratorService } from '../services/api';
import { Footer } from '../components/Layout';
import { PageTransition } from '../components/Animations';
import { ArrowLeft, BatteryCharging, Cog, Droplets, Gauge, Timer, Wrench, X, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export const CarDetailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const carId = searchParams.get('carId');
  
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modifications, setModifications] = useState([]);
  const [selectedModificationIds, setSelectedModificationIds] = useState([]);
  const [configuration, setConfiguration] = useState(null);
  const [configurationError, setConfigurationError] = useState('');
  const [isImageOpen, setIsImageOpen] = useState(false);
  const configurationRequestRef = useRef(0);
  const imageTriggerRef = useRef(null);
  const imageCloseRef = useRef(null);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
    }).format(price);
  };

  // بيانات افتراضية
  const DEFAULT_CARS = [
    {
      _id: 'default_0',
      brand: 'BMW',
      model: 'M440i xDrive',
      year: 2024,
      engine: {
        displacement: 2998,
        cylinders: 6,
        type: 'Turbocharged Inline-6',
      },
      horsepower: 503,
      torque: 479,
      fuelType: 'Petrol',
      acceleration: 4.2,
      topSpeed: 250,
      drivetrain: 'AWD',
      category: 'Sedan',
      price: 3500000,
      imageUrl: '/images/cars/bmw-m440i.jpg',
      description: 'Latest generation M440i with advanced tech',
    },
    {
      _id: 'default_1',
      brand: 'Mercedes-Benz',
      model: 'AMG C43',
      year: 2024,
      engine: {
        displacement: 1991,
        cylinders: 4,
        type: 'Turbocharged Hybrid I4',
      },
      horsepower: 402,
      torque: 500,
      fuelType: 'Petrol',
      acceleration: 4.2,
      topSpeed: 280,
      drivetrain: 'AWD',
      category: 'Sedan',
      price: 3800000,
      imageUrl: '/images/cars/mercedes-c43.jpg',
      description: 'New generation AMG C43 with hybrid power',
    },
    {
      _id: 'default_2',
      brand: 'Audi',
      model: 'RS7 Avant',
      year: 2024,
      engine: {
        displacement: 3996,
        cylinders: 8,
        type: 'Turbocharged V8',
      },
      horsepower: 661,
      torque: 626,
      fuelType: 'Petrol',
      acceleration: 3.3,
      topSpeed: 305,
      drivetrain: 'AWD',
      category: 'Sedan',
      price: 5500000,
      imageUrl: '/images/cars/audi-rs7.jpg',
      description: 'Latest RS7 Avant with enhanced power output',
    },
    {
      _id: 'default_3',
      brand: 'Porsche',
      model: '911 Turbo S',
      year: 2024,
      engine: {
        displacement: 3746,
        cylinders: 6,
        type: 'Turbocharged Flat-6',
      },
      horsepower: 640,
      torque: 590,
      fuelType: 'Petrol',
      acceleration: 2.6,
      topSpeed: 330,
      drivetrain: 'AWD',
      category: 'Sports',
      price: 9500000,
      imageUrl: '/images/cars/porsche-911-turbo.jpg',
      description: '2024 911 Turbo S with next-gen tech',
    },
    {
      _id: 'default_4',
      brand: 'Lamborghini',
      model: 'Revuelto',
      year: 2024,
      engine: {
        displacement: 5996,
        cylinders: 12,
        type: 'Hybrid V12',
      },
      horsepower: 1001,
      torque: 986,
      fuelType: 'Hybrid',
      acceleration: 2.5,
      topSpeed: 350,
      drivetrain: 'AWD',
      category: 'Sports',
      price: 25000000,
      imageUrl: '/images/cars/lamborghini-revuelto.jpg',
      description: 'Lamborghini flagship hybrid supercar',
    },
    {
      _id: 'default_5',
      brand: 'Ferrari',
      model: '812 Superfast',
      year: 2024,
      engine: {
        displacement: 6496,
        cylinders: 12,
        type: 'Naturally Aspirated V12',
      },
      horsepower: 789,
      torque: 718,
      fuelType: 'Petrol',
      acceleration: 2.9,
      topSpeed: 320,
      drivetrain: 'RWD',
      category: 'Sports',
      price: 20000000,
      imageUrl: '/images/cars/ferrari-812.jpg',
      description: 'Ferrari 812 Superfast with V12 power',
    },
    {
      _id: 'default_6',
      brand: 'Tesla',
      model: 'Model S Plaid 2024',
      year: 2024,
      engine: {
        displacement: 0,
        cylinders: 0,
        type: 'Electric Triple Motor',
      },
      horsepower: 1080,
      torque: 1420,
      fuelType: 'Electric',
      acceleration: 1.89,
      topSpeed: 330,
      drivetrain: 'AWD',
      category: 'Sedan',
      price: 5000000,
      imageUrl: '/images/cars/tesla-model-s-2024.jpg',
      description: 'Refreshed Model S Plaid with improved performance',
    },
    {
      _id: 'default_7',
      brand: 'McLaren',
      model: 'Artura',
      year: 2024,
      engine: {
        displacement: 3994,
        cylinders: 8,
        type: 'Hybrid V8',
      },
      horsepower: 680,
      torque: 720,
      fuelType: 'Hybrid',
      acceleration: 2.8,
      topSpeed: 330,
      drivetrain: 'RWD',
      category: 'Sports',
      price: 16000000,
      imageUrl: '/images/cars/mclaren-artura.jpg',
      description: 'McLaren hybrid supercar with groundbreaking tech',
    },
    {
      _id: 'default_8',
      brand: 'Bentley',
      model: 'Continental Speed',
      year: 2024,
      engine: {
        displacement: 5950,
        cylinders: 12,
        type: 'Twin-Turbocharged W12',
      },
      horsepower: 667,
      torque: 738,
      fuelType: 'Petrol',
      acceleration: 3.5,
      topSpeed: 335,
      drivetrain: 'AWD',
      category: 'Coupe',
      price: 13000000,
      imageUrl: '/images/cars/bentley-speed.jpg',
      description: 'Latest Bentley Continental Speed with ultimate luxury',
    },
    {
      _id: 'default_9',
      brand: 'Bugatti',
      model: 'Bolide',
      year: 2024,
      engine: {
        displacement: 7993,
        cylinders: 16,
        type: 'Quad-Turbocharged W16',
      },
      horsepower: 1600,
      torque: 1200,
      fuelType: 'Petrol',
      acceleration: 2.17,
      topSpeed: 500,
      drivetrain: 'AWD',
      category: 'Sports',
      price: 150000000,
      imageUrl: '/images/cars/bugatti-bolide.jpg',
      description: 'Bugatti Bolide - fastest hypercar ever created',
    },
    {
      _id: 'default_10',
      brand: 'Rolls-Royce',
      model: 'Ghost Black Badge',
      year: 2024,
      engine: {
        displacement: 5950,
        cylinders: 12,
        type: 'Twin-Turbocharged V12',
      },
      horsepower: 593,
      torque: 664,
      fuelType: 'Petrol',
      acceleration: 4.6,
      topSpeed: 250,
      drivetrain: 'AWD',
      category: 'Sedan',
      price: 15000000,
      imageUrl: '/images/cars/rolls-royce-ghost-bb.jpg',
      description: 'Rolls-Royce Ghost Black Badge with exclusive styling',
    },
    {
      _id: 'default_11',
      brand: 'Jaguar',
      model: 'F-Type 2025',
      year: 2025,
      engine: {
        displacement: 2997,
        cylinders: 6,
        type: 'Turbocharged Inline-6',
      },
      horsepower: 575,
      torque: 531,
      fuelType: 'Petrol',
      acceleration: 3.5,
      topSpeed: 305,
      drivetrain: 'RWD',
      category: 'Sports',
      price: 4500000,
      imageUrl: '/images/cars/jaguar-f-type-2025.jpg',
      description: 'New generation Jaguar F-Type with modern design',
    },
    {
      _id: 'default_12',
      brand: 'Dodge',
      model: 'Charger Daytona',
      year: 2024,
      engine: {
        displacement: 0,
        cylinders: 0,
        type: 'Electric Dual Motor',
      },
      horsepower: 670,
      torque: 740,
      fuelType: 'Electric',
      acceleration: 3.3,
      topSpeed: 300,
      drivetrain: 'AWD',
      category: 'Coupe',
      price: 4200000,
      imageUrl: '/images/cars/dodge-charger-daytona.jpg',
      description: 'New Dodge Charger Daytona EV muscle car',
    },
    {
      _id: 'default_13',
      brand: 'Chevrolet',
      model: 'Corvette E-Ray',
      year: 2024,
      engine: {
        displacement: 5498,
        cylinders: 8,
        type: 'Hybrid V8',
      },
      horsepower: 655,
      torque: 667,
      fuelType: 'Hybrid',
      acceleration: 2.5,
      topSpeed: 330,
      drivetrain: 'AWD',
      category: 'Sports',
      price: 5500000,
      imageUrl: '/images/cars/corvette-e-ray.jpg',
      description: 'Chevrolet Corvette E-Ray hybrid supercar',
    },
  ];

  useEffect(() => {
    let isCurrent = true;

    const fetchCar = async () => {
      setLoading(true);
      setCar(null);
      setError(null);
      setModifications([]);
      setSelectedModificationIds([]);
      setConfiguration(null);
      setConfigurationError('');

      try {
        if (!carId) {
          setError('No car ID provided');
          setLoading(false);
          return;
        }

        // محاولة جلب من API أولاً
        try {
          const response = await carService.getCarById(carId);
          if (!isCurrent) return;
          setCar({
            ...response.data.car,
            engine: {
              type: 'Unknown',
              cylinders: 0,
              displacement: 0,
              ...response.data.car.engine,
            },
          });
          setModifications(Array.isArray(response.data.modifications) ? response.data.modifications : []);
        } catch (apiError) {
          if (!isCurrent) return;
          setError(apiError.response?.status === 404 ? 'This vehicle is no longer available.' : 'Unable to load vehicle data. Please try again.');
        }
      } catch (err) {
        if (isCurrent) setError('Failed to load car details');
        console.error(err);
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    fetchCar();
    return () => {
      isCurrent = false;
    };
  }, [carId]);

  useEffect(() => {
    if (!isImageOpen) return undefined;

    imageCloseRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsImageOpen(false);
        imageTriggerRef.current?.focus();
      }
      if (event.key === 'Tab') {
        event.preventDefault();
        imageCloseRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      imageTriggerRef.current?.focus();
    };
  }, [isImageOpen]);

  const handleModificationToggle = async (modification) => {
    const modificationId = modification._id || modification.id;
    const isSelected = selectedModificationIds.includes(modificationId);
    const previousSelectedModificationIds = selectedModificationIds;
    const nextIds = isSelected
      ? selectedModificationIds.filter((id) => id !== modificationId)
      : [...selectedModificationIds, modificationId];

    if (!isSelected) {
      const missingRequirement = (modification.requirements || []).find((id) => !nextIds.includes(id));
      if (missingRequirement) {
        setConfigurationError(`${modification.name} requires another selected modification.`);
        return;
      }
      const hasConflict = (modification.conflicts || []).some((id) => nextIds.includes(id));
      if (hasConflict) {
        setConfigurationError('These modifications cannot be used together.');
        return;
      }
      if (modification.availability === 'in_stock' && Number(modification.stock) <= 0) {
        setConfigurationError(`${modification.name} is currently out of stock.`);
        return;
      }
    }

    setConfigurationError('');
    setSelectedModificationIds(nextIds);
    const requestId = configurationRequestRef.current + 1;
    configurationRequestRef.current = requestId;
    try {
      const response = await configuratorService.calculateConfiguration(carId, nextIds);
      if (requestId !== configurationRequestRef.current) return;
      setConfiguration(response.data);
    } catch (requestError) {
      if (requestId !== configurationRequestRef.current) return;
      setConfigurationError(requestError.response?.data?.error || 'Unable to calculate this configuration.');
      setSelectedModificationIds(previousSelectedModificationIds);
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="text-center py-12 sm:py-16 md:py-24">
          <div className="w-10 sm:w-12 h-10 sm:h-12 border-4 border-gray-700 border-t-red-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-xs sm:text-sm md:text-base text-gray-400 mt-3 sm:mt-4">Loading car details...</p>
        </div>
        <Footer />
      </PageTransition>
    );
  }

  if (error || !car) {
    return (
      <PageTransition>
        <div className="text-center py-12 sm:py-16 md:py-24">
          <p className="text-sm sm:text-base md:text-lg text-red-600 font-semibold">{error || 'Car not found'}</p>
          <button
            onClick={() => navigate('/cars')}
            className="mt-4 sm:mt-6 px-3 sm:px-6 py-1.5 sm:py-2 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm md:text-base rounded-lg font-semibold transition"
          >
            Back to Cars
          </button>
        </div>
        <Footer />
      </PageTransition>
    );
  }

  const performanceMetrics = [
    { label: 'Horsepower', value: `${car.horsepower} HP`, icon: Zap, tone: 'red' },
    { label: 'Torque', value: `${car.torque} Nm`, icon: Droplets, tone: 'blue' },
    { label: '0-100 km/h', value: `${typeof car.acceleration === 'number' ? car.acceleration.toFixed(1) : (parseFloat(car.acceleration) || 0).toFixed(1)}s`, icon: Timer, tone: 'amber' },
    { label: 'Top Speed', value: `${car.topSpeed} km/h`, icon: Gauge, tone: 'green' },
  ];

  return (
    <PageTransition>
      <main className="car-detail-page">
        <div className="car-detail-shell">
          <motion.button
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/cars')}
            className="car-back-link"
          >
            <ArrowLeft size={16} />
            Back to collection
          </motion.button>

          <section className="car-identity-grid" aria-labelledby="car-title">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="car-visual-panel">
              <div className="car-visual-grid" aria-hidden="true" />
              {car.imageUrl ? (
                <button ref={imageTriggerRef} type="button" onClick={() => setIsImageOpen(true)} aria-label={`View ${car.brand} ${car.model} image`} className="car-image-trigger">
                  <img src={car.imageUrl} alt={`${car.brand} ${car.model}`} className="car-detail-image" />
                </button>
              ) : (
                <Wrench className="car-image-fallback" aria-hidden="true" />
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="car-identity-panel">
              <p className="eyebrow">{car.brand} / {car.category}</p>
              <h1 id="car-title" className="car-title">{car.model}</h1>
              <p className="car-brand-label">{car.brand} <span>·</span> {car.year}</p>
              <p className="car-description">{car.description}</p>
              <div className="car-price-block">
                <span>Starting price</span>
                <strong>{formatPrice(car.price) || 'N/A'} <small>AED</small></strong>
              </div>
              <div className="car-identity-tags">
                <span><Cog size={15} /> {car.drivetrain}</span>
                <span><BatteryCharging size={15} /> {car.fuelType}</span>
                <span><Gauge size={15} /> {car.topSpeed} km/h</span>
              </div>
            </motion.div>
          </section>

          {isImageOpen && car.imageUrl && (
            <div role="dialog" aria-modal="true" aria-label={`${car.brand} ${car.model} image`} onClick={() => setIsImageOpen(false)} className="car-image-modal">
              <button ref={imageCloseRef} type="button" onClick={() => setIsImageOpen(false)} aria-label="Close image" className="car-image-close"><X size={20} /></button>
              <img src={car.imageUrl} alt={`${car.brand} ${car.model}`} onClick={(event) => event.stopPropagation()} className="car-modal-image" />
            </div>
          )}

          <section className="performance-section" aria-labelledby="performance-heading">
            <div className="section-kicker-row"><p className="eyebrow">Performance overview</p></div>
            <h2 id="performance-heading" className="sr-only">Performance data</h2>
            <div className="performance-grid">
              {performanceMetrics.map(({ label, value, icon: Icon, tone }) => (
                <div key={label} className={`performance-card performance-card--${tone}`}>
                  <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="detail-lower-grid">
            <div className="engine-panel detail-panel">
              <div className="detail-panel-heading"><div><p className="eyebrow">Engineering profile</p><h2><Cog size={20} /> Engine Details</h2></div></div>
              <div className="engine-spec-grid">
                <div><span>Engine architecture</span><strong>{car.engine.type}</strong></div>
                <div><span>Cylinders</span><strong>{car.engine.cylinders} Cyl</strong></div>
                <div><span>Displacement</span><strong>{car.engine.displacement} cc</strong></div>
                <div><span>Fuel system</span><strong>{car.fuelType}</strong></div>
                <div><span>Drive layout</span><strong>{car.drivetrain}</strong></div>
              </div>
            </div>

            <section className="modifications-panel detail-panel" aria-labelledby="modifications-heading">
              <div className="detail-panel-heading"><div><p className="eyebrow">Available upgrades</p><h2 id="modifications-heading"><Wrench size={20} /> Modifications</h2></div></div>
              {configurationError && <div role="alert" className="configuration-alert">{configurationError}</div>}
              {modifications.length === 0 ? (
                <p className="empty-modifications">No active modifications are available for this vehicle.</p>
              ) : (
                <div className="modification-list">
                  {modifications.map((modification) => {
                    const modificationId = modification._id || modification.id;
                    const isSelected = selectedModificationIds.includes(modificationId);
                    return (
                      <label key={modificationId} className={`modification-row ${isSelected ? 'modification-row--selected' : ''}`}>
                        <span className="modification-check"><input type="checkbox" checked={isSelected} onChange={() => handleModificationToggle(modification)} /><span /></span>
                        <span className="modification-copy"><strong>{modification.name}</strong><small>{modification.category || modification.type || 'Other'} · {modification.priceType === 'percentage' ? `${modification.price || 0}%` : `AED ${Number(modification.price || 0).toLocaleString()}`}</small></span>
                        <span className="modification-output">{modification.horsepower ? `+${modification.horsepower} HP` : ''}{modification.torque ? ` · +${modification.torque} Nm` : ''}</span>
                      </label>
                    );
                  })}
                </div>
              )}
              {configuration && (
                <div className="configuration-summary">
                  <div><span>Output</span><strong>{configuration.modifiedHorsepower} HP</strong></div>
                  <div><span>Torque</span><strong>{configuration.modifiedTorque} Nm</strong></div>
                  <div><span>0-100</span><strong>{Number(configuration.modifiedAcceleration || 0).toFixed(1)}s</strong></div>
                  <div><span>Upgrade total</span><strong>EGP {Number(configuration.totalPrice || 0).toLocaleString()}</strong></div>
                  <p>Final vehicle price <strong>EGP {(Number(car.price || 0) + Number(configuration.totalPrice || 0)).toLocaleString()}</strong></p>
                </div>
              )}
            </section>
          </section>

          <div className="purchase-bar">
            <div><span>Purchase summary</span><strong>{car.brand} {car.model}</strong></div>
            <button onClick={() => {
              const params = new URLSearchParams({
                carId: car.id,
                brand: car.brand,
                model: car.model,
                year: car.year,
                price: Number(car.price || 0) + Number(configuration?.totalPrice || 0),
                horsepower: configuration?.modifiedHorsepower ?? car.horsepower,
                torque: configuration?.modifiedTorque ?? car.torque,
                topSpeed: configuration?.modifiedTopSpeed ?? car.topSpeed,
                acceleration: configuration?.modifiedAcceleration ?? car.acceleration,
                fuelType: car.fuelType,
                engineType: car.engine.type,
                cylinders: car.engine.cylinders,
                drivetrain: car.drivetrain,
                imageUrl: car.imageUrl,
                modificationIds: selectedModificationIds.join(','),
              });
              navigate(`/purchase?${params.toString()}`);
            }} className="purchase-button">Continue to purchase <ArrowLeft size={18} /></button>
          </div>
        </div>
      </main>
      <Footer />
    </PageTransition>
  );
};
