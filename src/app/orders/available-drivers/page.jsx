'use client';

import AvailableDriversPage from '@/components/molecules/orders/AvailableDriversPage';
import { useRouter } from 'next/navigation';

export default function AvailableDriversRoute() {
  const router = useRouter();
  
  const handleBack = () => {
    router.push('/order/search-driver');
  };
  
  return <AvailableDriversPage onBack={handleBack} />;
}