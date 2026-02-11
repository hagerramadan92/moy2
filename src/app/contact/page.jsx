'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ContactFormSection from '@/components/molecules/Contacts/ContactFormSection';
import ContactHero from '@/components/molecules/Contacts/ContactHero';
import VisionMissionSection from '@/components/molecules/Contacts/VisionMissionSection';
import SpecialOffersSection from '@/components/molecules/Contacts/SpecialOffersSection';
import Footer from '@/components/molecules/common/Footer';
import ChatApp, { Conversation } from '@/components/ui/messages/Message';

const ContactPage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Skeleton Components
  const ContactHeroSkeleton = () => (
    <section className="relative py-14 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-gray-50 via-white to-gray-50 overflow-hidden">
      <div className="px-3 mx-auto max-w-7xl sm:px-6 lg:px-8 relative z-10">
        {/* Header Skeleton */}
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          <div className="inline-block mb-2 md:mb-3">
            <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mx-auto"></div>
          </div>
          <div className="h-7 sm:h-8 md:h-9 lg:h-10 w-3/4 sm:w-2/3 md:w-1/2 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse mx-auto mb-2 md:mb-3"></div>
          <div className="h-1 w-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
          <div className="h-4 sm:h-5 w-5/6 md:w-2/3 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse mx-auto mt-4"></div>
        </div>

        {/* Features Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-12 gap-x-6 lg:gap-6 pt-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="group relative bg-white rounded-2xl px-5 sm:px-6 md:px-7 pt-12 sm:pt-14 pb-6 sm:pb-8 text-center w-full border border-gray-100 shadow-sm">
              {/* Icon Skeleton */}
              <div className="absolute -top-8 sm:-top-10 left-1/2 -translate-x-1/2 w-16 h-16 sm:w-20 sm:h-20 md:w-20 md:h-20 bg-gray-200 dark:bg-gray-700 rounded-xl sm:rounded-2xl animate-pulse"></div>
              
              {/* Title Skeleton */}
              <div className="h-6 sm:h-7 md:h-8 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mx-auto mt-6 mb-3"></div>
              
              {/* Description Skeleton */}
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const VisionMissionSkeleton = () => (
    <section className="relative w-full py-10 md:py-12 bg-gradient-to-b from-white via-gray-50/50 to-white overflow-hidden">
      <div className="px-3 mx-auto max-w-7xl relative z-10">
        {/* Header Skeleton */}
        <div className="text-center mb-8 md:mb-10">
          <div className="inline-block mb-3 md:mb-4">
            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mx-auto"></div>
          </div>
          <div className="h-8 sm:h-10 md:h-12 lg:h-14 w-2/3 md:w-1/2 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse mx-auto mb-3 md:mb-4"></div>
          <div className="h-1 w-20 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-5"></div>
          <div className="space-y-2 max-w-3xl mx-auto">
            <div className="h-5 w-full bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
            <div className="h-5 w-5/6 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse mx-auto"></div>
          </div>
        </div>

        {/* Vision Items Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 max-w-6xl mx-auto">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="relative h-full bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-200">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              
              <div className="relative z-10 flex items-center gap-3 md:gap-4">
                {/* Icon Skeleton */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                </div>
                
                {/* Content Skeleton */}
                <div className="flex-1 flex flex-col gap-2 md:gap-3 border-r-2 border-gray-200 pr-3 md:pr-4">
                  <div className="h-6 md:h-7 lg:h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                  <div className="h-4 md:h-5 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 md:h-5 w-5/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const ContactFormSkeleton = () => (
    <section className="relative w-full py-10 md:py-12 lg:py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="px-4 mx-auto max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Side - Info Skeleton */}
          <div className="space-y-6">
            <div className="h-8 sm:h-10 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex-shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                    <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Form Skeleton */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg border border-gray-100">
            <div className="h-7 sm:h-8 w-2/3 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse mb-6"></div>
            
            <div className="space-y-4 sm:space-y-5">
              {/* Name Input Skeleton */}
              <div className="space-y-2">
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-12 sm:h-14 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
              </div>

              {/* Phone Input Skeleton */}
              <div className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-12 sm:h-14 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
              </div>

              {/* Subject Input Skeleton */}
              <div className="space-y-2">
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-12 sm:h-14 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
              </div>

              {/* Message Textarea Skeleton */}
              <div className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-32 sm:h-36 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
              </div>

              {/* Submit Button Skeleton */}
              <div className="h-12 sm:h-14 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse mt-6"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const SpecialOffersSkeleton = () => (
    <section className="relative w-full py-8 md:py-10 bg-gradient-to-b from-gray-50 to-white">
      <div className="px-4 mx-auto max-w-6xl relative z-10">
        {/* Header Skeleton */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-block mb-2">
            <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mx-auto"></div>
          </div>
          <div className="h-7 md:h-8 w-40 md:w-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse mx-auto mb-1.5"></div>
          <div className="h-0.5 w-12 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto"></div>
        </div>

        {/* Offers Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="relative bg-white rounded-lg p-4 md:p-5 h-full flex flex-col border border-gray-100 shadow-sm">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              
              <div className="flex flex-col items-center text-center space-y-3 flex-1">
                {/* Icon Skeleton */}
                <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                
                {/* Content Skeleton */}
                <div className="flex-1 flex flex-col justify-center w-full space-y-2">
                  <div className="h-5 md:h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mx-auto"></div>
                  <div className="h-6 md:h-7 w-2/3 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mx-auto"></div>
                  <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto"></div>
                  {i === 3 && (
                    <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mx-auto mt-2"></div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  if (loading) {
    return (
      <main className="relative min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-white overflow-hidden">
        {/* Background - same as original */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute inset-0">
            <div 
              className="absolute top-0 left-0 w-full h-full opacity-30"
              style={{
                background: `
                  radial-gradient(circle at 20% 30%, rgba(87, 155, 232, 0.15) 0%, transparent 50%),
                  radial-gradient(circle at 80% 70%, rgba(107, 168, 240, 0.15) 0%, transparent 50%),
                  radial-gradient(circle at 50% 50%, rgba(87, 155, 232, 0.1) 0%, transparent 50%)
                `
              }}
            />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="relative z-10">
          <ContactHeroSkeleton />
          <VisionMissionSkeleton />
          <ContactFormSkeleton />
          <SpecialOffersSkeleton />
          <Footer />
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-white overflow-hidden">
      {/* Creative Animated Background - Modern Design */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Mesh Gradient Background */}
        <div className="absolute inset-0">
          <div 
            className="absolute top-0 left-0 w-full h-full opacity-30"
            style={{
              background: `
                radial-gradient(circle at 20% 30%, rgba(87, 155, 232, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(107, 168, 240, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 50% 50%, rgba(87, 155, 232, 0.1) 0%, transparent 50%)
              `
            }}
          />
        </div>

        {/* Animated Geometric Shapes */}
        {[...Array(8)].map((_, i) => {
          const size = 100 + i * 30;
          const positions = [
            { top: '10%', left: '15%' },
            { top: '20%', right: '20%' },
            { top: '60%', left: '10%' },
            { bottom: '15%', right: '15%' },
            { bottom: '25%', left: '25%' },
            { top: '40%', right: '30%' },
            { bottom: '40%', left: '40%' },
            { top: '70%', right: '10%' },
          ];
          const pos = positions[i];
          
          return (
            <motion.div
              key={i}
              className="absolute"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                ...pos,
                background: `linear-gradient(135deg, rgba(87, 155, 232, 0.1), rgba(107, 168, 240, 0.05))`,
                borderRadius: i % 3 === 0 ? '50%' : i % 3 === 1 ? '30%' : '0%',
                transform: `rotate(${i * 45}deg)`,
                filter: 'blur(40px)'
              }}
              animate={{
                rotate: [i * 45, i * 45 + 360],
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 15 + i * 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          );
        })}

        {/* Flowing Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <defs>
            <linearGradient id="lineGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#579BE8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6BA8F0" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="lineGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6BA8F0" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#579BE8" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          
          {[...Array(5)].map((_, i) => (
            <motion.path
              key={i}
              d={`M ${i * 250} ${100 + i * 150} Q ${300 + i * 200} ${200 + i * 100} ${500 + i * 300} ${150 + i * 200}`}
              stroke={`url(#lineGradient${i % 2 + 1})`}
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: [0, 1, 0],
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.8
              }}
            />
          ))}
        </svg>

        {/* Animated Circles with Rings */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`circle-${i}`}
            className="absolute rounded-full border-2"
            style={{
              width: `${150 + i * 80}px`,
              height: `${150 + i * 80}px`,
              borderColor: `rgba(87, 155, 232, ${0.2 - i * 0.03})`,
              top: `${15 + i * 18}%`,
              left: `${10 + i * 15}%`,
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.1, 0.3, 0.1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5
            }}
          />
        ))}

        {/* Diagonal Stripes Pattern */}
        <motion.div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              #579BE8 10px,
              #579BE8 11px
            ),
            repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 10px,
              #6BA8F0 10px,
              #6BA8F0 11px
            )`
          }}
          animate={{
            x: [0, 20, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        {/* Floating Gradient Blobs */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={`blob-${i}`}
            className="absolute rounded-full"
            style={{
              width: `${200 + i * 100}px`,
              height: `${200 + i * 100}px`,
              background: `radial-gradient(circle, rgba(87, 155, 232, 0.15), rgba(107, 168, 240, 0.05))`,
              filter: 'blur(60px)',
              top: `${20 + i * 25}%`,
              left: `${5 + i * 20}%`,
            }}
            animate={{
              x: [0, 100, -50, 0],
              y: [0, -80, 60, 0],
              scale: [1, 1.4, 0.8, 1],
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Hexagon Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="hexagons" width="100" height="87.4" patternUnits="userSpaceOnUse">
                <polygon
                  points="50,0 93.3,25 93.3,75 50,100 6.7,75 6.7,25"
                  fill="none"
                  stroke="#579BE8"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hexagons)" />
          </svg>
        </div>

        {/* Animated Spotlight Effect */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-[800px] h-[800px] rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(87, 155, 232, 0.08), transparent 70%)`,
            transform: 'translate(-50%, -50%)',
            filter: 'blur(80px)'
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.2, 0.1],
            x: ['-50%', '-45%', '-50%'],
            y: ['-50%', '-55%', '-50%'],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* <ContactHero /> */}
        <VisionMissionSection/>
        <ContactFormSection />
        {/* <SpecialOffersSection/> */}
        <Footer />
          
     
      {/* <ChatApp /> */}
 
 
        
      </div>
    </main>
  );
};

export default ContactPage;