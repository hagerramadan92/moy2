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
  FaChartLine,
  FaHeart
} from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import AppPromotionSection from '@/components/molecules/Drivers/AppPromotionSection';
import CallToActionSection from '@/components/molecules/Drivers/CallToActionSection';
import Footer from '@/components/molecules/common/Footer';
import RelatedArticlesSection from '@/components/molecules/articles/RelatedArticlesSection';
import toast from 'react-hot-toast';

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
  const authContext = useAuth();
  const user = authContext?.user || null;
  const isLoggedIn = !!user;
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentsTotal, setCommentsTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [error, setError] = useState(null);
  const [commentForm, setCommentForm] = useState({
    content: '',
    guest_name: '',
    guest_email: ''
  });
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState(null);
  const [commentSuccess, setCommentSuccess] = useState(false);
  const [commentSuccessMessage, setCommentSuccessMessage] = useState('');
  const [newCommentId, setNewCommentId] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [authorImageError, setAuthorImageError] = useState(false);
  const DEFAULT_IMAGE = "/man.png";
  const DEFAULT_AUTHOR_IMAGE = "/person.png";

  // Get slug from params (the route uses [id] but it's actually a slug)
  const articleSlug = params?.id || params?.slug;

  // Debug logging
  useEffect(() => {
    console.log('ArticleDetails - params:', params);
    console.log('ArticleDetails - articleSlug:', articleSlug);
  }, [params, articleSlug]);

  useEffect(() => {
    const fetchArticle = async () => {
      // Wait for params to be available
      if (!params || !articleSlug) {
        console.log('ArticleDetails - Waiting for params...', { params, articleSlug });
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Validate slug
        const validSlug = String(articleSlug).trim();
        if (!validSlug || validSlug === 'undefined' || validSlug === 'null' || validSlug === '') {
          console.error('ArticleDetails - Invalid article slug:', articleSlug);
          throw new Error('Article slug is required');
        }
        
        console.log('ArticleDetails - Fetching article with slug:', validSlug);
        
        // Fetch article by slug
        const response = await fetch(`/api/articles/${encodeURIComponent(validSlug)}`);
        
        // Get response text first to handle both JSON and non-JSON responses
        const responseText = await response.text();
        let data = {};
        
        // Try to parse JSON response
        try {
          if (responseText && responseText.trim()) {
            data = JSON.parse(responseText);
          }
        } catch (parseError) {
          console.error('ArticleDetails - Failed to parse JSON response:', {
            error: parseError,
            responseText: responseText.substring(0, 200),
            status: response.status
          });
          
          // If response is not JSON and status is not ok, throw error
          if (!response.ok) {
            throw new Error(`فشل تحميل المقال (${response.status}): ${responseText.substring(0, 100)}`);
          }
        }
        
        // Check if response is ok before processing
        if (!response.ok && response.status !== 200) {
          // Build error message from various sources
          let errorMsg = null;
          
          if (data && typeof data === 'object' && Object.keys(data).length > 0) {
            errorMsg = 
              data?.message || 
              data?.error?.message ||
              (typeof data?.error === 'string' ? data.error : null) ||
              data?.errors?.message ||
              data?.error ||
              JSON.stringify(data);
          } else if (responseText && responseText.trim()) {
            errorMsg = responseText.substring(0, 200);
          } else {
            errorMsg = `فشل تحميل المقال (${response.status} ${response.statusText || ''})`;
          }
          
          console.error('ArticleDetails - HTTP Error Details:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            errorData: data,
            errorDataType: typeof data,
            errorDataKeys: data ? Object.keys(data) : [],
            errorDataString: data ? JSON.stringify(data) : 'null',
            responseText: responseText ? responseText.substring(0, 500) : 'empty',
            responseTextLength: responseText?.length || 0,
            finalErrorMessage: errorMsg
          });
          
          throw new Error(errorMsg || `فشل تحميل المقال (${response.status})`);
        }
        
        console.log('ArticleDetails - API Response:', { 
          status: response.status, 
          ok: response.ok,
          success: data?.success, 
          hasData: !!data?.data, 
          hasId: !!data?.id,
          hasTitle: !!data?.title,
          dataKeys: Object.keys(data || {}),
          fullData: data
        });
        
        // Handle different response structures
        let articleData = null;
        
        // Check if API returned success=false
        if (data?.success === false) {
          const errorMsg = 
            data?.message || 
            data?.error?.message ||
            data?.error ||
            (typeof data?.error === 'string' ? data.error : null) ||
            'فشل تحميل المقال';
          console.error('ArticleDetails - API returned error:', errorMsg, data);
          throw new Error(errorMsg);
        }
        
        // Extract article data from response
        if (data?.success === true && data?.data) {
          // Standard structure: { success: true, data: {...} }
            articleData = data.data;
        } else if (data?.id || data?.title) {
            // Response is the article object directly
            articleData = data;
        } else if (data?.data) {
          // Response has data field
            articleData = data.data;
        }
        
        if (articleData && (articleData.id || articleData.title)) {
          
          // Transform API article to component format
          const transformedArticle = {
            id: articleData.id,
            imageUrl: articleData.featured_image || "/man.png",
            category: articleData.category?.name || "عام",
            title: articleData.title,
            content: articleData.meta_description || articleData.content || articleData.body || articleData.description || "",
            meta_description: articleData.meta_description || "",
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
          setLikesCount(transformedArticle.likes || 0);
          // Initialize comments total with article's comment count
          setCommentsTotal(transformedArticle.comments || 0);
          
          // Check if article is bookmarked
          try {
            const bookmarks = JSON.parse(localStorage.getItem('bookmarkedArticles') || '[]');
            setIsBookmarked(bookmarks.includes(transformedArticle.id));
          } catch (err) {
            console.error('Error checking bookmarks:', err);
          }
          
          // Don't fetch comments automatically - only fetch when user clicks comments button
          
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
          // If no article data was extracted, provide detailed error
          const errorMsg = 
            data?.message || 
            data?.error?.message ||
            data?.error ||
            (typeof data?.error === 'string' ? data.error : null) ||
            data?.errors?.message ||
            'المقال غير موجود أو البيانات غير صحيحة';
          
          console.error('ArticleDetails - No article data extracted:', {
            status: response.status,
            ok: response.ok,
            message: errorMsg,
            fullData: data,
            dataKeys: Object.keys(data || {}),
            hasData: !!data,
            articleData: articleData,
            dataSuccess: data?.success,
            dataHasData: !!data?.data,
            dataHasId: !!data?.id,
            dataHasTitle: !!data?.title
          });
          
          throw new Error(errorMsg || 'فشل تحميل المقال');
        }
      } catch (err) {
        console.error('Error fetching article:', err);
        const errorMessage = err.message || 'حدث خطأ أثناء تحميل المقال';
        setError(errorMessage);
        
        // Only fallback to static data if slug matches (for testing)
        if (articleSlug) {
          const fallbackArticle = allArticles.find(a => a.id === parseInt(articleSlug)) || allArticles[0];
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

    // Only fetch if we have a valid slug
    if (articleSlug && String(articleSlug).trim() && String(articleSlug).trim() !== 'undefined' && String(articleSlug).trim() !== 'null') {
      fetchArticle();
    } else if (params && Object.keys(params).length > 0) {
      // If params exist but slug is invalid
      setError('Article slug is required');
      setLoading(false);
    }
  }, [articleSlug, params]);

  // Reading progress bar
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  // Skeleton Components
  const ArticleDetailsSkeleton = () => (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section Skeleton */}
      <section className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          <div className="max-w-7xl mx-auto text-center">
            {/* Category Badge Skeleton */}
            <div className="mb-6 flex justify-center">
              <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
            </div>

            {/* Title Skeleton */}
            <div className="mb-4 space-y-3">
              <div className="h-8 md:h-10 lg:h-12 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse mx-auto"></div>
              <div className="h-8 md:h-10 lg:h-12 w-5/6 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse mx-auto"></div>
            </div>

            {/* Description Skeleton */}
            <div className="mb-8 space-y-2">
              <div className="h-5 w-full max-w-3xl bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse mx-auto"></div>
              <div className="h-5 w-4/5 max-w-3xl bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse mx-auto"></div>
            </div>

            {/* Meta Info Skeleton */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-10 pb-8 border-b border-gray-200/50">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
              ))}
            </div>

            {/* Featured Image Skeleton */}
            <div className="relative w-full h-[350px] md:h-[450px] lg:h-[550px] rounded-xl overflow-hidden mb-0 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Content Section Skeleton */}
      <section className="relative pb-12 md:pb-16 pt-0 -mt-8">
        <div className="max-w-7xl mx-auto px-3">
          {/* Main Content Skeleton */}
          <article className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-8 mb-12 relative overflow-hidden">
            <div className="relative z-10 space-y-8 mb-12">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              ))}
            </div>

            {/* Tags Skeleton */}
            <div className="border-t border-gray-200/50 pt-6 mb-8">
              <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-4"></div>
              <div className="flex flex-wrap gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                ))}
              </div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-gray-200/50">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </article>

          {/* Author Card Skeleton */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 mb-12 border border-gray-200/50 shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse flex-shrink-0"></div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3"></div>
                <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Related Articles Skeleton */}
          <div className="mb-12">
            <div className="h-7 w-40 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200">
                  <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                  <div className="p-4">
                    <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mb-2"></div>
                    <div className="h-5 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-2"></div>
                    <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <AppPromotionSection />
      <CallToActionSection />
      <Footer />
    </main>
  );

  if (loading) {
    return <ArticleDetailsSkeleton />;
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
          <div className="max-w-7xl mx-auto text-center">
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
              <button
                onClick={async () => {
                  try {
                    // Use article ID for like API (not slug)
                    if (!article || !article.id) {
                      console.error('Article ID not found');
                      return;
                    }
                    
                    // Get access token if available
                    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
                    const headers = {
                      'Content-Type': 'application/json',
                      'Accept': 'application/json',
                    };
                    
                    if (token) {
                      headers['Authorization'] = `Bearer ${token}`;
                    }
                    
                    // Call the like API with article ID
                    const response = await fetch(`/api/articles/${article.id}/like`, {
                      method: 'POST',
                      headers: headers,
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok && data.success) {
                      // Toggle like state
                      setIsLiked(!isLiked);
                      
                      // Update count from API response if available
                      if (data.data?.likes_count !== undefined) {
                        setLikesCount(data.data.likes_count);
                      } else if (data.likes_count !== undefined) {
                        setLikesCount(data.likes_count);
                      } else {
                        // Fallback: update count locally
                        setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
                      }
                    } else {
                      console.error('Failed to like article:', data.message || data.error);
                    }
                  } catch (error) {
                    console.error('Error liking article:', error);
                  }
                }}
                className={`group flex items-center gap-2.5 px-5 py-2.5 rounded-lg font-cairo font-semibold text-sm transition-all duration-300 border hover:shadow-md ${
                  isLiked 
                    ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-600 border-red-500/40 hover:from-red-500/30 hover:to-pink-500/30' 
                    : 'bg-gradient-to-r from-[#579BE8]/10 to-[#315782]/10 hover:from-[#579BE8]/20 hover:to-[#315782]/20 text-[#579BE8] border-[#579BE8]/20 hover:border-[#579BE8]/40'
                }`}
              >
                <FaHeart className={`${isLiked ? 'fill-current text-red-600' : 'text-[#579BE8]'} group-hover:scale-110 transition-transform`} />
                <span>{likesCount}</span>
              </button>

              <button 
                onClick={async () => {
                  if (!showComments && comments.length === 0) {
                    // Fetch comments when first clicked
                    try {
                      setLoadingComments(true);
                      // Use article ID for comments API
                      const commentsResponse = await fetch(`/api/articles/${article.id}/comments`);
                      const commentsData = await commentsResponse.json();
                      
                      if (commentsResponse.ok && commentsData.success && commentsData.data) {
                        setComments(Array.isArray(commentsData.data) ? commentsData.data : []);
                        // Update total count from meta if available
                        if (commentsData.meta && commentsData.meta.total !== undefined) {
                          setCommentsTotal(commentsData.meta.total);
                        } else {
                          setCommentsTotal(Array.isArray(commentsData.data) ? commentsData.data.length : 0);
                        }
                      } else if (Array.isArray(commentsData)) {
                        setComments(commentsData);
                        setCommentsTotal(commentsData.length);
                      } else {
                        setComments([]);
                        setCommentsTotal(0);
                      }
                    } catch (commentsError) {
                      console.error('Error fetching comments:', commentsError);
                      setComments([]);
                    } finally {
                      setLoadingComments(false);
                    }
                  }
                  setShowComments(!showComments);
                  setShowAllComments(false); // Reset show all when toggling
                }}
                className={`group flex items-center gap-2.5 px-5 py-2.5 rounded-lg font-cairo font-semibold text-sm transition-all duration-300 border hover:shadow-md ${
                  showComments 
                    ? 'bg-gradient-to-r from-[#579BE8] to-[#315782] text-white border-[#579BE8]/40' 
                    : 'bg-gradient-to-r from-[#579BE8]/10 to-[#315782]/10 hover:from-[#579BE8]/20 hover:to-[#315782]/20 text-[#579BE8] border-[#579BE8]/20 hover:border-[#579BE8]/40'
                }`}
              >
                <FaComment className={`${showComments ? 'text-white' : 'text-[#579BE8]'} group-hover:scale-110 transition-transform`} />
                <span>{commentsTotal > 0 ? commentsTotal : article.comments}</span>
              </button>

              <button 
                onClick={async (e) => {
                  const articleUrl = typeof window !== 'undefined' ? window.location.href : '';
                  const shareData = {
                    title: article.title,
                    text: article.description || article.title,
                    url: articleUrl,
                  };

                  try {
                    // Try Web Share API if available
                    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                      await navigator.share(shareData);
                    } else {
                      // Fallback: Copy to clipboard
                      await navigator.clipboard.writeText(articleUrl);
                      // Show temporary success message
                      const button = e.currentTarget;
                      const span = button.querySelector('span');
                      if (span) {
                        const originalText = span.textContent;
                        span.textContent = 'تم النسخ!';
                        button.classList.add('bg-green-50', 'text-green-600');
                        setTimeout(() => {
                          span.textContent = originalText;
                          button.classList.remove('bg-green-50', 'text-green-600');
                        }, 2000);
                      }
                    }
                  } catch (err) {
                    // If share fails, try clipboard as fallback
                    if (err.name !== 'AbortError') {
                      try {
                        await navigator.clipboard.writeText(articleUrl);
                        const button = e.currentTarget;
                        const span = button.querySelector('span');
                        if (span) {
                          const originalText = span.textContent;
                          span.textContent = 'تم النسخ!';
                          button.classList.add('bg-green-50', 'text-green-600');
                          setTimeout(() => {
                            span.textContent = originalText;
                            button.classList.remove('bg-green-50', 'text-green-600');
                          }, 2000);
                        }
                      } catch (clipboardErr) {
                        console.error('Failed to copy to clipboard:', clipboardErr);
                        toast.error('فشل مشاركة الرابط');
                      }
                    }
                  }
                }}
                className="group flex items-center gap-2.5 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#579BE8]/10 to-[#315782]/10 hover:from-[#579BE8]/20 hover:to-[#315782]/20 text-[#579BE8] font-cairo font-semibold text-sm transition-all duration-300 border border-[#579BE8]/20 hover:border-[#579BE8]/40 hover:shadow-md"
              >
                <FaShareAlt className="text-[#579BE8] group-hover:scale-110 transition-transform" />
                <span>مشاركة</span>
              </button>

              <button
                onClick={async () => {
                  if (!article || !article.id) return;
                  
                  const newBookmarkState = !isBookmarked;
                  
                  // If user is logged in, save to API (if endpoint exists)
                  if (isLoggedIn) {
                    try {
                      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
                      if (token) {
                        // Try to save bookmark via API (if endpoint exists)
                        // For now, we'll just save locally
                        // You can add API call here if bookmark endpoint exists
                      }
                    } catch (err) {
                      console.error('Error saving bookmark:', err);
                    }
                  }
                  
                  // Save to localStorage
                  try {
                    const bookmarks = JSON.parse(localStorage.getItem('bookmarkedArticles') || '[]');
                    if (newBookmarkState) {
                      // Add to bookmarks
                      if (!bookmarks.includes(article.id)) {
                        bookmarks.push(article.id);
                        localStorage.setItem('bookmarkedArticles', JSON.stringify(bookmarks));
                      }
                    } else {
                      // Remove from bookmarks
                      const filtered = bookmarks.filter(id => id !== article.id);
                      localStorage.setItem('bookmarkedArticles', JSON.stringify(filtered));
                    }
                    setIsBookmarked(newBookmarkState);
                  } catch (err) {
                    console.error('Error saving bookmark to localStorage:', err);
                  }
                }}
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

          {/* Comments Section */}
          {showComments && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 md:p-8 mb-12 border border-gray-200/50 shadow-md"
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200/50">
                <FaComment className="text-[#579BE8] text-xl" />
                <h3 className="font-cairo font-bold text-xl text-gray-900">
                  التعليقات ({commentsTotal > 0 ? commentsTotal : comments.length})
                </h3>
              </div>

              {/* Comment Form */}
              <div className="mb-8 pb-6 border-b border-gray-200/50">
                <h4 className="font-cairo font-semibold text-lg text-gray-900 mb-4">أضف تعليقك</h4>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setSubmittingComment(true);
                    setCommentError(null);
                    setCommentSuccess(false);

                    try {
                      // Get CSRF token if available
                      let csrfToken = null;
                      if (typeof document !== 'undefined') {
                        const metaToken = document.querySelector('meta[name="csrf-token"]');
                        if (metaToken) {
                          csrfToken = metaToken.getAttribute('content');
                        }
                      }

                      const headers = {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                      };

                      if (csrfToken) {
                        headers['X-CSRF-TOKEN'] = csrfToken;
                        headers['X-XSRF-TOKEN'] = csrfToken;
                      }

                      // Prepare comment body - only include guest_name and guest_email if not logged in
                      const commentBody = {
                        content: commentForm.content.trim(),
                      };
                      
                      // Only add guest_name and guest_email if user is not logged in
                      if (!isLoggedIn) {
                        if (commentForm.guest_name.trim()) {
                          commentBody.guest_name = commentForm.guest_name.trim();
                        }
                        if (commentForm.guest_email.trim()) {
                          commentBody.guest_email = commentForm.guest_email.trim();
                        }
                      }

                      const response = await fetch(`/api/articles/${article.id}/comments`, {
                        method: 'POST',
                        headers: headers,
                        body: JSON.stringify(commentBody),
                      });

                      const data = await response.json();

                      if (response.ok && data.success !== false) {
                        // Show success message from API if available
                        const successMessage = data.message || 'تم إضافة التعليق بنجاح!';
                        setCommentSuccessMessage(successMessage);
                        setCommentSuccess(true);
                        
                        // Reset form
                        setCommentForm({ 
                          content: '', 
                          guest_name: isLoggedIn ? '' : '', 
                          guest_email: '' 
                        });
                        
                        // Don't add the comment immediately since it's pending review
                        // The comment will appear after it's approved and the user refreshes

                        // Hide success message after 5 seconds
                        setTimeout(() => {
                          setCommentSuccess(false);
                          setCommentSuccessMessage('');
                        }, 5000);
                      } else {
                        const errorMsg = data.message || data.error || 'فشل إضافة التعليق';
                        setCommentError(errorMsg);
                      }
                    } catch (err) {
                      console.error('Error submitting comment:', err);
                      setCommentError('حدث خطأ أثناء إضافة التعليق');
                    } finally {
                      setSubmittingComment(false);
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <textarea
                      value={commentForm.content}
                      onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                      placeholder="اكتب تعليقك هنا..."
                      required
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#579BE8] focus:border-[#579BE8] outline-none font-cairo text-sm md:text-base text-gray-700 resize-none"
                    />
                  </div>

                  {!isLoggedIn && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          value={commentForm.guest_name}
                          onChange={(e) => setCommentForm({ ...commentForm, guest_name: e.target.value })}
                          placeholder="الاسم"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#579BE8] focus:border-[#579BE8] outline-none font-cairo text-sm md:text-base text-gray-700"
                        />
                      </div>
                      <div>
                        <input
                          type="email"
                          value={commentForm.guest_email}
                          onChange={(e) => setCommentForm({ ...commentForm, guest_email: e.target.value })}
                          placeholder="البريد الإلكتروني *"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#579BE8] focus:border-[#579BE8] outline-none font-cairo text-sm md:text-base text-gray-700"
                        />
                      </div>
                    </div>
                  )}

                  {commentError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="font-cairo text-sm text-red-600">{commentError}</p>
                    </div>
                  )}

                  {commentSuccess && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="font-cairo text-sm text-green-600">{commentSuccessMessage || 'تم إضافة التعليق بنجاح!'}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={
                      submittingComment || 
                      !commentForm.content.trim() || 
                      (!isLoggedIn && (!commentForm.guest_name.trim() || !commentForm.guest_email.trim()))
                    }
                    className={`w-full md:w-auto px-6 py-3 bg-gradient-to-r from-[#579BE8] to-[#315782] text-white font-cairo font-semibold text-sm rounded-lg hover:from-[#4788d5] hover:to-[#2a4a6f] transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                  >
                    {submittingComment ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>جاري الإرسال...</span>
                      </>
                    ) : (
                      <span>إرسال التعليق</span>
                    )}
                  </button>
                </form>
              </div>

              {loadingComments ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-12 h-12 border-4 border-[#579BE8] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-12">
                  <FaComment className="text-gray-400 text-4xl mx-auto mb-4" />
                  <p className="font-cairo font-medium text-gray-600">لا توجد تعليقات بعد</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {(showAllComments ? comments : comments.slice(0, 3)).map((comment) => (
                    <motion.div
                      key={comment.id}
                      id={`comment-${comment.id}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`border-b border-gray-200/50 pb-6 last:border-b-0 last:pb-0 transition-all duration-500 ${
                        newCommentId === comment.id ? 'bg-blue-50/50 border-l-4 border-l-[#579BE8] pl-4' : ''
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#579BE8]/20 to-[#315782]/20 flex items-center justify-center flex-shrink-0">
                          <FaUser className="text-[#579BE8] text-lg" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-cairo font-bold text-sm text-gray-900">
                              {comment.is_guest && comment.guest_name ? comment.guest_name : 'مستخدم'}
                            </span>
                            {comment.is_edited && (
                              <span className="text-xs text-gray-700 font-cairo">(تم التعديل)</span>
                            )}
                          </div>
                          <p className="font-cairo font-normal text-sm md:text-base text-gray-700 leading-relaxed mb-3">
                            {comment.content}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-700">
                            <span className="font-cairo">{comment.created_at_human}</span>
                            {comment.likes_count > 0 && (
                              <div className="flex items-center gap-1">
                                <FaHeart className="text-red-600 text-xs" />
                                <span className="font-cairo">{comment.likes_count}</span>
                              </div>
                            )}
                            {comment.replies_count > 0 && (
                              <div className="flex items-center gap-1">
                                <FaComment className="text-[#579BE8] text-xs" />
                                <span className="font-cairo">{comment.replies_count} رد</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {comments.length > 3 && !showAllComments && (
                    <div className="pt-4">
                      <button
                        onClick={() => setShowAllComments(true)}
                        className="w-full py-3 px-4 bg-gradient-to-r from-[#579BE8]/10 to-[#315782]/10 hover:from-[#579BE8]/20 hover:to-[#315782]/20 text-[#579BE8] font-cairo font-semibold text-sm rounded-lg border border-[#579BE8]/20 hover:border-[#579BE8]/40 transition-all duration-300 hover:shadow-md"
                      >
                        عرض المزيد ({comments.length - 3} تعليق إضافي)
                      </button>
                    </div>
                  )}

                  {showAllComments && comments.length > 3 && (
                    <div className="pt-4">
                      <button
                        onClick={() => setShowAllComments(false)}
                        className="w-full py-3 px-4 bg-gradient-to-r from-[#579BE8]/10 to-[#315782]/10 hover:from-[#579BE8]/20 hover:to-[#315782]/20 text-[#579BE8] font-cairo font-semibold text-sm rounded-lg border border-[#579BE8]/20 hover:border-[#579BE8]/40 transition-all duration-300 hover:shadow-md"
                      >
                        عرض أقل
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Author Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 mb-12 border border-gray-200/50 shadow-md">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-[#579BE8]/20 flex-shrink-0 bg-gradient-to-br from-[#579BE8]/10 to-[#315782]/10 flex items-center justify-center">
              {authorImageError || !article.authorAvatar ? (
                <FaUser className="w-8 h-8 text-[#579BE8]" />
              ) : (
              <Image
                  src={article.authorAvatar}
                alt={article.author2}
                fill
                className="object-cover"
                onError={() => setAuthorImageError(true)}
              />
              )}
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
