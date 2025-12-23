'use client';

import ContactFormSection from '@/components/molecules/Contacts/ContactFormSection';
import ContactHero from '@/components/molecules/Contacts/ContactHero';
import VisionMissionSection from '@/components/molecules/Contacts/VisionMissionSection';
import SpecialOffersSection from '@/components/molecules/Contacts/SpecialOffersSection';
import Footer from '@/components/molecules/Footer';
import React from 'react';


const ContactPage = () => {
  return (
    <main className="min-h-screen bg-gray-20">
      <ContactHero />
      <VisionMissionSection/>
      <ContactFormSection />
      <SpecialOffersSection/>
      <Footer />

    </main>
  );
};

export default ContactPage;