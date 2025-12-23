'use client';
import AvailableSize from '@/components/molecules/AvailableSize';
import ChooseUs from '@/components/molecules/ChooseUs';
import CustomerReviews from '@/components/molecules/CustomerReviews';
import Deals from '@/components/molecules/Deals';
import Footer from '@/components/molecules/Footer';
import HomeCover from '@/components/molecules/HomeCover';
import HowItWorks from '@/components/molecules/HowItWorks';
import React from 'react';

const page = () => {
	return (
		<>
		<HomeCover/>
		<ChooseUs/>	
		<AvailableSize/>
		<HowItWorks/>
		<Deals/>
		<CustomerReviews/>
		<Footer/>
		</>
	);
};

export default page;


