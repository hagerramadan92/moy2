'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { FaPaperPlane, FaUser, FaPhone, FaEnvelope, FaCheckCircle } from 'react-icons/fa';

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

  // Validation functions (same as before)
  const validateName = (name) => {
    if (!name.trim()) return 'الاسم مطلوب';
    if (name.trim().length < 2) return 'الاسم يجب أن يكون على الأقل حرفين';
    if (!/^[\u0600-\u06FFa-zA-Z\s]+$/.test(name.trim())) return 'الاسم يجب أن يحتوي على أحرف فقط';
    return '';
  };

  const validatePhone = (phone) => {
    if (!phone.trim()) return 'رقم الجوال مطلوب';
    const phoneRegex = /^(0)?5\d{8}$/;
    const digitsOnly = phone.replace(/\D/g, '');
    if (!phoneRegex.test(digitsOnly) || (digitsOnly.length !== 9 && digitsOnly.length !== 10)) {
      return 'يرجى إدخال رقم جوال صحيح';
    }
    return '';
  };

  const validateSubject = (subject) => {
    if (!subject.trim()) return 'الموضوع مطلوب';
    if (subject.trim().length < 3) return 'الموضوع يجب أن يكون على الأقل 3 أحرف';
    return '';
  };

  const validateMessage = (message) => {
    if (!message.trim()) return 'الرسالة مطلوبة';
    if (message.trim().length < 10) return 'الرسالة يجب أن تكون على الأقل 10 أحرف';
    if (message.trim().length > 500) return 'الرسالة يجب أن تكون أقل من 500 حرف';
    return '';
  };

  // Handle input changes with validation
  const handleChange = (field, value) => {
    if (field === 'phone') {
      const digitsOnly = value.replace(/\D/g, '');
      setFormData({ ...formData, phone: digitsOnly });
      if (touched[field]) {
        setErrors({ ...errors, [field]: validatePhone(digitsOnly) });
      }
    } else {
      setFormData({ ...formData, [field]: value });
      if (touched[field]) {
        let error = '';
        if (field === 'name') error = validateName(value);
        else if (field === 'subject') error = validateSubject(value);
        else if (field === 'message') error = validateMessage(value);
        setErrors({ ...errors, [field]: error });
      }
    }
  };

  // Handle blur to mark field as touched
  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    
    let error = '';
    if (field === 'name') error = validateName(formData.name);
    else if (field === 'phone') error = validatePhone(formData.phone);
    else if (field === 'subject') error = validateSubject(formData.subject);
    else if (field === 'message') error = validateMessage(formData.message);
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
      toast.error('يرجى تصحيح الأخطاء في النموذج', { duration: 3000 });
      return;
    }
    
    setIsSubmitting(true);
    
    // Show loading toast
    const loadingToast = toast.loading('جاري إرسال الرسالة...');
    
    try {
      // Prepare phone number
      let phoneNumber = formData.phone.replace(/\D/g, '');
      if (!phoneNumber.startsWith('0')) {
        phoneNumber = '0' + phoneNumber;
      }

      // Send POST request
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: phoneNumber,
          subject: formData.subject.trim(),
          message: formData.message.trim()
        }),
      });

      toast.dismiss(loadingToast);

      if (response.ok) {
        toast.success('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً', {
          icon: <FaCheckCircle className="w-5 h-5" />,
          duration: 4000,
        });
        
        // Reset form
        setFormData({ name: '', phone: '', subject: '', message: '' });
        setErrors({ name: '', phone: '', subject: '', message: '' });
        setTouched({ name: false, phone: false, subject: false, message: false });
      } else {
        toast.error('فشل إرسال الرسالة. يرجى المحاولة مرة أخرى', { duration: 5000 });
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('حدث خطأ أثناء إرسال الرسالة', { duration: 5000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full bg-blue-50 py-8 sm:py-10 md:py-12 lg:py-14 xl:py-16">
      <div className="container mx-auto px-3 sm:px-4 py-2">
        <div className="max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-block mb-2">
              <span className="text-xs sm:text-sm font-bold text-[#579BE8] bg-blue-100 px-3 py-1.5 rounded-full">
                تواصل معنا
              </span>
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              <span className="block text-[#579BE8] text-sm sm:text-base md:text-lg lg:text-xl mb-1">
                فريق دعم متكامل
              </span>
              <span className="block text-sm sm:text-base md:text-lg lg:text-xl text-gray-700">
                على مدار الساعة
              </span>
            </h2>
            <div className="w-12 sm:w-16 h-0.5 bg-[#579BE8] rounded-full mx-auto"></div>
          </div>

          {/* Form Card - بدون أي مؤثرات */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-5 md:p-6 lg:p-7">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Name Field */}
              <div>
                <label className="flex items-center gap-2 text-gray-700 font-semibold text-xs sm:text-sm mb-1.5">
                  <FaUser className="w-3 h-3 sm:w-4 sm:h-4 text-[#579BE8]" />
                  <span>الاسم</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  className={`w-full h-10 sm:h-11 md:h-12 rounded-lg bg-gray-50 border text-right text-gray-900 text-sm px-3 outline-none ${
                    errors.name
                      ? 'border-red-400'
                      : touched.name && !errors.name
                      ? 'border-green-400'
                      : 'border-gray-200 focus:border-blue-600'
                  }`}
                  placeholder="الاسم"
                />
                {errors.name && (
                  <p className="text-red-600 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label className="flex items-center gap-2 text-gray-700 font-semibold text-xs sm:text-sm mb-1.5">
                  <FaPhone className="w-3 h-3 sm:w-4 sm:h-4 text-[#579BE8]" />
                  <span>الجوال</span>
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  onBlur={() => handleBlur('phone')}
                  className={`w-full h-10 sm:h-11 md:h-12 rounded-lg bg-gray-50 border text-right text-gray-900 text-sm px-3 outline-none ${
                    errors.phone
                      ? 'border-red-400'
                      : touched.phone && !errors.phone
                      ? 'border-green-400'
                      : 'border-gray-200 focus:border-blue-600'
                  }`}
                  placeholder="05xxxxxxxx"
                />
                {errors.phone && (
                  <p className="text-red-600 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Subject Field */}
              <div>
                <label className="flex items-center gap-2 text-gray-700 font-semibold text-xs sm:text-sm mb-1.5">
                  <FaEnvelope className="w-3 h-3 sm:w-4 sm:h-4 text-[#579BE8]" />
                  <span>الموضوع</span>
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  onBlur={() => handleBlur('subject')}
                  className={`w-full h-10 sm:h-11 md:h-12 rounded-lg bg-gray-50 border text-right text-gray-900 text-sm px-3 outline-none ${
                    errors.subject
                      ? 'border-red-400'
                      : touched.subject && !errors.subject
                      ? 'border-green-400'
                      : 'border-gray-200 focus:border-blue-600'
                  }`}
                  placeholder="موضوع الرسالة"
                />
                {errors.subject && (
                  <p className="text-red-600 text-xs mt-1">{errors.subject}</p>
                )}
              </div>

              {/* Message Field */}
              <div>
                <label className="flex items-center gap-2 text-gray-700 font-semibold text-xs sm:text-sm mb-1.5">
                  <FaEnvelope className="w-3 h-3 sm:w-4 sm:h-4 text-[#579BE8]" />
                  <span>رسالتك</span>
                  {formData.message && (
                    <span className="text-xs text-gray-500">
                      ({formData.message.trim().length}/500)
                    </span>
                  )}
                </label>
                <textarea
                  rows={4}
                  maxLength={500}
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  onBlur={() => handleBlur('message')}
                  className={`w-full rounded-lg bg-gray-50 border text-right text-gray-900 text-sm px-3 py-2 resize-none outline-none ${
                    errors.message
                      ? 'border-red-400'
                      : touched.message && !errors.message
                      ? 'border-green-400'
                      : 'border-gray-200 focus:border-blue-600'
                  }`}
                  placeholder="اكتب رسالتك هنا..."
                />
                {errors.message && (
                  <p className="text-red-600 text-xs mt-1">{errors.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !isFormValid()}
                className={`w-full h-10 sm:h-11 md:h-12 rounded-lg text-white font-medium text-sm shadow-sm flex items-center justify-center gap-2 ${
                  isSubmitting || !isFormValid()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#579BE8] hover:bg-blue-700'
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
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactFormSection;