import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { carService } from '../services/api';
import { AnimatedCard, AnimatedContainer, PageTransition } from '../components/Animations';
import { Footer } from '../components/Layout';
import { Wrench } from 'lucide-react';

export const HomePage = () => {
  const [featuredCars, setFeaturedCars] = useState([]);
  const [activeHeroVideo, setActiveHeroVideo] = useState(0);
  const [loading, setLoading] = useState(true);
  const [shouldAnimateHero, setShouldAnimateHero] = useState(true);
  const heroVideos = Array.from({ length: 9 }, (_, index) => `/videos/TOPSPEED${index + 1}.mp4`);
  const heroVideoRefs = useRef([]);
  const transitionTimeoutRef = useRef(null);
  const isTransitioningRef = useRef(false);
  const isMountedRef = useRef(true);

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

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
    isMountedRef.current = false;
    clearTimeout(transitionTimeoutRef.current);
    heroVideoRefs.current.forEach((video) => video?.pause());
    };
  }, []);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => {
      setShouldAnimateHero(!motionQuery.matches && document.documentElement.dataset.reducedMotion !== 'true');
    };
    const motionPreferenceObserver = new MutationObserver(updateMotionPreference);

    updateMotionPreference();
    motionPreferenceObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-reduced-motion'] });
    motionQuery.addEventListener('change', updateMotionPreference);
    return () => {
      motionPreferenceObserver.disconnect();
      motionQuery.removeEventListener('change', updateMotionPreference);
    };
  }, []);

  useEffect(() => {
    if (shouldAnimateHero) {
      heroVideoRefs.current[activeHeroVideo]?.play().catch(() => {});
      return undefined;
    }

    clearTimeout(transitionTimeoutRef.current);
    isTransitioningRef.current = false;
    heroVideoRefs.current.forEach((video) => video?.pause());
    return undefined;
  }, [activeHeroVideo, shouldAnimateHero]);

  const transitionToNextHeroVideo = (videoIndex) => {
    if (!isMountedRef.current || !shouldAnimateHero || isTransitioningRef.current) return;

    const nextVideoIndex = (videoIndex + 1) % heroVideos.length;
    const nextVideo = heroVideoRefs.current[nextVideoIndex];
    if (!nextVideo) return;

    isTransitioningRef.current = true;
    nextVideo.currentTime = 0;
    nextVideo.play().then(() => {
      if (!isMountedRef.current || !shouldAnimateHero) return;
      setActiveHeroVideo(nextVideoIndex);
      transitionTimeoutRef.current = setTimeout(() => {
        const currentVideo = heroVideoRefs.current[videoIndex];
        currentVideo?.pause();
        isTransitioningRef.current = false;
      }, 500);
    }).catch(() => {
      isTransitioningRef.current = false;
    });
  };

  return (
    <PageTransition>
      <div className="app-shell">
      <section className="hero-section relative min-h-[calc(100vh-4.5rem)] overflow-hidden flex items-start">
        {heroVideos.map((videoSource, index) => (
          <video
            key={videoSource}
            ref={(videoElement) => {
              heroVideoRefs.current[index] = videoElement;
            }}
            className={`hero-video ${activeHeroVideo === index ? 'hero-video--active' : ''}`}
            autoPlay={shouldAnimateHero && index === 0}
            muted
            playsInline
            preload={index === activeHeroVideo || index === (activeHeroVideo + 1) % heroVideos.length ? 'auto' : 'none'}
            onTimeUpdate={(event) => {
              if (activeHeroVideo === index && event.currentTarget.duration - event.currentTarget.currentTime < 0.55) {
                transitionToNextHeroVideo(index);
              }
            }}
            onEnded={() => transitionToNextHeroVideo(index)}
            onError={() => {
              if (activeHeroVideo === index) transitionToNextHeroVideo(index);
            }}
            aria-hidden="true"
          >
            <source src={videoSource} type="video/mp4" />
          </video>
        ))}
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
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
              {featuredCars.map((car, idx) => (
                <AnimatedCard key={car._id} delay={idx * 0.1}>
                  <div className="mb-5 flex aspect-[16/10] items-center justify-center overflow-hidden rounded-[var(--radius-md)] bg-gradient-to-br from-slate-800 to-slate-950">
                    {car.imageUrl ? (
                      <img
                        src={car.imageUrl}
                        alt={`${car.brand} ${car.model}`}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <Wrench className="w-12 h-12 text-gray-600" />
                    )}
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-[#102b45]">
                    {car.brand} {car.model}
                  </h3>
                  <div className="mb-5 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Horsepower</p>
                      <p className="font-bold text-[#b66b2b]">{car.horsepower} HP</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Top Speed</p>
                      <p className="font-bold text-[#315f82]">{car.topSpeed} km/h</p>
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
