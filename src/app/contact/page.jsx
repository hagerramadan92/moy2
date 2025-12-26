'use client';

import ContactFormSection from '@/components/molecules/Contacts/ContactFormSection';
import ContactHero from '@/components/molecules/Contacts/ContactHero';
import VisionMissionSection from '@/components/molecules/Contacts/VisionMissionSection';
import SpecialOffersSection from '@/components/molecules/Contacts/SpecialOffersSection';
import Footer from '@/components/molecules/common/Footer';
import React from 'react';
import OrderForm from '@/components/molecules/orders/Order';
import SearchDriverPage from '@/components/molecules/orders/page2';


const ContactPage = () => {
  return (
    <main className="min-h-screen bg-gray-20">
      <ContactHero />
      <VisionMissionSection/>
      <ContactFormSection />
      <SpecialOffersSection/>
      <Footer />
<OrderForm/>
<SearchDriverPage/>
    </main>
  );
};

export default ContactPage;