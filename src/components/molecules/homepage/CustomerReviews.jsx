"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { FaStar } from "react-icons/fa";
import { motion, useMotionValue, useTransform, useSpring, useAnimation } from "framer-motion";

// Default reviews
const defaultReviews = [
  {
    id: 1,
    name: "أبو عبدالله",
    date: "25/05/25",
    rating: 5,
    text: "أسرع خدمة تعاملت معها... السواق وصل خلال نص ساعة",
    image: "/images/customer.png",
  },
  {
    id: 2,
    name: "أبو عبدالله",
    date: "25/05/25",
    rating: 5,
    text: "أسرع خدمة تعاملت معها... السواق وصل خلال نص ساعة",
    image: "/images/customer.png",
  },
  {
    id: 3,
    name: "أبو عبدالله",
    date: "25/05/25",
    rating: 5,
    text: "أسرع خدمة تعاملت معها... السواق وصل خلال نص ساعة",
    image: "/images/customer.png",
  },
];

const ReviewCard = ({ review, x, isDragging }) => {
  const cardRef = useRef(null);

  // 3D Rotation Effect based on x position - only when dragging
  const rotateY = useTransform(x, [-500, 0, 500], [15, 0, -15]);
  const rotateZ = useTransform(x, [-500, 0, 500], [2, 0, -2]);
  const scale = useTransform(x, [-500, 0, 500], [0.9, 1, 0.9]);
  const opacityTransform = useTransform(x, [-800, 0, 800], [0.5, 1, 0.5]);
  
  // Use spring animation to smoothly return to linear when not dragging
  const springConfig = { stiffness: 100, damping: 20 };
  const linearRotateY = useSpring(isDragging ? rotateY : 0, springConfig);
  const linearRotateZ = useSpring(isDragging ? rotateZ : 0, springConfig);
  const linearScale = useSpring(isDragging ? scale : 1, springConfig);
  const opacity = isDragging ? opacityTransform : 1;

  return (
    <motion.div
      ref={cardRef}
      style={{
        rotateY: linearRotateY,
        rotateZ: linearRotateZ,
        scale: linearScale,
        opacity,
        x: 0,
      }}
      className="min-w-[85%] md:min-w-[45%] lg:min-w-[30%] perspective-1000"
    >
      <motion.div
        whileHover={{ y: -5 }}
        className="group relative bg-white rounded-2xl p-6 sm:p-7 md:p-8 shadow-lg hover:shadow-2xl border border-gray-100 h-full select-none transition-all duration-300 overflow-hidden"
      >
        {/* Gradient accent on top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#579BE8] via-[#124987] to-[#579BE8]"></div>
        
        {/* Decorative corner element */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#579BE8]/5 to-transparent rounded-bl-3xl"></div>
        
        {/* Content */}
        <div className="relative">
          <div className="flex justify-between items-start mb-4 pointer-events-none">
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full ring-2 ring-[#579BE8]/20 group-hover:ring-[#579BE8]/40 transition-all duration-300">
                <Image
                  src={review.image}
                  alt={review.name}
                  fill
                  className="rounded-full object-cover"
                  draggable={false}
                />
              </div>
              <div>
                <span className="text-gray-900 font-bold text-lg sm:text-xl md:text-2xl block">
                  {review.name}
                </span>
                <span className="text-gray-700 text-xs sm:text-sm font-medium">
                  {review.date}
                </span>
              </div>
            </div>
          </div>

          {/* Rating Stars */}
          <div className="flex gap-1 mb-4 pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1, type: "spring" }}
              >
                <FaStar
                  className={`w-5 h-5 sm:w-6 sm:h-6 ${
                    i < review.rating 
                      ? "text-[#FFCC00] drop-shadow-sm" 
                      : "text-gray-300"
                  }`}
                />
              </motion.div>
            ))}
          </div>

          {/* Review Text */}
          <div className="relative">
            <div className="absolute top-0 right-0 text-6xl sm:text-7xl font-bold text-[#579BE8]/5 leading-none pointer-events-none">
              "
            </div>
            <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed relative z-10 pointer-events-none pr-6">
              {review.text}
            </p>
          </div>
        </div>

        {/* Bottom gradient on hover */}
        <div className="absolute bottom-0 left-0 right-0 h-0 bg-gradient-to-t from-[#579BE8]/5 to-transparent group-hover:h-20 transition-all duration-300"></div>
      </motion.div>
    </motion.div>
  );
};

export default function CustomerReviews({ data }) {
  const [width, setWidth] = useState(0);
  const [isRTL, setIsRTL] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const carousel = useRef();
  const carouselContent = useRef();
  const x = useMotionValue(0);

  // Extract reviews from API response
  const apiReviews = data?.contents?.filter(c => c.key === 'review').map((c, index) => {
    const reviewData = c.value;
    return {
      id: index + 1,
      name: reviewData.name || "عميل",
      date: new Date().toLocaleDateString('ar-SA'),
      rating: reviewData.rating || 5,
      text: reviewData.comment || "",
      image: "/images/customer.png",
    };
  }) || [];

  const reviews = apiReviews.length > 0 ? apiReviews : defaultReviews;

  useEffect(() => {
    // Check for RTL direction
    const rtl = document.dir === "rtl" || document.documentElement.dir === "rtl";
    setIsRTL(rtl);

    const handleResize = () => {
      if (carouselContent.current && carousel.current) {
        const scrollWidth = carouselContent.current.scrollWidth;
        const offsetWidth = carousel.current.offsetWidth;
        const calculatedWidth = scrollWidth - offsetWidth;
        setWidth(calculatedWidth);
        
        // Reset position on resize
        x.set(0);
      }
    };

    // Use requestAnimationFrame to ensure DOM is ready
    const resizeObserver = new ResizeObserver(handleResize);
    if (carousel.current) {
      resizeObserver.observe(carousel.current);
    }

    handleResize(); // Initial calculation
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
    };
  }, [x]);

  return (
    <section className="relative py-14 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-gray-50 via-white to-gray-50 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#579BE8]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#124987]/5 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle, #579BE8 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}></div>
      </div>

      <div className="relative z-10 px-3 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-12 md:mb-16"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-[#579BE8]/10 border border-[#579BE8]/20"
          >
            <div className="w-2 h-2 rounded-full bg-[#579BE8] animate-pulse"></div>
            <span className="text-xs sm:text-sm font-semibold text-[#579BE8]">آراء العملاء</span>
          </motion.div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            <span className="bg-gradient-to-r from-[#579BE8] to-[#124987] bg-clip-text text-transparent">
              أراء عملائنا
            </span>
          </h2>
          
          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            اكتشف ما يقوله عملاؤنا عن خدماتنا
          </p>
        </motion.div>

        {/* Carousel Container */}
        <motion.div
          ref={carousel}
          className="cursor-grab active:cursor-grabbing overflow-hidden perspective-1000 rounded-2xl"
        >
          <motion.div
            ref={carouselContent}
            drag="x"
            dragConstraints={{ 
                right: isRTL ? width : 0, 
                left: isRTL ? 0 : -width 
            }}
            dragElastic={0.2}
            dragTransition={{
              power: 0.3,
              restDelta: 10,
            }}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={(event, info) => {
              setIsDragging(false);
              const swipeThreshold = 50;
              const swipe = info.offset.x;

              if (Math.abs(swipe) > swipeThreshold) {
                const snapPoints = isRTL 
                  ? [0, width / 2, width]
                  : [-width, -width / 2, 0];
                
                const closest = snapPoints.reduce((prev, curr) =>
                  Math.abs(curr - x.get()) < Math.abs(prev - x.get()) ? curr : prev
                );
                
                x.set(closest);
              }
            }}
            whileTap={{ cursor: "grabbing" }}
            style={{ x }}
            className="flex gap-6 sm:gap-8 px-4 md:px-8 py-8 sm:py-10"
          >
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} x={x} isDragging={isDragging} />
            ))}
          </motion.div>
        </motion.div>
        
        {/* Enhanced Progress Indicator - Right after cards */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex justify-center items-center gap-2 mt-6 sm:mt-8"
        >
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === 0 
                  ? "w-8 bg-gradient-to-r from-[#579BE8] to-[#124987]" 
                  : "w-2 bg-gray-300"
              }`}
              whileHover={{ scale: 1.2 }}
            />
          ))}
        </motion.div>

      </div>
    </section>
  );
}
