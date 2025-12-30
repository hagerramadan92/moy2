'use client';

import SearchDriverPage from '@/components/molecules/orders/SearchDriverPage';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SearchDriverRoute() {
  const router = useRouter();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/orders/available-drivers');
    }, 2000); 
    
    return () => clearTimeout(timer);
  }, [router]);
  
  const handleBack = () => {
    router.push('/orders');
  };
  
  return <SearchDriverPage onBack={handleBack} />;
}