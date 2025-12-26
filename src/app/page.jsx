'use client';
import AppPromotionSection from '@/components/molecules/Drivers/AppPromotionSection';
import AvailableSize from '@/components/molecules/homepage/AvailableSize';
import CallToActionSection from '@/components/molecules/Drivers/CallToActionSection';
import ChooseUs from '@/components/molecules/homepage/ChooseUs';
import CurrentLocation from '@/components/molecules/homepage/CurrentLocation';
import CustomerReviews from '@/components/molecules/homepage/CustomerReviews';
import Deals from '@/components/molecules/homepage/Deals';
import Footer from '@/components/molecules/common/Footer';
import HowItWorks from '@/components/molecules/homepage/HowItWorks';
import HowToUseAppSection from '@/components/molecules/Drivers/HowToUseAppSection';
import React from 'react';
import HomeCover from '@/components/molecules/homepage/HomeCover';

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


