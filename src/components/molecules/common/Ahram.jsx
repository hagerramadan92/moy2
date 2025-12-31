'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { FaCalendarAlt, FaUser, FaNewspaper, FaHeartbeat, FaBook, FaClock } from 'react-icons/fa';
import RelatedArticlesSection from '@/components/molecules/articles/RelatedArticlesSection';

const ARTICLES_DATA = [
  {
    id: 1,
    imageUrl: "/man2.jpg",
    category: "الصحة",
    title: "فوائد شرب الماء للجسم والصحة العامة",
    description: "تعرف على أهمية شرب الماء يومياً وكيف يؤثر على صحتك ونشاطك اليومي. الماء هو أساس الحياة وضروري لجميع وظائف الجسم الحيوية. يساعد في تحسين عملية الهضم وتنظيم درجة حرارة الجسم وطرد السموم من الجسم. كما أنه يحافظ على نضارة البشرة ويمنحك الطاقة والنشاط طوال اليوم. اكتشف المزيد عن الكمية المناسبة التي يجب شربها يومياً للحفاظ على صحتك المثلى.",
    publisher: "د. عماد حسن",
    date: "6 ديسمبر 2025",
    readTime: "5 دقائق",
  },
  {
    id: 2,
    imageUrl: "/man.png",
    category: "الصحة",
    title: "كيفية الحفاظ على ترطيب الجسم في الصيف",
    description: "نصائح مهمة للحفاظ على مستوى الماء في الجسم خلال الأيام الحارة. في فصل الصيف، يفقد الجسم كميات كبيرة من الماء عبر التعرق، مما قد يؤدي إلى الجفاف. تعلم كيفية التعرف على علامات الجفاف وكيفية الوقاية منه. اكتشف أفضل الأوقات لشرب الماء وأهمية تناول الفواكه والخضروات الغنية بالماء. احصل على نصائح عملية للحفاظ على ترطيب جسمك طوال اليوم حتى في أكثر الأيام حرارة.",
    publisher: "د. سارة أحمد",
    date: "5 ديسمبر 2025",
    readTime: "4 دقائق",
  },
  {
    id: 3,
    imageUrl: "/man.png",
    category: "اخبار",
    title: "تطورات جديدة في تقنيات تحلية المياه",
    description: "أحدث الابتكارات في مجال تحلية المياه وتأثيرها على البيئة والمجتمع. تشهد تقنيات تحلية المياه تطوراً هائلاً في السنوات الأخيرة مع ظهور تقنيات جديدة أكثر كفاءة وأقل استهلاكاً للطاقة. تعرف على أحدث المشاريع في هذا المجال وكيف تساهم في حل مشكلة نقص المياه في المناطق الجافة. اكتشف كيف يمكن لهذه التقنيات أن تحدث ثورة في مجال إمدادات المياه وتوفر مصادر مياه مستدامة للمستقبل.",
    publisher: "م. خالد محمد",
    date: "4 ديسمبر 2025",
    readTime: "6 دقائق",
  },
  {
    id: 4,
    imageUrl: "/man.png",
    category: "اخبار",
    title: "مؤتمر المياه الدولي 2025",
    description: "أهم ما تم مناقشته في مؤتمر المياه الدولي لهذا العام والتوصيات. جمع المؤتمر الدولي للمياه هذا العام أبرز الخبراء والباحثين من حول العالم لمناقشة التحديات والفرص في قطاع المياه. تم التركيز على قضايا الاستدامة وتغير المناخ وإدارة الموارد المائية. اكتشف أهم التوصيات التي خرج بها المؤتمر وكيف يمكن تطبيقها على المستوى المحلي والدولي لضمان مستقبل أفضل للمياه.",
    publisher: "أحمد علي",
    date: "3 ديسمبر 2025",
    readTime: "7 دقائق",
  },
  {
    id: 5,
    imageUrl: "/man.png",
    category: "الصحة",
    title: "أضرار قلة شرب الماء على الكلى",
    description: "كيف تؤثر قلة المياه على وظائف الكلى والصحة العامة للإنسان. الكلى هي أحد أهم أعضاء الجسم المسؤولة عن تنقية الدم وإزالة السموم. عندما لا تشرب كمية كافية من الماء، تتعرض الكلى للإجهاد وقد تتراكم السموم في الجسم. تعرف على العلامات التحذيرية التي تشير إلى أنك لا تشرب ما يكفي من الماء وكيف يمكن أن يؤثر ذلك على صحة كليتيك على المدى الطويل. اكتشف أهمية الماء في الوقاية من حصوات الكلى وأمراض الكلى المزمنة.",
    publisher: "د. يوسف كمال",
    date: "2 ديسمبر 2025",
    readTime: "5 دقائق",
  },
  {
    id: 6,
    imageUrl: "/man.png",
    category: "اخبار",
    title: "مشروع جديد لتحسين شبكة المياه",
    description: "تفاصيل المشروع الجديد لتحسين جودة وتوزيع المياه في المدينة. أعلنت الجهات المختصة عن إطلاق مشروع ضخم لتطوير وتحسين شبكة توزيع المياه في المدينة. يشمل المشروع تحديث البنية التحتية القديمة وتركيب أنظمة حديثة لضمان جودة المياه وتقليل الفاقد. تعرف على مراحل المشروع والمناطق التي سيتم تغطيتها والفوائد المتوقعة للمواطنين. اكتشف كيف سيساهم هذا المشروع في تحسين جودة الحياة وتوفير مياه شرب آمنة للجميع.",
    publisher: "مريم سعيد",
    date: "1 ديسمبر 2025",
    readTime: "4 دقائق",
  },
  {
    id: 7,
    imageUrl: "/man.png",
    category: "الصحة",
    title: "أهمية المياه في النظام الغذائي",
    description: "دور المياه الأساسي في الحفاظ على صحة الجسم والوقاية من الأمراض. الماء ليس فقط ضرورياً للبقاء على قيد الحياة، بل يلعب دوراً حيوياً في النظام الغذائي الصحي. يساعد الماء في عملية الهضم وامتصاص العناصر الغذائية ونقلها إلى خلايا الجسم. كما أنه يساهم في الشعور بالشبع ويمكن أن يساعد في إدارة الوزن. تعرف على كيفية دمج الماء بشكل صحيح في نظامك الغذائي اليومي للحصول على أفضل النتائج الصحية.",
    publisher: "د. فاطمة علي",
    date: "30 نوفمبر 2025",
    readTime: "6 دقائق",
  },
  {
    id: 8,
    imageUrl: "/man.png",
    category: "اخبار",
    title: "تطوير تقنيات جديدة لتنقية المياه",
    description: "ابتكارات حديثة في مجال معالجة وتنقية المياه لضمان الجودة. يشهد مجال معالجة المياه تطورات مستمرة مع ظهور تقنيات جديدة أكثر تطوراً وفعالية. من أنظمة التنقية المتقدمة إلى استخدام الذكاء الاصطناعي في مراقبة جودة المياه، تعرف على أحدث الابتكارات التي تغير طريقة معالجتنا للمياه. اكتشف كيف يمكن لهذه التقنيات أن تحسن جودة مياه الشرب وتقلل من التكاليف البيئية والاقتصادية لعمليات المعالجة.",
    publisher: "م. سعد الدوسري",
    date: "29 نوفمبر 2025",
    readTime: "5 دقائق",
  },
  {
    id: 9,
    imageUrl: "/man.png",
    category: "الصحة",
    title: "الفوائد الصحية للمياه المعدنية الطبيعية",
    description: "اكتشف الفوائد العديدة للمياه المعدنية الطبيعية وكيفية اختيار النوع المناسب لصحتك. المياه المعدنية الطبيعية تحتوي على معادن مهمة مثل الكالسيوم والمغنيسيوم والصوديوم التي يحتاجها الجسم. تعرف على الفرق بين أنواع المياه المعدنية المختلفة وكيفية قراءة الملصقات الغذائية. اكتشف الفوائد الصحية لكل نوع من المعادن الموجودة في المياه المعدنية وكيف يمكن أن تساهم في تحسين صحتك العامة. تعلم كيفية اختيار النوع المناسب حسب احتياجاتك الصحية.",
    publisher: "د. محمد العلي",
    date: "28 نوفمبر 2025",
    readTime: "6 دقائق",
  },
  {
    id: 10,
    imageUrl: "/man.png",
    category: "اخبار",
    title: "مشروع جديد لتحسين جودة مياه الشرب",
    description: "إطلاق مشروع ضخم لتحسين جودة مياه الشرب في جميع أنحاء المملكة. أعلنت الحكومة عن مشروع طموح يهدف إلى تحسين جودة مياه الشرب في جميع المناطق. يشمل المشروع تحديث محطات المعالجة وتركيب أنظمة مراقبة متقدمة وبناء محطات جديدة في المناطق النائية. تعرف على تفاصيل المشروع والجدول الزمني للتنفيذ والاستثمارات المخصصة له. اكتشف كيف سيساهم هذا المشروع في ضمان حصول جميع المواطنين على مياه شرب آمنة وعالية الجودة.",
    publisher: "أحمد السعيد",
    date: "27 نوفمبر 2025",
    readTime: "4 دقائق",
  },
  {
    id: 11,
    imageUrl: "/man.png",
    category: "الصحة",
    title: "كيفية معرفة احتياجك اليومي من الماء",
    description: "دليل شامل لمعرفة كمية الماء التي يحتاجها جسمك يومياً حسب وزنك ونشاطك. احتياجك اليومي من الماء يختلف حسب عدة عوامل مثل وزنك وعمرك ومستوى نشاطك البدني والمناخ الذي تعيش فيه. تعلم كيفية حساب احتياجك اليومي بدقة باستخدام معادلات بسيطة. اكتشف العوامل التي تزيد من احتياجك للماء مثل ممارسة الرياضة والطقس الحار والحمل والرضاعة. احصل على نصائح عملية لضمان حصولك على كمية كافية من الماء يومياً.",
    publisher: "د. فاطمة الزهراء",
    date: "26 نوفمبر 2025",
    readTime: "5 دقائق",
  },
  {
    id: 12,
    imageUrl: "/man.png",
    category: "اخبار",
    title: "توقعات أسعار المياه للعام القادم",
    description: "تحليل شامل لتوقعات أسعار المياه والخدمات المرتبطة بها للعام القادم. مع التغيرات الاقتصادية والتطورات في قطاع المياه، يتوقع الخبراء تغيرات في أسعار المياه والخدمات المرتبطة بها. تعرف على العوامل التي تؤثر على أسعار المياه مثل تكاليف الطاقة وتكاليف الصيانة والاستثمارات في البنية التحتية. اكتشف التوقعات للعام القادم وكيف يمكن للمواطنين الاستعداد لهذه التغيرات. احصل على نصائح لتوفير استهلاك المياه وتقليل الفواتير.",
    publisher: "م. خالد العتيبي",
    date: "25 نوفمبر 2025",
    readTime: "7 دقائق",
  },
  {
    id: 13,
    imageUrl: "/man.png",
    category: "الصحة",
    title: "أهمية شرب الماء قبل النوم",
    description: "فوائد شرب الماء قبل النوم والكمية المناسبة للحصول على نوم أفضل. شرب الماء قبل النوم له فوائد عديدة ولكن يجب أن يكون بكمية معتدلة. يساعد الماء في الحفاظ على ترطيب الجسم أثناء النوم ويمكن أن يحسن من جودة النوم. تعرف على الكمية المناسبة التي يجب شربها قبل النوم لتجنب الاستيقاظ المتكرر للذهاب إلى الحمام. اكتشف كيف يمكن للماء أن يساعد في تحسين عملية الأيض أثناء النوم والاستيقاظ بشعور أفضل في الصباح.",
    publisher: "د. سامي حسن",
    date: "24 نوفمبر 2025",
    readTime: "4 دقائق",
  },
  {
    id: 14,
    imageUrl: "/man.png",
    category: "اخبار",
    title: "تطوير شبكة توزيع المياه في المدن الكبرى",
    description: "مشاريع جديدة لتطوير وتحسين شبكة توزيع المياه في المدن الرئيسية. تشهد المدن الكبرى مشاريع ضخمة لتطوير وتحسين شبكات توزيع المياه لمواكبة النمو السكاني والتوسع العمراني. تعرف على أحدث المشاريع الجارية والخطط المستقبلية لتطوير البنية التحتية للمياه. اكتشف كيف تستخدم التقنيات الحديثة مثل إنترنت الأشياء في مراقبة وإدارة شبكات المياه. تعلم عن الفوائد المتوقعة من هذه المشاريع وكيف ستساهم في تحسين جودة الخدمة للمواطنين.",
    publisher: "م. نورا أحمد",
    date: "23 نوفمبر 2025",
    readTime: "6 دقائق",
  },
  {
    id: 15,
    imageUrl: "/man.png",
    category: "الصحة",
    title: "الماء والرياضة: دليل شامل",
    description: "كيفية شرب الماء أثناء ممارسة الرياضة للحصول على أفضل أداء. الماء ضروري جداً عند ممارسة الرياضة لتعويض السوائل المفقودة عبر التعرق. تعرف على أفضل الأوقات لشرب الماء قبل وأثناء وبعد التمرين. اكتشف الكميات المناسبة من الماء التي يجب شربها حسب نوع وطول التمرين. تعلم كيفية التعرف على علامات الجفاف أثناء التمرين وكيفية الوقاية منها. احصل على نصائح عملية لضمان حصولك على الترطيب الكافي أثناء ممارسة الرياضة.",
    publisher: "د. يوسف كريم",
    date: "22 نوفمبر 2025",
    readTime: "5 دقائق",
  },
  {
    id: 16,
    imageUrl: "/man.png",
    category: "اخبار",
    title: "مشروع جديد لتحسين جودة المياه في المناطق النائية",
    description: "إطلاق مشروع طموح لتحسين جودة المياه وتوفير مياه شرب آمنة في المناطق النائية والريفية. يشمل المشروع بناء محطات معالجة جديدة وتركيب أنظمة تنقية متقدمة. تعرف على تفاصيل المشروع والمناطق المستهدفة والجدول الزمني للتنفيذ. اكتشف كيف سيساهم هذا المشروع في تحسين جودة الحياة لآلاف المواطنين في المناطق النائية.",
    publisher: "م. علي محمود",
    date: "21 نوفمبر 2025",
    readTime: "6 دقائق",
  },
  {
    id: 17,
    imageUrl: "/man.png",
    category: "الصحة",
    title: "فوائد شرب الماء على معدة فارغة",
    description: "اكتشف الفوائد الصحية المذهلة لشرب الماء على معدة فارغة في الصباح. يساعد شرب الماء عند الاستيقاظ في تنشيط الدورة الدموية وتحسين عملية الأيض. تعرف على الكمية المناسبة والطريقة الصحيحة لشرب الماء في الصباح. اكتشف كيف يمكن أن يحسن من صحة الجهاز الهضمي ويزيد من مستويات الطاقة لديك.",
    publisher: "د. ليلى أحمد",
    date: "20 نوفمبر 2025",
    readTime: "4 دقائق",
  },
  {
    id: 18,
    imageUrl: "/man.png",
    category: "اخبار",
    title: "تطوير تقنيات جديدة لترشيد استهلاك المياه",
    description: "ابتكارات حديثة في مجال ترشيد استهلاك المياه وتقليل الفاقد. تشمل التقنيات الجديدة أنظمة ذكية لمراقبة الاستهلاك وأجهزة توفير المياه. تعرف على أحدث الابتكارات وكيف يمكن تطبيقها في المنازل والمؤسسات. اكتشف الفوائد الاقتصادية والبيئية لاستخدام هذه التقنيات وكيف تساهم في الحفاظ على الموارد المائية.",
    publisher: "م. حسن محمد",
    date: "19 نوفمبر 2025",
    readTime: "5 دقائق",
  },
  {
    id: 19,
    imageUrl: "/man.png",
    category: "الصحة",
    title: "الماء وعلاقته بفقدان الوزن",
    description: "كيف يساعد شرب الماء في عملية فقدان الوزن والحفاظ على وزن صحي. الماء يلعب دوراً مهماً في عملية الأيض وحرق السعرات الحرارية. تعرف على أفضل الأوقات لشرب الماء لتعزيز عملية فقدان الوزن. اكتشف الدراسات العلمية التي تثبت العلاقة بين شرب الماء وفقدان الوزن. احصل على نصائح عملية لاستخدام الماء كأداة فعالة في رحلة إنقاص الوزن.",
    publisher: "د. نورة السالم",
    date: "18 نوفمبر 2025",
    readTime: "6 دقائق",
  },
  {
    id: 20,
    imageUrl: "/man.png",
    category: "اخبار",
    title: "مؤتمر تقنيات المياه المستدامة 2025",
    description: "انطلاق مؤتمر تقنيات المياه المستدامة لعام 2025 بمشاركة خبراء من حول العالم. يناقش المؤتمر أحدث التقنيات والحلول المستدامة في مجال إدارة المياه. تعرف على أهم الجلسات والمواضيع التي سيتم مناقشتها والتوصيات المتوقعة. اكتشف كيف يمكن لهذه التقنيات أن تساهم في حل مشاكل المياه على المستوى العالمي.",
    publisher: "أ. خالد العلي",
    date: "17 نوفمبر 2025",
    readTime: "7 دقائق",
  },
  {
    id: 21,
    imageUrl: "/man.png",
    category: "الصحة",
    title: "أهمية الماء للبشرة والشعر",
    description: "كيف يؤثر شرب الماء على صحة البشرة والشعر ومظهرهما. الماء ضروري للحفاظ على ترطيب البشرة ومنع الجفاف والتجاعيد. تعرف على الكمية المناسبة من الماء للحصول على بشرة صحية ومشرقة. اكتشف العلاقة بين شرب الماء وصحة الشعر وكيف يمكن أن يحسن من مظهره وقوته.",
    publisher: "د. سمية خالد",
    date: "16 نوفمبر 2025",
    readTime: "5 دقائق",
  },
  {
    id: 22,
    imageUrl: "/man.png",
    category: "اخبار",
    title: "مشروع ضخم لتحديث شبكة المياه في العاصمة",
    description: "إطلاق مشروع ضخم لتحديث وتطوير شبكة توزيع المياه في العاصمة. يشمل المشروع استبدال الأنابيب القديمة وتركيب أنظمة حديثة. تعرف على مراحل المشروع والاستثمارات المخصصة والجدول الزمني. اكتشف كيف سيساهم في تحسين جودة الخدمة وتقليل الفاقد في شبكة المياه.",
    publisher: "م. فهد الدوسري",
    date: "15 نوفمبر 2025",
    readTime: "6 دقائق",
  },
];

const CategoryTab = ({ category, isSelected, onClick, icon: Icon, index }) => {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.08, y: -3 }}
      whileTap={{ scale: 0.95 }}
      className={`
        relative flex items-center
         gap-2.5 px-7 py-3.5 rounded-full font-cairo font-bold text-sm transition-all duration-300
        overflow-hidden group
        ${isSelected 
          ? 'bg-gradient-to-r from-[#579BE8] via-[#4a8dd8] to-[#315782] text-white shadow-xl shadow-[#579BE8]/40' 
          : 'bg-white/80 backdrop-blur-sm text-gray-700 border-2 border-gray-200 hover:border-[#579BE8] hover:shadow-lg hover:bg-white'
        }
      `}
    >
      {/* Shimmer effect on hover */}
      {!isSelected && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6 }}
        />
      )}
      <Icon className={`text-base transition-all duration-300 ${isSelected ? 'scale-110 drop-shadow-lg' : 'group-hover:scale-110'}`} />
      <span className="relative z-10">{category}</span>
      {isSelected && (
        <motion.div
          layoutId="activeCategory"
          className="absolute inset-0 bg-gradient-to-r from-[#579BE8] via-[#4a8dd8] to-[#315782] rounded-full -z-10"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </motion.button>
  );
};

const ArticleCard = ({ article, index, currentIndex }) => {
  // Limit title to 5 words
  const titleWords = article.title.split(' ');
  const limitedTitle = titleWords.length > 5 
    ? titleWords.slice(0, 5).join(' ') + '...'
    : article.title;
  const limitedDesc = article.description;

  const isCenterCard = index === currentIndex;
  const isSideCard = Math.abs(index - currentIndex) === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: isCenterCard ? 1 : isSideCard ? 0.9 : 0,
        y: 0,
        scale: isCenterCard ? 1 : isSideCard ? 0.95 : 0.9
      }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`
        relative rounded-3xl bg-white transition-all duration-500 ease-out
        flex flex-col w-full max-w-[320px] mx-auto h-[400px] max-h-[400px] overflow-hidden
        group
        ${
          isCenterCard
            ? "scale-100 opacity-100 shadow-2xl shadow-[#579BE8]/20 z-10 ring-2 ring-[#579BE8]/30"
            : isSideCard
            ? "scale-95 opacity-90 shadow-lg shadow-gray-200/50 z-0"
            : "opacity-0 scale-90 pointer-events-none"
        }
        hover:shadow-2xl hover:shadow-[#579BE8]/30 hover:scale-[1.02] hover:ring-2 hover:ring-[#579BE8]/40
      `}
    >
      {/* Animated Gradient Border on Hover */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#579BE8]/10 via-[#315782]/10 to-[#579BE8]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-0 blur-2xl" />
      
      {/* Shimmer Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 3 }}
      />
      
      {/* Top Accent Line */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#579BE8] via-[#4a8dd8] to-[#315782] transition-opacity duration-300 ${
        isCenterCard ? "opacity-100" : "opacity-0"
      }`} />
      
      {/* Image */}
      <div className="relative w-full h-[200px] overflow-hidden flex-shrink-0">
        <Link href={`/articles/${article.id}`} className="block w-full h-full relative">
          <Image
            src={article.imageUrl}
            alt={limitedTitle}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
          {/* Multi-layer Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className={`absolute inset-0 bg-gradient-to-br from-[#579BE8]/30 to-transparent transition-opacity duration-500 ${
            isCenterCard ? "opacity-30" : "opacity-0 group-hover:opacity-20"
          }`} />
          
          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#579BE8]/10 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </Link>
        
        {/* Category Badge */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="absolute top-4 right-4 z-20"
        >
          <span className={`px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-md transition-all duration-300 group-hover:shadow-lg ${
            article.category === "الصحة"
              ? "bg-gradient-to-r from-[#579BE8] to-[#4a8dd8]"
              : "bg-gradient-to-r from-[#315782] to-[#579BE8]"
          }`}>
            {article.category}
          </span>
        </motion.div>

        {/* Reading Time Badge */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute bottom-4 left-4 z-20"
        >
          <div className="px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 shadow-lg group-hover:bg-black/80 transition-all duration-300">
            <FaClock className="text-[10px]" />
            <span>{article.readTime}</span>
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col relative z-10 bg-white">
         {/* Title - One row only with hidden overflow */}
         <Link href={`/articles/${article.id}`} className="block mb-4 group/title">
           <h3 
             className={`font-cairo font-black text-lg leading-tight transition-all duration-500 overflow-hidden text-ellipsis whitespace-nowrap ${
               isCenterCard 
                 ? "text-gray-900 group-hover/title:text-transparent group-hover/title:bg-clip-text group-hover/title:bg-gradient-to-r group-hover/title:from-[#579BE8] group-hover/title:to-[#315782]"
                 : "text-gray-700"
             }`}
             style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
           >
             {limitedTitle}
           </h3>
         </Link>

        {/* Description - Fixed height with hidden overflow */}
        <p className="font-cairo font-normal text-base text-gray-600 mb-6 flex-1 leading-relaxed overflow-hidden text-ellipsis line-clamp-2 block" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', height: '3.5rem', maxHeight: '3.5rem' }}>
          {limitedDesc}
        </p>

        {/* Publisher and Date - Enhanced - Same Row */}
        <div className={`flex items-center justify-between gap-4 pt-5 border-t transition-colors duration-300 ${
          isCenterCard ? "border-gray-200" : "border-gray-100"
        }`}>
          <motion.div 
            className="flex items-center gap-2.5 text-xs text-gray-700"
            whileHover={{ x: -2, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className={`p-2 rounded-xl bg-gradient-to-br from-[#579BE8]/10 to-[#315782]/10 transition-all duration-300 ${
              isCenterCard ? "group-hover:from-[#579BE8]/25 group-hover:to-[#315782]/25 shadow-sm" : "group-hover:from-[#579BE8]/15 group-hover:to-[#315782]/15"
            }`}>
              <FaUser className="text-[#579BE8] text-xs" />
            </div>
            <span className="font-cairo font-bold">{article.publisher}</span>
          </motion.div>
          <motion.div 
            className="flex items-center gap-2.5 text-xs text-gray-700"
            whileHover={{ x: 2, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className={`p-2 rounded-xl bg-gradient-to-br from-[#579BE8]/10 to-[#315782]/10 transition-all duration-300 ${
              isCenterCard ? "group-hover:from-[#579BE8]/25 group-hover:to-[#315782]/25 shadow-sm" : "group-hover:from-[#579BE8]/15 group-hover:to-[#315782]/15"
            }`}>
              <FaCalendarAlt className="text-[#579BE8] text-xs" />
            </div>
            <span className="font-cairo font-bold">{article.date}</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default function Ahram() {
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [showAll, setShowAll] = useState(false);

  const categories = [
    { name: 'الكل', icon: FaNewspaper },
    { name: 'الصحة', icon: FaHeartbeat },
    { name: 'اخبار', icon: FaNewspaper },
  ];

  const filteredArticles = selectedCategory === 'الكل'
    ? ARTICLES_DATA
    : ARTICLES_DATA.filter(article => article.category === selectedCategory);

  // Articles for static grid (first 6)
  const staticArticles = filteredArticles.slice(0, 6);
  const displayedStaticArticles = showAll ? staticArticles : staticArticles.slice(0, 3);
  
  // Articles for related articles slider
  const relatedArticles = filteredArticles.slice(0, 8);

  return (
    <section className="relative w-full pt-8 pb-20 md:pt-12 md:pb-28 lg:pt-16 lg:pb-32 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Advanced Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#579BE8]/10 to-transparent rounded-full blur-3xl -z-0 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tl from-[#315782]/10 to-transparent rounded-full blur-3xl -z-0 animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-[#579BE8]/5 via-transparent to-[#315782]/5 rounded-full blur-3xl -z-0" />
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] -z-0 opacity-30" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Premium Header Section - Redesigned */}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-16 -mt-8"
        >
          {/* Header Cover with Gradient Background */}
          <div className="relative rounded-3xl overflow-hidden">
            {/* Animated Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#579BE8] via-[#4a8dd8] to-[#315782]">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "linear"
                }}
              />
            </div>
            
            {/* Decorative Pattern Overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white rounded-full blur-3xl" />
            </div>
            
            {/* Content */}
            <div className="relative z-10 p-8 md:p-12 lg:p-16">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                {/* Title Section - Redesigned */}
                <div className="flex items-center gap-6">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="relative group/icon"
                  >
                    <div className="absolute inset-0 bg-white/30 rounded-2xl blur-xl group-hover/icon:blur-2xl transition-all duration-300" />
                    <div className="relative p-5 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-2xl group-hover/icon:bg-white/30 transition-all duration-300">
                      <FaBook className="text-white text-3xl group-hover/icon:scale-110 transition-transform duration-300 drop-shadow-lg" />
                    </div>
                  </motion.div>
                  <div>
                    <motion.h2
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-4xl md:text-5xl lg:text-6xl font-black text-white font-cairo mb-2 drop-shadow-lg"
                    >
                      المقالات
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-white/90 font-cairo font-semibold text-lg md:text-xl"
                    >
                      اكتشف أحدث المقالات والأخبار المميزة
                    </motion.p>
                  </div>
                </div>

                {/* Category Tabs - Redesigned for Dark Background */}
                <div className="flex items-center gap-4 flex-wrap justify-center">
                  {categories.map((cat, index) => (
                    <motion.button
                      key={cat.name}
                      onClick={() => {
                        setSelectedCategory(cat.name);
                      }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                      whileHover={{ scale: 1.08, y: -3 }}
                      whileTap={{ scale: 0.95 }}
                      className={`
                        relative flex items-center gap-2.5 px-7 py-3.5 rounded-full font-cairo font-bold text-sm transition-all duration-300
                        overflow-hidden group
                        ${selectedCategory === cat.name 
                          ? 'bg-white text-[#579BE8] shadow-xl shadow-white/30' 
                          : 'bg-white/20 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/30 hover:border-white/50'
                        }
                      `}
                    >
                      {/* Shimmer effect on hover */}
                      {!selectedCategory && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          initial={{ x: '-100%' }}
                          whileHover={{ x: '100%' }}
                          transition={{ duration: 0.6 }}
                        />
                      )}
                      <cat.icon className={`text-base transition-all duration-300 ${selectedCategory === cat.name ? 'scale-110 drop-shadow-lg' : 'group-hover:scale-110'}`} />
                      <span className="relative z-10">{cat.name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Static Articles Grid */}
        <div className="mb-20">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-10 text-center"
          >
            <h3 className="text-3xl md:text-4xl font-black text-gray-900 font-cairo mb-3">
              جميع المقالات
            </h3>
            <div className="w-24 h-1 bg-gradient-to-r from-[#579BE8] to-[#315782] rounded-full mx-auto"></div>
            <p className="text-gray-600 font-cairo font-medium text-base mt-4">
              اكتشف مجموعة متنوعة من المقالات المهمة والمفيدة
            </p>
          </motion.div>

          {/* Articles Grid - 4 columns on large screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 mb-10">
            {displayedStaticArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="w-full"
              >
                <ArticleCard article={article} index={index} currentIndex={index} />
              </motion.div>
            ))}
          </div>

          {/* Show More Button */}
          {staticArticles.length > 4 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center"
            >
              <motion.button
                onClick={() => setShowAll(!showAll)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-10 py-3.5 bg-gradient-to-r from-[#579BE8] to-[#315782] text-white rounded-xl font-cairo font-bold text-base hover:from-[#4788d5] hover:to-[#2a4a6f] transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden"
              >
                {/* Shimmer Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
                <span className="relative z-10 flex items-center gap-2">
                  {showAll ? 'عرض أقل' : 'عرض المزيد'}
                  <motion.svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    animate={{ rotate: showAll ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </span>
              </motion.button>
            </motion.div>
          )}
        </div>

        {/* Related Articles Slider Section */}
        <RelatedArticlesSection articles={relatedArticles} />
      </div>
    </section>
  );
}
