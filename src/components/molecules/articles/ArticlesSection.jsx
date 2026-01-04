'use client';

import { useState, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { FaBook, FaNewspaper, FaHeartbeat, FaClock, FaUser, FaCalendarAlt, FaArrowRight, FaFire, FaChartLine, FaSearch, FaTimes } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';
import { ChevronLeft } from 'lucide-react';
import { IoDocumentTextOutline } from 'react-icons/io5';
import { MdArticle } from 'react-icons/md';

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
    likes: apiArticle.likes_count || 0,
    comments: apiArticle.comments_count || 0,
    featured: apiArticle.is_featured || false,
    trending: apiArticle.views_count > 100 || false,
    slug: apiArticle.slug
  };
};

const ARTICLES_DATA = [
  {
    id: 1,
    imageUrl: "/man.png",
    category: "الصحة",
    title: "فوائد شرب الماء للجسم والصحة العامة",
    description: "تعرف على أهمية شرب الماء يومياً وكيف يؤثر على صحتك ونشاطك اليومي. اكتشف النصائح الطبية المهمة للحفاظ على ترطيب الجسم.",
    author: "د. عماد حسن",
    date: "6 ديسمبر 2025",
    readTime: "5 دقائق",
    views: 1250,
    featured: true,
    trending: true
  },
  {
    id: 2,
    imageUrl: "/man.png",
    category: "الصحة",
    title: "كيفية الحفاظ على ترطيب الجسم في الصيف",
    description: "نصائح مهمة للحفاظ على مستوى الماء في الجسم خلال الأيام الحارة. تعلم كيفية تجنب الجفاف والحفاظ على صحتك.",
    author: "د. سارة أحمد",
    date: "5 ديسمبر 2025",
    readTime: "4 دقائق",
    views: 980,
    featured: false,
    trending: true
  },
  {
    id: 3,
    imageUrl: "/man.png",
    category: "اخبار",
    title: "تطورات جديدة في تقنيات تحلية المياه",
    description: "أحدث الابتكارات في مجال تحلية المياه وتأثيرها على البيئة. اكتشف كيف تتطور التكنولوجيا لخدمة البشرية.",
    author: "م. خالد محمد",
    date: "4 ديسمبر 2025",
    readTime: "6 دقائق",
    views: 2100,
    featured: true,
    trending: false
  },
  {
    id: 4,
    imageUrl: "/man.png",
    category: "اخبار",
    title: "مؤتمر المياه الدولي 2025",
    description: "أهم ما تم مناقشته في مؤتمر المياه الدولي لهذا العام. تعرف على القرارات والتوصيات المهمة.",
    author: "أحمد علي",
    date: "3 ديسمبر 2025",
    readTime: "7 دقائق",
    views: 1500,
    featured: false,
    trending: false
  },
  {
    id: 5,
    imageUrl: "/man.png",
    category: "الصحة",
    title: "أضرار قلة شرب الماء على الكلى",
    description: "كيف تؤثر قلة المياه على وظائف الكلى والصحة العامة. نصائح طبية مهمة للحفاظ على صحة الكلى.",
    author: "د. يوسف كمال",
    date: "2 ديسمبر 2025",
    readTime: "5 دقائق",
    views: 890,
    featured: false,
    trending: false
  },
  {
    id: 6,
    imageUrl: "/man.png",
    category: "اخبار",
    title: "مشروع جديد لتحسين شبكة المياه",
    description: "تفاصيل المشروع الجديد لتحسين جودة وتوزيع المياه في المدينة. تعرف على الفوائد المتوقعة.",
    author: "مريم سعيد",
    date: "1 ديسمبر 2025",
    readTime: "4 دقائق",
    views: 1100,
    featured: false,
    trending: false
  }
];

const CATEGORIES = [
  {
    id: 1,
    name: 'الكل',
    icon: FaBook,
    color: '#4B5563',
    bgColor: '#F3F4F6'
  },
  {
    id: 2,
    name: 'الصحة',
    icon: FaHeartbeat,
    color: '#579BE8',
    bgColor: '#EFF6FF'
  },
  {
    id: 3,
    name: 'اخبار',
    icon: FaNewspaper,
    color: '#EF4444',
    bgColor: '#FEF2F2'
  }
];

const CategoryButton = ({ category, isSelected, onClick }) => {
  const Icon = category.icon || FaBook;
  const selectedBgColor = '#579BE8'; // Unified color for all selected categories
  
  return (
    <motion.button
      onClick={() => onClick(category.name)}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className={`
        relative flex items-center gap-2 px-5 py-2.5 rounded-full
        font-cairo font-semibold text-sm transition-all duration-300
        ${isSelected 
          ? `text-white shadow-md` 
          : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
        }
      `}
      style={isSelected ? { backgroundColor: selectedBgColor } : {}}
    >
      {Icon && <Icon className="text-base" />}
      <span>{category.name}</span>
    </motion.button>
  );
};

const FeaturedArticle = ({ article }) => {
  const [imageError, setImageError] = useState(false);
  const defaultImage = "/man.png";
  
  if (!article) return null;
  
  const categoryData = CATEGORIES.find(cat => cat.name === article.category);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative group"
    >
      <Link href={`/articles/${article.slug}`} title={article.title}>
        <div className="relative h-[500px] md:h-[600px] rounded-3xl overflow-hidden shadow-2xl cursor-pointer">
          {/* Image with overlay */}
          <div className="absolute inset-0">
            <Image
              src={imageError ? defaultImage : (article.imageUrl || defaultImage)}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
          </div>
          
          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 text-white">
            {/* Category Badge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-4"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold backdrop-blur-md bg-white/20 border border-white/30 text-white">
                {article.trending && <FaFire className="text-orange-400" />}
                {article.category}
              </span>
            </motion.div>
            
            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-black mb-4 leading-tight group-hover:text-gray-200 transition-colors"
            >
              {article.title}
            </motion.h2>
            
            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-gray-200 mb-6 line-clamp-2"
            >
              {article.description}
            </motion.p>
            
            {/* Meta Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center gap-6 text-sm md:text-base"
            >
              <div className="flex items-center gap-2">
                <FaUser className="text-gray-300" />
                <span className="text-gray-200">{article.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-gray-300" />
                <span className="text-gray-200">{article.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaClock className="text-gray-300" />
                <span className="text-gray-200">{article.readTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaChartLine className="text-gray-300" />
                <span className="text-gray-200">{article.views.toLocaleString()} مشاهدة</span>
              </div>
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const ArticleCard = ({ article, variant = 'default' }) => {
  const [imageError, setImageError] = useState(false);
  const categoryData = CATEGORIES.find(cat => cat.name === article.category);
  
  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        className="group w-full"
      >
        <Link href={`/articles/${article.slug}`} title={article.title}>
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 w-full h-[140px]">
            <div className="flex gap-4 p-5 h-full">
              <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden">
                <Image
                  src={imageError ? DEFAULT_IMAGE : (article.imageUrl || DEFAULT_IMAGE)}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={() => setImageError(true)}
                />
              </div>
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <span 
                    className="text-xs font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-700"
                  >
                    {article.category}
                  </span>
                  {article.trending && (
                    <FaFire className="text-orange-500 text-xs" />
                  )}
                </div>
                <h3 className="font-bold text-sm text-gray-900 mb-2 line-clamp-2 group-hover:text-gray-600 transition-colors leading-tight h-[40px]">
                  {article.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-auto">
                  <span>{article.readTime}</span>
                  <span>•</span>
                  <span>{article.views.toLocaleString()} مشاهدة</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className="group w-full"
    >
      <Link href={`/articles/${article.slug}`} title={article.title}>
        <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col w-full h-[480px]">
          {/* Image */}
          <div className="relative h-[200px] w-full overflow-hidden flex-shrink-0">
            <Image
              src={imageError ? DEFAULT_IMAGE : (article.imageUrl || DEFAULT_IMAGE)}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Category Badge */}
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-white/90 backdrop-blur-sm text-gray-700 border border-gray-200">
                {article.trending && <FaFire className="text-orange-500" />}
                {article.category}
              </span>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-5 flex-1 flex flex-col">
            <h3 className="font-black text-lg text-gray-900 mb-3 line-clamp-2 group-hover:text-gray-600 transition-colors leading-tight h-[56px]">
              {article.title}
            </h3>
            <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed h-[60px]">
              {article.description}
            </p>
            
            {/* Meta Info */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <FaUser className="text-xs" />
                  <span className="truncate max-w-[80px]">{article.author}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FaClock className="text-xs" />
                  <span>{article.readTime}</span>
                </div>
              </div>
              <FaArrowRight className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const ArticlesHeader = ({ selectedCategory, onCategorySelect, apiCategories = [], articleCategories = [], searchQuery, onSearchChange, onSearchClear }) => {
  const [showAllCategories, setShowAllCategories] = useState(false);
  
  // Start with "جميع المقالات" category
  const allCategories = [{
    id: 0,
    name: 'جميع المقالات',
    icon: FaBook,
    color: '#4B5563',
    bgColor: '#F3F4F6'
  }];
  
  // Track used names to avoid duplicates
  const usedNames = new Set(['جميع المقالات']);
  
  // Add API categories if available
  if (apiCategories.length > 0) {
    apiCategories.forEach(cat => {
      if (!usedNames.has(cat.name)) {
        allCategories.push(cat);
        usedNames.add(cat.name);
      }
    });
  } else {
    // Fallback to static categories (excluding "الكل")
    CATEGORIES.slice(1).forEach(cat => {
      if (!usedNames.has(cat.name)) {
        allCategories.push(cat);
        usedNames.add(cat.name);
      }
    });
    
    // Add article categories that don't exist in static categories
    let dynamicIndex = 1000; // Start from high number to avoid conflicts
    articleCategories
      .filter(cat => !usedNames.has(cat))
      .forEach((cat) => {
        allCategories.push({
          id: dynamicIndex++,
          name: cat,
          icon: FaBook,
          color: '#579BE8',
          bgColor: '#EFF6FF'
        });
        usedNames.add(cat);
      });
  }

  // Determine which categories to show
  const categoriesToShow = showAllCategories || allCategories.length <= 5 
    ? allCategories 
    : allCategories.slice(0, 5);
  const hasMoreCategories = allCategories.length > 5;

  return (
    <section className="relative w-full py-7 bg-gradient-to-br from-secondary/20 via-background to-secondary/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="flex py-5 md:py-6 lg:py-8 px-4 md:px-6 lg:px-8 flex-col gap-3 md:gap-4 lg:gap-5 items-center justify-center bg-gradient-to-br from-[#579BE8] via-[#4a8dd8] to-[#124987] text-white rounded-xl md:rounded-2xl lg:rounded-3xl shadow-xl md:shadow-2xl relative overflow-hidden group">
            {/* Enhanced Decorative Background Elements */}
            <div className="absolute top-0 right-0 p-4 opacity-[0.08] rotate-12 group-hover:rotate-6 transition-transform duration-1000">
              <FaBook size={140} className="text-white" />
            </div>
            <div className="absolute bottom-0 left-0 p-4 opacity-[0.08] -rotate-12 group-hover:-rotate-6 transition-transform duration-1000">
              <IoDocumentTextOutline size={120} className="text-white" />
            </div>
            <div className="absolute top-1/2 right-1/4 opacity-[0.06]">
              <MdArticle size={100} className="text-white rotate-12" />
            </div>

            {/* Enhanced Animated Glow Effects */}
            <motion.div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/8 rounded-full blur-3xl"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <div className="absolute top-0 right-1/4 w-72 h-72 bg-white/12 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-1/4 w-56 h-56 bg-white/12 rounded-full blur-2xl"></div>

            {/* Main Content - Enhanced */}
            <div className="flex flex-col gap-4 items-center justify-center relative z-10 w-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col gap-3 items-center text-center max-w-lg"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-xl border-2 border-white/30 mb-2">
                  <FaBook className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </div>
                <h2 className="text-lg md:text-xl lg:text-2xl font-black drop-shadow-lg">مدونة وايت مياه</h2>
                <p className="text-xs md:text-sm lg:text-base opacity-90 font-medium">اكتشف أحدث المقالات والنصائح حول المياه والصحة</p>
              </motion.div>

              {/* Search Input */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full max-w-2xl mt-2"
              >
                <div className="relative">
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 z-10 pointer-events-none">
                    <FaSearch className="w-4 h-4 opacity-80" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery || ''}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="ابحث عن مقال..."
                    dir="rtl"
                    lang="ar"
                    className="w-full pr-10 pl-4 py-3 md:py-4 rounded-xl md:rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300 font-medium text-sm md:text-base"
                  />
                  {searchQuery && (
                    <button
                      onClick={onSearchClear}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                    >
                      <FaTimes className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>

              {/* Category Filters */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap justify-center gap-3 mt-4"
              >
                {categoriesToShow.map((category, index) => (
                  <CategoryButton
                    key={`category-${category.name}-${category.id || index}`}
                    category={category}
                    isSelected={selectedCategory === category.name}
                    onClick={onCategorySelect}
                  />
                ))}
                
                {/* Show More Button */}
                {hasMoreCategories && !showAllCategories && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAllCategories(true)}
                    className="relative flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 transition-all duration-300 font-cairo font-semibold text-sm"
                  >
                    <span>المزيد</span>
                    <FaArrowRight className="text-sm" />
                  </motion.button>
                )}
                
                {/* Show Less Button */}
                {hasMoreCategories && showAllCategories && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAllCategories(false)}
                    className="relative flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 transition-all duration-300 font-cairo font-semibold text-sm"
                  >
                    <span>أقل</span>
                    <ChevronLeft className="text-sm" />
                  </motion.button>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Memoize ArticlesHeader to prevent re-renders when only results change
const MemoizedArticlesHeader = memo(ArticlesHeader);

const ArticlesGrid = ({ articles, selectedCategory, searchQuery, loading }) => {
  // Get featured articles (can be multiple)
  const featuredArticles = articles.filter(a => a.featured);
  const featuredArticle = featuredArticles[0]; // Show first featured article in hero section
  
  // Get the ID of the first featured article to exclude it from grid (to avoid duplication)
  const firstFeaturedArticleId = featuredArticle?.id;
  
  // Get all articles excluding the first featured one from grid (already shown in hero)
  // But include other featured articles in the grid
  // For search results, show ALL articles without filtering
  let articlesToShow = [];
  
  if (searchQuery && searchQuery.trim() !== '') {
    // For search, show all articles (don't filter out featured)
    articlesToShow = articles;
    console.log('ArticlesGrid - Using search mode, showing all articles');
  } else if (selectedCategory === "جميع المقالات" || selectedCategory === null || selectedCategory === '') {
    // For all articles, exclude the first featured one (shown in hero)
    articlesToShow = articles.filter(a => a.id !== firstFeaturedArticleId);
    console.log('ArticlesGrid - Using all articles mode, filtered out featured');
  } else {
    // For category filter, show only articles in that category
    articlesToShow = articles.filter(article => article.category === selectedCategory);
    console.log('ArticlesGrid - Using category filter mode');
  }
  
  const trendingArticles = articles.filter(a => a.trending && !a.featured).slice(0, 3);
  
  // Debug logging
  console.log('========== ArticlesGrid Debug ==========');
  console.log('ArticlesGrid - Total articles:', articles.length);
  console.log('ArticlesGrid - Search query:', searchQuery);
  console.log('ArticlesGrid - Selected category:', selectedCategory);
  console.log('ArticlesGrid - Featured articles:', featuredArticles.length);
  console.log('ArticlesGrid - Articles to show:', articlesToShow.length);
  console.log('ArticlesGrid - First featured article ID:', firstFeaturedArticleId);
  console.log('ArticlesGrid - Trending articles:', trendingArticles.length);
  if (articlesToShow.length > 0) {
    console.log('ArticlesGrid - First article to show:', articlesToShow[0]);
  } else {
    console.log('ArticlesGrid - WARNING: No articles to show!');
    console.log('ArticlesGrid - Articles array:', articles);
  }
  console.log('==========================================');

  // Show loading state only in results section
  if (loading) {
    return (
      <section className="py-12 md:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#579BE8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">جاري البحث عن المقالات...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Featured Article */}
        {featuredArticle && !searchQuery && (selectedCategory === "جميع المقالات" || selectedCategory === null || selectedCategory === '') && (
          <div className="mb-16">
            <div className="flex items-center gap-2 mb-6">
              <FaFire className="text-gray-600 text-xl" />
              <h2 className="text-2xl md:text-3xl font-black text-gray-900">مقال مميز</h2>
            </div>
            <FeaturedArticle article={featuredArticle} />
          </div>
        )}

        {/* Trending Articles */}
        {trendingArticles.length > 0 && !searchQuery && (selectedCategory === "جميع المقالات" || selectedCategory === null || selectedCategory === '') && (
          <div className="mb-16">
            <div className="flex items-center gap-2 mb-6">
              <FaChartLine className="text-gray-600 text-xl" />
              <h2 className="text-2xl md:text-3xl font-black text-gray-900">الأكثر قراءة</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {trendingArticles.map((article) => (
                <ArticleCard key={article.id} article={article} variant="compact" />
              ))}
            </div>
          </div>
        )}

        {/* All Articles Grid */}
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-8">
            {searchQuery && searchQuery.trim() !== '' 
              ? `نتائج البحث عن "${searchQuery}"` 
              : selectedCategory === "جميع المقالات" || selectedCategory === null || selectedCategory === '' 
                ? 'جميع المقالات' 
                : `مقالات ${selectedCategory}`
            }
          </h2>
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {(searchQuery && searchQuery.trim() !== '' ? articlesToShow : articlesToShow.slice(0, 5)).map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ArticleCard article={article} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {articlesToShow.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="inline-block p-8 bg-gray-50 rounded-2xl">
                <p className="text-xl text-gray-600 mb-2">
                  {searchQuery && searchQuery.trim() !== '' 
                    ? `لم يتم العثور على نتائج للبحث عن "${searchQuery}"`
                    : 'لا توجد مقالات في هذه الفئة حالياً'
                  }
                </p>
                <p className="text-sm text-gray-400">
                  {searchQuery && searchQuery.trim() !== '' 
                    ? 'جرب البحث بكلمات مختلفة'
                    : 'نعمل على إضافة محتوى جديد قريباً'
                  }
                </p>
              </div>
            </motion.div>
          )}

          {/* Read More Button - Show if more than 5 articles (only for non-search) */}
          {!searchQuery && articlesToShow.length > 5 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mt-12"
            >
              <Link
                href="/articles"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#579BE8] to-[#315782] text-white rounded-xl font-cairo font-bold text-lg hover:from-[#4788d5] hover:to-[#2a4a6f] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span>اقرأ المزيد</span>
                <FaArrowRight className="text-xl" />
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

const ArticlesSection = () => {
  const [selectedCategory, setSelectedCategory] = useState("جميع المقالات");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [apiCategories, setApiCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeoutRef = useRef(null);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        
        if (response.ok && data.success && data.data) {
          // Transform API categories to component format
          const transformedCategories = data.data.map((cat, index) => ({
            id: cat.id || index + 1,
            name: cat.name,
            slug: cat.slug,
            icon: CATEGORIES.find(c => c.name === cat.name)?.icon || FaBook,
            color: cat.color || '#579BE8',
            bgColor: cat.color ? `${cat.color}20` : '#EFF6FF',
            description: cat.description
          }));
          
          setApiCategories(transformedCategories);
          console.log('Categories fetched from API:', transformedCategories);
        } else {
          console.warn('Failed to fetch categories, using static categories');
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  // Fetch articles or search
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let response;
        let apiUrl;
        
        // If there's a search query, use search API
        if (searchQuery && searchQuery.trim() !== '') {
          // Properly encode Arabic characters for URL
          const trimmedQuery = searchQuery.trim();
          const encodedQuery = encodeURIComponent(trimmedQuery);
          apiUrl = `/api/articles/search?q=${encodedQuery}`;
          
          console.log('Search - Original Arabic query:', trimmedQuery);
          console.log('Search - Encoded query:', encodedQuery);
          
          // Get access token if available
          const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
          const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          };
          
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
          
          response = await fetch(apiUrl, { headers });
        } else {
          // Otherwise, fetch all articles
          response = await fetch('/api/articles');
        }
        
        const data = await response.json();
        
        // Detailed logging of the response
        console.log('========== API RESPONSE ==========');
        console.log('API Response Status:', response.status);
        console.log('Is Search Query:', searchQuery && searchQuery.trim() !== '');
        console.log('Full API Response:', JSON.stringify(data, null, 2));
        console.log('Response keys:', Object.keys(data));
        console.log('data.success:', data.success);
        console.log('data.data exists:', !!data.data);
        console.log('data.data is array:', Array.isArray(data.data));
        if (data.data) {
          console.log('data.data length:', data.data.length);
          if (data.data.length > 0) {
            console.log('First article in data.data:', JSON.stringify(data.data[0], null, 2));
          }
        }
        console.log('===================================');
        
        // Handle successful response
        if (response.ok) {
          // Extract articles from response - handle the structure: { success: true, data: [...] }
          let articlesData = null;
          
          // Primary structure: { success: true, data: [...] }
          if (data.success === true && data.data) {
            if (Array.isArray(data.data)) {
              articlesData = data.data;
            }
          }
          // Fallback structures
          else if (data.data && Array.isArray(data.data)) {
            articlesData = data.data;
          } else if (Array.isArray(data)) {
            articlesData = data;
          } else if (data.articles && Array.isArray(data.articles)) {
            articlesData = data.articles;
          }
          
          console.log('========== EXTRACTION ==========');
          console.log('Extracted articlesData:', articlesData);
          console.log('Is Array:', Array.isArray(articlesData));
          console.log('Length:', articlesData?.length);
          if (articlesData && articlesData.length > 0) {
            console.log('First article raw:', JSON.stringify(articlesData[0], null, 2));
          }
          console.log('================================');
          
          if (articlesData && Array.isArray(articlesData)) {
            // Transform articles
            const transformedArticles = articlesData.length > 0 
              ? articlesData.map(transformArticle)
              : [];
            
            console.log('========== TRANSFORMATION ==========');
            console.log('Transformed Articles count:', transformedArticles.length);
            if (transformedArticles.length > 0) {
              console.log('First transformed article:', JSON.stringify(transformedArticles[0], null, 2));
            }
            console.log('=====================================');
            
            setArticles(transformedArticles);
            
            // Extract unique categories from articles as fallback
            if (transformedArticles.length > 0) {
              const uniqueCategories = [...new Set(transformedArticles.map(a => a.category))];
              setCategories(uniqueCategories);
              console.log('Categories from articles:', uniqueCategories);
            }
            
            // Clear error for search results (even if empty)
            if (searchQuery && searchQuery.trim() !== '') {
              setError(null);
            }
          } else {
            // Could not extract articles data
            console.error('Could not extract articles from response');
            console.error('Response structure:', JSON.stringify(data, null, 2));
            setArticles([]);
            if (searchQuery && searchQuery.trim() !== '') {
              // For search, empty results are valid
              setError(null);
            } else {
              setError(data.message || 'لا توجد مقالات متاحة');
            }
          }
        } else {
          // Handle error response
          const errorMessage = data.message || data.error || 'فشل تحميل المقالات';
          console.error('API Error:', errorMessage);
          
          // For search queries, empty results are acceptable
          if (searchQuery && searchQuery.trim() !== '') {
            setArticles([]);
            setError(null); // Don't show error for empty search results
          } else {
            setError(errorMessage);
            // Fallback to static data only if not searching
            setArticles(ARTICLES_DATA);
          }
        }
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError(err.message);
        // Fallback to static data only if not searching
        if (!searchQuery || searchQuery.trim() === '') {
          setArticles(ARTICLES_DATA);
        } else {
          // For search, empty results are acceptable
          setArticles([]);
          setError(null);
        }
      } finally {
        setLoading(false);
      }
    };

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If searching, debounce the search - wait for user to stop typing
    if (searchQuery && searchQuery.trim() !== '') {
      // Show loading state immediately when user starts typing
      setLoading(true);
      
      // Wait for user to stop typing before fetching
      searchTimeoutRef.current = setTimeout(() => {
        fetchArticles();
      }, 800); // 800ms debounce - wait for user to stop typing
    } else {
      // If no search query, fetch immediately
      fetchArticles();
    }

    // Cleanup timeout on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    // Reset category when searching
    if (value && value.trim() !== '') {
      setSelectedCategory("جميع المقالات");
    }
  };

  const handleSearchClear = () => {
    setSearchQuery('');
  };

  const filteredArticles = selectedCategory === "جميع المقالات" || selectedCategory === "الكل" 
    ? articles 
    : articles.filter(article => article.category === selectedCategory);

  return (
    <main className="w-full">
      <MemoizedArticlesHeader 
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        apiCategories={apiCategories}
        articleCategories={categories}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onSearchClear={handleSearchClear}
      />
      <ArticlesGrid 
        articles={filteredArticles} 
        selectedCategory={selectedCategory} 
        searchQuery={searchQuery}
        loading={loading}
      />
    </main>
  );
};

export default ArticlesSection;
