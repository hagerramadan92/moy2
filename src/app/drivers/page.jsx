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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#579BE8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الصفحة...</p>
        </div>
      </div>
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
        <IntroSection />
        {/* Statistics section - use dynamic if available, otherwise default StatsSection */}
        {sectionMap['statistics'] || <StatsSection />}
        {/* Benefits section - use dynamic if available, otherwise default StaticSection */}
        {sectionMap['benefits'] || <StaticSection />}
        <DriverServicesSection />
        <StartJourneySection/>
        <HowToUseAppSection />
        <AppPromotionSection/>
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
      <StartJourneySection/>
      <HowToUseAppSection />
      <AppPromotionSection/>
      <CallToActionSection />
      <Footer/>
    </main>
  );
}
