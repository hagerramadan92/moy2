// src/app/articles/page.jsx
'use client';

import AppPromotionSection from "@/components/molecules/Drivers/AppPromotionSection";
import ArticlesHero from "@/components/molecules/articles/ArticlesHero";
import ArticlesSection from "@/components/molecules/articles/ArticlesSection";
import CallToActionSection from "@/components/molecules/Drivers/CallToActionSection";
import Footer from "@/components/molecules/common/Footer";

const ArticlePage = () => {
  return (
    <main>
      <ArticlesHero />
      <ArticlesSection />
      <AppPromotionSection />
      <CallToActionSection />
      <Footer />
    </main>
  );
};

export default ArticlePage;