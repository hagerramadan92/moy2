'use client';

import { useState } from 'react';
import ArticleCard from '@/components/ui/ArticleCard';

const ARTICLES_DATA = [
  {
    id: 1,
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
  },
  {
    id: 2,
    imageUrl: "/man.png",
    category: "الصحة",
    title: "كيفية الحفاظ على ترطيب الجسم في الصيف",
    description: "نصائح مهمة للحفاظ على مستوى الماء في الجسم خلال الأيام الحارة...",
    author: "د. سارة أحمد",
    date: "5 ديسمبر 2025",
    readTime: "4 دقائق",
    personIconUrl: "/person.png",
    calendarIconUrl: "/calender.png",
    timeIconUrl: "/time2.png"
  },
  {
    id: 3,
    imageUrl: "/man.png",
    category: "اخبار",
    title: "تطورات جديدة في تقنيات تحلية المياه",
    description: "أحدث الابتكارات في مجال تحلية المياه وتأثيرها على البيئة...",
    author: "م. خالد محمد",
    date: "4 ديسمبر 2025",
    readTime: "6 دقائق",
    personIconUrl: "/person.png",
    calendarIconUrl: "/calender.png",
    timeIconUrl: "/time2.png"
  },
  {
    id: 4,
    imageUrl: "/man.png",
    category: "اخبار",
    title: "مؤتمر المياه الدولي 2025",
    description: "أهم ما تم مناقشته في مؤتمر المياه الدولي لهذا العام...",
    author: "أحمد علي",
    date: "3 ديسمبر 2025",
    readTime: "7 دقائق",
    personIconUrl: "/person.png",
    calendarIconUrl: "/calender.png",
    timeIconUrl: "/time2.png"
  },
  {
    id: 5,
    imageUrl: "/man.png",
    category: "الصحة",
    title: "أضرار قلة شرب الماء على الكلى",
    description: "كيف تؤثر قلة المياه على وظائف الكلى والصحة العامة...",
    author: "د. يوسف كمال",
    date: "2 ديسمبر 2025",
    readTime: "5 دقائق",
    personIconUrl: "/person.png",
    calendarIconUrl: "/calender.png",
    timeIconUrl: "/time2.png"
  },
  {
    id: 6,
    imageUrl: "/man.png",
    category: "اخبار",
    title: "مشروع جديد لتحسين شبكة المياه",
    description: "تفاصيل المشروع الجديد لتحسين جودة وتوزيع المياه في المدينة...",
    author: "مريم سعيد",
    date: "1 ديسمبر 2025",
    readTime: "4 دقائق",
    personIconUrl: "/person.png",
    calendarIconUrl: "/calender.png",
    timeIconUrl: "/time2.png"
  }
];

const CATEGORIES = [
  {
    id: 1,
    name: 'الكل',
    gradient: 'linear-gradient(260.48deg, #1C7C4B 0%, rgba(102, 102, 102, 0) 100%)',
    textColor: 'text-primary-green',
    activeBg: 'linear-gradient(rgba(28, 124, 75, 0.1), rgba(28, 124, 75, 0.1)) padding-box'
  },
  {
    id: 2,
    name: 'الصحة',
    gradient: 'linear-gradient(259.57deg, #579BE8 2.46%, rgba(102, 102, 102, 0) 100%)',
    textColor: 'text-primary-blue',
    activeBg: 'linear-gradient(rgba(87, 155, 232, 0.1), rgba(87, 155, 232, 0.1)) padding-box'
  },
  {
    id: 3,
    name: 'اخبار',
    gradient: 'linear-gradient(257.28deg, #B70005 3.19%, rgba(102, 102, 102, 0) 100%)',
    textColor: 'text-primary-red',
    activeBg: 'linear-gradient(rgba(183, 0, 5, 0.1), rgba(183, 0, 5, 0.1)) padding-box'
  }
];

  const CategoryButton = ({ category, isSelected, onClick }) => {
  const getButtonStyle = () => {
    const baseStyle = {
      border: '2px solid transparent',
      borderRadius: '9999px',
    };

    if (isSelected) {
      return {
        ...baseStyle,
        background: `${category.activeBg}, ${category.gradient} border-box`,
      };
    }

    return {
      ...baseStyle,
      background: `linear-gradient(white, white) padding-box, ${category.gradient} border-box`,
    };
  };

  return (
    <button
      onClick={() => onClick(category.name)}
      className={`
        relative min-w-[100px] sm:min-w-[120px] h-12 sm:h-14 
        rounded-full px-5 sm:px-6 flex items-center justify-center 
        transition-all duration-300 hover:scale-105 active:scale-95
        ${isSelected ? 'scale-105 shadow-lg' : 'hover:opacity-90'}
      `}
      style={getButtonStyle()}
    >
      <span className={`
        font-cairo font-semibold text-sm sm:text-base 
        ${category.textColor} transition-colors duration-300
        ${isSelected ? 'font-bold' : ''}
      `}>
        {category.name}
      </span>
    </button>
  );
};

const ArticlesHeader = ({ selectedCategory, onCategorySelect }) => (
  <section className="w-full bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24 min-h-[70vh] flex flex-col justify-center items-center">
      
      <div className="w-full max-w-3xl mb-6 md:mb-8 text-center">
        <h1 className="font-cairo font-semibold text-xl sm:text-2xl md:text-3xl lg:text-4xl text-[#579BE8] mb-4 md:mb-6">
          📚 مدونة وايت مياه
        </h1>
        
        <p className="font-cairo font-normal text-base sm:text-lg md:text-xl lg:text-2xl text-gray-900 leading-relaxed">
          <span className="block md:inline-block md:whitespace-nowrap md:overflow-visible">
            اكتشف أحدث المقالات والنصائح حول المياه والصحة وخدماتنا المميزه
          </span>
        </p>
      </div>

      <div className="w-full max-w-md mt-2 md:mt-2 lg:mt-4">
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          {CATEGORIES.map((category) => (
            <CategoryButton
              key={category.id}
              category={category}
              isSelected={selectedCategory === category.name}
              onClick={onCategorySelect}
            />
          ))}
        </div>
      </div>

    </div>
  </section>
);

const ArticlesGrid = ({ articles }) => (
  <section className="min-h-screen bg-gray-50 py-12">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-center">
        <div className="w-full max-w-6xl">
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
              {articles.map((article) => (
                <ArticleCard key={article.id} {...article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="font-cairo text-xl text-gray-500">
                لا توجد مقالات في هذه الفئة حالياً
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  </section>
);

const ArticlesSection = () => {
  const [selectedCategory, setSelectedCategory] = useState("الكل");

  const filteredArticles = selectedCategory === "الكل" 
    ? ARTICLES_DATA 
    : ARTICLES_DATA.filter(article => article.category === selectedCategory);

  return (
    <main className="w-full">
      <ArticlesHeader 
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />
      <ArticlesGrid articles={filteredArticles} />
    </main>
  );
};

export default ArticlesSection;