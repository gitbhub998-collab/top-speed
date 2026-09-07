import React, { useEffect, useState } from 'react';
import { carService } from '../services/api';
import { AnimatedCard, PageTransition } from '../components/Animations';
import { Header, Footer } from '../components/Layout';
import { Zap, Gauge, Fuel, Wrench } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// البيانات الافتراضية للسيارات الحديثة 2024-2025
const DEFAULT_CARS = [
  {
    _id: 'default_0',
    brand: 'BMW',
    model: 'M440i xDrive',
    year: 2024,
    horsepower: 503,
    torque: 479,
    acceleration: 4.2,
    topSpeed: 250,
    fuelType: 'Petrol',
    drivetrain: 'AWD',
    category: 'Sedan',
    price: 3500000,
    imageUrl: '/images/cars/bmw-m440i.jpg',
    description: 'Latest generation M440i with advanced tech',
    isVisible: true,
  },
  {
    _id: 'default_1',
    brand: 'Mercedes-Benz',
    model: 'AMG C43',
    year: 2024,
    horsepower: 402,
    torque: 500,
    acceleration: 4.2,
    topSpeed: 280,
    fuelType: 'Petrol',
    drivetrain: 'AWD',
    category: 'Sedan',
    price: 3800000,
    imageUrl: '/images/cars/mercedes-c43.jpg',
    description: 'New generation AMG C43 with hybrid power',
    isVisible: true,
  },
  {
    _id: 'default_2',
    brand: 'Audi',
    model: 'RS7 Avant',
    year: 2024,
    horsepower: 661,
    torque: 626,
    acceleration: 3.3,
    topSpeed: 305,
    fuelType: 'Petrol',
    drivetrain: 'AWD',
    category: 'Sedan',
    price: 5500000,
    imageUrl: '/images/cars/audi-rs7.jpg',
    description: 'Latest RS7 Avant with enhanced power output',
    isVisible: true,
  },
  {
    _id: 'default_3',
    brand: 'Porsche',
    model: '911 Turbo S',
    year: 2024,
    horsepower: 640,
    torque: 590,
    acceleration: 2.6,
    topSpeed: 330,
    fuelType: 'Petrol',
    drivetrain: 'AWD',
    category: 'Sports',
    price: 9500000,
    imageUrl: '/images/cars/porsche-911-turbo.jpg',
    description: '2024 911 Turbo S with next-gen tech',
    isVisible: true,
  },
  {
    _id: 'default_4',
    brand: 'Lamborghini',
    model: 'Revuelto',
    year: 2024,
    horsepower: 1001,
    torque: 986,
    acceleration: 2.5,
    topSpeed: 350,
    fuelType: 'Hybrid',
    drivetrain: 'AWD',
    category: 'Sports',
    price: 25000000,
    imageUrl: '/images/cars/lamborghini-revuelto.jpg',
    description: 'Lamborghini flagship hybrid supercar',
    isVisible: true,
  },
  {
    _id: 'default_5',
    brand: 'Ferrari',
    model: '812 Superfast',
    year: 2024,
    horsepower: 789,
    torque: 718,
    acceleration: 2.9,
    topSpeed: 320,
    fuelType: 'Petrol',
    drivetrain: 'RWD',
    category: 'Sports',
    price: 20000000,
    imageUrl: '/images/cars/ferrari-812.jpg',
    description: 'Ferrari 812 Superfast with V12 power',
    isVisible: true,
  },
  {
    _id: 'default_6',
    brand: 'Tesla',
    model: 'Model S Plaid 2024',
    year: 2024,
    horsepower: 1080,
    torque: 1420,
    acceleration: 1.89,
    topSpeed: 330,
    fuelType: 'Electric',
    drivetrain: 'AWD',
    category: 'Sedan',
    price: 5000000,
    imageUrl: '/images/cars/tesla-model-s-2024.jpg',
    description: 'Refreshed Model S Plaid with improved performance',
    isVisible: true,
  },
  {
    _id: 'default_7',
    brand: 'McLaren',
    model: 'Artura',
    year: 2024,
    horsepower: 680,
    torque: 720,
    acceleration: 2.8,
    topSpeed: 330,
    fuelType: 'Hybrid',
    drivetrain: 'RWD',
    category: 'Sports',
    price: 16000000,
    imageUrl: '/images/cars/mclaren-artura.jpg',
    description: 'McLaren hybrid supercar with groundbreaking tech',
    isVisible: true,
  },
  {
    _id: 'default_8',
    brand: 'Bentley',
    model: 'Continental Speed',
    year: 2024,
    horsepower: 667,
    torque: 738,
    acceleration: 3.5,
    topSpeed: 335,
    fuelType: 'Petrol',
    drivetrain: 'AWD',
    category: 'Coupe',
    price: 13000000,
    imageUrl: '/images/cars/bentley-speed.jpg',
    description: 'Latest Bentley Continental Speed with ultimate luxury',
    isVisible: true,
  },
  {
    _id: 'default_9',
    brand: 'Bugatti',
    model: 'Bolide',
    year: 2024,
    horsepower: 1600,
    torque: 1200,
    acceleration: 2.17,
    topSpeed: 500,
    fuelType: 'Petrol',
    drivetrain: 'AWD',
    category: 'Sports',
    price: 150000000,
    imageUrl: '/images/cars/bugatti-bolide.jpg',
    description: 'Bugatti Bolide - fastest hypercar ever created',
    isVisible: true,
  },
  {
    _id: 'default_10',
    brand: 'Rolls-Royce',
    model: 'Ghost Black Badge',
    year: 2024,
    horsepower: 593,
    torque: 664,
    acceleration: 4.6,
    topSpeed: 250,
    fuelType: 'Petrol',
    drivetrain: 'AWD',
    category: 'Sedan',
    price: 15000000,
    imageUrl: '/images/cars/rolls-royce-ghost-bb.jpg',
    description: 'Rolls-Royce Ghost Black Badge with exclusive styling',
    isVisible: true,
  },
  {
    _id: 'default_11',
    brand: 'Jaguar',
    model: 'F-Type 2025',
    year: 2025,
    horsepower: 575,
    torque: 531,
    acceleration: 3.5,
    topSpeed: 305,
    fuelType: 'Petrol',
    drivetrain: 'RWD',
    category: 'Sports',
    price: 4500000,
    imageUrl: '/images/cars/jaguar-f-type-2025.jpg',
    description: 'New generation Jaguar F-Type with modern design',
    isVisible: true,
  },
  {
    _id: 'default_12',
    brand: 'Dodge',
    model: 'Charger Daytona',
    year: 2024,
    horsepower: 670,
    torque: 740,
    acceleration: 3.3,
    topSpeed: 300,
    fuelType: 'Electric',
    drivetrain: 'AWD',
    category: 'Coupe',
    price: 4200000,
    imageUrl: '/images/cars/dodge-charger-daytona.jpg',
    description: 'New Dodge Charger Daytona EV muscle car',
    isVisible: true,
  },
  {
    _id: 'default_13',
    brand: 'Chevrolet',
    model: 'Corvette E-Ray',
    year: 2024,
    horsepower: 655,
    torque: 667,
    acceleration: 2.5,
    topSpeed: 330,
    fuelType: 'Hybrid',
    drivetrain: 'AWD',
    category: 'Sports',
    price: 5500000,
    imageUrl: '/images/cars/corvette-e-ray.jpg',
    description: 'Chevrolet Corvette E-Ray hybrid supercar',
    isVisible: true,
  },
];

export const CarsPage = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredCars, setFilteredCars] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await carService.getAllCars();
        
        if (Array.isArray(response.data) && response.data.length > 0) {
          setCars(response.data);
          const uniqueBrands = ['All', ...new Set(response.data.map((c) => c.brand))];
          setBrands(uniqueBrands);
          setFilteredCars(response.data);
          setError(null);
        } else {
          throw new Error('No cars in response');
        }
      } catch (err) {
        setCars(DEFAULT_CARS);
        const uniqueBrands = ['All', ...new Set(DEFAULT_CARS.map((c) => c.brand))];
        setBrands(uniqueBrands);
        setFilteredCars(DEFAULT_CARS);
        setError(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  useEffect(() => {
    if (selectedBrand === 'All') {
      setFilteredCars(cars);
    } else {
      setFilteredCars(cars.filter((car) => car.brand === selectedBrand));
    }
  }, [selectedBrand, cars]);

  return (
    <PageTransition>
      <div className="page-surface">
        <Header
          title="Car Catalog"
          subtitle="Browse and customize premium vehicles"
        />

        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-12">
        <div className="mb-6 sm:mb-8 flex gap-2 sm:gap-4 overflow-x-auto pb-4">
          {brands.map((brand) => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(brand)}
              className={`px-3 sm:px-4 md:px-6 py-1 sm:py-2 rounded-lg text-xs sm:text-sm md:text-base font-semibold transition whitespace-nowrap ${
                selectedBrand === brand
                  ? 'accent-button'
                  : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
              }`}
            >
              {brand}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="w-10 sm:w-12 h-10 sm:h-12 border-4 border-gray-700 border-t-red-600 rounded-full animate-spin mx-auto"></div>
            <p className="text-xs sm:text-sm md:text-base text-gray-400 mt-3 sm:mt-4">Loading cars...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 sm:py-12">
            <p className="text-sm sm:text-base md:text-lg text-red-600 font-semibold">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {filteredCars.map((car, idx) => (
              <AnimatedCard key={car._id} delay={idx * 0.1}>
                <Link
                  to={`/car-detail?carId=${car._id}`}
                  className="block group cursor-pointer h-full"
                >
                  <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg mb-3 sm:mb-4 flex items-center justify-center overflow-hidden group-hover:opacity-90 transition">
                    {car.imageUrl ? (
                      <img
                        src={car.imageUrl}
                        alt={`${car.brand} ${car.model}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    ) : (
                      <div className="text-center">
                        <Wrench className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 text-gray-600 mx-auto mb-1 sm:mb-2" />
                        <p className="text-xs sm:text-sm text-gray-500">No image available</p>
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2 group-hover:text-red-600 transition">
                    {car.brand} {car.model}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">{car.year}</p>
                  <p className="text-red-600 font-bold text-base sm:text-lg md:text-xl mb-3 sm:mb-4">
                    {new Intl.NumberFormat('en-US', {
                      minimumFractionDigits: 0,
                    }).format(car.price)}
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
                    <div className="bg-gray-800 rounded-lg p-2 sm:p-3">
                      <Zap className="w-3 sm:w-4 h-3 sm:h-4 text-red-600 mb-1" />
                      <p className="text-xs text-gray-400">Horsepower</p>
                      <p className="text-xs sm:text-sm text-white font-bold">{car.horsepower} HP</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-2 sm:p-3">
                      <Gauge className="w-3 sm:w-4 h-3 sm:h-4 text-blue-600 mb-1" />
                      <p className="text-xs text-gray-400">Top Speed</p>
                      <p className="text-xs sm:text-sm text-white font-bold">{car.topSpeed} km/h</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-2 sm:p-3">
                      <Fuel className="w-3 sm:w-4 h-3 sm:h-4 text-orange-600 mb-1" />
                      <p className="text-xs text-gray-400">Fuel Type</p>
                      <p className="text-xs sm:text-sm text-white font-bold">{car.fuelType}</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-2 sm:p-3">
                      <Wrench className="w-3 sm:w-4 h-3 sm:h-4 text-gray-400 mb-1" />
                      <p className="text-xs text-gray-400">0-100 km/h</p>
                      <p className="text-xs sm:text-sm text-white font-bold">{typeof car.acceleration === 'number' ? car.acceleration.toFixed(1) : (parseFloat(car.acceleration) || 0).toFixed(1)}s</p>
                    </div>
                  </div>
                </Link>
                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={() => navigate(`/car-detail?carId=${car._id}`)}
                    className="w-full accent-button py-1.5 sm:py-2 text-xs sm:text-sm md:text-base rounded-lg font-semibold transition"
                  >
                    View Details
                  </button>
                </div>
              </AnimatedCard>
            ))}
          </div>
        )}

        {filteredCars.length === 0 && !loading && (
          <div className="text-center py-8 sm:py-12">
            <p className="text-sm sm:text-base md:text-lg text-gray-400">No cars found in this category</p>
          </div>
        )}
      </div>
      </div>

      <Footer />
    </PageTransition>
  );
};
