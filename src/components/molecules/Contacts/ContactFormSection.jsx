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
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({
    name: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [touched, setTouched] = useState({
    name: false,
    phone: false,
    subject: false,
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
    // Accept phone numbers starting with 0 or without 0
    const phoneRegex = /^(0)?5\d{8}$/;
    const digitsOnly = phone.replace(/\D/g, '');
    if (!phoneRegex.test(digitsOnly) || (digitsOnly.length !== 9 && digitsOnly.length !== 10)) {
      return 'يرجى إدخال رقم جوال صحيح';
    }
    return '';
  };

  const validateSubject = (subject) => {
    if (!subject.trim()) {
      return 'الموضوع مطلوب';
    }
    if (subject.trim().length < 3) {
      return 'الموضوع يجب أن يكون على الأقل 3 أحرف';
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
    if (field === 'phone') {
      // Remove non-digits for phone
      const digitsOnly = value.replace(/\D/g, '');
      setFormData({ ...formData, phone: digitsOnly });
      if (touched[field]) {
        setErrors({ ...errors, [field]: validatePhone(digitsOnly) });
      }
    } else {
      setFormData({ ...formData, [field]: value });
      
      // Validate on change if field has been touched
      if (touched[field]) {
        let error = '';
        if (field === 'name') {
          error = validateName(value);
        } else if (field === 'subject') {
          error = validateSubject(value);
        } else if (field === 'message') {
          error = validateMessage(value);
        }
        setErrors({ ...errors, [field]: error });
      }
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
    } else if (field === 'subject') {
      error = validateSubject(formData.subject);
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
      !validateSubject(formData.subject) &&
      !validateMessage(formData.message)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({ 
      name: true, 
      phone: true, 
      subject: true, 
      message: true 
    });
    
    // Validate all fields
    const nameError = validateName(formData.name);
    const phoneError = validatePhone(formData.phone);
    const subjectError = validateSubject(formData.subject);
    const messageError = validateMessage(formData.message);
    
    setErrors({
      name: nameError,
      phone: phoneError,
      subject: subjectError,
      message: messageError
    });
    
    // If form is invalid, don't submit
    if (nameError || phoneError || subjectError || messageError) {
      toast.error('يرجى تصحيح الأخطاء في النموذج', {
        duration: 3000,
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Show loading toast
    const loadingToast = toast.loading('جاري إرسال الرسالة...', {
      duration: Infinity,
    });
    
    try {
      // Prepare phone number - ensure it starts with 0
      let phoneNumber = formData.phone.replace(/\D/g, '');
      if (!phoneNumber.startsWith('0')) {
        phoneNumber = '0' + phoneNumber;
      }

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      // Try to get CSRF token from various sources
      let csrfToken = null;
      
      // 1. Try to get from meta tag
      if (typeof document !== 'undefined') {
        const metaToken = document.querySelector('meta[name="csrf-token"]');
        if (metaToken) {
          csrfToken = metaToken.getAttribute('content');
        }
      }

      // 2. Try to get from cookie
      if (!csrfToken && typeof document !== 'undefined') {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === 'XSRF-TOKEN' || name === 'csrf-token' || name === '_token') {
            csrfToken = decodeURIComponent(value);
            break;
          }
        }
      }

      // 3. Try to fetch from API endpoint
      if (!csrfToken) {
        try {
          const csrfResponse = await fetch('https://moya.talaaljazeera.com/sanctum/csrf-cookie', {
            method: 'GET',
            credentials: 'include',
          });
          // After setting cookie, try to get token from cookie again
          if (typeof document !== 'undefined') {
            const cookies = document.cookie.split(';');
            for (let cookie of cookies) {
              const [name, value] = cookie.trim().split('=');
              if (name === 'XSRF-TOKEN' || name === 'csrf-token' || name === '_token') {
                csrfToken = decodeURIComponent(value);
                break;
              }
            }
          }
        } catch (csrfError) {
        }
      }

      // Add CSRF token to headers if found
      if (csrfToken) {
        headers['X-CSRF-TOKEN'] = csrfToken;
        headers['X-XSRF-TOKEN'] = csrfToken;
      }

      // Prepare request body
      const requestBody = {
        name: formData.name.trim(),
        phone: phoneNumber,
        subject: formData.subject.trim(),
        message: formData.message.trim()
      };

      // Add CSRF token to body if API requires it in body
      if (csrfToken) {
        requestBody._token = csrfToken;
      }

      // Log request details for debugging

      // Send POST request to Next.js API route (proxy to avoid CORS issues)
      let response;
      try {
        response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(csrfToken && {
              'X-CSRF-TOKEN': csrfToken,
              'X-XSRF-TOKEN': csrfToken,
            }),
          },
          body: JSON.stringify(requestBody),
        });
        
      } catch (fetchError) {
        // Dismiss loading toast
        toast.dismiss(loadingToast);
        
        console.error('Fetch error details:', {
          error: fetchError,
          message: fetchError.message,
          stack: fetchError.stack,
          name: fetchError.name
        });
        
        // Check if it's a network error
        if (fetchError instanceof TypeError && fetchError.message === 'Failed to fetch') {
          toast.error('فشل الاتصال بالخادم. قد تكون هناك مشكلة في CORS أو الخادم غير متاح. يرجى التحقق من اتصالك بالإنترنت أو المحاولة لاحقاً', {
            duration: 6000,
          });
        } else {
          toast.error(`حدث خطأ أثناء إرسال الرسالة: ${fetchError.message}`, {
            duration: 5000,
          });
        }
        
        setIsSubmitting(false);
        return;
      }

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (response.ok) {
        let data;
        try {
          data = await response.json();
        } catch (jsonError) {
          // If response is not JSON, still consider it success
        }
        
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
        setFormData({ 
          name: '', 
          phone: '', 
          subject: '', 
          message: '' 
        });
        setErrors({ 
          name: '', 
          phone: '', 
          subject: '', 
          message: '' 
        });
        setTouched({ 
          name: false, 
          phone: false, 
          subject: false, 
          message: false 
        });
      } else {
        // Handle API error
        let errorData = {};
        let errorMessage = 'فشل إرسال الرسالة. يرجى المحاولة مرة أخرى';
        
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorData.errors || errorMessage;
          } else {
            const text = await response.text();
            errorMessage = text || errorMessage;
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          errorMessage = `خطأ ${response.status}: ${response.statusText}`;
        }
        
        // Handle specific error codes
        if (response.status === 419) {
          errorMessage = 'انتهت صلاحية الجلسة. يرجى تحديث الصفحة والمحاولة مرة أخرى';
        } else if (response.status === 422) {
          errorMessage = errorMessage || 'البيانات المدخلة غير صحيحة. يرجى التحقق من جميع الحقول';
        } else if (response.status === 500) {
          errorMessage = 'خطأ في الخادم. يرجى المحاولة لاحقاً';
        }
        
        toast.error(errorMessage, {
          duration: 5000,
        });
      }
    } catch (error) {
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      // Handle network or other errors
      console.error('Error submitting form:', error);
      
      let errorMessage = 'حدث خطأ أثناء إرسال الرسالة. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى';
      
      if (error instanceof TypeError) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'فشل الاتصال بالخادم. قد تكون هناك مشكلة في الشبكة أو الخادم غير متاح';
        } else if (error.message.includes('NetworkError')) {
          errorMessage = 'خطأ في الشبكة. يرجى التحقق من اتصالك بالإنترنت';
        }
      }
      
      toast.error(errorMessage, {
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
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
          <h2 className="text-xl sm:text-2xl md:text-3xl  font-black text-gray-900 mb-2 md:mb-3 leading-tight">
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
                  className="text-red-600 text-xs font-medium flex items-center gap-1"
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
                  className="text-red-600 text-xs font-medium flex items-center gap-1"
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

            {/* Subject Field */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
                <FaEnvelope className="w-4 h-4 text-[#579BE8]" />
                <span>الموضوع</span>
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                onBlur={() => handleBlur('subject')}
                className={`w-full h-12 rounded-xl bg-gray-50 border-2 text-right text-gray-900 font-medium text-sm px-4 transition-all outline-none ${
                  errors.subject
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                    : touched.subject && !errors.subject
                    ? 'border-green-400 focus:border-green-500 focus:ring-green-500/20'
                    : 'border-gray-200 focus:border-[#579BE8] focus:ring-[#579BE8]/20'
                }`}
                placeholder="موضوع الرسالة"
              />
              {errors.subject && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-600 text-xs font-medium flex items-center gap-1"
                >
                  <span>⚠</span>
                  {errors.subject}
                </motion.p>
              )}
            </div>

            {/* Message Field */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
                <FaEnvelope className="w-4 h-4 text-[#579BE8]" />
                <span>رسالتك</span>
                {formData.message && (
                  <span className="text-xs text-gray-700 font-normal">
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
                  className="text-red-600 text-xs font-medium flex items-center gap-1"
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
              whileHover={{ scale: !isSubmitting ? 1.02 : 1 }}
              whileTap={{ scale: !isSubmitting ? 0.98 : 1 }}
              className={`w-full h-12 rounded-xl text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#579BE8] to-[#6BA8F0] hover:shadow-lg'
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
