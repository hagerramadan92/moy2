'use client';

import { useParams, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import AppPromotionSection from '@/components/molecules/Drivers/AppPromotionSection';
import CallToActionSection from '@/components/molecules/Drivers/CallToActionSection';
import Footer from '@/components/molecules/common/Footer';

const allArticles = [
  {
    id: 1,
    imageUrl: "/man.png",
    category: "الصحة",
    title: "فوائد شرب الماء للجسم والصحة العامة",
    content: `الماء هو أساس الحياة وعنصر حيوي لصحة الإنسان. يشكل الماء حوالي 60% من وزن جسم الإنسان البالغ، ويلعب دوراً محورياً في جميع العمليات الحيوية التي تحدث داخل الجسم.
من أهم فوائد شرب الماء بانتظام تحسين وظائف الدماغ والتركيز. فالجفاف حتى لو كان بسيطاً يمكن أن يؤثر سلباً على المزاج والذاكرة والأداء الذهني.
كما يساعد الماء في تنظيم درجة حرارة الجسم من خلال التعرق، ويسهل عملية الهضم ويمنع الإمساك. بالإضافة إلى ذلك، يعمل الماء على تنقية الجسم من السموم عبر الكلى.
ينصح الخبراء بشرب 8 أكواب من الماء يومياً على الأقل، مع زيادة هذه الكمية في الأيام الحارة أو عند ممارسة الرياضة.
في ووتر هب إكسبريس، نحرص على توفير مياه نقية وصحية لكم ولعائلاتكم، مع خدمة توصيل سريعة ومريحة حتى باب منزلكم.`,
    description: "تعرف على أهمية شرب الماء يومياً وكيف يؤثر على صحتك ونشاطك اليومي...",
    author: "د. عماد حسن",
    author2: "د. أحمد محمد",
    author2Title: "كاتب ومتخصص في مجال المياه والصحة",
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
    content: `مع ارتفاع درجات الحرارة في فصل الصيف، يزداد خطر الإصابة بالجفاف الذي يؤثر سلباً على صحة الجسم. يتعرض الجسم لفقدان كميات كبيرة من السوائل عبر التعرق، مما يستدعي تعويضها بشرب كميات كافية من الماء.
تشير الدراسات إلى أن احتياجات الجسم من الماء تزيد بنسبة 20-30% في الأيام الحارة مقارنة بالأيام المعتدلة. ولذلك، ينصح بتناول كوب من الماء كل ساعة تقريباً خلال النهار.
كما ينصح بتجنب المشروبات التي تحتوي على الكافيين أو السكريات، لأنها قد تزيد من فقدان السوائل. بدلاً من ذلك، يمكن الاعتماد على الماء العادي أو الماء المضاف إليه شرائح الليمون أو النعناع لإضافة نكهة منعشة.
في ووتر هب إكسبريس، نوفر لكم مياه نقية ومعقمة تصل إليكم طازجة، مع خدمة التوصيل المجانية عند الطلب عبر التطبيق أو الموقع الإلكتروني.`,
    description: "نصائح مهمة للحفاظ على مستوى الماء في الجسم خلال الأيام الحارة...",
    author: "د. سارة أحمد",
    author2: "د. سارة أحمد",
    author2Title: "أخصائية تغذية ومتخصصة في الصحة العامة",
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
    content: `شهدت تقنيات تحلية المياه تطوراً ملحوظاً خلال السنوات الأخيرة، حيث أصبحت أكثر كفاءة وأقل استهلاكاً للطاقة. تعتمد التقنيات الحديثة على أغشية متطورة قادرة على تنقية المياه بأقل تكلفة وأعلى جودة.
أحدث هذه التقنيات هي نظام التناضح العكسي المتطور الذي يقلل من استهلاك الطاقة بنسبة 40% مقارنة بالأنظمة التقليدية. كما توصل الباحثون إلى مواد جديدة لتصنيع الأغشية تزيد من عمرها الافتراضي وتقلل من تكاليف الصيانة.
تهدف هذه التطورات إلى جعل المياه المحلاة متاحة لشريحة أكبر من السكان، خاصة في المناطق التي تعاني من شح الموارد المائية الطبيعية.
في ووتر هب إكسبريس، نواكب هذه التطورات من خلال استخدام أحدث تقنيات التنقية والتعبئة لضمان جودة المياه التي نقدمها لعملائنا الكرام.`,
    description: "أحدث الابتكارات في مجال تحلية المياه وتأثيرها على البيئة...",
    author: "م. خالد محمد",
    author2: "م. خالد محمد",
    author2Title: "خبير في تقنيات معالجة المياه",
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
    content: `انعقد مؤتمر المياه الدولي لعام 2025 في دبي بحضور أكثر من 3000 خبير ومتخصص من حول العالم. ناقش المؤتمر التحديات التي تواجه قطاع المياه على مستوى العالم والحلول المبتكرة للتغلب عليها.
تطرق المؤتمر إلى قضايا هامة مثل ندرة المياه في بعض المناطق، وتلوث مصادر المياه، وسبل تحسين كفاءة استخدام المياه في القطاعات المختلفة.
كما تم عرض تجارب ناجحة من دول مختلفة في مجال إدارة الموارد المائية، وتبادل الخبرات بين المشاركين.
شاركت ووتر هب إكسبريس في المؤتمر كشريك استراتيجي، حيث قدمت تجربتها الناجحة في توفير مياه شرب آمنة ونقية للمجتمعات المحلية.`,
    description: "أهم ما تم مناقشته في مؤتمر المياه الدولي لهذا العام...",
    author: "أحمد علي",
    author2: "أحمد علي",
    author2Title: "مراسل صحفي متخصص في الشؤون البيئية",
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
    content: `تلعب الكلى دوراً حيوياً في تنقية الجسم من السموم، وتعتمد في أداء وظيفتها بشكل أساسي على توفر كميات كافية من الماء. عندما يقل استهلاك الماء، تتراكم السموم في الجسم وقد تؤدي إلى تكون حصوات الكلى.
تشير الدراسات إلى أن قلة شرب الماء تزيد من خطر الإصابة بحصوات الكلى بنسبة 40%، كما ترفع احتمالية الإصابة بالتهابات المسالك البولية.
تظهر أعراض قلة الماء في الجسم على شكل تغير لون البول إلى الأصفر الداكن، والشعور المستمر بالإرهاق، وجفاف الفم والجلد.
ينصح الأطباء بشرب ما لا يقل عن 2 لتر من الماء يومياً للحفاظ على صحة الكلى، مع زيادة هذه الكمية للأشخاص الذين يمارسون نشاطاً بدنياً مرتفعاً.
توفر ووتر هب إكسبريس عبوات مياه بأحجام مختلفة تناسب احتياجاتك اليومية، مع خدمة التوصيل المنتظمة لضمان توفر المياه النقية دائماً في منزلك.`,
    description: "كيف تؤثر قلة المياه على وظائف الكلى والصحة العامة...",
    author: "د. يوسف كمال",
    author2: "د. يوسف كمال",
    author2Title: "استشاري أمراض الكلى والمسالك البولية",
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
    content: `أعلنت وزارة المياه عن مشروع جديد لتحسين شبكة توزيع المياه في المدن الرئيسية. يهدف المشروع إلى تقليل الفاقد من المياه وتوصيل مياه شرب آمنة لمزيد من الأسر.
يتضمن المشروع استبدال الأنابيب القديمة بأخرى حديثة مقاومة للتسرب، وتركيب عدادات ذكية تمكن المستهلكين من مراقبة استهلاكهم المائي بدقة.
من المتوقع أن يسهم المشروع في توفير 30% من المياه المفقودة في الشبكة الحالية، مما يعني توفير كميات أكبر من المياه الصالحة للشرب.
تتعاون ووتر هب إكسبريس مع الجهات المعنية في هذا المشروع من خلال تقديم الدعم الفني والخبرة المكتسبة في مجال إدارة وتوزيع المياه النقية.`,
    description: "تفاصيل المشروع الجديد لتحسين جودة وتوزيع المياه في المدينة...",
    author: "مريم سعيد",
    author2: "مريم سعيد",
    author2Title: "مهندسة مدنية متخصصة في شبكات المياه",
    date: "1 ديسمبر 2025",
    readTime: "4 دقائق",
    personIconUrl: "/person.png",
    calendarIconUrl: "/calender.png",
    timeIconUrl: "/time2.png"
  }
];

const ArticleDetails = () => {
  const params = useParams();
  const router = useRouter();
  const articleId = parseInt(params.id);

  const article = allArticles.find(article => article.id === articleId) || allArticles[0];

  const relatedArticles = allArticles
    .filter(item => item.category === article.category && item.id !== articleId)
    .slice(0, 3);

  if (relatedArticles.length < 3) {
    const otherArticles = allArticles
      .filter(item => item.category !== article.category)
      .slice(0, 3 - relatedArticles.length);
    relatedArticles.push(...otherArticles);
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative container min-h-[400px] lg:h-[461px] bg-gradient-to-b from-[rgba(87,155,232,0.69)] to-[#1C4471] overflow-visible">
        <div className="relative mx-auto px-4 h-full">
          {/* Back Button */}
          <div className="pt-6">
            <button 
              onClick={() => router.push('/articles')} 
              className="text-white hover:opacity-80 transition-opacity z-10 relative"
              aria-label="رجوع"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="absolute top-[60px] left-1/2 -translate-x-1/2 w-full max-w-[428px] px-4 z-10">
            {/* Category */}
            <div className="flex justify-center mb-3">
              <span className="inline-block px-4 py-1 rounded-full border border-white/30 bg-white/20 font-cairo font-semibold text-xs lg:text-[10px] text-white">
                {article.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-cairo font-semibold text-xl md:text-2xl lg:text-[28px] text-center text-white mb-4 leading-tight whitespace-nowrap text-ellipsis">
              {article.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 lg:gap-6 mx-auto">
              {/* Author */}
              <div className="flex items-center gap-2">
                <div className="relative w-5 h-5">
                  <Image 
                    src="/person.png" 
                    alt="كاتب" 
                    fill 
                    className="object-contain"
                    style={{ 
                      filter: 'brightness(0) saturate(100%) invert(78%) sepia(24%) saturate(362%) hue-rotate(176deg) brightness(95%) contrast(89%)' 
                    }}
                  />
                </div>
                <span className="font-cairo font-semibold text-xs lg:text-[13px] text-[#AFC6E1] whitespace-nowrap">
                  {article.author}
                </span>
              </div>

              {/* Date */}
              <div className="flex items-center gap-2">
                <div className="relative w-5 h-5">
                  <Image 
                    src="/calender.png" 
                    alt="تاريخ" 
                    fill 
                    className="object-contain"
                    style={{ 
                      filter: 'brightness(0) saturate(100%) invert(78%) sepia(24%) saturate(362%) hue-rotate(176deg) brightness(95%) contrast(89%)' 
                    }}
                  />
                </div>
                <span className="font-cairo font-semibold text-xs lg:text-[13px] text-[#AFC6E1] whitespace-nowrap">
                  {article.date}
                </span>
              </div>

              {/* Read Time */}
              <div className="flex items-center gap-2">
                <div className="relative w-5 h-5">
                  <Image 
                    src="/time2.png" 
                    alt="وقت القراءة" 
                    fill 
                    className="object-contain"
                    style={{ 
                      filter: 'brightness(0) saturate(100%) invert(78%) sepia(24%) saturate(362%) hue-rotate(176deg) brightness(95%) contrast(89%)' 
                    }}
                  />
                </div>
                <span className="font-cairo font-semibold text-xs lg:text-[13px] text-[#AFC6E1] whitespace-nowrap">
                  {article.readTime}
                </span>
              </div>
            </div>
          </div>

          {/* Main Image */}
          <div className="absolute top-[280px] sm:top-[280px] md:top-[280px] lg:top-[300px] left-1/2 -translate-x-1/2 w-[95vw] max-w-[900px] h-[250px] sm:h-[300px] md:h-[350px] lg:h-[450px] z-20">
            <div className="relative w-full h-full rounded-2xl lg:rounded-[24px] overflow-hidden shadow-2xl">
              <Image 
                src={article.imageUrl} 
                alt={article.title} 
                fill 
                className="object-cover object-top" 
                priority
                sizes="(max-width: 640px) 95vw, (max-width: 768px) 90vw, (max-width: 1024px) 850px, 900px"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="relative mt-[180px] sm:mt-[20px] md:mt-[250px] lg:mt-[340px] pb-12 md:pb-16 lg:pb-20">
        <div className="container mx-auto px-4">
          <div className="w-full max-w-4xl xl:max-w-[1283px] mx-auto bg-white rounded-2xl lg:rounded-[24px] shadow-lg lg:shadow-[0px_0px_18px_0px_rgba(87,155,232,0.25)] p-6 md:p-8 lg:p-12">
            
            {/* Article Content */}
            <div className="mb-8 lg:mb-10">
              {article.content.split('\n').map((paragraph, index) => (
                <p key={index} className="font-cairo font-normal text-base md:text-lg lg:text-[18px] text-justify text-gray-800 mb-4 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Tags */}
            <div className="text-right mb-6 lg:mb-8">
              <span className="font-cairo font-bold text-lg md:text-xl lg:text-[20px] text-black mb-2 inline-block">
                الوسوم:
              </span>
              <br className="hidden sm:block" />
              <span className="font-cairo font-semibold text-base md:text-lg lg:text-[18px] px-3 py-2 md:px-4 md:py-4 rounded-lg text-[#579BE8] bg-white inline-block border border-[#579BE8]/20">
                {article.category === "الصحة" 
                  ? "#صحة #مياه #نصائح طبية #حياة صحية" 
                  : "#أخبار #مياه #تقنيات #مشاريع تنموية"
                }
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-start gap-3 mb-10 lg:mb-12">
              <button 
                className="px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity min-w-[100px]"
                style={{ 
                  background: 'rgba(169, 206, 248, 0.18)', 
                  border: '1px solid rgba(87, 155, 232, 0.38)' 
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="#579BE8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="font-cairo font-semibold text-sm md:text-base lg:text-[16px] text-[#579BE8]">
                  إعجاب
                </span>
              </button>

              <button 
                className="px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity min-w-[100px]"
                style={{ 
                  background: 'rgba(169, 206, 248, 0.18)', 
                  border: '1px solid rgba(87, 155, 232, 0.38)' 
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="#579BE8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="font-cairo font-semibold text-sm md:text-base lg:text-[16px] text-[#579BE8]">
                  تعليق
                </span>
              </button>

              <button 
                className="px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity min-w-[110px]"
                style={{ 
                  background: 'rgba(169, 206, 248, 0.18)', 
                  border: '1px solid rgba(87, 155, 232, 0.38)' 
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="#579BE8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span className="font-cairo font-semibold text-sm md:text-base lg:text-[16px] text-[#579BE8]">
                  مشاركة
                </span>
              </button>
            </div>

            {/* Author Info */}
            <div className="bg-white rounded-2xl lg:rounded-[24px] shadow-md lg:shadow-[0px_0px_9px_0px_rgba(87,155,232,0.25)] p-6 mb-10 lg:mb-12">
              <div className="flex items-center justify-start gap-4 md:gap-6">
                <div className="relative w-16 h-16 md:w-20 md:h-20 lg:w-[80px] lg:h-[80px] rounded-full border-3 border-[#579BE8] overflow-hidden flex-shrink-0">
                  <Image 
                    src="/person1.jpg" 
                    alt="كاتب" 
                    fill 
                    className="object-cover"
                  />
                </div>
                <div className="text-right flex-1">
                  <h3 className="font-cairo font-semibold text-lg md:text-xl lg:text-[18px] text-[#579BE8] mb-1">
                    {article.author2}
                  </h3>
                  <p className="font-cairo font-semibold text-sm md:text-base lg:text-[14px] text-[#737375]">
                    {article.author2Title}
                  </p>
                </div>
              </div>
            </div>

            {/* Related Articles */}
            <div className="mb-10 lg:mb-12">
              <h2 className="font-cairo font-semibold text-lg md:text-xl lg:text-[20px] text-black text-right mb-6 lg:mb-8">
                مقالات ذات صلة:
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 justify-items-center">
                {relatedArticles.map((relatedArticle, index) => (
                  <div 
                    key={index} 
                    className="w-full max-w-xs sm:max-w-full cursor-pointer"
                    onClick={() => router.push(`/articles/${relatedArticle.id}`)}
                  >
                    <div className="w-full h-[280px] sm:h-[300px] lg:h-[350px] bg-white rounded-xl lg:rounded-[24px] shadow-md lg:shadow-[0px_4px_4px_rgba(0,0,0,0.25)] overflow-hidden hover:shadow-lg transition-shadow hover:scale-[1.02] transition-transform duration-300">
                      <div className="relative w-full h-[140px] sm:h-[160px] lg:h-[200px] overflow-hidden">
                        <Image 
                          src={relatedArticle.imageUrl} 
                          alt={relatedArticle.title} 
                          fill 
                          className="object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4 lg:p-5">
                        <div className="flex justify-end mb-2">
                          <span className="inline-block px-3 py-1 rounded-full bg-[rgba(87,155,232,0.1)] border border-[rgba(87,155,232,0.3)] font-cairo font-semibold text-[10px] text-[#579BE8]">
                            {relatedArticle.category}
                          </span>
                        </div>
                        <h3 className="font-cairo font-semibold text-sm md:text-sm lg:text-[15px] text-right text-[#579BE8] mb-2 whitespace-nowrap overflow-hidden text-ellipsis">
                          {relatedArticle.title}
                        </h3>
                        <p className="font-cairo font-normal text-xs md:text-sm lg:text-[13px] text-right text-[#757575] line-clamp-3">
                          {relatedArticle.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-2">
              <div className="w-8 h-2 lg:w-[40px] lg:h-[12px] rounded-full bg-[#579BE8]"></div>
              <div className="w-2 h-2 lg:w-[12px] lg:h-[12px] rounded-full bg-[rgba(87,155,232,0.5)]"></div>
              <div className="w-2 h-2 lg:w-[12px] lg:h-[12px] rounded-full bg-[rgba(87,155,232,0.5)]"></div>
            </div>
          </div>
        </div>
      </section>

      <AppPromotionSection />
      <CallToActionSection />
      <Footer />
    </main>
  );
};

export default ArticleDetails;