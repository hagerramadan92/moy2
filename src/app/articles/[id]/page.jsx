'use client';

import { useParams, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  FaArrowLeft, 
  FaClock, 
  FaUser, 
  FaCalendarAlt, 
  FaComment, 
  FaShareAlt,
  FaBookmark,
  FaChartLine
} from 'react-icons/fa';
import AppPromotionSection from '@/components/molecules/Drivers/AppPromotionSection';
import CallToActionSection from '@/components/molecules/Drivers/CallToActionSection';
import Footer from '@/components/molecules/common/Footer';
import RelatedArticlesSection from '@/components/molecules/articles/RelatedArticlesSection';

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
    author2: "د. عماد حسن",
    author2Title: "كاتب ومتخصص في مجال المياه والصحة",
    date: "6 ديسمبر 2025",
    readTime: "5 دقائق",
    views: 1250,
    likes: 89,
    comments: 23
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
    views: 980,
    likes: 67,
    comments: 18
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
    views: 2100,
    likes: 145,
    comments: 42
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
    views: 1500,
    likes: 112,
    comments: 31
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
    views: 890,
    likes: 56,
    comments: 15
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
    views: 1100,
    likes: 78,
    comments: 22
  }
];

const ArticleDetails = () => {
  const params = useParams();
  const router = useRouter();
  const { scrollYProgress } = useScroll();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [authorImageError, setAuthorImageError] = useState(false);
  const DEFAULT_IMAGE = "/man.png";
  const DEFAULT_AUTHOR_IMAGE = "/person.png";

  // Get articleId from params, handle both slug and id
  const articleId = params?.id || params?.slug;

  // Debug logging
  useEffect(() => {
    console.log('ArticleDetails - params:', params);
    console.log('ArticleDetails - articleId:', articleId);
  }, [params, articleId]);

  useEffect(() => {
    const fetchArticle = async () => {
      // Wait for params to be available
      if (!params || !articleId) {
        console.log('ArticleDetails - Waiting for params...', { params, articleId });
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Validate articleId
        const validId = String(articleId).trim();
        if (!validId || validId === 'undefined' || validId === 'null' || validId === '') {
          console.error('ArticleDetails - Invalid articleId:', articleId);
          throw new Error('Article ID or slug is required');
        }
        
        console.log('ArticleDetails - Fetching article with ID:', validId);
        
        // Fetch article by slug/id
        const response = await fetch(`/api/articles/${encodeURIComponent(validId)}`);
        const data = await response.json();
        
        console.log('ArticleDetails - API Response:', { status: response.status, success: data.success, hasData: !!data.data, dataKeys: Object.keys(data) });
        
        // Handle different response structures
        let articleData = null;
        if (response.ok) {
          if (data.success && data.data) {
            articleData = data.data;
          } else if (data.id || data.title) {
            // Response is the article object directly
            articleData = data;
          } else if (data.data && !data.success) {
            // Response has data but no success field
            articleData = data.data;
          }
        }
        
        if (articleData) {
          
          // Transform API article to component format
          const transformedArticle = {
            id: articleData.id,
            imageUrl: articleData.featured_image || "/man.png",
            category: articleData.category?.name || "عام",
            title: articleData.title,
            content: articleData.content || articleData.body || articleData.description || "",
            description: articleData.excerpt || articleData.summary || "",
            author: articleData.author?.name || "غير معروف",
            author2: articleData.author?.name || "غير معروف",
            author2Title: articleData.author?.email || "كاتب",
            authorAvatar: articleData.author?.avatar || "/person.png",
            date: articleData.published_at_human || articleData.created_at_human || "",
            readTime: `${articleData.reading_time || 5} دقائق`,
            views: articleData.views_count || 0,
            likes: articleData.likes_count || 0,
            comments: articleData.comments_count || 0,
            tags: articleData.tags || []
          };
          
          setArticle(transformedArticle);
          
          // Fetch related articles
          const relatedResponse = await fetch('/api/articles');
          const relatedData = await relatedResponse.json();
          
          if (relatedResponse.ok && relatedData.success && relatedData.data) {
            const allArticles = relatedData.data.map(apiArticle => ({
              id: apiArticle.id,
              imageUrl: apiArticle.featured_image || "/man.png",
              category: apiArticle.category?.name || "عام",
              title: apiArticle.title,
              description: apiArticle.excerpt || apiArticle.summary || "",
              publisher: apiArticle.author?.name || "غير معروف",
              date: apiArticle.published_at_human || apiArticle.created_at_human || "",
              readTime: `${apiArticle.reading_time || 5} دقائق`,
              views: apiArticle.views_count || 0,
              slug: apiArticle.slug
            }));
            
            const related = allArticles
              .filter(item => 
                item.category === transformedArticle.category && 
                item.id !== transformedArticle.id
              )
              .slice(0, 8);
            
            if (related.length < 8) {
              const otherArticles = allArticles
                .filter(item => 
                  item.category !== transformedArticle.category && 
                  item.id !== transformedArticle.id
                )
                .slice(0, 8 - related.length);
              related.push(...otherArticles);
            }
            
            setRelatedArticles(related);
          }
        } else {
          // If API returns error, provide more context
          const errorMsg = data.message || data.error || `Failed to fetch article (${response.status})`;
          console.error('ArticleDetails - API Error:', {
            status: response.status,
            message: errorMsg,
            data: data
          });
          throw new Error(errorMsg);
        }
      } catch (err) {
        console.error('Error fetching article:', err);
        const errorMessage = err.message || 'حدث خطأ أثناء تحميل المقال';
        setError(errorMessage);
        
        // Only fallback to static data if articleId is a number (ID)
        if (articleId && !isNaN(parseInt(articleId))) {
          const fallbackArticle = allArticles.find(a => a.id === parseInt(articleId)) || allArticles[0];
          if (fallbackArticle) {
            console.log('ArticleDetails - Using fallback article:', fallbackArticle);
            setArticle(fallbackArticle);
            
            const related = allArticles
              .filter(item => item.category === fallbackArticle.category && item.id !== fallbackArticle.id)
              .slice(0, 8);
            setRelatedArticles(related.map(a => ({
              ...a,
              publisher: a.author || a.publisher,
              description: a.description || ''
            })));
            setError(null); // Clear error if fallback works
          }
        }
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have a valid articleId
    if (articleId && String(articleId).trim() && String(articleId).trim() !== 'undefined' && String(articleId).trim() !== 'null') {
      fetchArticle();
    } else if (params && Object.keys(params).length > 0) {
      // If params exist but articleId is invalid
      setError('Article ID or slug is required');
      setLoading(false);
    }
  }, [articleId, params]);

  // Reading progress bar
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#579BE8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل المقال...</p>
        </div>
      </main>
    );
  }

  if (error && !article) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/articles')}
            className="px-6 py-2 bg-[#579BE8] text-white rounded-lg"
          >
            العودة للمقالات
          </button>
        </div>
      </main>
    );
  }

  if (!article) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Reading Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#579BE8] via-[#4a8dd8] to-[#315782] z-50 origin-left shadow-lg shadow-[#579BE8]/30"
        style={{ width: progressWidth }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#579BE8]/10 to-transparent rounded-full blur-3xl -z-0" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tl from-[#315782]/10 to-transparent rounded-full blur-3xl -z-0" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        

          {/* Header Content */}
          <div className="max-w-4xl mx-auto text-center">
            {/* Category Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6 flex justify-center"
            >
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-cairo font-black text-sm shadow-lg backdrop-blur-md transition-all duration-300 bg-gradient-to-r from-sky-500/15 to-blue-600/15 ring-1 ring-sky-200/60">
                {article.category}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-cairo font-black text-2xl md:text-3xl lg:text-4xl text-gray-900 mb-4 leading-tight"
            >
              {article.title}
            </motion.h1>

            {/* Description */}
            {article.description && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="font-cairo font-normal text-base md:text-lg text-gray-600 mb-8 leading-relaxed"
              >
                {article.description}
              </motion.p>
            )}

            {/* Meta Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-10 pb-8 border-b border-gray-200/50"
            >
              <motion.div 
                className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-gradient-to-br from-[#579BE8]/10 to-[#315782]/10 backdrop-blur-sm border border-[#579BE8]/20"
                whileHover={{ scale: 1.05 }}
              >
                <div className="p-1.5 rounded-lg bg-[#579BE8]/20">
                  <FaUser className="text-[#579BE8] text-sm" />
                </div>
                <span className="font-cairo font-bold text-gray-700">{article.author}</span>
              </motion.div>
              
              <motion.div 
                className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-gradient-to-br from-[#579BE8]/10 to-[#315782]/10 backdrop-blur-sm border border-[#579BE8]/20"
                whileHover={{ scale: 1.05 }}
              >
                <div className="p-1.5 rounded-lg bg-[#579BE8]/20">
                  <FaCalendarAlt className="text-[#579BE8] text-sm" />
                </div>
                <span className="font-cairo font-bold text-gray-700">{article.date}</span>
              </motion.div>
              
              <motion.div 
                className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-gradient-to-br from-[#579BE8]/10 to-[#315782]/10 backdrop-blur-sm border border-[#579BE8]/20"
                whileHover={{ scale: 1.05 }}
              >
                <div className="p-1.5 rounded-lg bg-[#579BE8]/20">
                  <FaClock className="text-[#579BE8] text-sm" />
                </div>
                <span className="font-cairo font-bold text-gray-700">{article.readTime}</span>
              </motion.div>
              
              <motion.div 
                className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-gradient-to-br from-[#579BE8]/10 to-[#315782]/10 backdrop-blur-sm border border-[#579BE8]/20"
                whileHover={{ scale: 1.05 }}
              >
                <div className="p-1.5 rounded-lg bg-[#579BE8]/20">
                  <FaChartLine className="text-[#579BE8] text-sm" />
                </div>
                <span className="font-cairo font-bold text-gray-700">{article.views.toLocaleString()} مشاهدة</span>
              </motion.div>
            </motion.div>

            {/* Featured Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="relative w-ful
              l h-[350px] md:h-[450px] lg:h-[550px] 
              rounded-xl overflow-hidden mb-0 group"
            >
              <Image
                src={imageError ? DEFAULT_IMAGE : (article.imageUrl || DEFAULT_IMAGE)}
                alt={article.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                onError={() => setImageError(true)}
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40
               via-black/10 to-transparent opacity-0 group-hover:opacity-100 
               transition-opacity duration-500" />
             
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="relative pb-12 md:pb-16 pt-0 -mt-8">
        <div className="max-w-7xl mx-auto px-3">
          {/* Main Content */}
          <motion.article
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md
             p-8  mb-12   relative overflow-hidden"
          >
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#579BE8]/5 to-transparent rounded-full blur-3xl -z-0" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#315782]/5 to-transparent rounded-full blur-3xl -z-0" />
            
            <div className="relative z-10 space-y-8 mb-12">
              {article.content ? (
                typeof article.content === 'string' ? (
                  article.content.split('\n').map((paragraph, index) => (
                    paragraph.trim() && (
                      <motion.p
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="font-cairo font-normal text-sm md:text-base text-gray-600 leading-relaxed text-justify"
                        dangerouslySetInnerHTML={{ __html: paragraph }}
                      />
                    )
                  ))
                ) : (
                  <div 
                    className="prose prose-lg max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />
                )
              ) : (
                <p className="font-cairo font-normal text-sm md:text-base text-gray-600 leading-relaxed text-justify">
                  لا يوجد محتوى متاح لهذا المقال.
                </p>
              )}
            </div>

            {/* Tags */}
            <div className="border-t border-gray-200/50 pt-6 mb-8">
              <h3 className="font-cairo font-semibold text-base text-gray-600 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-gradient-to-b from-[#579BE8] to-[#315782] rounded-full"></span>
                الوسوم:
              </h3>
              <div className="flex flex-wrap gap-3">
                {article.tags && article.tags.length > 0 ? (
                  article.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="group font-cairo font-medium text-sm cursor-pointer transition-all duration-300 text-[#579BE8] hover:text-[#315782] hover:scale-105"
                    >
                      #{tag}
                    </span>
                  ))
                ) : (
                  (article.category === "الصحة" 
                    ? ["#صحة", "#مياه", "#نصائح طبية", "#حياة صحية"]
                    : ["#أخبار", "#مياه", "#تقنيات", "#مشاريع تنموية"]
                  ).map((tag, idx) => (
                    <span
                      key={idx}
                      className="group font-cairo font-medium text-sm cursor-pointer transition-all duration-300 text-[#579BE8] hover:text-[#315782] hover:scale-105"
                    >
                      {tag}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-gray-200/50">
              <button className="group flex items-center gap-2.5 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#579BE8]/10 to-[#315782]/10 hover:from-[#579BE8]/20 hover:to-[#315782]/20 text-[#579BE8] font-cairo font-semibold text-sm transition-all duration-300 border border-[#579BE8]/20 hover:border-[#579BE8]/40 hover:shadow-md">
                <FaComment className="text-[#579BE8] group-hover:scale-110 transition-transform" />
                <span>{article.comments}</span>
              </button>

              <button className="group flex items-center gap-2.5 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#579BE8]/10 to-[#315782]/10 hover:from-[#579BE8]/20 hover:to-[#315782]/20 text-[#579BE8] font-cairo font-semibold text-sm transition-all duration-300 border border-[#579BE8]/20 hover:border-[#579BE8]/40 hover:shadow-md">
                <FaShareAlt className="text-[#579BE8] group-hover:scale-110 transition-transform" />
                <span>مشاركة</span>
              </button>

              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`ml-auto group flex items-center gap-2.5 px-5 py-2.5 rounded-lg font-cairo font-semibold text-sm transition-all duration-300 ${
                  isBookmarked 
                    ? 'bg-gradient-to-r from-[#579BE8] to-[#315782] text-white shadow-lg hover:shadow-xl ring-2 ring-[#579BE8]/30' 
                    : 'bg-gradient-to-r from-[#579BE8]/10 to-[#315782]/10 hover:from-[#579BE8]/20 hover:to-[#315782]/20 text-[#579BE8] border border-[#579BE8]/20 hover:border-[#579BE8]/40 hover:shadow-md'
                }`}
              >
                <FaBookmark className={isBookmarked ? 'fill-current' : ''} />
                <span>{isBookmarked ? 'محفوظ' : 'حفظ'}</span>
              </button>
            </div>
          </motion.article>

          {/* Author Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 mb-12 border border-gray-200/50 shadow-md">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-[#579BE8]/20 flex-shrink-0">
              <Image
                src={authorImageError ? DEFAULT_AUTHOR_IMAGE : (article.authorAvatar || DEFAULT_AUTHOR_IMAGE)}
                alt={article.author2}
                fill
                className="object-cover"
                onError={() => setAuthorImageError(true)}
              />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-cairo font-bold text-lg text-gray-900 mb-1 truncate">
                  {article.author2}
                </h3>
                <p className="font-cairo font-medium text-sm text-gray-600 mb-3 line-clamp-1">
                  {article.author2Title}
                </p>
                <button className="px-5 py-2 bg-gradient-to-r from-[#579BE8] to-[#315782] text-white rounded-lg font-cairo font-semibold text-sm hover:from-[#4788d5] hover:to-[#2a4a6f] transition-all duration-300 shadow-sm hover:shadow-md">
                  متابعة
                </button>
              </div>
            </div>
          </div>

          {/* Related Articles */}
          <RelatedArticlesSection articles={relatedArticles} />
        </div>
      </section>

      <AppPromotionSection />
      <CallToActionSection />
      <Footer />
    </main>
  );
};

export default ArticleDetails;
