"use client";

import { motion } from "framer-motion";
import { IoWaterOutline, IoEyeOutline } from "react-icons/io5";
import { SlLocationPin } from "react-icons/sl";
import { FaMoneyBillWave } from "react-icons/fa6";
import { Package } from "lucide-react";
import { PiTruck } from "react-icons/pi";
import { FaLocationDot } from "react-icons/fa6";
import { MdCloudDone } from "react-icons/md";
import { FaPlay } from "react-icons/fa";
import { useState, useRef } from "react";

const HowItWorks = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  const handlePlayVideo = () => {
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  return (
    <section
      dir="rtl"
      className="py-16 bg-[#EFF5FD] relative overflow-hidden"
    >
      <div className="px-3 mx-auto max-w-7xl relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 sm:mb-8 md:mb-10"
        >
          <div className="inline-block mb-2 md:mb-3">
            <span className="text-xs md:text-sm font-bold text-[#579BE8] bg-[#579BE8]/10 px-3 py-1.5 rounded-full">
              كيف تعمل
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 mb-2 md:mb-3 leading-tight">
            {/* <span className="block text-[#579BE8]">كيف تعمل</span> */}
            <span className="block text-[#579BE8] text-lg sm:text-xl md:text-2xl mt-2">شاهد الفيديو التعريفي</span>
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-[#579BE8] to-[#315782] rounded-full mx-auto"></div>
        </motion.div>

        {/* Video Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative max-w-4xl mx-auto mb-12 md:mb-16 rounded-2xl overflow-hidden shadow-2xl group"
        >
          {/* Video Container */}
          <div className="relative aspect-video bg-gray-900">
            {!isPlaying ? (
              <>
                {/* Video Thumbnail - أول إطار من الفيديو أو صورة ثابتة */}
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                  src="/howIt.mp4"
                  muted
                  playsInline
                  preload="metadata"
                />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-all duration-300">
                  <button
                    onClick={handlePlayVideo}
                    className="w-20 h-20 md:w-24 md:h-24 bg-[#579BE8] rounded-full flex items-center justify-center shadow-xl transform hover:scale-110 transition-all duration-300 hover:shadow-2xl hover:bg-[#4a8ad0]"
                  >
                    <FaPlay className="text-white text-3xl md:text-4xl ml-1" />
                  </button>
                </div>
              </>
            ) : (
              // Video Player
              <video
                className="absolute top-0 left-0 w-full h-full"
                src="/howIt.mp4"
                controls
                autoPlay
                playsInline
              />
            )}
          </div>

          {/* Video Caption */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 md:p-6">
            <p className="text-white text-sm md:text-base font-medium">
              شاهد كيف يمكنك الاستفادة من المنصة في دقيقتين
            </p>
          </div>
        </motion.div>

        {/* Steps Section - يمكنك إضافة الخطوات هنا إذا أردت */}

      </div>
    </section>
  );
};

export default HowItWorks;