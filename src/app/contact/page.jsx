'use client';

import React from 'react';
import { motion } from 'framer-motion';
import ContactFormSection from '@/components/molecules/Contacts/ContactFormSection';
import ContactHero from '@/components/molecules/Contacts/ContactHero';
import VisionMissionSection from '@/components/molecules/Contacts/VisionMissionSection';
import SpecialOffersSection from '@/components/molecules/Contacts/SpecialOffersSection';
import Footer from '@/components/molecules/common/Footer';

const ContactPage = () => {
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
        <ContactHero />
        <VisionMissionSection/>
        <ContactFormSection />
        <SpecialOffersSection/>
        <Footer />
      </div>
    </main>
  );
};

export default ContactPage;