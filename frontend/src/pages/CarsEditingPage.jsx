import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, Footer } from '../components/Layout';
import { PageTransition } from '../components/Animations';
import { ArrowLeft, Mail, Phone, User, Car, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';
import { serviceService } from '../services/api';

export const CarsEditingPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    clientName: '',
    phoneNumber: '',
    email: '',
    carType: '',
    modifications: {
      exhaust: false,
      engine: false,
      brakes: false,
      carBody: false,
      colors: false,
    }
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleModificationChange = (modification) => {
    setFormData(prev => ({
      ...prev,
      modifications: {
        ...prev.modifications,
        [modification]: !prev.modifications[modification]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate form
    if (!formData.clientName || !formData.phoneNumber || !formData.email || !formData.carType) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    // Check if at least one modification is selected
    const hasModifications = Object.values(formData.modifications).some(val => val === true);
    if (!hasModifications) {
      setError('Please select at least one modification');
      setLoading(false);
      return;
    }

    try {
      // Send to backend API using axios client
      await serviceService.sendModificationRequest(formData);

      setSubmitted(true);
      setFormData({
        clientName: '',
        phoneNumber: '',
        email: '',
        carType: '',
        modifications: {
          exhaust: false,
          engine: false,
          brakes: false,
          carBody: false,
          colors: false,
        }
      });

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Failed to send request. Please try again.');
    } finally {
      setLoading(false);
    }
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

        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8 md:mb-12"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-4">
            Car Modification Service
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-400">
            Professional car modifications tailored to your specifications
          </p>
        </motion.div>

        {/* Main Form Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto mb-6 sm:mb-8 md:mb-12"
        >
          <div className="form-surface rounded-2xl border p-4 sm:p-6 md:p-8 lg:p-12 shadow-2xl">
            
            {/* Success Message */}
            {submitted && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 sm:mb-6 p-2 sm:p-3 md:p-4 bg-red-600 text-white text-xs sm:text-sm md:text-base rounded-lg text-center font-semibold"
              >
                Your request has been sent to our modification team!
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 sm:mb-6 p-2 sm:p-3 md:p-4 bg-red-500/20 border border-red-600 text-red-300 text-xs sm:text-sm md:text-base rounded-lg text-center font-semibold"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Section 1: Client Information */}
              <div className="mb-4 sm:mb-6 md:mb-8">
                <h2 className="text-lg sm:text-xl font-bold text-red-600 mb-3 sm:mb-4 md:mb-6 pb-2 sm:pb-3 border-b border-gray-700">
                  Client Information
                </h2>

                {/* Client Name */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-4 sm:mb-6"
                >
                  <label className="flex items-center gap-2 text-white text-xs sm:text-sm md:text-base font-semibold mb-1.5 sm:mb-2 md:mb-3">
                    <User className="w-4 sm:w-5 h-4 sm:h-5 text-red-600" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm md:text-base bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition"
                  />
                </motion.div>

                {/* Phone Number */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="mb-4 sm:mb-6"
                >
                  <label className="flex items-center gap-2 text-white text-xs sm:text-sm md:text-base font-semibold mb-1.5 sm:mb-2 md:mb-3">
                    <Phone className="w-4 sm:w-5 h-4 sm:h-5 text-red-600" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm md:text-base bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition"
                  />
                </motion.div>

                {/* Email */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="flex items-center gap-2 text-white text-xs sm:text-sm md:text-base font-semibold mb-1.5 sm:mb-2 md:mb-3">
                    <Mail className="w-4 sm:w-5 h-4 sm:h-5 text-red-600" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm md:text-base bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition"
                  />
                </motion.div>
              </div>

              {/* Divider */}
              <div className="border-t border-red-600 opacity-30"></div>

              {/* Section 2: Vehicle Information */}
              <div className="mb-4 sm:mb-6 md:mb-8">
                <h2 className="text-lg sm:text-xl font-bold text-red-600 mb-3 sm:mb-4 md:mb-6 pb-2 sm:pb-3 border-b border-gray-700">
                  Vehicle Information
                </h2>

                {/* Car Type */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <label className="flex items-center gap-2 text-white text-xs sm:text-sm md:text-base font-semibold mb-1.5 sm:mb-2 md:mb-3">
                    <Car className="w-4 sm:w-5 h-4 sm:h-5 text-red-600" />
                    Car Type/Model
                  </label>
                  <input
                    type="text"
                    name="carType"
                    value={formData.carType}
                    onChange={handleChange}
                    placeholder="e.g., BMW M440i, Mercedes AMG C43, Ferrari 812"
                    className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm md:text-base bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition"
                  />
                </motion.div>
              </div>

              {/* Divider */}
              <div className="border-t border-red-600 opacity-30"></div>

              {/* Section 3: Modifications Selection */}
              <div className="mb-4 sm:mb-6 md:mb-8">
                <h2 className="text-lg sm:text-xl font-bold text-red-600 mb-3 sm:mb-4 md:mb-6 pb-2 sm:pb-3 border-b border-gray-700">
                  Select Modifications
                </h2>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-2 sm:space-y-3 md:space-y-4"
                >
                  {/* Exhaust */}
                  <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 md:p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-red-600 transition cursor-pointer">
                    <input
                      type="checkbox"
                      id="exhaust"
                      checked={formData.modifications.exhaust}
                      onChange={() => handleModificationChange('exhaust')}
                      className="w-4 sm:w-5 h-4 sm:h-5 cursor-pointer"
                    />
                    <label htmlFor="exhaust" className="flex-1 cursor-pointer text-xs sm:text-sm md:text-base text-white font-semibold">
                      Performance Exhaust System
                    </label>
                  </div>

                  {/* Engine */}
                  <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 md:p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-red-600 transition cursor-pointer">
                    <input
                      type="checkbox"
                      id="engine"
                      checked={formData.modifications.engine}
                      onChange={() => handleModificationChange('engine')}
                      className="w-4 sm:w-5 h-4 sm:h-5 cursor-pointer"
                    />
                    <label htmlFor="engine" className="flex-1 cursor-pointer text-xs sm:text-sm md:text-base text-white font-semibold">
                      Engine Tuning & Optimization
                    </label>
                  </div>

                  {/* Brakes */}
                  <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 md:p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-red-600 transition cursor-pointer">
                    <input
                      type="checkbox"
                      id="brakes"
                      checked={formData.modifications.brakes}
                      onChange={() => handleModificationChange('brakes')}
                      className="w-4 sm:w-5 h-4 sm:h-5 cursor-pointer"
                    />
                    <label htmlFor="brakes" className="flex-1 cursor-pointer text-xs sm:text-sm md:text-base text-white font-semibold">
                      Brake System Upgrade
                    </label>
                  </div>

                  {/* Car Body */}
                  <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 md:p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-red-600 transition cursor-pointer">
                    <input
                      type="checkbox"
                      id="carBody"
                      checked={formData.modifications.carBody}
                      onChange={() => handleModificationChange('carBody')}
                      className="w-4 sm:w-5 h-4 sm:h-5 cursor-pointer"
                    />
                    <label htmlFor="carBody" className="flex-1 cursor-pointer text-xs sm:text-sm md:text-base text-white font-semibold">
                      Body Kit & Aerodynamics
                    </label>
                  </div>

                  {/* Colors */}
                  <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 md:p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-red-600 transition cursor-pointer">
                    <input
                      type="checkbox"
                      id="colors"
                      checked={formData.modifications.colors}
                      onChange={() => handleModificationChange('colors')}
                      className="w-4 sm:w-5 h-4 sm:h-5 cursor-pointer"
                    />
                    <label htmlFor="colors" className="flex-1 cursor-pointer text-xs sm:text-sm md:text-base text-white font-semibold">
                      Custom Paint & Colors
                    </label>
                  </div>
                </motion.div>
              </div>

              {/* Submit Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full mt-6 sm:mt-8 px-4 sm:px-6 py-2 sm:py-3 md:py-4 accent-button disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xs sm:text-sm md:text-base lg:text-lg rounded-lg transition transform"
              >
                {loading ? 'Sending...' : 'Send Request'}
              </motion.button>
            </form>

            {/* Info Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="mt-4 sm:mt-6 md:mt-8 p-2 sm:p-3 md:p-4 bg-gray-800 border border-gray-700 rounded-lg"
            >
              <p className="text-gray-300 text-xs sm:text-sm md:text-base">
                Our professional modification team will review your request and send you a detailed quote and timeline to the email address you provided. We guarantee prompt response within 24 hours.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>

      <Footer />
    </PageTransition>
  );
};
