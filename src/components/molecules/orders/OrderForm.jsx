'use client';

import Image from 'next/image';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Droplets, Scale, Calendar, ArrowRight, Truck, CheckCircle2, AlertCircle, Search, ArrowLeft, ChevronDown, ChevronUp, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { FaStar, FaMapMarkerAlt, FaHome, FaBriefcase, FaMapMarkedAlt } from 'react-icons/fa';

import OrderSchedulePage from './OrderSchedulePage';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import api from '@/utils/api';
import Spinner from "@/components/ui/spinner";
import WaterTypeSelect from '@/components/common/WaterTypeSelect';

const LocationPickerModal = dynamic(
	() => import('./LocationPickerModal'),
	{ ssr: false }
);

const API_BASE_URL = "https://moya.talaaljazeera.com/api/v1";

// Separate component that uses useSearchParams
function OrderFormContent() {
	// State management
	const [waterType, setWaterType] = useState('');
	const [quantity, setQuantity] = useState('');
	const [selectedSavedLocation, setSelectedSavedLocation] = useState(null);
	const [showSchedule, setShowSchedule] = useState(false);
	const [isMapOpen, setIsMapOpen] = useState(false);
	const [savedLocations, setSavedLocations] = useState([]);
	const [loadingLocations, setLoadingLocations] = useState(false);
	const [showAllLocations, setShowAllLocations] = useState(false);
	const [isManualLocation, setIsManualLocation] = useState(false);
	const [locationData, setLocationData] = useState(null);
	
	// New states for API data
	const [waterTypes, setWaterTypes] = useState([]);
	const [services, setServices] = useState([]);
	const [loadingWaterTypes, setLoadingWaterTypes] = useState(false);
	const [loadingServices, setLoadingServices] = useState(false);
	
	const searchParams = useSearchParams();

	useEffect(() => {
		setWaterType(searchParams.get("waterType") || "");
		setQuantity(searchParams.get("waterSize") || "");
	}, [searchParams]);

	// Fetch all required data on component mount
	useEffect(() => {
		fetchAllData();
	}, []);

	// Fetch all required data
	const fetchAllData = async () => {
		try {
			await Promise.all([
				fetchSavedLocations(),
				fetchWaterTypes(),
				fetchServices()
			]);
		} catch (error) {
			console.error("Error fetching all data:", error);
			toast.error("حدث خطأ في تحميل البيانات");
		}
	};

	// Fetch water types from API
	const fetchWaterTypes = async () => {
		try {
			setLoadingWaterTypes(true);
			const response = await fetch(`${API_BASE_URL}/type-water`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"Accept": "application/json",
				},
			});

			const data = await response.json();
			if (response.ok && data.status && data.data) {
				setWaterTypes(data.data);
				// If water type is passed in URL params, validate it exists
				const urlWaterType = searchParams.get("waterType");
				if (urlWaterType && data.data.some(wt => wt.id.toString() === urlWaterType)) {
					setWaterType(urlWaterType);
				}
			} else {
				toast.error(data.message || "فشل جلب أنواع المياه");
			}
		} catch (error) {
			console.error("Error fetching water types:", error);
			toast.error("حدث خطأ أثناء جلب أنواع المياه");
		} finally {
			setLoadingWaterTypes(false);
		}
	};

	// Fetch services from API
	const fetchServices = async () => {
		try {
			setLoadingServices(true);
			const response = await fetch(`${API_BASE_URL}/services`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"Accept": "application/json",
				},
			});

			const data = await response.json();
			if (response.ok && data.status && data.data) {
				// Filter only active services
				const activeServices = data.data.filter(service => service.is_active === 1);
				setServices(activeServices);
				// If quantity is passed in URL params, validate it exists
				const urlQuantity = searchParams.get("waterSize");
				if (urlQuantity && activeServices.some(s => s.id.toString() === urlQuantity)) {
					setQuantity(urlQuantity);
				}
			} else {
				toast.error(data.message || "فشل جلب الخدمات");
			}
		} catch (error) {
			console.error("Error fetching services:", error);
			toast.error("حدث خطأ أثناء جلب الخدمات");
		} finally {
			setLoadingServices(false);
		}
	};

	// Fetch saved locations from API
	const fetchSavedLocations = async () => {
		const accessToken = localStorage.getItem("accessToken");
		if (!accessToken) {
			toast.error("يرجى تسجيل الدخول أولاً");
			router.push('/login');
			return;
		}

		try {
			setLoadingLocations(true);
			const response = await fetch(`${API_BASE_URL}/addresses`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"Accept": "application/json",
					"Authorization": `Bearer ${accessToken}`,
				},
			});

			const data = await response.json();
			if (response.ok && data.status && data.data) {
				setSavedLocations(data.data);
				// If there are saved locations, select the first favorite or first one
				if (data.data.length > 0) {
					const favoriteLocation = data.data.find(loc => loc.is_favorite);
					if (favoriteLocation) {
						setSelectedSavedLocation(favoriteLocation);
						setLocationData({
							...favoriteLocation,
							latitude: parseFloat(favoriteLocation.latitude),
							longitude: parseFloat(favoriteLocation.longitude)
						});
					} else {
						setSelectedSavedLocation(data.data[0]);
						setLocationData({
							...data.data[0],
							latitude: parseFloat(data.data[0].latitude),
							longitude: parseFloat(data.data[0].longitude)
						});
					}
				}
			} else {
				toast.error(data.message || "فشل جلب الأماكن المحفوظة");
			}
		} catch (error) {
			console.error("Error fetching saved locations:", error);
			toast.error("حدث خطأ أثناء جلب الأماكن المحفوظة");
		} finally {
			setLoadingLocations(false);
		}
	};

	// Navigate to saved addresses page
	const navigateToAddressesPage = () => {
		router.push('/addresses?fromOrder=true');
	};

	// Handle manual location selection from map
	const handleManualLocationSelect = (data) => {
		setLocationData(data);
		setSelectedSavedLocation(null);
		setIsManualLocation(true);
		setIsMapOpen(false);
	};

	// Handle saved location selection
	const handleSavedLocationSelect = (location) => {
		setSelectedSavedLocation(location);
		setLocationData({
			...location,
			latitude: parseFloat(location.latitude),
			longitude: parseFloat(location.longitude)
		});
		setIsManualLocation(false);
	};

	// Clear location selection
	const handleClearLocation = () => {
		setLocationData(null);
		setSelectedSavedLocation(null);
		setIsManualLocation(false);
	};

	// Validation state - tracks which fields have been interacted with
	const [touched, setTouched] = useState({
		location: false,
		waterType: false,
		quantity: false
	});
	const [attemptedSubmit, setAttemptedSubmit] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const router = useRouter();

	// Validation helpers
	const validation = {
		location: !!locationData,
		waterType: !!waterType,
		quantity: !!quantity
	};

	const showError = (field) => (touched[field] || attemptedSubmit) && !validation[field];
	const showSuccess = (field) => validation[field];

	const getFieldStatus = (field) => {
		if (showSuccess(field)) return 'success';
		if (showError(field)) return 'error';
		return 'default';
	};

	// 🔴 🔴 **التعديل الرئيسي هنا: دالة handleOrderNow** 🔴 🔴
	const handleOrderNow = async () => {
		setAttemptedSubmit(true);

		// Validate required fields
		if (!locationData) {
			toast.error('الرجاء تحديد الموقع أولاً');
			return;
		}
		if (!waterType) {
			toast.error('الرجاء اختيار نوع المياه');
			return;
		}
		if (!quantity) {
			toast.error('الرجاء اختيار الكمية');
			return;
		}

		setIsLoading(true);

		try {
			const accessToken = localStorage.getItem("accessToken");
			if (!accessToken) {
				toast.error("يرجى تسجيل الدخول أولاً");
				router.push('/login');
				return;
			}

			// Prepare order data
			const orderData = {
				service_id: parseInt(quantity), // service_id is the quantity ID
				water_type_id: parseInt(waterType),
				saved_location_id: selectedSavedLocation ? selectedSavedLocation.id : null
			};

			// If manual location is selected, create a new address first
			let savedLocationId = selectedSavedLocation ? selectedSavedLocation.id : null;
			
			if (isManualLocation && locationData) {
				// Create new address from manual location
				const newAddressResponse = await fetch(`${API_BASE_URL}/addresses`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"Accept": "application/json",
						"Authorization": `Bearer ${accessToken}`,
					},
					body: JSON.stringify({
						name: locationData.name || 'موقع الطلب',
						address: locationData.address,
						city: locationData.city || 'الرياض',
						area: locationData.area || 'حي عام',
						latitude: locationData.latitude,
						longitude: locationData.longitude,
						type: 'other',
						is_favorite: false,
						additional_info: 'موقع طلب'
					}),
				});

				const addressData = await newAddressResponse.json();
				if (newAddressResponse.ok && addressData.status && addressData.data) {
					savedLocationId = addressData.data.id;
				} else {
					toast.error("فشل حفظ العنوان الجديد");
					setIsLoading(false);
					return;
				}
			}

			// Update order data with saved location ID
			orderData.saved_location_id = savedLocationId;

			// Send order request
			const response = await fetch(`${API_BASE_URL}/orders`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Accept": "application/json",
					"Authorization": `Bearer ${accessToken}`,
				},
				body: JSON.stringify(orderData),
			});

			const data = await response.json();
			console.log('📦 Order creation response:', data); // ✅ للتحقق من شكل الـ response
			
			if (response.ok && data.status) {
				toast.success(data.message || "تم إنشاء الطلب بنجاح!");
				
				// ✅ ✅ **الحل: الحصول على orderId من الـ response** ✅ ✅
				let orderId;
				
				// حاول الحصول على orderId بطرق مختلفة حسب هيكل الـ response
				if (data.data?.id) {
					// الحالة 1: data.data.id
					orderId = data.data.id;
				} else if (data.data?.order_id) {
					// الحالة 2: data.data.order_id
					orderId = data.data.order_id;
				} else if (data.id) {
					// الحالة 3: data.id
					orderId = data.id;
				} else if (data.order_id) {
					// الحالة 4: data.order_id
					orderId = data.order_id;
				} else if (data.order?.id) {
					// الحالة 5: data.order.id
					orderId = data.order.id;
				} else {
					// إذا لم يتم العثور على orderId، استخدم fallback
					console.warn('⚠️ Could not find orderId in response');
					toast.error('لم يتم الحصول على رقم الطلب من الخادم');
					setIsLoading(false);
					return;
				}
				
				console.log('✅ Order ID retrieved:', orderId);
				
				// ✅ **التوجيه الصحيح لصفحة السائقين المتاحين مع orderId**
				router.push(`/orders/available-drivers?orderId=${orderId}`);
				
			} else {
				toast.error(data.message || "فشل إنشاء الطلب");
			}
		} catch (error) {
			console.error("Error creating order:", error);
			toast.error("حدث خطأ أثناء إنشاء الطلب");
		} finally {
			setIsLoading(false);
		}
	};

	// Handle scheduled order
	const handleScheduleOrder = async (scheduleData) => {
		setAttemptedSubmit(true);

		// Validate required fields
		if (!locationData) {
			toast.error('الرجاء تحديد الموقع أولاً');
			return;
		}
		if (!waterType) {
			toast.error('الرجاء اختيار نوع المياه');
			return;
		}
		if (!quantity) {
			toast.error('الرجاء اختيار الكمية');
			return;
		}

		setIsLoading(true);

		try {
			const accessToken = localStorage.getItem("accessToken");
			if (!accessToken) {
				toast.error("يرجى تسجيل الدخول أولاً");
				
				return;
			}

			// Prepare order data with schedule
			const orderData = {
				service_id: parseInt(quantity),
				water_type_id: parseInt(waterType),
				saved_location_id: selectedSavedLocation ? selectedSavedLocation.id : null,
				order_date: scheduleData.dateTime,
				notes: scheduleData.notes || "توصيل مجدول"
			};

			// If manual location is selected, create a new address first
			let savedLocationId = selectedSavedLocation ? selectedSavedLocation.id : null;
			
			if (isManualLocation && locationData) {
				const newAddressResponse = await fetch(`${API_BASE_URL}/addresses`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"Accept": "application/json",
						"Authorization": `Bearer ${accessToken}`,
					},
					body: JSON.stringify({
						name: locationData.name || 'موقع مجدول',
						address: locationData.address,
						city: locationData.city || 'الرياض',
						area: locationData.area || 'حي عام',
						latitude: locationData.latitude,
						longitude: locationData.longitude,
						type: 'other',
						is_favorite: false,
						additional_info: 'موقع مجدول'
					}),
				});

				const addressData = await newAddressResponse.json();
				if (newAddressResponse.ok && addressData.status && addressData.data) {
					savedLocationId = addressData.data.id;
				} else {
					toast.error("فشل حفظ العنوان الجديد");
					setIsLoading(false);
					return;
				}
			}

			// Update order data with saved location ID
			orderData.saved_location_id = savedLocationId;

			// Send scheduled order request
			const response = await fetch(`${API_BASE_URL}/orders`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Accept": "application/json",
					"Authorization": `Bearer ${accessToken}`,
				},
				body: JSON.stringify(orderData),
			});

			const data = await response.json();
			
			if (response.ok && data.status) {
				toast.success(data.message || "تم جدولة الطلب بنجاح!");
				// Navigate back to orders list or home
				router.push('/orders');
			} else {
				toast.error(data.message || "فشل جدولة الطلب");
			}
		} catch (error) {
			console.error("Error scheduling order:", error);
			toast.error("حدث خطأ أثناء جدولة الطلب");
		} finally {
			setIsLoading(false);
		}
	};

	if (showSchedule) {
		return <OrderSchedulePage 
			onBack={() => setShowSchedule(false)} 
			onSchedule={handleScheduleOrder}
			locationData={locationData}
			selectedSavedLocation={selectedSavedLocation}
			isManualLocation={isManualLocation}
			waterType={waterType}
			quantity={quantity}
			waterTypes={waterTypes}
			services={services}
		/>;
	}

	// Filter locations for display
	const displayedLocations = showAllLocations 
		? savedLocations 
		: savedLocations.slice(0, 1);

	// Get selected water type name
	const selectedWaterTypeName = waterTypes.find(wt => wt.id.toString() === waterType)?.name || '';

	// Get selected service name
	const selectedServiceName = services.find(s => s.id.toString() === quantity)?.name || '';

	// Animation variants
	const containerVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
	};

	const itemVariants = {
		hidden: { opacity: 0, x: -20 },
		visible: { opacity: 1, x: 0 }
	};

	return (
		<div className="min-h-screen bg-gray-50/50 p-4 md:p-8 flex justify-center items-start pt-12 md:pt-16">
			<LocationPickerModal
				isOpen={isMapOpen}
				onClose={() => setIsMapOpen(false)}
				onSelect={handleManualLocationSelect}
			/>

			<motion.div
				initial="hidden"
				animate="visible"
				variants={containerVariants}
				className="w-full max-w-3xl space-y-6 relative"
			>

				{/* Header */}
				<motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl p-6 shadow-lg border border-[#579BE8]/20 bg-gradient-to-r from-[#579BE8] via-[#4a8dd8] to-[#124987]">
					<div className="absolute inset-0 overflow-hidden">
						<div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse" />
						<div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-xl" />
					</div>
					<div className="relative flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-bold text-white font-cairo mb-1">اطلب الان</h1>
							<p className="text-white/80 text-sm">قم بملء البيانات التالية لإتمام طلبك</p>
						</div>
						<div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white border border-white/30">
							<Truck size={24} />
						</div>
					</div>
				</motion.div>

				{/* Form Card */}
				<div className="bg-white rounded-3xl p-6 lg:p-8 shadow-xl shadow-[#124987]/10 border border-[#579BE8]/20 relative overflow-hidden">

					<div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#579BE8] via-[#4a8dd8] to-[#124987]" />

					<div className="space-y-8">

						{/* Location Section */}
						<motion.div variants={itemVariants} className="space-y-4">
							<div className="flex items-center justify-between mb-2">
								<label className="flex items-center gap-2 text-gray-700 font-bold">
									<MapPin size={20} className={getFieldStatus('location') === 'error' ? 'text-red-500' : 'text-[#579BE8]'} />
									موقع التوصيل
									{showSuccess('location') && (
										<motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="mr-auto">
											<CheckCircle2 size={18} className="text-[#579BE8]" />
										</motion.span>
									)}
								</label>
								<button
									onClick={navigateToAddressesPage}
									className="text-xs px-3 py-1.5 bg-[#579BE8]/10 text-[#579BE8] rounded-lg hover:bg-[#579BE8]/20 transition-colors font-medium flex items-center gap-1"
								>
									<FaMapMarkerAlt className="w-3 h-3" />
									إدارة العناوين
								</button>
							</div>

							{/* Saved Locations Section */}
							{loadingLocations ? (
								<div className="flex items-center justify-center py-4">
									<Spinner />
									<span className="mr-2 text-sm text-gray-500">جاري تحميل الأماكن المحفوظة...</span>
								</div>
							) : savedLocations.length > 0 && (
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
											<FaStar className="text-[#579BE8] w-4 h-4" />
											الأماكن المحفوظة
										</h3>
										{savedLocations.length > 1 && (
											<button
												onClick={() => setShowAllLocations(!showAllLocations)}
												className="text-xs text-[#579BE8] hover:text-[#124987] flex items-center gap-1"
											>
												{showAllLocations ? (
													<>
														<ChevronUp size={12} />
														إخفاء البعض
													</>
												) : (
													<>
														<ChevronDown size={12} />
														عرض الكل ({savedLocations.length})
													</>
												)}
											</button>
										)}
									</div>

									<div className="space-y-2">
										{displayedLocations.map((location) => (
											<div
												key={location.id}
												onClick={() => {
													setTouched(prev => ({ ...prev, location: true }));
													handleSavedLocationSelect(location);
												}}
												className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
													selectedSavedLocation?.id === location.id
														? 'bg-gradient-to-br from-[#579BE8]/10 to-[#124987]/5 border-[#579BE8]'
														: 'bg-gray-50/50 border-gray-200 hover:border-[#579BE8]/50'
												}`}
											>
												<div className="flex items-start gap-3">
													<div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
														selectedSavedLocation?.id === location.id
															? 'bg-[#579BE8] text-white'
															: 'bg-gray-100 text-gray-500'
													}`}>
														{location.type === 'home' ? <FaHome className="w-4 h-4" /> :
														 location.type === 'work' ? <FaBriefcase className="w-4 h-4" /> :
														 <FaMapMarkedAlt className="w-4 h-4" />}
													</div>
													<div className="flex-1 min-w-0">
														<div className="flex items-center gap-2 mb-1">
															<h4 className="font-medium text-sm text-gray-900 truncate">
																{location.name}
															</h4>
															{location.is_favorite && (
																<FaStar className="text-[#579BE8] w-3 h-3 flex-shrink-0" />
															)}
														</div>
														<p className="text-xs text-gray-500 truncate">
															{location.address}
														</p>
														{selectedSavedLocation?.id === location.id && (
															<div className="mt-1 flex items-center gap-1">
																<span className="text-xs px-2 py-0.5 bg-[#579BE8]/10 text-[#579BE8] rounded">
																	محدد
																</span>
															</div>
														)}
													</div>
												</div>
											</div>
										))}
									</div>
								</div>
							)}

							{/* Manual Location Selection */}
							<div className="pt-2">
								<div
									onClick={() => {
										setTouched(prev => ({ ...prev, location: true }));
										setIsMapOpen(true);
									}}
									className={`group cursor-pointer relative w-full h-16 rounded-2xl transition-all duration-300 flex items-center px-4 overflow-hidden border-2 border-dashed
										${getFieldStatus('location') === 'success'
											? 'bg-[#579BE8]/5 border-[#579BE8]/50 hover:border-[#579BE8]/70'
											: getFieldStatus('location') === 'error'
												? 'bg-red-50 border-red-300 hover:border-red-400'
												: 'bg-gradient-to-r from-[#579BE8]/5 to-[#124987]/5 hover:from-[#579BE8]/10 hover:to-[#124987]/10 border-[#579BE8]/30 hover:border-[#579BE8]/60'
										}`}
								>
									<div className="flex-1 flex items-center gap-3">
										<div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors 
											${getFieldStatus('location') === 'success'
												? 'bg-gradient-to-r from-[#579BE8] to-[#124987] text-white'
												: getFieldStatus('location') === 'error'
													? 'bg-red-100 text-red-500'
													: 'bg-[#579BE8]/10 text-[#579BE8]'
											}`}>
											<MapPin size={20} />
										</div>
										<div className="flex flex-col items-start overflow-hidden">
											<span className={`text-sm font-bold truncate w-full text-right ${
												locationData ? 'text-gray-900' : getFieldStatus('location') === 'error' ? 'text-red-400' : 'text-gray-400'
											}`}>
												{locationData 
													? isManualLocation 
														? `موقع على الخريطة: ${locationData.address?.substring(0, 30)}...` 
														: `محفوظ: ${selectedSavedLocation?.name}`
													: 'اضغط لتحديد موقع جديد على الخريطة'
												}
											</span>
											{locationData && (
												<span className="text-[#579BE8] text-xs">
													✓ {isManualLocation ? 'موقع على الخريطة' : 'مكان محفوظ'}
												</span>
											)}
										</div>
									</div>
									{locationData && (
										<button
											onClick={(e) => {
												e.stopPropagation();
												handleClearLocation();
											}}
											className="absolute left-3 p-1.5 bg-red-100 text-red-500 rounded-lg hover:bg-red-200 transition-colors"
										>
											<X size={14} />
										</button>
									)}
									<div className="bg-gradient-to-r from-[#579BE8] to-[#124987] text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity absolute left-3">
										<ArrowRight size={16} />
									</div>
								</div>
								<AnimatePresence>
									{showError('location') && (
										<motion.p
											initial={{ opacity: 0, y: -10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -10 }}
											className="text-red-500 text-xs flex items-center gap-1"
										>
											<AlertCircle size={14} />
											الرجاء تحديد موقع التوصيل
										</motion.p>
									)}
								</AnimatePresence>
								{locationData && isManualLocation && (
									<div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-xl">
										<p className="text-xs text-green-700 flex items-center gap-2">
											<CheckCircle2 size={12} />
											سيتم حفظ هذا الموقع تلقائياً مع الطلب
										</p>
									</div>
								)}
							</div>
						</motion.div>

						{/* Details Grid */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* Water Type */}
							<div className="space-y-3">
								<label className="flex  items-center gap-2 text-gray-700 font-bold mb-2">
									<Droplets size={20} className={getFieldStatus('waterType') === 'error' ? 'text-red-500' : 'text-[#579BE8]'} />
									نوع المياه
									{showSuccess('waterType') && (
										<motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="mr-auto">
											<CheckCircle2 size={18} className="text-[#579BE8]" />
										</motion.span>
									)}
								</label>
								
								{loadingWaterTypes ? (
									<div className="w-full h-14 rounded-2xl border-2 border-[#579BE8]/30 bg-gray-50 px-4 flex items-center justify-center">
										<Spinner />
										<span className="mr-2 text-sm text-gray-500">جاري التحميل...</span>
									</div>
								) : (
									<div className="relative">
										<Select
											value={waterType}
											onValueChange={(value) => {
												setWaterType(value);
												setTouched(prev => ({ ...prev, waterType: true }));
											}}
										>
											<SelectTrigger className={`h-14 w-full rounded-2xl border-2 ${getFieldStatus('waterType') === 'error' ? 'border-red-300' : 'border-[#579BE8]/30'} bg-gray-50 px-4 text-right focus:ring-0 focus:ring-offset-0 focus:border-[#579BE8]`}>
												<SelectValue placeholder="اختر نوع المياه">
													{selectedWaterTypeName || 'اختر نوع المياه'}
												</SelectValue>
											</SelectTrigger>
											<SelectContent className="rounded-xl border-[#579BE8]/20">
												{waterTypes.map((waterTypeItem) => (
													<SelectItem 
														key={waterTypeItem.id} 
														value={waterTypeItem.id.toString()}
														className="text-right py-3 px-4 focus:bg-[#579BE8]/10 cursor-pointer"
													>
														{waterTypeItem.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										
										{waterType && (
											<div className="absolute left-3 top-1/2 -translate-y-1/2">
												<CheckCircle2 size={20} className="text-[#579BE8]" />
											</div>
										)}
									</div>
								)}
								
								<AnimatePresence>
									{showError('waterType') && (
										<motion.p
											initial={{ opacity: 0, y: -10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -10 }}
											className="text-red-500 text-xs flex items-center gap-1"
										>
											<AlertCircle size={14} />
											الرجاء اختيار نوع المياه
										</motion.p>
									)}
								</AnimatePresence>
							</div>
							{/* <WaterTypeSelect/> */}

							{/* Service (Quantity) */}
							<div className="space-y-3">
								<label className="flex items-center gap-2 text-gray-700 font-bold mb-2">
									<Scale size={20} className={getFieldStatus('quantity') === 'error' ? 'text-red-500' : 'text-[#579BE8]'} />
									الكمية (طن)
									{showSuccess('quantity') && (
										<motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="mr-auto">
											<CheckCircle2 size={18} className="text-[#579BE8]" />
										</motion.span>
									)}
								</label>
								
								{loadingServices ? (
									<div className="w-full h-14 rounded-2xl border-2 border-[#579BE8]/30 bg-gray-50 px-4 flex items-center justify-center">
										<Spinner />
										<span className="mr-2 text-sm text-gray-500">جاري التحميل...</span>
									</div>
								) : (
									<div className="relative ">
										<Select
											value={quantity}
											onValueChange={(value) => {
												setQuantity(value);
												setTouched(prev => ({ ...prev, quantity: true }));
											}}
										>
											<SelectTrigger className={`h-14 w-full rounded-2xl border-2 ${getFieldStatus('quantity') === 'error' ? 'border-red-300' : 'border-[#579BE8]/30'} bg-gray-50 px-4 text-right focus:ring-0 focus:ring-offset-0 focus:border-[#579BE8]`}>
												<SelectValue placeholder="اختر الكمية">
													{selectedServiceName || 'اختر الكمية'}
												</SelectValue>
											</SelectTrigger>
											<SelectContent className="rounded-xl border-[#579BE8]/20">
												{services.map((service) => (
													<SelectItem 
														key={service.id} 
														value={service.id.toString()}
														className="text-right py-3 px-4 focus:bg-[#579BE8]/10 cursor-pointer"
													>
														{service.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										
										{quantity && (
											<div className="absolute left-3 top-1/2 -translate-y-1/2">
												{/* <CheckCircle2 size={20} className="text-[#579BE8]" /> */}
											</div>
										)}
									</div>
								)}
								
								<AnimatePresence>
									{showError('quantity') && (
										<motion.p
											initial={{ opacity: 0, y: -10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -10 }}
											className="text-red-500 text-xs flex items-center gap-1"
										>
											<AlertCircle size={14} />
											الرجاء اختيار الكمية
										</motion.p>
									)}
								</AnimatePresence>
								
								{selectedServiceName && (
									<div className="mt-2 p-2 bg-[#579BE8]/5 rounded-lg">
										<p className="text-xs text-[#579BE8] text-center">
											الخدمة: {selectedServiceName}
										</p>
									</div>
								)}
							</div>
						</div>

						{/* Actions */}
						<motion.div variants={itemVariants} className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
							<button
								onClick={handleOrderNow}
								disabled={isLoading || loadingWaterTypes || loadingServices}
								className="h-14 rounded-2xl bg-gradient-to-r from-[#579BE8] via-[#4a8dd8] to-[#124987] hover:from-[#4a8dd8] hover:via-[#3a7dc8] hover:to-[#0d3a6a] text-white font-bold text-lg shadow-lg shadow-[#124987]/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
							>
								{isLoading ? (
									<>
										<Spinner />
										<span>جاري إنشاء الطلب...</span>
									</>
								) : (
									<>
										<span>اطلب الآن</span>
										<ArrowLeft size={20} />
									</>
								)}
							</button>

							<button
								onClick={() => setShowSchedule(true)}
								disabled={isLoading || !locationData || loadingWaterTypes || loadingServices}
								className="h-14 rounded-2xl bg-white border-2 border-[#579BE8]/30 text-[#579BE8] font-bold text-lg hover:bg-gradient-to-r hover:from-[#579BE8]/5 hover:to-[#124987]/5 hover:border-[#579BE8]/50 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<Calendar size={20} />
								<span>جدولة الطلب</span>
							</button>
						</motion.div>

						{/* Order Summary */}
						{(waterType || quantity) && (
							<div className="pt-4 border-t border-gray-100">
								<h4 className="text-sm font-bold text-gray-700 mb-3">ملخص اختياراتك:</h4>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
									{waterType && (
										<div className="bg-[#579BE8]/5 rounded-xl p-3 border border-[#579BE8]/20">
											<p className="text-xs text-gray-600 mb-1">نوع المياه</p>
											<p className="text-sm font-medium text-[#579BE8]">{selectedWaterTypeName}</p>
										</div>
									)}
									{quantity && (
										<div className="bg-[#579BE8]/5 rounded-xl p-3 border border-[#579BE8]/20">
											<p className="text-xs text-gray-600 mb-1">الكمية</p>
											<p className="text-sm font-medium text-[#579BE8]">{selectedServiceName}</p>
										</div>
									)}
								</div>
							</div>
						)}

						{/* Info Box */}
						<div className="pt-4 border-t border-gray-100">
							<div className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-xl">
								<AlertCircle size={18} className="text-[#579BE8] mt-0.5 flex-shrink-0" />
								<div>
									<p className="text-xs text-gray-600">
										• يمكنك اختيار مكان محفوظ أو تحديد موقع جديد على الخريطة
									</p>
									<p className="text-xs text-gray-600 mt-1">
										• المواقع الجديدة سيتم حفظها تلقائياً مع الطلب
									</p>
									{(loadingWaterTypes || loadingServices) && (
										<p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
											<Loader2 className="w-3 h-3 animate-spin" />
											جاري تحميل الخيارات المتاحة...
										</p>
									)}
								</div>
							</div>
						</div>

					</div>
				</div>

			</motion.div>

			{/* Loader Overlay */}
			<AnimatePresence>
				{isLoading && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3 }}
						className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center"
					>
						<motion.div
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.9, opacity: 0 }}
							transition={{ type: "spring", stiffness: 300, damping: 25 }}
							className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-xl shadow-[#579BE8]/20 border border-[#579BE8]/20 min-w-[280px] relative overflow-hidden"
						>
							<div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#579BE8] via-[#4a8dd8] to-[#124987]" />
							<div className="flex items-center gap-4">
								<div className="relative flex-shrink-0">
									<motion.div
										animate={{ rotate: 360 }}
										transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
										className="w-12 h-12 rounded-full border-3 border-[#579BE8]/20 border-t-[#579BE8]"
										style={{ borderWidth: '3px' }}
									/>
									<div className="absolute inset-0 flex items-center justify-center">
										<motion.div
											animate={{ scale: [1, 1.1, 1] }}
											transition={{ duration: 1, repeat: Infinity }}
											className="w-7 h-7 bg-gradient-to-r from-[#579BE8] to-[#124987] rounded-lg flex items-center justify-center shadow-md"
										>
											<Search size={14} className="text-white" />
										</motion.div>
									</div>
								</div>
								<div className="flex-1">
									<h3 className="text-sm font-bold text-[#124987] font-cairo">
										{isManualLocation ? 'جاري حفظ الموقع وإنشاء الطلب' : 'جاري إنشاء الطلب'}
									</h3>
									<div className="flex items-center gap-1 mt-1">
										<p className="text-gray-400 text-xs">
											يرجى الانتظار
										</p>
										<div className="flex gap-0.5">
											{[0, 1, 2].map((i) => (
												<motion.span
													key={i}
													animate={{ opacity: [0.3, 1, 0.3] }}
													transition={{
														duration: 0.8,
														repeat: Infinity,
														delay: i * 0.2
													}}
													className="w-1 h-1 bg-[#579BE8] rounded-full"
												/>
											))}
										</div>
									</div>
								</div>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

// Wrapper component with Suspense boundary
export default function OrderForm() {
	return (
		<Suspense fallback={
			<div className="flex items-center justify-center py-8">
				<div className="animate-spin">
					<div className="w-8 h-8 border-4 border-gray-300 border-t-[#579BE8] rounded-full"></div>
				</div>
			</div>
		}>
			<OrderFormContent />
		</Suspense>
	);
}