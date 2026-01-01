'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { FaCalendarAlt, FaUser, FaClock } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';
import { ChevronLeft } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/effect-coverflow';

const ArticleCard = ({ article, index, currentIndex, isActive = false }) => {
  const [imageError, setImageError] = useState(false);
  const DEFAULT_IMAGE = "/man.png";
  
  // Limit title to 5 words
  const titleWords = article.title.split(' ');
  const limitedTitle = titleWords.length > 5 
    ? titleWords.slice(0, 5).join(' ') + '...'
    : article.title;
  const limitedDesc = article.description || '';

  const isCenterCard = isActive;
  const isSideCard = false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1,
        y: 0,
        scale: isCenterCard ? 1 : 0.95
      }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`
        relative rounded-3xl bg-white transition-all duration-500 ease-out
        flex flex-col w-full max-w-[320px] mx-auto h-[320px] max-h-[320px] overflow-hidden
        group
        ${
          isCenterCard
            ? "scale-100 opacity-100 shadow-2xl shadow-[#579BE8]/20 z-10 ring-2 ring-[#579BE8]/30"
            : "scale-95 opacity-90 shadow-lg shadow-gray-200/50 z-0"
        }
        hover:shadow-2xl hover:shadow-[#579BE8]/30 hover:scale-[1.02] hover:ring-2 hover:ring-[#579BE8]/40
      `}
    >
      {/* Animated Gradient Border on Hover */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#579BE8]/10 via-[#315782]/10 to-[#579BE8]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-0 blur-2xl" />
      
      {/* Shimmer Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 3 }}
      />
      
      {/* Top Accent Line */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#579BE8] via-[#4a8dd8] to-[#315782] transition-opacity duration-300 ${
        isCenterCard ? "opacity-100" : "opacity-0"
      }`} />
      
       {/* Image */}
       <div className="relative w-full h-[150px] overflow-hidden flex-shrink-0">
        <Link href={`/articles/${article.slug || article.id}`} className="block w-full h-full relative">
          <Image
            src={imageError ? DEFAULT_IMAGE : (article.imageUrl || DEFAULT_IMAGE)}
            alt={limitedTitle}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            onError={() => setImageError(true)}
          />
          {/* Multi-layer Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className={`absolute inset-0 bg-gradient-to-br from-[#579BE8]/30 to-transparent transition-opacity duration-500 ${
            isCenterCard ? "opacity-30" : "opacity-0 group-hover:opacity-20"
          }`} />
          
          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#579BE8]/10 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </Link>
        
        {/* Category Badge */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="absolute top-4 right-4 z-20"
        >
          <span className={`px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-md transition-all duration-300 group-hover:shadow-lg ${
            article.category === "الصحة"
              ? "bg-gradient-to-r from-[#579BE8] to-[#4a8dd8]"
              : "bg-gradient-to-r from-[#315782] to-[#579BE8]"
          }`}>
            {article.category}
          </span>
        </motion.div>

        {/* Reading Time Badge */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute bottom-4 left-4 z-20"
        >
          <div className="px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 shadow-lg group-hover:bg-black/80 transition-all duration-300">
            <FaClock className="text-[10px]" />
            <span>{article.readTime}</span>
          </div>
        </motion.div>
      </div>

       {/* Content */}
       <div className="p-4 flex-1 flex flex-col relative z-10 bg-white">
          {/* Title - One row only with hidden overflow */}
          <Link href={`/articles/${article.slug || article.id}`} className="block mb-2 group/title">
            <h3 
              className={`font-cairo font-black text-xs md:text-base leading-tight transition-all duration-500 overflow-hidden text-ellipsis whitespace-nowrap ${
                isCenterCard 
                  ? "text-gray-900 group-hover/title:text-transparent group-hover/title:bg-clip-text group-hover/title:bg-gradient-to-r group-hover/title:from-[#579BE8] group-hover/title:to-[#315782]"
                  : "text-gray-700"
              }`}
              style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {limitedTitle}
            </h3>
          </Link>

         {/* Description - Fixed height with hidden overflow */}
         <p className="font-cairo font-normal text-base text-gray-600 mb-3 flex-1 leading-relaxed overflow-hidden text-ellipsis line-clamp-2 block" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', height: '2rem', maxHeight: '2rem' }}>
           {limitedDesc}
         </p>

         {/* Publisher and Date - Enhanced - Same Row */}
         <div className={`flex items-center justify-between gap-2 pt-2 border-t transition-colors duration-300 ${
           isCenterCard ? "border-gray-200" : "border-gray-100"
         }`}>
          <motion.div 
            className="flex items-center gap-2 text-xs text-gray-700"
            whileHover={{ x: -2, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className={`p-1.5 rounded-lg bg-gradient-to-br from-[#579BE8]/10 to-[#315782]/10 transition-all duration-300 ${
              isCenterCard ? "group-hover:from-[#579BE8]/25 group-hover:to-[#315782]/25 shadow-sm" : "group-hover:from-[#579BE8]/15 group-hover:to-[#315782]/15"
            }`}>
              <FaUser className="text-[#579BE8] text-xs" />
            </div>
            <span className="font-cairo font-bold">{article.publisher || article.author}</span>
          </motion.div>
          <motion.div 
            className="flex items-center gap-2 text-xs text-gray-700"
            whileHover={{ x: 2, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className={`p-1.5 rounded-lg bg-gradient-to-br from-[#579BE8]/10 to-[#315782]/10 transition-all duration-300 ${
              isCenterCard ? "group-hover:from-[#579BE8]/25 group-hover:to-[#315782]/25 shadow-sm" : "group-hover:from-[#579BE8]/15 group-hover:to-[#315782]/15"
            }`}>
              <FaCalendarAlt className="text-[#579BE8] text-xs" />
            </div>
            <span className="font-cairo font-bold">{article.date}</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default function RelatedArticlesSection({ articles = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const swiperRef = useRef(null);

  // Limit articles to 8 for carousel
  const relatedArticles = articles.slice(0, 8);

  if (!relatedArticles || relatedArticles.length === 0) {
    return null;
  }

  return (
    <div className="mb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <h3 className="text-3xl md:text-4xl font-black text-gray-900 font-cairo mb-2 text-center">
          مقالات ذات صلة
        </h3>
        <div className="w-24 h-1 bg-gradient-to-r from-[#579BE8] to-[#315782] rounded-full mx-auto"></div>
      </motion.div>

      <div className="relative mx-auto mx-4 sm:mx-0">
        <div className="relative px-4 sm:px-6 md:px-8 lg:px-12">
          <Swiper
            ref={swiperRef}
            modules={[Navigation, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 24,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 24,
              },
              1280: {
                slidesPerView: 4,
                spaceBetween: 24,
              },
            }}
            loop={true}
            centeredSlides={true}
            initialSlide={2}
            onSlideChange={(swiper) => setCurrentIndex(swiper.realIndex)}
            navigation={{
              nextEl: '.swiper-button-next-custom',
              prevEl: '.swiper-button-prev-custom',
            }}
             className="!pb-8 min-h-[350px]"
            dir="rtl"
          >
            {relatedArticles.map((article, index) => (
              <SwiperSlide key={article.id}>
                <div className="flex justify-center">
                  <ArticleCard 
                    article={article} 
                    index={index} 
                    currentIndex={currentIndex}
                    isActive={currentIndex === index}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Buttons */}
          <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none z-20 hidden sm:flex">
            <button
              className="swiper-button-next-custom pointer-events-auto absolute right-0 sm:right-2 md:right-4 transform translate-x-1/2 sm:translate-x-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white hover:bg-[#579BE8] text-[#579BE8] hover:text-white transition-all duration-300 hover:scale-110 shadow-lg flex items-center justify-center border-0 cursor-pointer"
              aria-label="الكارت التالي"
            >
              <IoIosArrowForward className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <button
              className="swiper-button-prev-custom pointer-events-auto absolute left-0 sm:left-2 md:left-4 transform -translate-x-1/2 sm:translate-x-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white hover:bg-[#579BE8] text-[#579BE8] hover:text-white transition-all duration-300 hover:scale-110 shadow-lg flex items-center justify-center border-0 cursor-pointer"
              aria-label="الكارت السابق"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

         {/* Progress Indicator */}
         <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.5 }}
           className="flex justify-center items-center mt-3 gap-2"
         >
          {relatedArticles.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => {
                if (swiperRef.current?.swiper) {
                  swiperRef.current.swiper.slideToLoop(index);
                }
              }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className={`
                h-2 rounded-full transition-all duration-300 cursor-pointer
                ${currentIndex === index 
                  ? "bg-gradient-to-r from-[#579BE8] to-[#315782] w-8 sm:w-10 shadow-md shadow-[#579BE8]/30" 
                  : "bg-gray-300 w-2 hover:bg-gray-400"
                }
              `}
              aria-label={`انتقل إلى البطاقة ${index + 1}`}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

