"use client";

import Link from 'next/link';
import { useState } from 'react';

export default function HeroSection() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative w-full h-[90vh] overflow-hidden bg-gradient-to-r from-orange-200 via-green-200 to-blue-200">

      {/* NAVBAR */}
      <nav className="absolute top-0 left-0 w-full flex justify-between items-center px-6 md:px-10 py-6 z-20">
        {/* LOGO */}
        <Link href="/">
          <h1 className="text-3xl font-extrabold text-orange-600 cursor-pointer hover:text-orange-700 transition">
            create
          </h1>
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex gap-8 font-semibold text-gray-800">
          <Link href="#new" className="hover:text-orange-600 transition">
            NEW
          </Link>
          <Link href="#core-gummies" className="hover:text-orange-600 transition">
            CORE GUMMIES
          </Link>
          <Link href="#bundle" className="hover:text-orange-600 transition">
            BUNDLE & SAVE
          </Link>
          <Link href="#quality" className="hover:text-orange-600 transition">
            QUALITY
          </Link>
        </div>

        {/* DESKTOP CTA */}
        <Link href="/products">
          <button className="hidden md:block bg-orange-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:bg-orange-600 hover:scale-105 transition-all">
            SHOP NOW
          </button>
        </Link>

        {/* MOBILE MENU BUTTON */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-gray-800 focus:outline-none"
        >
          {mobileMenuOpen ? (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="absolute top-20 left-0 w-full bg-white/95 backdrop-blur-md z-30 py-6 px-6 shadow-xl md:hidden">
          <div className="flex flex-col gap-4 font-semibold text-gray-800">
            <Link 
              href="#new" 
              className="hover:text-orange-600 transition py-2 border-b border-gray-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              NEW
            </Link>
            <Link 
              href="#core-gummies" 
              className="hover:text-orange-600 transition py-2 border-b border-gray-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              CORE GUMMIES
            </Link>
            <Link 
              href="#bundle" 
              className="hover:text-orange-600 transition py-2 border-b border-gray-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              BUNDLE & SAVE
            </Link>
            <Link 
              href="#quality" 
              className="hover:text-orange-600 transition py-2 border-b border-gray-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              QUALITY
            </Link>
            <Link href="/products">
              <button 
                className="w-full bg-orange-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:bg-orange-600 transition mt-4"
                onClick={() => setMobileMenuOpen(false)}
              >
                SHOP NOW
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* HERO CONTENT */}
      <div className="relative z-10 flex flex-col md:flex-row h-full items-center justify-between px-6 md:px-12 lg:px-24 pt-20 md:pt-0">

        {/* LEFT TEXT */}
        <div className="max-w-xl space-y-4 md:space-y-6 text-center md:text-left">
          <p className="text-orange-700 font-bold tracking-wide uppercase text-sm md:text-base">
            🎉 New Limited 2026 Bundle
          </p>

          <h2 className="text-4xl md:text-5xl lg:text-7xl font-black leading-tight text-gray-900">
            Because Results <br /> 
            Start With <br /> 
            Consistency.
          </h2>

          <p className="text-gray-700 text-base md:text-lg leading-relaxed">
            Building a habit is hard. We make it easier — and tastier.
            Shop the <span className="font-bold text-orange-600">Routine Building Bundle</span>:
            3 best-selling flavors, every 3 months.
          </p>

          <div className="flex gap-4 justify-center md:justify-start">
            <Link href="/products">
              <button className="bg-orange-500 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-black text-base md:text-lg shadow-xl hover:bg-orange-600 hover:scale-105 transition-all">
                SHOP NOW
              </button>
            </Link>
            <Link href="#learn-more">
              <button className="bg-white/80 backdrop-blur text-gray-800 px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg shadow-xl hover:bg-white transition-all">
                Learn More
              </button>
            </Link>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="flex gap-4 md:gap-6 items-center mt-8 md:mt-0">
          <img
            src="/orange.png"
            alt="Orange gummy bottle"
            className="w-32 md:w-48 lg:w-60 rotate-[-10deg] drop-shadow-2xl hover:rotate-[-5deg] hover:scale-110 transition-all duration-300 cursor-pointer"
          />

          <img
            src="/green.png"
            alt="Green gummy bottle"
            className="w-32 md:w-48 lg:w-60 rotate-[5deg] drop-shadow-2xl hover:rotate-[10deg] hover:scale-110 transition-all duration-300 cursor-pointer"
          />
        </div>
      </div>

      {/* SCROLL INDICATOR */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 animate-bounce hidden md:block">
        <svg 
          className="w-6 h-6 text-gray-700" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 14l-7 7m0 0l-7-7m7 7V3" 
          />
        </svg>
      </div>

      {/* FLOATING BADGES */}
      <div className="absolute top-1/2 left-8 transform -translate-y-1/2 space-y-4 hidden lg:block">
        <div className="bg-white/90 backdrop-blur px-4 py-3 rounded-full shadow-xl">
          <p className="text-xs font-bold text-gray-800">⭐ 5000+ Happy Customers</p>
        </div>
        <div className="bg-white/90 backdrop-blur px-4 py-3 rounded-full shadow-xl">
          <p className="text-xs font-bold text-gray-800">🌿 100% Natural Ingredients</p>
        </div>
        <div className="bg-white/90 backdrop-blur px-4 py-3 rounded-full shadow-xl">
          <p className="text-xs font-bold text-gray-800">🚚 Free Shipping</p>
        </div>
      </div>
    </div>
  );
}
