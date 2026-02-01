'use client';
import { useState, useEffect } from 'react';
import AppPromotionSection from '@/components/molecules/Drivers/AppPromotionSection';
import AvailableSize from '@/components/molecules/homepage/AvailableSize';
import CallToActionSection from '@/components/molecules/Drivers/CallToActionSection';
import ChooseUs from '@/components/molecules/homepage/ChooseUs';
import CurrentLocation from '@/components/molecules/homepage/CurrentLocation';
import CustomerReviews from '@/components/molecules/homepage/CustomerReviews';
import Deals from '@/components/molecules/homepage/Deals';
import Footer from '@/components/molecules/common/Footer';
import HowItWorks from '@/components/molecules/homepage/HowItWorks';
import HomeCover from '@/components/molecules/homepage/HomeCover';



const page = () => {
	const [pageData, setPageData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchPageData = async () => {
			try {
				setLoading(true);
				setError(null);
				
				// Fetch page data for 'home' key
				const response = await fetch('/api/pages/home');
				const data = await response.json();
				
				
				if (response.ok && (data.success || data.status)) {
					setPageData(data.data);
				} else {
					throw new Error(data.message || 'Failed to fetch page data');
				}
			} catch (err) {
				console.error('Error fetching page data:', err);
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchPageData();
	}, []);

	// Render sections based on pageData
	const renderSection = (section) => {
		switch (section.type) {
			case 'hero':
				// Hero section - use HomeCover component
				return <HomeCover key={section.id} data={section} />;
			case 'features':
				// Features section - use ChooseUs component
				return <ChooseUs key={section.id} data={section} />;
			case 'packages':
				// Packages section - use AvailableSize component (doesn't use dynamic data)
				return <AvailableSize key={section.id} />;
			case 'steps':
				// Steps section - use HowItWorks component
				return <HowItWorks key={section.id} data={section} />;
			case 'testimonials':
				// Testimonials section - use CustomerReviews component
				return <CustomerReviews key={section.id} data={section} />;
			default:
				return null;
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="w-16 h-16 border-4 border-[#579BE8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
					<p className="text-gray-600">جاري تحميل الصفحة...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<p className="text-red-600 mb-4">{error}</p>
					<button
						onClick={() => window.location.reload()}
						className="px-6 py-2 bg-[#579BE8] text-white rounded-lg"
					>
						إعادة المحاولة
					</button>
				</div>
			</div>
		);
	}

	// If pageData exists, render sections dynamically, otherwise use default components
	if (pageData && pageData.sections && pageData.sections.length > 0) {
		// Sort sections by order
		const sortedSections = [...pageData.sections].sort((a, b) => (a.order || 0) - (b.order || 0));
		
		return (
			<> 
				{sortedSections.map(section => renderSection(section))}
			
				<Deals/>
				<AppPromotionSection />
				<CallToActionSection />
				<Footer/>
			</>
		);
	}

	// Fallback to default components if no data
	return (
		<> 

			<HomeCover/>
			<ChooseUs/>	
			<AvailableSize/>
			<HowItWorks/>
		
			<Deals/>
			<CustomerReviews/>
			<AppPromotionSection />
			<CallToActionSection />
			<Footer/>
		</>
	);
};

export default page;


