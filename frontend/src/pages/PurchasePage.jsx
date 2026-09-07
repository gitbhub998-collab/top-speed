import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Header, Footer } from '../components/Layout';
import { PageTransition } from '../components/Animations';
import { ArrowLeft, Zap, Gauge, Fuel, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';

export const PurchasePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get car data from URL params
  const carData = {
    brand: searchParams.get('brand') || 'Unknown',
    model: searchParams.get('model') || 'Unknown',
    year: parseInt(searchParams.get('year') || '2024'),
    price: parseInt(searchParams.get('price') || '0'),
    horsepower: parseInt(searchParams.get('horsepower') || '0'),
    torque: parseInt(searchParams.get('torque') || '0'),
    topSpeed: parseInt(searchParams.get('topSpeed') || '0'),
    acceleration: parseFloat(searchParams.get('acceleration') || '0'),
    fuelType: searchParams.get('fuelType') || 'Petrol',
    engineType: searchParams.get('engineType') || 'Unknown',
    cylinders: parseInt(searchParams.get('cylinders') || '0'),
    drivetrain: searchParams.get('drivetrain') || 'Unknown',
    imageUrl: searchParams.get('imageUrl') || '/images/cars/default.jpg',
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <PageTransition>
      
      <div className="page-surface">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-12">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs sm:text-sm md:text-base text-red-600 hover:text-red-500 mb-4 sm:mb-6 md:mb-8 font-semibold transition"
        >
          <ArrowLeft className="w-4 sm:w-5 h-4 sm:h-5" />
          Back
        </motion.button>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 items-center justify-center">
          {/* Car Details Card - Square */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-sm mx-auto md:mx-0"
          >
            <div className="form-surface rounded-xl border overflow-hidden shadow-2xl">
              {/* Car Image */}
              <div className="h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                <img
                  src={carData.imageUrl}
                  alt={`${carData.brand} ${carData.model}`}
                  className="max-w-full max-h-full object-contain hover:scale-110 transition-transform duration-500"
                />
              </div>

              {/* Car Info Section */}
              <div className="p-2 sm:p-3 md:p-4">
                {/* Header */}
                <div className="mb-2 sm:mb-3 md:mb-4">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                    {carData.brand}
                  </h2>
                  <p className="text-base sm:text-lg md:text-lg text-red-600 font-semibold mt-0.5 sm:mt-1">
                    {carData.model}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 sm:mt-1">Year: {carData.year}</p>
                </div>

                {/* Price Highlight */}
                <div className="accent-button rounded-lg p-2 sm:p-3 mb-2 sm:mb-3 md:mb-4">
                  <p className="text-gray-100 text-xs font-semibold uppercase tracking-wide">Price</p>
                  <p className="text-white text-lg sm:text-xl md:text-2xl font-bold mt-0.5 sm:mt-1">
                    {formatPrice(carData.price)}
                  </p>
                </div>

                {/* Key Specs */}
                <div className="space-y-1 sm:space-y-2 mb-2 sm:mb-3 md:mb-4">
                  <div className="flex justify-between items-center border-b border-gray-800 pb-1 sm:pb-2">
                    <span className="text-gray-400 flex items-center gap-1 text-xs sm:text-sm">
                      <Zap className="w-3 h-3 text-yellow-500" />
                      Horsepower
                    </span>
                    <span className="text-white font-semibold text-xs sm:text-sm">{carData.horsepower} hp</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-800 pb-1 sm:pb-2">
                    <span className="text-gray-400 text-xs sm:text-sm">Torque</span>
                    <span className="text-white font-semibold text-xs sm:text-sm">{carData.torque} Nm</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-800 pb-1 sm:pb-2">
                    <span className="text-gray-400 flex items-center gap-1 text-xs sm:text-sm">
                      <Gauge className="w-3 h-3 text-orange-600" />
                      0-100
                    </span>
                    <span className="text-white font-semibold text-xs sm:text-sm">{carData.acceleration.toFixed(1)}s</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-800 pb-1 sm:pb-2">
                    <span className="text-gray-400 flex items-center gap-1 text-xs sm:text-sm">
                      <Fuel className="w-3 h-3 text-green-600" />
                      Top Speed
                    </span>
                    <span className="text-white font-semibold text-xs sm:text-sm">{carData.topSpeed}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-800 pb-1 sm:pb-2">
                    <span className="text-gray-400 text-xs sm:text-sm">{carData.fuelType}</span>
                    <span className="text-white font-semibold text-xs sm:text-sm">{carData.drivetrain}</span>
                  </div>
                </div>

                {/* Engine Info */}
                <div className="bg-gray-900 rounded-lg p-2 sm:p-3">
                  <p className="text-gray-400 text-xs font-semibold uppercase">Engine</p>
                  <p className="text-white text-xs font-semibold mt-0.5 sm:mt-1">{carData.engineType}</p>
                  <p className="text-gray-500 text-xs mt-0.5 sm:mt-1">{carData.cylinders} Cyl</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* QR Code Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center justify-center"
          >
            <div className="text-center mb-4 sm:mb-6 md:mb-8">
              <h3 className="text-lg sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2">
                Complete Your buying process
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-gray-400">
                Scan the QR code below to pay via Instapay
              </p>
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-2xl border-4 border-orange-300"
            >
              <img
                src="/images/cars/Instapay.jpg"
                alt="Instapay QR Code"
                className="w-48 sm:w-56 md:w-64 h-48 sm:h-56 md:h-64 object-contain"
              />
            </motion.div>

            <div className="mt-4 sm:mt-6 md:mt-8 text-center">
              <p className="text-xs sm:text-sm md:text-base text-gray-300">
                Open your banking app and scan this code to proceed with payment
              </p>
              <p className="text-red-600 font-semibold mt-1 sm:mt-2 text-xs sm:text-sm md:text-base">
                Total Amount: {formatPrice(carData.price)}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>

      <Footer />
    </PageTransition>
  );
};
