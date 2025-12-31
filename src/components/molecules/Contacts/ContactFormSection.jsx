'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FaPaperPlane, FaUser, FaPhone, FaEnvelope, FaCheckCircle, FaWater } from 'react-icons/fa';
import { IoWaterOutline } from 'react-icons/io5';

const ContactFormSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: ''
  });
  const [errors, setErrors] = useState({
    name: '',
    phone: '',
    message: ''
  });
  const [touched, setTouched] = useState({
    name: false,
    phone: false,
    message: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation functions
  const validateName = (name) => {
    if (!name.trim()) {
      return 'الاسم مطلوب';
    }
    if (name.trim().length < 2) {
      return 'الاسم يجب أن يكون على الأقل حرفين';
    }
    if (!/^[\u0600-\u06FFa-zA-Z\s]+$/.test(name.trim())) {
      return 'الاسم يجب أن يحتوي على أحرف فقط';
    }
    return '';
  };

  const validatePhone = (phone) => {
    if (!phone.trim()) {
      return 'رقم الجوال مطلوب';
    }
    const phoneRegex = /^05\d{8}$/;
    if (!phoneRegex.test(phone.trim())) {
      return 'يرجى إدخال رقم جوال صحيح (يبدأ بـ 05 ويتكون من 10 أرقام)';
    }
    return '';
  };

  const validateMessage = (message) => {
    if (!message.trim()) {
      return 'الرسالة مطلوبة';
    }
    if (message.trim().length < 10) {
      return 'الرسالة يجب أن تكون على الأقل 10 أحرف';
    }
    if (message.trim().length > 500) {
      return 'الرسالة يجب أن تكون أقل من 500 حرف';
    }
    return '';
  };

  // Handle input changes with validation
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    
    // Validate on change if field has been touched
    if (touched[field]) {
      let error = '';
      if (field === 'name') {
        error = validateName(value);
      } else if (field === 'phone') {
        // Remove non-digits for phone
        const digitsOnly = value.replace(/\D/g, '');
        setFormData(prev => ({ ...prev, phone: digitsOnly }));
        error = validatePhone(digitsOnly);
      } else if (field === 'message') {
        error = validateMessage(value);
      }
      setErrors({ ...errors, [field]: error });
    }
  };

  // Handle blur to mark field as touched
  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    
    let error = '';
    if (field === 'name') {
      error = validateName(formData.name);
    } else if (field === 'phone') {
      error = validatePhone(formData.phone);
    } else if (field === 'message') {
      error = validateMessage(formData.message);
    }
    setErrors({ ...errors, [field]: error });
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      !validateName(formData.name) &&
      !validatePhone(formData.phone) &&
      !validateMessage(formData.message)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({ name: true, phone: true, message: true });
    
    // Validate all fields
    const nameError = validateName(formData.name);
    const phoneError = validatePhone(formData.phone);
    const messageError = validateMessage(formData.message);
    
    setErrors({
      name: nameError,
      phone: phoneError,
      message: messageError
    });
    
    // If form is invalid, don't submit
    if (nameError || phoneError || messageError) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Show loading toast
    const loadingToast = toast.loading('جاري إرسال الرسالة...', {
      duration: 1500,
    });
    
    // Simulate API call
    setTimeout(() => {
      console.log('Form submitted:', formData);
      setIsSubmitting(false);
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      // Show success toast
      toast.success('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً', {
        icon: <FaCheckCircle className="w-5 h-5" />,
        duration: 4000,
        style: {
          background: '#579BE8',
          color: '#fff',
          borderRadius: '12px',
          padding: '16px',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
      
      // Reset form
      setFormData({ name: '', phone: '', message: '' });
      setErrors({ name: '', phone: '', message: '' });
      setTouched({ name: false, phone: false, message: false });
    }, 1500);
  };

  return (
    <section className="relative w-full py-12 md:py-16 bg-gradient-to-br from-[#D0E8FF] via-[#E0F2FF] to-[#C8E5FF] overflow-hidden">
      {/* Simple Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 right-20 w-32 h-32 bg-[#579BE8]/10 rounded-full blur-2xl"
        ></motion.div>
        <motion.div
          animate={{
            y: [0, 30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-40 left-32 w-48 h-48 bg-[#579BE8]/8 rounded-full blur-3xl"
        ></motion.div>
        
        {/* Water Ripple Effect */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#D0E8FF]/8 via-transparent to-transparent"></div>
      </div>

      {/* Decorative Water Icons */}
      <div className="absolute top-10 right-10 text-[#579BE8]/15 z-0">
        <IoWaterOutline size={120} className="rotate-12" />
      </div>
      <div className="absolute bottom-10 left-10 text-[#579BE8]/15 z-0">
        <FaWater size={100} className="-rotate-12" />
      </div>
      <div className="absolute top-1/2 right-1/4 text-[#579BE8]/10 z-0">
        <IoWaterOutline size={200} className="rotate-45" />
      </div>
      <div className="absolute top-1/3 left-1/4 text-[#579BE8]/12 z-0">
        <FaWater size={80} className="rotate-12" />
      </div>

      <div className="px-4 mx-auto max-w-2xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 sm:mb-8 md:mb-10"
        >
          <div className="inline-block mb-2 md:mb-3">
            <span className="text-xs md:text-sm font-bold text-[#579BE8] bg-[#579BE8]/10 px-3 py-1.5 rounded-full">
              تواصل معنا
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 mb-2 md:mb-3 leading-tight">
            <span className="block text-[#579BE8]">أرسل لنا رسالتك وسنرد عليك في أقرب وقت</span>
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-[#579BE8] to-[#315782] rounded-full mx-auto"></div>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/95 backdrop-blur-2xl rounded-2xl shadow-xl border border-white/20 p-6 md:p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
                <FaUser className="w-4 h-4 text-[#579BE8]" />
                <span>الاسم</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                className={`w-full h-12 rounded-xl bg-gray-50 border-2 text-right text-gray-900 font-medium text-sm px-4 transition-all outline-none ${
                  errors.name
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                    : touched.name && !errors.name
                    ? 'border-green-400 focus:border-green-500 focus:ring-green-500/20'
                    : 'border-gray-200 focus:border-[#579BE8] focus:ring-[#579BE8]/20'
                }`}
                placeholder="أدخل اسمك الكامل"
              />
              {errors.name && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-xs font-medium flex items-center gap-1"
                >
                  <span>⚠</span>
                  {errors.name}
                </motion.p>
              )}
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
                <FaPhone className="w-4 h-4 text-[#579BE8]" />
                <span>الجوال</span>
              </label>
              <input
                type="tel"
                maxLength={10}
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                onBlur={() => handleBlur('phone')}
                className={`w-full h-12 rounded-xl bg-gray-50 border-2 text-right text-gray-900 font-medium text-sm px-4 transition-all outline-none ${
                  errors.phone
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                    : touched.phone && !errors.phone
                    ? 'border-green-400 focus:border-green-500 focus:ring-green-500/20'
                    : 'border-gray-200 focus:border-[#579BE8] focus:ring-[#579BE8]/20'
                }`}
                placeholder="05xxxxxxxx"
              />
              {errors.phone && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-xs font-medium flex items-center gap-1"
                >
                  <span>⚠</span>
                  {errors.phone}
                </motion.p>
              )}
              {touched.phone && !errors.phone && formData.phone && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-green-600 text-xs font-medium flex items-center gap-1"
                >
                  <span>✓</span>
                  رقم الجوال صحيح
                </motion.p>
              )}
            </div>

            {/* Message Field */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
                <FaEnvelope className="w-4 h-4 text-[#579BE8]" />
                <span>رسالتك</span>
                {formData.message && (
                  <span className="text-xs text-gray-500 font-normal">
                    ({formData.message.trim().length}/500)
                  </span>
                )}
              </label>
              <textarea
                rows={5}
                maxLength={500}
                value={formData.message}
                onChange={(e) => handleChange('message', e.target.value)}
                onBlur={() => handleBlur('message')}
                className={`w-full rounded-xl bg-gray-50 border-2 text-right text-gray-900 font-medium text-sm px-4 py-3 resize-none transition-all outline-none ${
                  errors.message
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                    : touched.message && !errors.message
                    ? 'border-green-400 focus:border-green-500 focus:ring-green-500/20'
                    : 'border-gray-200 focus:border-[#579BE8] focus:ring-[#579BE8]/20'
                }`}
                placeholder="اكتب رسالتك هنا..."
              />
              {errors.message && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-xs font-medium flex items-center gap-1"
                >
                  <span>⚠</span>
                  {errors.message}
                </motion.p>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting || !isFormValid()}
              whileHover={{ scale: isFormValid() && !isSubmitting ? 1.02 : 1 }}
              whileTap={{ scale: isFormValid() && !isSubmitting ? 0.98 : 1 }}
              className={`w-full h-12 rounded-xl text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                isFormValid() && !isSubmitting
                  ? 'bg-gradient-to-r from-[#579BE8] to-[#6BA8F0] hover:shadow-lg'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>جاري الإرسال...</span>
                </>
              ) : (
                <>
                  <FaPaperPlane className="w-4 h-4" />
                  <span>إرسال الرسالة</span>
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactFormSection;
