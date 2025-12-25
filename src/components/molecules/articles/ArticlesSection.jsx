'use client';

import ArticleCard from '@/components/ui/ArticleCard';
import React from 'react';

const ArticlesPage = () => {
  const articleData = {
    imageUrl: "/man.png",
    category: "الصحة",
    title: "فوائد شرب الماء للجسم والصحة العامة",
    description: "تعرف على أهمية شرب الماء يومياً وكيف يؤثر على صحتك ونشاطك اليومي...",
    author: "د. عماد حسن",
    date: "6 ديسمبر 2025",
    readTime: "5 دقائق",
    personIconUrl: "/person.png",
    calendarIconUrl: "/calender.png",
    timeIconUrl: "/time2.png"
  };

  const articles = Array(6).fill(articleData).map((item, index) => ({
    ...item,
    id: index + 1
  }));

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Grid Container */}
        <div className="flex justify-center">
          <div className="w-full max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  id={article.id}
                  imageUrl={article.imageUrl}
                  category={article.category}
                  title={article.title}
                  description={article.description}
                  author={article.author}
                  date={article.date}
                  readTime={article.readTime}
                  personIconUrl={article.personIconUrl}
                  calendarIconUrl={article.calendarIconUrl}
                  timeIconUrl={article.timeIconUrl}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticlesPage;
