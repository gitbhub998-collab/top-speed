import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react';

export const Header = ({ title, subtitle }) => {
  return (
    <div className="bg-[#101e2d] border-b border-white/10 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col items-start gap-2 mb-2 sm:flex-row sm:items-center sm:gap-4">
          <h1 className="display-heading text-3xl sm:text-5xl font-normal text-white">{title}</h1>
          <p className="text-slate-400 text-sm font-semibold">
            Premium Cars. Precision Service. Unmatched Excellence.
          </p>
        </div>
        {subtitle && <p className="text-slate-400 text-lg">{subtitle}</p>}
      </div>
    </div>
  );
};

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-20 overflow-hidden border-t border-white/10 bg-[#07111d]">
      <style>{`
        @keyframes phoneFlash {
          0%, 100% { color: #dc2626; }
          50% { color: #991b1b; }
        }
        .phone-flash {
          animation: phoneFlash 1.5s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .phone-flash {
            animation: none;
          }
        }
      `}</style>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(239,155,74,0.12),transparent_28%),radial-gradient(circle_at_85%_100%,rgba(110,159,196,0.12),transparent_34%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-[1.15fr_1fr_0.85fr] md:gap-10 lg:gap-16">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-8 w-1 bg-orange-400" aria-hidden="true" />
              <h3 className="text-2xl font-bold tracking-[0.18em] text-white">TOP SPEED</h3>
            </div>
            <p className="max-w-xs text-sm leading-7 text-slate-400">
              Premium automotive experiences, from discovery to precision service.
            </p>
            <Link
              to="/cars"
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-orange-300 transition hover:text-orange-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-4 focus-visible:ring-offset-[#07111d]"
            >
              Explore our collection
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div>
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.25em] text-orange-300">Visit TOP SPEED</p>
            <div className="space-y-5">
              <a href="tel:+201022861438" className="group flex items-start gap-3 text-slate-300 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300">
                <Phone className="phone-flash mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <span>
                  <span className="block text-xs uppercase tracking-wider text-slate-400">Call the manager</span>
                  <span className="mt-1 block font-medium">+20 102 286 1438</span>
                </span>
              </a>
              <a href="mailto:topspeed@gmail.com" className="group flex items-start gap-3 text-slate-300 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-slate-400 transition group-hover:text-orange-300" aria-hidden="true" />
                <span>
                  <span className="block text-xs uppercase tracking-wider text-slate-400">Email us</span>
                  <span className="mt-1 block font-medium">topspeed@gmail.com</span>
                </span>
              </a>
              <div className="flex items-start gap-3 text-slate-300">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-red-500" aria-hidden="true" />
                <span>
                  <span className="block text-xs uppercase tracking-wider text-slate-400">Our showroom</span>
                  <span className="mt-1 block leading-6">6th of October, 26th of July Road<br />In front of Al-Dahan</span>
                </span>
              </div>
            </div>
          </div>

          <div className="md:text-right">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.25em] text-orange-300">Follow the drive</p>
            <p className="max-w-xs text-sm leading-7 text-slate-300 md:ml-auto">
              Stay close to new arrivals, special offers, and the latest from our showroom.
            </p>
            <div className="mt-7 flex gap-3 md:justify-end">
              <a
                href="https://www.facebook.com/share/1HeY8i6fna/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-slate-400 transition hover:border-blue-400 hover:bg-blue-500/10 hover:text-blue-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/bilalmohamed623?stkn=bHRobXI4M2Y3djU0"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-slate-400 transition hover:border-pink-400 hover:bg-pink-500/10 hover:text-pink-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-slate-400">© {currentYear} TOP SPEED. All rights reserved.</p>
          <p className="text-slate-400">Built by Bilal Mohamed</p>
        </div>
      </div>
    </footer>
  );
};
