'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { FaFire, FaClock, FaUser, FaCalendarAlt } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';
import { ChevronLeft } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const DEFAULT_IMAGE = "/man.png";

// Transform API article to component format
const transformArticle = (apiArticle) => {
  return {
    id: apiArticle.id,
    imageUrl: apiArticle.featured_image || DEFAULT_IMAGE,
    category: apiArticle.category?.name || "عام",
    title: apiArticle.title,
    description: apiArticle.excerpt || apiArticle.summary || "",
    author: apiArticle.author?.name || "غير معروف",
    date: apiArticle.published_at_human || apiArticle.created_at_human || "",
    readTime: `${apiArticle.reading_time || 5} دقائق`,
    views: apiArticle.views_count || 0,
    slug: apiArticle.slug
  };
};

const ArticleCard = ({ article, isActive = false }) => {
  const [imageError, setImageError] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1,
        y: 0,
        scale: isActive ? 1 : 0.95
      }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`
        relative rounded-3xl bg-white transition-all duration-500 ease-out
        flex flex-col w-full max-w-[350px] mx-auto h-[400px] overflow-hidden
        group
        ${
          isActive
            ? "scale-100 opacity-100 shadow-2xl shadow-[#579BE8]/20 z-10 ring-2 ring-[#579BE8]/30"
            : "scale-95 opacity-90 shadow-lg shadow-gray-200/50 z-0"
        }
        hover:shadow-2xl hover:shadow-[#579BE8]/30 hover:scale-[1.02] hover:ring-2 hover:ring-[#579BE8]/40
      `}
    >
      {/* Animated Gradient Border */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#579BE8]/10 via-[#315782]/10 to-[#579BE8]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-0 blur-2xl" />
      
      {/* Top Accent Line */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#579BE8] via-[#4a8dd8] to-[#315782] transition-opacity duration-300 ${
        isActive ? "opacity-100" : "opacity-0"
      }`} />
      
      {/* Image */}
      <div className="relative w-full h-[200px] overflow-hidden flex-shrink-0">
        <Link href={`/articles/${article.slug || article.id}`} className="block w-full h-full relative">
          <Image
            src={imageError ? DEFAULT_IMAGE : (article.imageUrl || DEFAULT_IMAGE)}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className={`absolute inset-0 bg-gradient-to-br from-[#579BE8]/30 to-transparent transition-opacity duration-500 ${
            isActive ? "opacity-30" : "opacity-0 group-hover:opacity-20"
          }`} />
        </Link>
        
        {/* Category Badge */}
        <div className="absolute top-4 right-4 z-20">
          <span className="px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-md bg-gradient-to-r from-[#579BE8] to-[#4a8dd8]">
            {article.category}
          </span>
        </div>
        
        {/* Featured Badge */}
        <div className="absolute top-4 left-4 z-20">
          <span className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-md bg-gradient-to-r from-orange-500 to-red-500 flex items-center gap-1">
            <FaFire className="text-xs" />
            مميز
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <Link href={`/articles/${article.slug || article.id}`} className="block mb-2 group/title">
          <h3 className="font-black text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-[#579BE8] transition-colors leading-tight min-h-[56px]">
            {article.title}
          </h3>
        </Link>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed flex-1">
          {article.description}
        </p>
        
        {/* Meta Info */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
          <div className="flex items-center gap-3 text-xs text-gray-700">
            <div className="flex items-center gap-1.5">
              <FaUser className="text-xs" />
              <span className="truncate max-w-[80px]">{article.author}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FaClock className="text-xs" />
              <span>{article.readTime}</span>
            </div>
          </div>
          <Link 
            href={`/articles/${article.slug || article.id}`}
            className="text-[#579BE8] hover:text-[#315782] transition-colors"
          >
            <IoIosArrowForward className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default function ArticlesSlider() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const swiperRef = useRef(null);

  useEffect(() => {
    const fetchFeaturedArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/articles/featured');
        const data = await response.json();
        
        if (response.ok && data.success && data.data) {
          const transformedArticles = data.data.map(transformArticle);
          setArticles(transformedArticles);
          console.log('Featured articles fetched:', transformedArticles.length);
        } else {
          throw new Error(data.message || 'Failed to fetch featured articles');
        }
      } catch (err) {
        console.error('Error fetching featured articles:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedArticles();
  }, []);

  if (loading) {
    return (
      <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#579BE8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل المقالات المميزة...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || articles.length === 0) {
    return null; // Don't show slider if no articles
  }

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaFire className="text-3xl text-orange-500" />
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 font-cairo">
              المقالات المميزة
            </h2>
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-[#579BE8] to-[#315782] rounded-full mx-auto"></div>
        </motion.div>

        <div className="relative mx-4 sm:mx-0">
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
              loop={articles.length > 3}
              centeredSlides={true}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              onSlideChange={(swiper) => setCurrentIndex(swiper.realIndex)}
              navigation={{
                nextEl: '.swiper-button-next-featured',
                prevEl: '.swiper-button-prev-featured',
              }}
              className="!pb-8 min-h-[450px]"
              dir="rtl"
            >
              {articles.map((article, index) => (
                <SwiperSlide key={article.id}>
                  <div className="flex justify-center">
                    <ArticleCard 
                      article={article} 
                      isActive={currentIndex === index}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Custom Navigation Buttons */}
            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none z-20 hidden sm:flex">
              <button
                className="swiper-button-next-featured pointer-events-auto absolute right-0 sm:right-2 md:right-4 transform translate-x-1/2 sm:translate-x-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white hover:bg-[#579BE8] text-[#579BE8] hover:text-white transition-all duration-300 hover:scale-110 shadow-lg flex items-center justify-center border-0 cursor-pointer"
                aria-label="المقال التالي"
              >
                <IoIosArrowForward className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <button
                className="swiper-button-prev-featured pointer-events-auto absolute left-0 sm:left-2 md:left-4 transform -translate-x-1/2 sm:translate-x-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white hover:bg-[#579BE8] text-[#579BE8] hover:text-white transition-all duration-300 hover:scale-110 shadow-lg flex items-center justify-center border-0 cursor-pointer"
                aria-label="المقال السابق"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>

          {/* Progress Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center items-center mt-6 gap-2"
          >
            {articles.map((_, index) => (
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
                aria-label={`انتقل إلى المقال ${index + 1}`}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
