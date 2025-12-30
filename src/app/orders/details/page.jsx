'use client';

import OrderDetailsPage from '@/components/molecules/orders/OrderDetailsPage';
import { useRouter } from 'next/navigation';

export default function OrderDetailsRoute() {
  const router = useRouter();
  
  const handleBack = () => {
    router.push('/order/available-drivers');
  };
  
  return <OrderDetailsPage onBack={handleBack} />;
}