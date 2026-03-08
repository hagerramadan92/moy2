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

const CACHE_KEY = 'waytmiah_homepage_data';
const CACHE_DURATION = 10 * 60 * 1000; 

const Page = () => {
	const [pageData, setPageData] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchPageData = async () => {
			try {
				setLoading(true);
				
				
				const cachedData = getCachedData();
				
				if (cachedData) {
					
					
					setPageData(cachedData);
					setLoading(false);
					
					
					fetchFreshDataInBackground();
					return;
				}
				
				
				
				await fetchFreshData();
				
			} catch (err) {
				console.error('Error in fetch flow:', err);
				
				const fallbackCache = getCachedData(true);
				if (fallbackCache) {
					
					setPageData(fallbackCache);
				}
			} finally {
				setLoading(false);
			}
		};

		fetchPageData();
	}, []);

	// دالة جلب البيانات من الكاش
	const getCachedData = (ignoreExpiry = false) => {
		try {
			const cached = localStorage.getItem(CACHE_KEY);
			if (!cached) return null;
			
			const { data, timestamp } = JSON.parse(cached);
			
			// لو عاوز تتجاهل مدة الصلاحية (في حالة الخطأ)
			if (ignoreExpiry) return data;
			
			// لو البيانات لسه صالحة
			if (Date.now() - timestamp < CACHE_DURATION) {
				return data;
			}
			
			return null;
		} catch (e) {
			console.error('Error reading cache:', e);
			return null;
		}
	};

	// دالة تخزين البيانات في الكاش
	const setCachedData = (data) => {
		try {
			localStorage.setItem(CACHE_KEY, JSON.stringify({
				data,
				timestamp: Date.now()
			}));
			
		} catch (e) {
			console.error('Error setting cache:', e);
		}
	};

	// دالة جلب بيانات جديدة (الأساسية)
	const fetchFreshData = async () => {
		try {
			const response = await fetch('https://dashboard.waytmiah.com/api/v1/pages/home', {
				headers: {
					'Accept': 'application/json',
					'Cache-Control': 'no-cache'
				}
			});
			
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			
			const data = await response.json();
			
			// التحقق من صحة البيانات
			if (data && (data.success || data.status) && data.data) {
				setPageData(data.data);
				setCachedData(data.data); 
				console.log('✅ Fresh data fetched and cached');
			} else {
				console.warn('Invalid data structure:', data);
			}
			
		} catch (err) {
			console.error('Error fetching fresh data:', err);
			throw err; 
		}
	};

	
	const fetchFreshDataInBackground = async () => {
		try {
			console.log('🔄 Background refresh started');
			const response = await fetch('https://dashboard.waytmiah.com/api/v1/pages/home', {
				headers: {
					'Accept': 'application/json',
					'Cache-Control': 'no-cache'
				}
			});
			
			if (!response.ok) return;
			
			const data = await response.json();
			
			if (data && (data.success || data.status) && data.data) {
				// قارن هل البيانات اختلفت؟
				const currentData = getCachedData(true);
				if (JSON.stringify(currentData) !== JSON.stringify(data.data)) {
					console.log('🔄 Data changed, updating...');
					setPageData(data.data);
					setCachedData(data.data);
				} else {
					console.log('🔄 Data unchanged, cache is fresh');
					
					setCachedData(currentData);
				}
			}
		} catch (err) {
			console.error('Background refresh failed:', err);
			// silent fail - مش هنظهر حاجة للمستخدم
		}
	};

	// دالة عرض الأقسام
	const renderSection = (section) => {
		if (!section || section.is_active === false) return null;
		
		switch (section.type) {
			case 'hero':
				return <HomeCover key={section.id} data={section} />;
			case 'features':
				return <ChooseUs key={section.id} data={section} />;
			case 'packages':
				return <AvailableSize key={section.id} />;
			case 'steps':
				return <HowItWorks key={section.id} data={section} />;
			case 'testimonials':
				return <CustomerReviews key={section.id} data={section} />;
			default:
				return null;
		}
	};

	
	const getMergedSections = () => {
		const staticSections = [
			{ type: 'deals', component: Deals, isStatic: true, order: 999 },
			{ type: 'appPromotion', component: AppPromotionSection, isStatic: true, order: 1000 },
			{ type: 'callToAction', component: CallToActionSection, isStatic: true, order: 1001 },
		];

	
		if (!pageData?.sections?.length) {
			return [
				{ type: 'hero', component: HomeCover, isStatic: true },
				{ type: 'features', component: ChooseUs, isStatic: true },
				{ type: 'packages', component: AvailableSize, isStatic: true },
				{ type: 'steps', component: HowItWorks, isStatic: true },
				{ type: 'deals', component: Deals, isStatic: true },
				{ type: 'testimonials', component: CustomerReviews, isStatic: true },
				{ type: 'appPromotion', component: AppPromotionSection, isStatic: true },
				{ type: 'callToAction', component: CallToActionSection, isStatic: true },
				{ type: 'footer', component: Footer, isStatic: true }
			];
		}

		const dynamicSections = pageData.sections
			.filter(section => section.is_active !== false)
			.sort((a, b) => (a.order || 0) - (b.order || 0))
			.map(section => ({
				...section,
				component: (() => {
					switch (section.type) {
						case 'hero': return HomeCover;
						case 'features': return ChooseUs;
						case 'packages': return AvailableSize;
						case 'steps': return HowItWorks;
						case 'testimonials': return CustomerReviews;
						case 'deals': return Deals;
						case 'appPromotion': return AppPromotionSection;
						case 'callToAction': return CallToActionSection;
						default: return null;
					}
				})(),
				props: section.data ? { data: section } : {}
			}))
			.filter(section => section.component !== null);

		const allSections = [...dynamicSections];
		const existingTypes = new Set(dynamicSections.map(s => s.type));
		
		staticSections.forEach(staticSection => {
			if (!existingTypes.has(staticSection.type)) {
				allSections.push({
					...staticSection,
					component: staticSection.component,
					props: {}
				});
			}
		});

		
		allSections.sort((a, b) => (a.order || 0) - (b.order || 0));
			// أضف الفوتر في النهاية
		allSections.push({ 
			type: 'footer', 
			component: Footer, 
			isStatic: true,
			order: 9999
		});

		return allSections;
	};

	// Skeleton Components
	const HomeCoverSkeleton = () => (
		<div className="cover relative px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
			<div className="container mx-auto">
				<div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
					<div className="form-left content-left order-1 md:order-2 rounded-xl sm:rounded-2xl md:rounded-[26px] border border-[#FFFFFF26] sm:border-2 md:border-[12px] lg:border-[20px] shadow-lg overflow-hidden">
						<div className="bg-[#FFFFFF26] h-full p-2 py-6 md:py-3">
							<div className="bg-[#EFF5FD] px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 rounded-2xl sm:rounded-3xl flex flex-col gap-4 sm:gap-6 shadow-xl w-full max-w-md mx-auto h-[420px] sm:h-[440px] md:h-[460px] lg:h-[500px]">
								<div className="text-center mb-4">
									<div className="h-7 sm:h-8 md:h-10 w-48 sm:w-56 md:w-64 bg-gray-300 dark:bg-gray-700 rounded-xl animate-pulse mx-auto mb-3"></div>
									<div className="h-4 w-40 sm:w-48 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse mx-auto"></div>
								</div>
								<div className="space-y-2">
									<div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
									<div className="h-14 w-full bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
								</div>
								<div className="space-y-2">
									<div className="h-4 w-28 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
									<div className="h-14 w-full bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
								</div>
								<div className="mt-6">
									<div className="h-14 w-full bg-gray-300 dark:bg-gray-700 rounded-xl animate-pulse"></div>
								</div>
							</div>
						</div>
					</div>
					<div className="content-right order-2 md:order-1">
						<div className="h-8 sm:h-10 md:h-12 lg:h-14 w-3/4 sm:w-4/5 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse mb-4 sm:mb-6"></div>
						<div className="space-y-2 mb-6 sm:mb-8">
							<div className="h-5 sm:h-6 md:h-7 w-full bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
							<div className="h-5 sm:h-6 md:h-7 w-5/6 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
						</div>
						<div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
							<div className="h-12 w-36 sm:w-40 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
							<div className="h-12 w-36 sm:w-40 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);

	const ChooseUsSkeleton = () => (
		<div className="py-8 sm:py-12 md:py-16 lg:py-20">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
				<div className="text-center mb-8 sm:mb-12 md:mb-16">
					<div className="h-8 sm:h-10 md:h-12 w-64 sm:w-80 md:w-96 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse mx-auto mb-4"></div>
					<div className="h-4 sm:h-5 w-48 sm:w-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse mx-auto"></div>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
					{[1, 2, 3, 4, 5, 6].map((i) => (
						<div key={i} className="bg-white dark:bg-card border border-border/60 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm">
							<div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse mb-4"></div>
							<div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-3"></div>
							<div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
							<div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
						</div>
					))}
				</div>
			</div>
		</div>
	);

	const AvailableSizeSkeleton = () => (
		<div className="py-8 sm:py-12 md:py-16 bg-secondary/10">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
				<div className="text-center mb-8 sm:mb-12">
					<div className="h-8 sm:h-10 w-56 sm:w-72 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse mx-auto mb-4"></div>
					<div className="h-4 w-48 sm:w-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse mx-auto"></div>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
					{[1, 2, 3, 4].map((i) => (
						<div key={i} className="bg-white dark:bg-card border border-border/60 rounded-2xl sm:rounded-3xl p-6 shadow-sm">
							<div className="h-32 sm:h-40 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse mb-4"></div>
							<div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-3"></div>
							<div className="h-5 w-1/2 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
						</div>
					))}
				</div>
			</div>
		</div>
	);

	const HowItWorksSkeleton = () => (
		<div className="py-8 sm:py-12 md:py-16">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
				<div className="text-center mb-8 sm:mb-12 md:mb-16">
					<div className="h-8 sm:h-10 w-64 sm:w-80 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse mx-auto mb-4"></div>
					<div className="h-4 w-56 sm:w-72 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse mx-auto"></div>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
					{[1, 2, 3, 4].map((i) => (
						<div key={i} className="text-center">
							<div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mx-auto mb-4"></div>
							<div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mx-auto mb-3"></div>
							<div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
							<div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto"></div>
						</div>
					))}
				</div>
			</div>
		</div>
	);

	const CustomerReviewsSkeleton = () => (
		<div className="py-8 sm:py-12 md:py-16 bg-secondary/10">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
				<div className="text-center mb-8 sm:mb-12">
					<div className="h-8 sm:h-10 w-64 sm:w-80 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse mx-auto mb-4"></div>
					<div className="h-4 w-56 sm:w-72 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse mx-auto"></div>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
					{[1, 2, 3].map((i) => (
						<div key={i} className="bg-white dark:bg-card border border-border/60 rounded-2xl sm:rounded-3xl p-6 shadow-sm">
							<div className="flex items-center gap-4 mb-4">
								<div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
								<div className="flex-1">
									<div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-2"></div>
									<div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
								</div>
							</div>
							<div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
							<div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
						</div>
					))}
				</div>
			</div>
		</div>
	);

	const DealsSkeleton = () => (
		<div className="py-8 sm:py-12 md:py-16">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
				<div className="h-8 sm:h-10 w-48 sm:w-64 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse mx-auto mb-8"></div>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{[1, 2, 3].map((i) => (
						<div key={i} className="bg-white dark:bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
							<div className="h-40 sm:h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse mb-4"></div>
							<div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-3"></div>
							<div className="h-5 w-1/2 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
						</div>
					))}
				</div>
			</div>
		</div>
	);

	const AppPromotionSkeleton = () => (
		<div className="py-8 sm:py-12 md:py-16 bg-gradient-to-br from-[#579BE8] to-[#315782]">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
					<div className="space-y-4">
						<div className="h-8 sm:h-10 w-3/4 bg-white/20 rounded-2xl animate-pulse"></div>
						<div className="h-6 w-full bg-white/15 rounded-xl animate-pulse"></div>
						<div className="h-6 w-5/6 bg-white/15 rounded-xl animate-pulse"></div>
						<div className="flex gap-4 mt-6">
							<div className="h-12 w-32 bg-white/20 rounded-xl animate-pulse"></div>
							<div className="h-12 w-32 bg-white/20 rounded-xl animate-pulse"></div>
						</div>
					</div>
					<div className="h-64 sm:h-80 bg-white/10 rounded-2xl animate-pulse"></div>
				</div>
			</div>
		</div>
	);

	const CallToActionSkeleton = () => (
		<div className="py-8 sm:py-12 md:py-16">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 text-center">
				<div className="h-8 sm:h-10 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse mx-auto mb-4"></div>
				<div className="h-5 w-2/3 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse mx-auto mb-8"></div>
				<div className="h-12 w-48 bg-[#579BE8] rounded-2xl animate-pulse mx-auto"></div>
			</div>
		</div>
	);

	
	if (loading) {
		return (
			<div className="space-y-0">
				<HomeCoverSkeleton />
				<ChooseUsSkeleton />
				<AvailableSizeSkeleton />
				<HowItWorksSkeleton />
				<DealsSkeleton />
				<CustomerReviewsSkeleton />
				<AppPromotionSkeleton />
				<CallToActionSkeleton />
				<Footer />
			</div>
		);
	}

	
	const mergedSections = getMergedSections();

	return (
		<>
			{mergedSections.map((section, index) => {
				const Component = section.component;
				
				
				if (section.isStatic) {
					return <Component key={`static-${section.type}-${index}`} />;
				}
				
			
				return <Component 
					key={section.id || `dynamic-${section.type}-${index}`} 
					data={section} 
				/>;
			})}
		</>
	);
};

export default Page;