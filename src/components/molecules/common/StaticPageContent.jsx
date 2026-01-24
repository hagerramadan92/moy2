"use client";

import React, { useState, useEffect } from "react";
import { FaChevronLeft } from "react-icons/fa";
import Link from "next/link";
import { motion } from "framer-motion";

export default function StaticPageContent({ 
  slug, 
  title, 
  backLink = "/",
  backLinkText = "العودة"
}) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!slug) {
          throw new Error('Slug is required');
        }
        
        
        // Use Next.js API route as proxy to avoid CORS issues
        const apiUrl = `/api/static-page?slug=${encodeURIComponent(slug)}`;
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        
        // Get response text first
        const responseText = await response.text();
        
        let responseData = {};
        try {
          if (responseText) {
            responseData = JSON.parse(responseText);
          } else {
            console.warn('Static page response is empty');
          }
        } catch (parseError) {
          console.error('Static page JSON parse error:', parseError);
          console.error('Response text that failed to parse:', responseText.substring(0, 200));
          responseData = { 
            error: 'Failed to parse response', 
            raw: responseText.substring(0, 200) 
          };
        }
        
        if (!response.ok) {
          const errorMessage = 
            responseData.message || 
            responseData.error || 
            responseData.errors?.message ||
            (responseData.raw ? `Invalid response format: ${responseData.raw}` : null) ||
            `فشل تحميل المحتوى (${response.status})`;
          
          console.error('Static page fetch error details:', {
            status: response.status,
            statusText: response.statusText,
            message: errorMessage,
            fullResponse: responseData,
            responseText: responseText.substring(0, 200),
            slug: slug,
            apiUrl: apiUrl
          });
          
          throw new Error(errorMessage);
        }
        
        // Check if response is empty or invalid
        if (!responseData || Object.keys(responseData).length === 0) {
          throw new Error('الاستجابة من الخادم فارغة أو غير صحيحة');
        }
        
        setContent(responseData);
      } catch (err) {
        console.error('Error fetching static page content:', err);
        setError(err.message || 'حدث خطأ أثناء تحميل المحتوى');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchContent();
    } else {
      setError('Slug is required');
      setLoading(false);
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#579BE8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background">
        <div className="max-w-7xl mx-auto px-3 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-2xl p-8 sm:p-12 text-center text-white shadow-2xl mb-8"
          >
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
                {title}
              </h1>
              <p className="text-white/90 max-w-2xl mx-auto text-base sm:text-lg">
                {error}
              </p>
            </div>
          </motion.div>

          {/* Back Button */}
          <div className="mb-6 text-center">
            <Link 
              href={backLink}
              className="inline-flex items-center gap-2 text-[#579BE8] hover:text-[#315782] font-bold transition-colors"
            >
              <FaChevronLeft className="text-sm" />
              {backLinkText}
            </Link>
          </div>

          {/* Error Details */}
          <div className="bg-white dark:bg-card rounded-2xl border border-red-200 dark:border-red-800 p-6 sm:p-8 shadow-sm">
            <div className="text-center space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                يرجى المحاولة مرة أخرى لاحقاً أو التواصل مع الدعم الفني إذا استمرت المشكلة.
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-500">
                <p>Slug: {slug}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Parse HTML content if it's a string, or display structured content
  const renderContent = () => {
    if (!content) return null;

    // If content has HTML
    if (content.content || content.body || content.html) {
      const htmlContent = content.content || content.body || content.html;
      return (
        <div 
          className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      );
    }

    // If content has structured data
    if (content.data) {
      const htmlContent = content.data.content || content.data.body || content.data.html || content.data;
      if (typeof htmlContent === 'string') {
        return (
          <div 
            className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        );
      }
    }

    // Fallback: display as JSON
    return (
      <div className="bg-white dark:bg-card rounded-2xl border border-border/50 p-6 sm:p-8">
        <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(content, null, 2)}</pre>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <div className="max-w-7xl mx-auto px-3 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-[#579BE8] via-[#579BE8] to-[#315782] rounded-2xl p-8 sm:p-12 text-center text-white shadow-2xl mb-8"
        >
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
              {content?.title || content?.data?.title || title}
            </h1>
            {content?.description || content?.data?.description ? (
              <p className="text-white/90 max-w-2xl mx-auto text-base sm:text-lg">
                {content.description || content.data?.description}
              </p>
            ) : null}
          </div>
        </motion.div>

        {/* Back Button */}
        <div className="mb-6">
          <Link 
            href={backLink}
            className="inline-flex items-center gap-2 text-[#579BE8] hover:text-[#315782] font-bold transition-colors"
          >
            <FaChevronLeft className="text-sm" />
            {backLinkText}
          </Link>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-card rounded-2xl border border-border/50 p-6 sm:p-8 shadow-sm"
        >
          {renderContent()}
        </motion.div>
      </div>
    </div>
  );
}

