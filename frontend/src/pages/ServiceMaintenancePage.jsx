import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, Footer } from '../components/Layout';
import { PageTransition } from '../components/Animations';
import { ArrowLeft, Mail, Phone, User, Car, MapPin, AlertCircle, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';
import { serviceService } from '../services/api';

export const ServiceMaintenancePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    clientName: '',
    phoneNumber: '',
    email: '',
    carType: '',
    address: '',
    issueCategory: '',
    issueDescription: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const commonIssues = [
    'Engine Problem',
    'Transmission Issue',
    'Brake System',
    'Suspension Problem',
    'Electrical Issue',
    'Air Conditioning',
    'Oil Change & Filter',
    'Battery Replacement',
    'Tire Service',
    'Coolant System',
    'Fuel System',
    'Exhaust System',
    'Steering Problem',
    'Alternator Issue',
    'Water Pump',
    'General Inspection',
    'Other',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const normalizedFormData = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [key, value.trim()])
    );

    // Validate form
    if (Object.values(normalizedFormData).some((value) => !value)) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (normalizedFormData.issueDescription.length < 10) {
      setError('Please provide a detailed description (at least 10 characters)');
      setLoading(false);
      return;
    }

    try {
      // Send to backend
      await serviceService.sendMaintenanceRequest(normalizedFormData);
      
      setSubmitted(true);
      setFormData({
        clientName: '',
        phoneNumber: '',
        email: '',
        carType: '',
        address: '',
        issueCategory: '',
        issueDescription: '',
      });

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err.response?.data?.message || 'Failed to send request. Please try again.');
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
          className="flex items-center gap-2 text-xs sm:text-sm md:text-base text-green-600 hover:text-green-500 mb-4 sm:mb-6 md:mb-8 font-semibold transition"
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
            Service & Maintenance
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-400">
            Professional maintenance and repair services for your vehicle
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
                className="mb-4 sm:mb-6 p-2 sm:p-3 md:p-4 bg-green-600 text-white text-xs sm:text-sm md:text-base rounded-lg text-center font-semibold"
              >
                Your maintenance request has been sent to our service team!
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
                <h2 className="text-lg sm:text-xl font-bold text-green-600 mb-3 sm:mb-4 md:mb-6 pb-2 sm:pb-3 border-b border-gray-700">
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
                    <User className="w-4 sm:w-5 h-4 sm:h-5 text-green-600" />
                    Client Name
                  </label>
                  <input
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm md:text-base bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-600 transition"
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
                    <Phone className="w-4 sm:w-5 h-4 sm:h-5 text-green-600" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm md:text-base bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-600 transition"
                  />
                </motion.div>

                {/* Email */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-4 sm:mb-6"
                >
                  <label className="flex items-center gap-2 text-white text-xs sm:text-sm md:text-base font-semibold mb-1.5 sm:mb-2 md:mb-3">
                    <Mail className="w-4 sm:w-5 h-4 sm:h-5 text-green-600" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm md:text-base bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-600 transition"
                  />
                </motion.div>

                {/* Address */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <label className="flex items-center gap-2 text-white text-xs sm:text-sm md:text-base font-semibold mb-1.5 sm:mb-2 md:mb-3">
                    <MapPin className="w-4 sm:w-5 h-4 sm:h-5 text-green-600" />
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your address"
                    className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm md:text-base bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-600 transition"
                  />
                </motion.div>
              </div>

              {/* Divider */}
              <div className="border-t border-green-600 opacity-30"></div>

              {/* Section 2: Vehicle Information */}
              <div className="mb-4 sm:mb-6 md:mb-8">
                <h2 className="text-lg sm:text-xl font-bold text-green-600 mb-3 sm:mb-4 md:mb-6 pb-2 sm:pb-3 border-b border-gray-700">
                  Vehicle Information
                </h2>

                {/* Car Type */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="flex items-center gap-2 text-white text-xs sm:text-sm md:text-base font-semibold mb-1.5 sm:mb-2 md:mb-3">
                    <Car className="w-4 sm:w-5 h-4 sm:h-5 text-green-600" />
                    Car Type/Model
                  </label>
                  <input
                    type="text"
                    name="carType"
                    value={formData.carType}
                    onChange={handleChange}
                    placeholder="e.g., BMW M440i, Mercedes AMG C43, Toyota Corolla"
                    className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm md:text-base bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-600 transition"
                  />
                </motion.div>
              </div>

              {/* Divider */}
              <div className="border-t border-green-600 opacity-30"></div>

              {/* Section 3: Service Issue */}
              <div className="mb-4 sm:mb-6 md:mb-8">
                <h2 className="text-lg sm:text-xl font-bold text-green-600 mb-3 sm:mb-4 md:mb-6 pb-2 sm:pb-3 border-b border-gray-700">
                  Service Issue
                </h2>

                {/* Issue Category */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 }}
                  className="mb-4 sm:mb-6"
                >
                  <label className="flex items-center gap-2 text-white text-xs sm:text-sm md:text-base font-semibold mb-1.5 sm:mb-2 md:mb-3">
                    <AlertCircle className="w-4 sm:w-5 h-4 sm:h-5 text-green-600" />
                    Select Issue Category
                  </label>
                  <select
                    name="issueCategory"
                    value={formData.issueCategory}
                    onChange={handleChange}
                    className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm md:text-base bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-600 transition"
                  >
                    <option value="">Choose a common issue...</option>
                    {commonIssues.map((issue, index) => (
                      <option key={index} value={issue}>{issue}</option>
                    ))}
                  </select>
                </motion.div>

                {/* Issue Description */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="flex items-center gap-2 text-white text-xs sm:text-sm md:text-base font-semibold mb-1.5 sm:mb-2 md:mb-3">
                    <Wrench className="w-4 sm:w-5 h-4 sm:h-5 text-green-600" />
                    Describe the Problem
                  </label>
                  <textarea
                    name="issueDescription"
                    value={formData.issueDescription}
                    onChange={handleChange}
                    placeholder="Please describe the issue in detail..."
                    rows="4"
                    className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm md:text-base bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-600 transition resize-none"
                  ></textarea>
                </motion.div>
              </div>

              {/* Submit Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full mt-6 sm:mt-8 px-4 sm:px-6 py-2 sm:py-3 md:py-4 bg-[#315f82] hover:bg-[#42799f] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm md:text-base lg:text-lg rounded-lg transition transform"
              >
                {loading ? 'Sending...' : 'Send Maintenance Request'}
              </motion.button>
            </form>

            {/* Info Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-4 sm:mt-6 md:mt-8 p-2 sm:p-3 md:p-4 bg-gray-800 border border-gray-700 rounded-lg"
            >
              <p className="text-gray-300 text-xs sm:text-sm md:text-base">
                Our experienced technical team will review your maintenance request and contact you within 24 hours to confirm service details, provide a diagnosis, and schedule the service at your convenience.
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
