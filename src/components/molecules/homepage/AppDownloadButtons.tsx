"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";

// Define the expected shape of an app link from the API
type AppLink = {
  name: string;
  url: string;
};

// Define the props for our component
interface AppDownloadButtonsProps {
  className?: string;
  userType: 'user' | 'driver'; // <-- NEW PROP: Specify which set of links to use
}

export default function AppDownloadButtons({ className = "", userType }: AppDownloadButtonsProps) {
  const [appLinks, setAppLinks] = useState<{ googlePlay?: string; appStore?: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppLinks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('https://dashboard.waytmiah.com/api/v1/support/apps');
        if (!response.ok) {
          throw new Error('فشل في تحميل روابط التطبيقات');
        }
        const result = await response.json();

        if (result.status && result.data) {
          // Find the correct URLs based on the userType prop
          const googlePlayKey = `${userType}_google_play`;
          const appleStoreKey = `${userType}_apple_store`;

          const googlePlayLink = result.data.find((link: AppLink) => link.name === googlePlayKey);
          const appleStoreLink = result.data.find((link: AppLink) => link.name === appleStoreKey);

          setAppLinks({
            googlePlay: googlePlayLink?.url,
            appStore: appleStoreLink?.url,
          });
        } else {
          throw new Error('بيانات الروابط غير صالحة');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
        console.error("Failed to fetch app links:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppLinks();
  }, [userType]); // Re-fetch if userType changes

  // Handle loading and error states gracefully
  if (isLoading) {
    return (
      <div className={`flex items-stretch sm:items-center gap-3 sm:gap-4 ${className}`}>
        <div className="w-full sm:w-36 h-16 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="w-full sm:w-36 h-16 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    // In case of error, you might want to hide the buttons or show a message.
    // For now, we'll render nothing.
    console.error(error);
    return null;
  }

  // Function to handle button click and open the URL
  const handleButtonClick = (url: string | undefined) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={`flex items-stretch sm:items-center gap-3 sm:gap-4 ${className}`}>
      {/* جوجل بلاي */}
      <button
        onClick={() => handleButtonClick(appLinks.googlePlay)}
        disabled={!appLinks.googlePlay}
        className="flex flex-row-reverse items-center justify-start gap-2 sm:gap-3 px-3 py-2 rounded-lg border cursor-pointer shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto text-white border-[#94c5f8] bg-gradient-to-r from-[#579BE8] to-[#124987] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        <Image
          src="/images/Playstore.png"
          width={28}
          height={34}
          alt="جوجل بلاي"
          className="w-6 h-7 flex-shrink-0"
        />
        <div className="text-right">
          <p className="text-[10px] sm:text-xs leading-tight">متوفر على</p>
          <p className="text-xs font-semibold leading-tight">جوجل بلاي</p>
        </div>
      </button>

      {/* آب ستور */}
      <button
        onClick={() => handleButtonClick(appLinks.appStore)}
        disabled={!appLinks.appStore}
        className="flex flex-row-reverse items-center justify-start gap-2 sm:gap-3 px-3 py-2 rounded-lg border shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto text-white border-[#94c5f8] bg-gradient-to-r from-[#579BE8] to-[#124987] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        <Image
          src="/images/app.png"
          width={28}
          height={34}
          alt="آب ستور"
          className="w-6 h-7 flex-shrink-0"
        />
        <div className="text-right">
          <p className="text-[10px] sm:text-xs leading-tight">متوفر على</p>
          <p className="text-xs font-semibold leading-tight">آب ستور</p>
        </div>
      </button>
    </div>
  );
}