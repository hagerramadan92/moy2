'use client';

import { useState, useEffect } from 'react';
import ArticlesSection from "@/components/molecules/articles/ArticlesSection";
import AppPromotionSection from "@/components/molecules/Drivers/AppPromotionSection";
import CallToActionSection from "@/components/molecules/Drivers/CallToActionSection";
import Footer from "@/components/molecules/common/Footer";
import ArticlesSlider from "@/components/molecules/articles/ArticlesSlider";

const ArticlePage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Skeleton Components
  const ArticlesSectionSkeleton = () => (
    <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Skeleton */}
        <div className="text-center mb-8 md:mb-12">
          <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mx-auto mb-3 md:mb-4"></div>
          <div className="h-8 sm:h-10 md:h-12 lg:h-14 w-2/3 md:w-1/2 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse mx-auto mb-3 md:mb-4"></div>
          <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-5 animate-pulse"></div>
        </div>

        {/* Search Bar Skeleton */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="h-12 md:h-14 w-full bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
        </div>

        {/* Categories Skeleton */}
        <div className="flex flex-wrap justify-center gap-3 mb-8 md:mb-12">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
          ))}
        </div>

        {/* Articles Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200">
              {/* Image Skeleton */}
              <div className="w-full h-48 md:h-56 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              
              {/* Content Skeleton */}
              <div className="p-4 md:p-6">
                <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mb-3"></div>
                <div className="h-6 md:h-7 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-2"></div>
                <div className="h-6 md:h-7 w-5/6 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-4"></div>
                <div className="space-y-2 mb-4">
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 w-4/5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const ArticlesSliderSkeleton = () => (
    <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mx-auto mb-3 md:mb-4"></div>
          <div className="h-8 sm:h-10 md:h-12 w-2/3 md:w-1/2 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200">
              <div className="w-full h-48 md:h-56 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              <div className="p-4 md:p-6">
                <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mb-3"></div>
                <div className="h-6 md:h-7 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-2"></div>
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  if (loading) {
    return (
      <main>
        <ArticlesSectionSkeleton />
        <ArticlesSliderSkeleton />
        <CallToActionSection />
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <ArticlesSection />
      {/* <AppPromotionSection /> */}
      <ArticlesSlider />
      <CallToActionSection />
      <Footer />
    </main>
  );
};

export default ArticlePage;