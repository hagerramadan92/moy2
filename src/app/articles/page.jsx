'use client';

import ArticlesSection from "@/components/molecules/articles/ArticlesSection";
import AppPromotionSection from "@/components/molecules/Drivers/AppPromotionSection";
import CallToActionSection from "@/components/molecules/Drivers/CallToActionSection";
import Footer from "@/components/molecules/common/Footer";

const ArticlePage = () => {
  return (
    <main>
      <ArticlesSection />
      <AppPromotionSection />
      <CallToActionSection />
      <Footer />
    </main>
  );
};

export default ArticlePage;