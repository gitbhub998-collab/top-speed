import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, CreditCard, Fuel, Gauge, ShieldCheck, Timer, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Footer } from '../components/Layout';
import { PageTransition } from '../components/Animations';
import { carService, configuratorService } from '../services/api';

const formatPrice = (price) => new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
}).format(price);

export const PurchasePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const carId = searchParams.get('carId') || '';
  const modificationIds = searchParams.get('modificationIds')?.split(',').filter(Boolean) || [];
  const [carData, setCarData] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isCurrent = true;
    const loadPurchaseData = async () => {
      if (!carId) {
        setLoadError('This vehicle is unavailable.');
        return;
      }
      try {
        const [carResponse, configurationResponse] = await Promise.all([
          carService.getCarById(carId),
          configuratorService.calculateConfiguration(carId, modificationIds),
        ]);
        if (!isCurrent) return;
        const car = carResponse.data.car;
        const configuration = configurationResponse.data;
        setCarData({
          carId: car.id,
          brand: car.brand,
          model: car.model,
          year: Number(car.year || 0),
          price: Number(car.price || 0) + Number(configuration.totalPrice || 0),
          horsepower: Number(configuration.modifiedHorsepower ?? car.horsepower ?? 0),
          torque: Number(configuration.modifiedTorque ?? car.torque ?? 0),
          topSpeed: Number(configuration.modifiedTopSpeed ?? car.topSpeed ?? 0),
          acceleration: Number(configuration.modifiedAcceleration ?? car.acceleration ?? 0),
          fuelType: car.fuelType || 'Petrol',
          engineType: car.engine?.type || 'Unknown',
          cylinders: Number(car.engine?.cylinders || 0),
          drivetrain: car.drivetrain || 'Unknown',
          imageUrl: car.imageUrl || '/images/cars/default.jpg',
        });
      } catch (error) {
        if (isCurrent) setLoadError(error.response?.data?.error || 'Unable to load the secure order summary.');
      }
    };
    loadPurchaseData();
    return () => { isCurrent = false; };
  }, [carId, modificationIds.join(',')]);

  if (loadError) return <main className="checkout-page"><div className="checkout-shell"><p className="payment-error" role="alert">{loadError}</p></div></main>;
  if (!carData) return <main className="checkout-page"><div className="checkout-shell"><p className="empty-modifications">Loading secure order summary...</p></div></main>;

  const specs = [
    { label: 'Power', value: `${carData.horsepower} HP`, icon: Zap },
    { label: 'Torque', value: `${carData.torque} Nm`, icon: Gauge },
    { label: '0-100 km/h', value: `${carData.acceleration.toFixed(1)}s`, icon: Timer },
    { label: 'Top speed', value: `${carData.topSpeed} km/h`, icon: Fuel },
  ];

  return (
    <PageTransition>
      <main className="checkout-page">
        <div className="checkout-shell">
          <motion.button initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} onClick={() => navigate(-1)} className="checkout-back-link">
            <ArrowLeft size={16} />
            Back to vehicle
          </motion.button>

          <header className="checkout-header">
            <div>
              <p className="eyebrow">Order checkout</p>
              <h1>Complete your purchase</h1>
              <p>Review the vehicle details, then choose your preferred secure payment method.</p>
            </div>
            <div className="checkout-step"><span>01</span><i /><span>Payment</span></div>
          </header>

          <div className="checkout-layout">
            <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="order-summary-panel" aria-labelledby="order-summary-heading">
              <div className="checkout-panel-heading">
                <div><p className="eyebrow">Order summary</p><h2 id="order-summary-heading">Your vehicle</h2></div>
                <span className="order-status"><Check size={13} /> Ready</span>
              </div>
              <div className="checkout-car-visual">
                <img
                  src={carData.imageUrl}
                  alt={`${carData.brand} ${carData.model}`}
                  onError={(event) => {
                    event.currentTarget.hidden = true;
                    event.currentTarget.parentElement.classList.add('checkout-car-visual--fallback');
                  }}
                />
                <span className="checkout-image-fallback">Vehicle image unavailable</span>
              </div>
              <div className="checkout-car-heading">
                <div><span>{carData.brand} · {carData.year}</span><h3>{carData.model}</h3></div>
                <span className="checkout-category">{carData.drivetrain}</span>
              </div>
              <div className="checkout-spec-grid">
                {specs.map(({ label, value, icon: Icon }) => <div key={label}><Icon size={15} /><span>{label}</span><strong>{value}</strong></div>)}
              </div>
              <div className="checkout-engine-row">
                <div><span>Powertrain</span><strong>{carData.engineType}</strong></div>
                <div><span>Fuel / cylinders</span><strong>{carData.fuelType} · {carData.cylinders} Cyl</strong></div>
              </div>
            </motion.section>

            <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="payment-panel" aria-labelledby="payment-heading">
              <div className="checkout-panel-heading">
                <div><p className="eyebrow">Payment method</p><h2 id="payment-heading"><CreditCard size={20} /> Choose how to pay</h2></div>
                <span className="payment-secure"><ShieldCheck size={15} /> Secure</span>
              </div>
              <div className="payment-methods" role="group" aria-label="Payment method">
                <div className="payment-method payment-method--selected">
                  <span className="payment-method-icon">IP</span>
                  <span><strong>Instapay</strong><small>Scan QR code</small></span>
                  <Check size={16} />
                </div>
              </div>
              <div className="payment-instruction"><span className="payment-step-number">1</span><div><strong>Scan the payment QR</strong><p>Use your banking app to scan the code and transfer the exact order amount.</p></div></div>
              <div className="payment-qr-frame"><img src="/images/cars/Instapay.jpg" alt="Instapay payment QR code" /></div>
              <div className="payment-instruction payment-instruction--last"><span className="payment-step-number">2</span><div><strong>Keep your transfer confirmation</strong><p>Our team will use the payment confirmation to verify and process your vehicle order.</p></div></div>
              <div className="checkout-total"><span>Total amount</span><strong>{formatPrice(carData.price)} <small>EGP</small></strong></div>
              <div className="payment-note"><ShieldCheck size={16} /><span>Payment is processed through Instapay. Do not send a different amount.</span></div>
            </motion.section>
          </div>
        </div>
      </main>
      <Footer />
    </PageTransition>
  );
};
