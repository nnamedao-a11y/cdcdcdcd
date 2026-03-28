/**
 * Public Header Component
 * 
 * Навігація для публічного сайту з підтримкою мов
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MagnifyingGlass, Car, House, Calculator, User, List, X, Globe } from '@phosphor-icons/react';
import { useLang } from '../../i18n';

const PublicHeader = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { lang, setLang, t } = useLang();

  const navItems = [
    { path: '/', label: t('home'), icon: House },
    { path: '/cars', label: t('cars'), icon: Car },
    { path: '/vin-check', label: t('vinCheck'), icon: MagnifyingGlass },
    { path: '/calculator', label: t('calculator'), icon: Calculator },
  ];

  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-zinc-900" data-testid="logo">
            BIBI Cars
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                (item.path === '/cars' && location.pathname.startsWith('/cars'));
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    isActive 
                      ? 'text-zinc-900' 
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                  data-testid={`nav-${item.path.replace('/', '') || 'home'}`}
                >
                  <Icon size={18} weight={isActive ? 'fill' : 'regular'} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="hidden md:flex items-center gap-1 text-sm" data-testid="lang-switcher">
              <Globe size={16} className="text-zinc-400" />
              <button
                onClick={() => setLang('bg')}
                className={`px-2 py-1 rounded ${lang === 'bg' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-900'}`}
              >
                BG
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-1 rounded ${lang === 'en' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-900'}`}
              >
                EN
              </button>
            </div>

            <Link
              to="/cabinet"
              className="hidden md:flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
              data-testid="cabinet-link"
            >
              <User size={18} />
              {t('cabinet')}
            </Link>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-zinc-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-btn"
            >
              {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-100 py-4">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                      isActive ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-600'
                    }`}
                  >
                    <Icon size={20} />
                    {item.label}
                  </Link>
                );
              })}
              
              {/* Mobile Language Switcher */}
              <div className="flex items-center gap-2 px-4 py-2">
                <Globe size={18} className="text-zinc-400" />
                <button
                  onClick={() => setLang('bg')}
                  className={`px-3 py-1.5 rounded ${lang === 'bg' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600'}`}
                >
                  BG
                </button>
                <button
                  onClick={() => setLang('en')}
                  className={`px-3 py-1.5 rounded ${lang === 'en' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600'}`}
                >
                  EN
                </button>
              </div>
              
              <Link
                to="/cabinet"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 bg-zinc-900 text-white rounded-lg mt-2"
              >
                <User size={20} />
                {t('cabinet')}
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default PublicHeader;
