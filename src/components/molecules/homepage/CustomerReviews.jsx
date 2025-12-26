"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { FaStar } from "react-icons/fa";
import { motion, useMotionValue, useTransform, useSpring, useAnimation } from "framer-motion";

const reviews = [
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
  {
    id: 4,
    name: "أبو عبدالله",
    date: "25/05/25",
    rating: 5,
    text: "أسرع خدمة تعاملت معها... السواق وصل خلال نص ساعة",
    image: "/images/customer.png",
  },
  {
    id: 5,
    name: "أبو عبدالله",
    date: "25/05/25",
    rating: 5,
    text: "أسرع خدمة تعاملت معها... السواق وصل خلال نص ساعة",
    image: "/images/customer.png",
  },
  {
    id: 6,
    name: "أبو عبدالله",
    date: "25/05/25",
    rating: 5,
    text: "أسرع خدمة تعاملت معها... السواق وصل خلال نص ساعة",
    image: "/images/customer.png",
  },
  {
    id: 7,
    name: "أبو عبدالله",
    date: "25/05/25",
    rating: 5,
    text: "أسرع خدمة تعاملت معها... السواق وصل خلال نص ساعة",
    image: "/images/customer.png",
  },
];

const ReviewCard = ({ review, x, isDragging }) => {
  const cardRef = useRef(null);

  // 3D Rotation Effect based on x position
  // Adjust the input range based on your container width estimate
  // 0 is center. -500 is left, 500 is right.
  const rotateY = useTransform(x, [-500, 0, 500], [15, 0, -15]);
  const rotateZ = useTransform(x, [-500, 0, 500], [2, 0, -2]);
  const scale = useTransform(x, [-500, 0, 500], [0.9, 1, 0.9]);
  const opacityTransform = useTransform(x, [-800, 0, 800], [0.5, 1, 0.5]);
  const opacity = isDragging ? opacityTransform : 1;

  return (
    <motion.div
      ref={cardRef}
      style={{
        rotateY,
        rotateZ,
        scale,
        opacity,
        x: 0, // This is local offset, the parent handles the slider x
      }}
      className="min-w-[85%] md:min-w-[45%] lg:min-w-[30%] perspective-1000"
    >
      <motion.div
        className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/40 h-full select-none"
      >
        <div className="flex justify-between items-center mb-3 pointer-events-none">
          <div className="flex items-center gap-2">
            <div className="relative w-[62px] h-[62px]">
                <Image
                src={review.image}
                alt={review.name}
                fill
                className="rounded-full object-cover"
                draggable={false}
                />
            </div>
            <span className="text-gray-900 font-bold text-[20px] lg:text-[24px]">
              {review.name}
            </span>
          </div>

          <span className="text-[#A7AFC2CF] text-[15px] font-medium">
            {review.date}
          </span>
        </div>

        <div className="flex mb-4 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <FaStar
              key={i}
              className={`w-6 h-6 ml-1 ${
                i < review.rating ? "text-[#FFCC00]" : "text-gray-300"
              }`}
            />
          ))}
        </div>

        <p className="text-[#000000A6] text-lg leading-relaxed pointer-events-none">
          {review.text}
        </p>
      </motion.div>
    </motion.div>
  );
};

export default function CustomerReviewsExact() {
  const [width, setWidth] = useState(0);
  const [isRTL, setIsRTL] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const carousel = useRef();
  const carouselContent = useRef();
  const x = useMotionValue(0);

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
    <section className="py-16 bg-gradient-to-b bg-[#EFF5FD] overflow-hidden">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-3xl md:text-4xl font-bold text-[#579BE8] mb-12">
          أراء عملتنا
        </h2>

        {/* Carousel Container */}
        <motion.div
          ref={carousel}
          className="cursor-grab active:cursor-grabbing overflow-hidden perspective-1000 rounded-lg"
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
                // Snap to next/previous on swipe
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
            className="flex gap-8 px-4 md:px-12 py-10"
          >
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} x={x} isDragging={isDragging} />
            ))}
          </motion.div>
        </motion.div>
        
        {/* Simple Progress Indicator */}
        <div className="flex justify-center mt-2 space-x-3">
             {/* We can make this interactive later if needed, dynamic based on slide index */}
            <div className="w-12 h-2 bg-[#5A9CF0] rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
         </div>

      </div>
    </section>
  );
}
