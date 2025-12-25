'use client';
import AppPromotionSection from '@/components/molecules/Drivers/AppPromotionSection';
import AvailableSize from '@/components/molecules/AvailableSize';
import CallToActionSection from '@/components/molecules/Drivers/CallToActionSection';
import ChooseUs from '@/components/molecules/ChooseUs';
import CurrentLocation from '@/components/molecules/CurrentLocation';
import CustomerReviews from '@/components/molecules/CustomerReviews';
import Deals from '@/components/molecules/Deals';
import Footer from '@/components/molecules/Footer';
import HomeCover from '@/components/molecules/HomeCover';
import HowItWorks from '@/components/molecules/HowItWorks';
import HowToUseAppSection from '@/components/molecules/Drivers/HowToUseAppSection';
import React from 'react';

const page = () => {
	return (
		<> 
		<HomeCover/>
		<ChooseUs/>	
		<AvailableSize/>
		<HowItWorks/>
		<CurrentLocation/>
		<Deals/>
		<CustomerReviews/>
		 <HowToUseAppSection />
		<AppPromotionSection />
		<CallToActionSection />
		<Footer/>
		</>
	);
};

export default page;


