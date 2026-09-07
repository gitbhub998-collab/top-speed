import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { carService } from '../services/api';
import { AnimatedCard, AnimatedContainer, PageTransition } from '../components/Animations';
import { Footer } from '../components/Layout';
import { ArrowRight, Wrench } from 'lucide-react';

export const HomePage = () => {
  const [featuredCars, setFeaturedCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await carService.getAllCars();
        setFeaturedCars(Array.isArray(response.data) ? response.data.slice(0, 3) : []);
      } catch (error) {
        console.error('Failed to load cars:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  return (
    <PageTransition>
      <div className="app-shell">
      <section className="hero-section relative min-h-[calc(100vh-4.5rem)] overflow-hidden flex items-start">
        <video
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        >
          <source src="/TOPSPEED.mp4" type="video/mp4" />
        </video>
        <div className="hero-video-overlay" aria-hidden="true"></div>
        <div className="absolute inset-0 opacity-20" aria-hidden="true">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        </div>

        <div className="relative z-10 mx-auto w-full px-3 pb-10 pt-12 text-left sm:px-4 sm:pb-16 sm:pt-20 md:px-6 md:pb-20 md:pt-24 lg:px-8">
          <AnimatedContainer>
            <p className="eyebrow mb-4">The automotive atelier</p>
            <h1 className="display-heading text-4xl sm:text-6xl md:text-7xl lg:text-7xl font-normal text-white mb-5 sm:mb-6 leading-[0.98] sm:leading-[0.94] max-w-4xl">
              Drive the <span className="gradient-text">difference.</span>
            </h1>
            <p className="text-sm sm:text-[0.95rem] md:text-base text-slate-300 mb-8 sm:mb-10 max-w-xl leading-relaxed">
              A sharper way to discover, configure, and care for the machines you love.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-12 sm:mb-16">
              <Link
                to="/cars"
                className="w-full px-5 sm:w-auto sm:px-7 py-3 sm:py-3.5 bg-orange-400 hover:bg-orange-300 text-[#08111c] rounded font-bold text-sm sm:text-base transition inline-flex items-center justify-center gap-2 shadow-[0_12px_35px_rgba(239,155,74,0.2)]"
              >
                Explore Cars
                <ArrowRight size={20} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </Link>
            </div>
          </AnimatedContainer>

        </div>
      </section>

      <section className="bg-[#f5f1e8] py-16 sm:py-20 md:py-24 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <AnimatedContainer>
            <p className="eyebrow mb-3 !text-[#b66b2b]">Selected machines</p>
            <h2 className="display-heading text-3xl sm:text-4xl md:text-5xl font-normal text-[#102b45] mb-3 sm:mb-4">Featured Vehicles</h2>
            <p className="text-sm sm:text-base text-slate-600 mb-8 sm:mb-12">
              Discover the finest automobiles in our catalog
            </p>
          </AnimatedContainer>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-gray-700 border-t-red-600 rounded-full animate-spin mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredCars.map((car, idx) => (
                <AnimatedCard key={car._id} delay={idx * 0.1}>
                  <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-950 rounded mb-4 flex items-center justify-center overflow-hidden">
                    {car.imageUrl ? (
                      <img
                        src={car.imageUrl}
                        alt={`${car.brand} ${car.model}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Wrench className="w-12 h-12 text-gray-600" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-[#102b45] mb-2">
                    {car.brand} {car.model}
                  </h3>
                  <div className="flex justify-between mb-4 text-sm">
                    <div>
                      <p className="text-slate-500">Horsepower</p>
                      <p className="text-[#b66b2b] font-bold">{car.horsepower} HP</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Top Speed</p>
                      <p className="text-[#315f82] font-bold">{car.topSpeed} km/h</p>
                    </div>
                  </div>
                  <Link
                    to={`/car-detail?carId=${car._id}`}
                    className="w-full bg-[#102b45] hover:bg-[#183b59] text-white py-2.5 rounded font-semibold transition text-center block"
                  >
                    Customize Now
                  </Link>
                </AnimatedCard>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-[#102b45] py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="eyebrow mb-4">Make it yours</p>
          <h2 className="display-heading text-4xl font-normal text-white mb-8">Ready to Customize?</h2>
          <p className="text-slate-300 mb-12 max-w-2xl mx-auto">
            Start building your dream vehicle with our interactive configurator
          </p>
          <Link
            to="/cars"
            className="inline-block px-8 py-4 bg-orange-400 hover:bg-orange-300 text-[#08111c] rounded font-bold transition"
          >
            Browse All Cars
          </Link>
        </div>
      </section>
      </div>

      <Footer />
    </PageTransition>
  );
};
