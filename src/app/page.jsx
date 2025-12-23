'use client';
import AvailableSize from '@/components/molecules/AvailableSize';
import ChooseUs from '@/components/molecules/ChooseUs';
import CurrentLocation from '@/components/molecules/CurrentLocation';
import CustomerReviews from '@/components/molecules/CustomerReviews';
import Footer from '@/components/molecules/Footer';
import HomeCover from '@/components/molecules/HomeCover';
import React from 'react';

const page = () => {
	return (
		<>
			<HomeCover />
			<ChooseUs />
			<AvailableSize />
			<CurrentLocation />
			<CustomerReviews />
			<Footer />
		</>
	);
};

export default page;


