'use client';

import ArticlesSection from "@/components/molecules/articles/ArticlesSection";
import AppPromotionSection from "@/components/molecules/Drivers/AppPromotionSection";
import CallToActionSection from "@/components/molecules/Drivers/CallToActionSection";
import Footer from "@/components/molecules/common/Footer";
import ArticlesSlider from "@/components/molecules/articles/ArticlesSlider";

const ArticlePage = () => {
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