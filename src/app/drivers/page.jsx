"use client";

import { useState, useEffect } from "react";
import IntroSection from "@/components/molecules/Drivers/IntroSection";
import StatsSection from "@/components/molecules/Drivers/StatsSection";
import StaticSection from "@/components/molecules/Drivers/StaticSection";
import DriverServicesSection from "@/components/molecules/Drivers/DriverServicesSection";
import AppPromotionSection from "@/components/molecules/Drivers/AppPromotionSection";
import CallToActionSection from "@/components/molecules/Drivers/CallToActionSection";
import HowToUseAppSection from "@/components/molecules/Drivers/HowToUseAppSection";
import Footer from "@/components/molecules/common/Footer";
import Cover from "@/components/molecules/Drivers/cover";
import StartJourneySection from "@/components/molecules/Drivers/StartJourneySection";
import AppPromotionSectionDriver from "@/components/molecules/Drivers/AppPromotionSectionDriver";

export default function DriversPage() {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch page data for 'drivers' key
        const response = await fetch('/api/pages/drivers');
        const data = await response.json();
        
        console.log('Drivers Page - API Response:', data);
        
        if (response.ok && (data.success || data.status)) {
          setPageData(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch page data');
        }
      } catch (err) {
        console.error('Error fetching page data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, []);

  // Render sections based on pageData
  const renderSection = (section) => {
    switch (section.type) {
      case 'hero':
        // Hero section - use Cover component
        return <Cover key={section.id} data={section} />;
      case 'statistics':
        // Statistics section - use StatsSection component
        return <StatsSection key={section.id} data={section} />;
      case 'benefits':
        // Benefits section - use StaticSection component
        return <StaticSection key={section.id} data={section} />;
      default:
        return null;
    }
  };

  // Skeleton Components
  const CoverSkeleton = () => (
    <div className="cover relative px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
      <div className="container mx-auto">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
          {/* Form Section Skeleton */}
          <div className="form-left content-left order-1 md:order-2 rounded-xl sm:rounded-2xl md:rounded-[26px] border border-[#FFFFFF26] sm:border-2 md:border-[12px] lg:border-[20px] shadow-lg overflow-hidden">
            <div className="bg-[#FFFFFF26] h-full p-2 py-6 md:py-3">
              <div className="bg-[#EFF5FD] px-2 sm:px-5 md:px-6 lg:px-7 py-5 sm:py-6 md:py-7 lg:py-8 rounded-xl sm:rounded-2xl md:rounded-3xl flex flex-col gap-3 sm:gap-4 shadow-md w-full max-w-md mx-auto min-h-[380px] sm:min-h-[420px] md:min-h-[480px] justify-center">
                <div className="h-6 sm:h-7 md:h-8 w-3/4 bg-gray-300 dark:bg-gray-700 rounded-xl animate-pulse mx-auto mb-4"></div>
                <div className="w-full rounded-xl sm:rounded-2xl bg-gray-200 dark:bg-gray-700 p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 animate-pulse">
                  <div className="h-5 w-full bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                </div>
                <div className="w-full rounded-xl sm:rounded-2xl bg-gray-200 dark:bg-gray-700 p-4 sm:p-5 md:p-6 mb-3 sm:mb-4 md:mb-5 animate-pulse">
                  <div className="h-5 w-full bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                </div>
                <div className="h-11 sm:h-12 md:h-14 w-full bg-gray-300 dark:bg-gray-700 rounded-lg sm:rounded-xl animate-pulse mt-2 sm:mt-3 md:mt-4"></div>
              </div>
            </div>
          </div>

          {/* Content Section Skeleton */}
          <div className="content-right order-2 md:order-1">
            <div className="h-10 w-60 bg-white/20 rounded-lg backdrop-blur-sm mb-3 mt-4 animate-pulse"></div>
            <div className="h-8 sm:h-10 w-full bg-white/20 rounded-2xl animate-pulse mb-3"></div>
            <div className="space-y-2 mb-4">
              <div className="h-5 w-full bg-white/15 rounded-xl animate-pulse"></div>
              <div className="h-5 w-5/6 bg-white/15 rounded-xl animate-pulse"></div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-start gap-4">
              <div className="h-12 w-40 bg-white/20 rounded-xl animate-pulse"></div>
              <div className="h-12 w-40 bg-white/20 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );



  const StatsSectionSkeleton = () => (
    <section className="relative w-full py-10 md:py-12 bg-gradient-to-b from-white via-gray-50/50 to-white overflow-hidden">
      <div className="px-3 mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-8 md:mb-10">
          <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mx-auto mb-3 md:mb-4"></div>
          <div className="h-8 sm:h-10 md:h-12 w-2/3 md:w-1/2 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse mx-auto mb-3 md:mb-4"></div>
          <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-5 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-200 shadow-sm">
              <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse mx-auto mb-4"></div>
              <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mx-auto mb-2"></div>
              <div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const StaticSectionSkeleton = () => (
    <section className="px-4 sm:px-6 lg:px-8 py-8 lg:py-12 my-4 lg:my-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 md:mb-10">
          <div className="h-6 w-28 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mx-auto mb-3 md:mb-4"></div>
          <div className="h-8 sm:h-10 md:h-12 w-2/3 md:w-1/2 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse mx-auto mb-3 md:mb-4"></div>
          <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-200 shadow-sm">
              <div className="h-20 w-20 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse mx-auto mb-4"></div>
              <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mx-auto mb-3"></div>
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const DriverServicesSectionSkeleton = () => (
    <section className="container py-10 sm:py-12 lg:py-14 my-6 lg:my-8">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 lg:mb-12">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mx-auto mb-2 md:mb-3"></div>
          <div className="h-8 sm:h-10 md:h-12 lg:h-14 w-2/3 md:w-1/2 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse mx-auto mb-2 md:mb-3"></div>
          <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8">
              <div className="h-7 lg:h-8 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-6"></div>
              <div className="w-12 h-0.5 bg-gray-200 dark:bg-gray-700 rounded-full mb-6 animate-pulse"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse mt-2 flex-shrink-0"></div>
                    <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const StartJourneySectionSkeleton = () => (
    <section className="relative w-full py-10 md:py-12 bg-gradient-to-b from-white via-gray-50/50 to-white overflow-hidden">
      <div className="px-4 mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-8 md:mb-10">
          <div className="h-6 w-28 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mx-auto mb-3 md:mb-4"></div>
          <div className="h-8 sm:h-10 md:h-12 w-2/3 md:w-1/2 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse mx-auto mb-3 md:mb-4"></div>
        </div>
        <div className="h-64 md:h-80 w-full bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
      </div>
    </section>
  );

  const HowToUseAppSectionSkeleton = () => (
    <section className="relative w-full py-10 md:py-12 bg-gradient-to-b from-white via-gray-50/50 to-white overflow-hidden">
      <div className="px-4 mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-8 md:mb-10">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mx-auto mb-3 md:mb-4"></div>
          <div className="h-8 sm:h-10 md:h-12 w-2/3 md:w-1/2 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse mx-auto mb-3 md:mb-4"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse mx-auto mb-4"></div>
              <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mx-auto mb-3"></div>
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  if (loading) {
    return (
      <main className="space-y-20">
        <CoverSkeleton />
        {/* <IntroSectionSkeleton /> */}
        <StatsSectionSkeleton />
        <StaticSectionSkeleton />
        <DriverServicesSectionSkeleton />
        <StartJourneySectionSkeleton />
        <HowToUseAppSectionSkeleton />
        <Footer />
      </main>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-[#579BE8] text-white rounded-lg"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  // If pageData exists, render sections dynamically while maintaining original order
  if (pageData && pageData.sections && pageData.sections.length > 0) {
    // Sort sections by order
    const sortedSections = [...pageData.sections].sort((a, b) => (a.order || 0) - (b.order || 0));
    
    // Create a map of section types to their rendered components
    const sectionMap = {};
    sortedSections.forEach(section => {
      sectionMap[section.type] = renderSection(section);
    });
    
    return (
      <main className="space-y-20">
        {/* Hero section - use dynamic if available, otherwise default Cover */}
        {sectionMap['hero'] || <Cover />}
        {/* <IntroSection /> */}
        {/* Statistics section - use dynamic if available, otherwise default StatsSection */}
        {sectionMap['statistics'] || <StatsSection />}
        {/* Benefits section - use dynamic if available, otherwise default StaticSection */}
        {sectionMap['benefits'] || <StaticSection />}
        <DriverServicesSection />
        {/* <StartJourneySection/> */}
        <HowToUseAppSection />
        <AppPromotionSectionDriver />
        <CallToActionSection />
        <Footer/>
      </main>
    );
  }

  // Fallback to default components if no data
  return (
    <main className="space-y-20">
      <Cover />
      <IntroSection />
      <StatsSection />
      <StaticSection />
      <DriverServicesSection />
      {/* <StartJourneySection/> */}
      <HowToUseAppSection />
      <AppPromotionSection/>
      <CallToActionSection />
      <Footer/>
    </main>
  );
}
