"use client";

import { useState } from "react";

import { FaRegUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBell, FaHeart, FaChevronLeft, FaStar, FaPlus } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { BiCurrentLocation } from "react-icons/bi";
import { FaRegTrashCan } from "react-icons/fa6";
import Swal from "sweetalert2";
import Link from "next/link";


export default function MyProfilePage() {
    const [showSavedPlaces, setShowSavedPlaces] = useState(false);
    const [showAllPlaces, setShowAllPlaces] = useState(false);

    // CRUD States for Saved Places
    const [places, setPlaces] = useState([
        "الرياض حي الملك فهد 1",
        "الرياض حي الملك فهد 2",
        "الرياض حي الملك فهد 3",
        "الرياض حي الملك فهد 4",
        "الرياض حي الملك فهد 5",
        "الرياض حي الملك فهد 6"
    ]);
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState("");
    const [editingIndex, setEditingIndex] = useState(null);
    const [editValue, setEditValue] = useState("");

    const handleAdd = () => {
        if (newName.trim()) {
            setPlaces([newName, ...places]);
            setNewName("");
            setIsAdding(false);
            setShowSavedPlaces(true);
        }
    };

    const handleUpdate = (index) => {
        if (editValue.trim()) {
            const updated = [...places];
            updated[index] = editValue;
            setPlaces(updated);
            setEditingIndex(null);
        }
    };

    const handleDelete = (index) => {
        setPlaces(places.filter((_, i) => i !== index));
    };

    // CRUD States for Favorite Places
    const [showFavorites, setShowFavorites] = useState(false);
    const [showAllFavorites, setShowAllFavorites] = useState(false);
    const [favorites, setFavorites] = useState([
        "مطعم البيك - الرياض",
        "مقهى هاف مليون",
        "مكتبة جرير - فرع الحمراء"
    ]);
    const [isAddingFavorite, setIsAddingFavorite] = useState(false);
    const [newFavoriteName, setNewFavoriteName] = useState("");
    const [editingFavoriteIndex, setEditingFavoriteIndex] = useState(null);
    const [editFavoriteValue, setEditFavoriteValue] = useState("");

    const handleAddFavorite = () => {
        if (newFavoriteName.trim()) {
            setFavorites([newFavoriteName, ...favorites]);
            setNewFavoriteName("");
            setIsAddingFavorite(false);
            setShowFavorites(true);
        }
    };

    const handleUpdateFavorite = (index) => {
        if (editFavoriteValue.trim()) {
            const updated = [...favorites];
            updated[index] = editFavoriteValue;
            setFavorites(updated);
            setEditingFavoriteIndex(null);
        }
    };

    const handleDeleteFavorite = (index) => {
        setFavorites(favorites.filter((_, i) => i !== index));
    };

    const handleDisableAccount = () => {
        Swal.fire({
            title: "هل أنت متأكد؟",
            text: "سيتم تعطيل حسابك مؤقتاً ولن تتمكن من تلقي الإشعارات.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#579BE8",
            cancelButtonColor: "#F75A65",
            confirmButtonText: "نعم، عطل الحساب",
            cancelButtonText: "إلغاء",
            background: "var(--background)",
            color: "var(--foreground)",
            customClass: {
                popup: "rounded-2xl border border-border shadow-xl",
                confirmButton: "rounded-xl font-bold px-6 py-2",
                cancelButton: "rounded-xl font-bold px-6 py-2"
            }
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: "تم التعطيل!",
                    text: "تم تعطيل حسابك بنجاح.",
                    icon: "success",
                    confirmButtonColor: "#579BE8",
                    confirmButtonText: "موافق",
                    background: "var(--background)",
                    color: "var(--foreground)",
                    customClass: {
                        popup: "rounded-2xl border border-border shadow-xl",
                        confirmButton: "rounded-xl font-bold px-6 py-2"
                    }
                });
            }
        });
    };
    const handleDeleteAccount = () => {
        Swal.fire({
            title: "هل أنت متأكد؟",
            text: "سيتم حذف حسابك نهائياً ولن تتمكن من استخدام التطبيق.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#579BE8",
            cancelButtonColor: "#F75A65",
            confirmButtonText: "نعم، حذف الحساب",
            cancelButtonText: "إلغاء",
            background: "var(--background)",
            color: "var(--foreground)",
            customClass: {
                popup: "rounded-2xl border border-border shadow-xl",
                confirmButton: "rounded-xl font-bold px-6 py-2",
                cancelButton: "rounded-xl font-bold px-6 py-2"
            }
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: "تم الحذف!",
                    text: "تم حذف حسابك بنجاح.",
                    icon: "success",
                    confirmButtonColor: "#579BE8",
                    confirmButtonText: "موافق",
                    background: "var(--background)",
                    color: "var(--foreground)",
                    customClass: {
                        popup: "rounded-2xl border border-border shadow-xl",
                        confirmButton: "rounded-xl font-bold px-6 py-2"
                    }
                });
            }
        });
    };
    return (
        <div className="flex flex-col gap-6">
            <div className="bg-white dark:bg-card rounded-2xl overflow-hidden p-6 shadow-sm fade-in-up">

                {/* Avatar Section */}
                <div className="flex md:flex-row flex-col md:items-center gap-6 justify-between mb-8 pb-8 ">
                    <div className="flex items-center md:gap-6 gap-3">
                        <div className="w-22 h-22 md:w-[98px] md:h-[98px] rounded-full bg-secondary flex items-center justify-center dark:border-card shadow-xl relative overflow-hidden ring-1 ring-border/50">
                            <Image
                                src="/images/customer.png"
                                alt="Customer"
                                width={98}
                                height={98}
                                className="w-full h-full object-cover"
                                quality={100}
                                priority
                                unoptimized
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <h2 className="text-[14px] md:text-[18px] font-semibold text-[#579BE8]">سعود بن ناصر المطيري</h2>
                            <span className="text-[12px] font-medium text-[#1C7C4B]  px-3 py-1 rounded-full w-fit">
                                نشط الآن
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-3 md:px-6 cursor-pointer py-2.5 rounded-xl font-semibold border border-[#F75A65] text-[#F75A65] hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-primary/20">
                            حذف الصورة
                        </button>
                        <button className="px-3 md:px-6  cursor-pointer py-2.5 rounded-xl font-semibold border border-[#579BE8] bg-[#579BE8] text-primary-foreground hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-primary/20">
                            رفع الصورة
                        </button>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Full Name */}
                    <div className="space-y-3">
                        <label className="text-base text-foreground/80 pr-1">الاسم الكامل</label>
                        <div className="relative group">
                            <div className="absolute top-1/2 -translate-y-1/2 right-4 text-muted-foreground group-focus-within:text-primary transition-colors">
                                <FaRegUser className="w-5 h-5" />
                            </div>
                            <Input
                                defaultValue="الاسم الكامل"
                                className="h-[60px] pr-12 text-[#0000004D] text-[16px]  font-medium border-2 border-[#579BE8] focus:border-[#579BE8] focus:ring-4 focus:ring-[#579BE8]/10 rounded-lg bg-secondary/30 transition-all"
                            />
                        </div>
                    </div>

                    {/* Phone Number - Matching PhoneStep Style */}
                    <div className="space-y-3">
                        <label className="text-base  text-foreground/80 pr-1">رقم الجوال</label>
                        <div className="relative group ">
                            <div className="absolute top-1/2 -translate-y-1/2 left-4 w-[60px] h-[30px] opacity-90">
                                <Image
                                    src="/images/phone-icon.png"
                                    alt="Phone Icon"
                                    width={79}
                                    height={31}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <Input
                                defaultValue="555555555"
                                dir="ltr"
                                className="text-left pl-24 h-[60px] text-[#0000004D] text-[16px] pr-12  font-medium border-2 border-[#579BE8] focus:border-[#579BE8] focus:ring-4 focus:ring-[#579BE8]/10 rounded-lg bg-secondary/30 transition-all "
                            />
                        </div>
                    </div>

                    {/* location */}
                    <div className="space-y-3 lg:col-span-2">
                        <label className="text-base text-foreground/80 pr-1">الموقع</label>
                        <div className="relative group">
                            <div className="absolute top-1/2 -translate-y-1/2 right-4 text-muted-foreground group-focus-within:text-primary transition-colors">
                                <FaMapMarkerAlt className="w-5 h-5" />
                            </div>
                            <Input
                                defaultValue="الرياض - مستشفى الملك فيصل"
                                className="h-[60px] pr-12 text-[#0000004D] text-[16px] font-medium border-2 border-[#579BE8] focus:border-[#579BE8] focus:ring-4 focus:ring-[#579BE8]/10 rounded-lg bg-secondary/30 transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-10 pt-6 flex justify-end">
                    <button className="bg-[#579BE8] text-white px-10 py-4 rounded-xl hover:bg-[#579BE8]/90 
                hover:-translate-y-0.5 hover:shadow-lg transition-all cursor-pointer text-[20px] shadow-primary/20">
                        حفظ التعديل
                    </button>
                </div>
            </div>
            <div className="bg-white dark:bg-card rounded-2xl overflow-hidden p-6 shadow-sm fade-in-up">
                <h3 className="text-xl font-bold mb-6 text-foreground">اعدادات الحساب</h3>

                <div className="flex flex-col gap-4">
                    {/* Notifications Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-secondary/30 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4">
                            <div className="bg-secondary/50 group-hover:bg-white dark:group-hover:bg-card p-3 rounded-full transition-colors">
                                <FaBell className="text-[#579BE8] w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold mb-1">تفعيل الاشعارات</h4>
                                <p className="text-sm text-muted-foreground">استقبال التنبيهات والتحديثات </p>
                            </div>
                        </div>
                        {/* Custom Switch Visual */}
                        <div className="w-12 h-6 bg-[#579BE8] rounded-full relative transition-colors cursor-pointer">
                            <div className="absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform"></div>
                        </div>
                    </div>

                    {/* Saved Places */}
                    <div
                        id="savedPlaces"
                        onClick={() => setShowSavedPlaces(!showSavedPlaces)}
                        className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-secondary/30 transition-colors cursor-pointer group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-secondary/50 group-hover:bg-white dark:group-hover:bg-card p-3 rounded-full transition-colors">
                                <BiCurrentLocation className="text-[#579BE8] w-6 h-6" />

                            </div>
                            <div>
                                <h4 className="text-lg font-semibold mb-1">الأماكن المحفوظة</h4>
                                <p className="text-sm text-muted-foreground">احفظ مواقعك </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsAdding(!isAdding);
                                    if (!showSavedPlaces) setShowSavedPlaces(true);
                                }}
                                className="text-[#579BE8] bg-[#579BE8]/10 p-2 rounded-lg hover:bg-[#579BE8]/20 transition-colors"
                                title="اضافة موقع جديد"
                            >
                                <FaPlus className="w-5 h-5" />
                                <span className="sr-only">اضافة</span>
                            </button>
                            <FaChevronLeft className={`text-muted-foreground group-hover:text-primary transition-transform duration-300 ${showSavedPlaces ? "rotate-[-90deg]" : ""}`} />
                        </div>


                    </div>
                    {showSavedPlaces && (
                        <div id="savedPlacesItem" className="flex flex-col gap-2">
                            {/* Add New Input */}
                            {isAdding && (
                                <div className="flex items-center gap-2 p-3 bg-[#579BE8]/5 rounded-xl mx-2 border border-[#579BE8]/20 fade-in-up">
                                    <Input
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        placeholder="اسم الموقع الجديد..."
                                        className="h-10 text-sm"
                                        autoFocus
                                    />
                                    <button onClick={handleAdd} className="bg-[#579BE8] text-white px-4 py-2 rounded-lg text-sm font-bold">حفظ</button>
                                    <button onClick={() => setIsAdding(false)} className="text-muted-foreground px-2">الغاء</button>
                                </div>
                            )}

                            {places.map((place, i) => (
                                (i < 5 || showAllPlaces) && (
                                    <div key={i} className="flex items-center justify-between gap-4 p-4 bg-secondary/20 rounded-xl mx-2 fade-in-up">
                                        {editingIndex === i ? (
                                            <div className="flex items-center gap-2 w-full">
                                                <Input
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    className="h-9 text-sm"
                                                    autoFocus
                                                />
                                                <button onClick={() => handleUpdate(i)} className="text-green-600 font-bold text-sm">تأكيد</button>
                                                <button onClick={() => setEditingIndex(null)} className="text-muted-foreground text-sm">الغاء</button>
                                            </div>
                                        ) : (
                                            <>
                                                <h4>{place}</h4>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingIndex(i);
                                                            setEditValue(place);
                                                        }}
                                                        className="p-2 hover:bg-white dark:hover:bg-card rounded-full transition-colors"
                                                    >
                                                        <CiEdit className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(i)}
                                                        className="p-2 hover:bg-white dark:hover:bg-card rounded-full text-destructive transition-colors"
                                                    >
                                                        <FaRegTrashCan className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )
                            ))}
                            {places.length > 5 && (
                                <button
                                    onClick={() => setShowAllPlaces(!showAllPlaces)}
                                    className="text-[#579BE8] font-bold text-sm mt-2 hover:underline cursor-pointer w-fit mx-auto"
                                >
                                    {showAllPlaces ? "عرض أقل" : "عرض المزيد"}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Favorite Places */}
                    <div
                        className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-secondary/30 transition-colors cursor-pointer group"
                        onClick={() => setShowFavorites(!showFavorites)}
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-secondary/50 group-hover:bg-white dark:group-hover:bg-card p-3 rounded-full transition-colors">
                                <FaStar className="text-[#579BE8] w-6 h-6" />

                            </div>
                            <div>
                                <h4 className="text-lg font-semibold mb-1">الأماكن المفضلة</h4>
                                <p className="text-sm text-muted-foreground">احتر كم اماكنك المفضلة</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsAddingFavorite(!isAddingFavorite);
                                    if (!showFavorites) setShowFavorites(true);
                                }}
                                className="text-[#579BE8] bg-[#579BE8]/10 p-2 rounded-lg hover:bg-[#579BE8]/20 transition-colors"
                                title="اضافة مفضل جديد"
                            >
                                <FaPlus className="w-5 h-5" />
                                <span className="sr-only">اضافة</span>
                            </button>
                            <FaChevronLeft className={`text-muted-foreground group-hover:text-primary transition-transform duration-300 ${showFavorites ? "rotate-[-90deg]" : ""}`} />
                        </div>
                    </div>

                    {showFavorites && (
                        <div className="flex flex-col gap-2">
                            {/* Add New Input */}
                            {isAddingFavorite && (
                                <div className="flex items-center gap-2 p-3 bg-[#579BE8]/5 rounded-xl mx-2 border border-[#579BE8]/20 fade-in-up">
                                    <Input
                                        value={newFavoriteName}
                                        onChange={(e) => setNewFavoriteName(e.target.value)}
                                        placeholder="اسم المكان المفضل..."
                                        className="h-10 text-sm"
                                        autoFocus
                                    />
                                    <button onClick={handleAddFavorite} className="bg-[#579BE8] text-white px-4 py-2 rounded-lg text-sm font-bold">حفظ</button>
                                    <button onClick={() => setIsAddingFavorite(false)} className="text-muted-foreground px-2">الغاء</button>
                                </div>
                            )}

                            {favorites.map((fav, i) => (
                                (i < 5 || showAllFavorites) && (
                                    <div key={i} className="flex items-center justify-between gap-4 p-4 bg-secondary/20 rounded-xl mx-2 fade-in-up">
                                        {editingFavoriteIndex === i ? (
                                            <div className="flex items-center gap-2 w-full">
                                                <Input
                                                    value={editFavoriteValue}
                                                    onChange={(e) => setEditFavoriteValue(e.target.value)}
                                                    className="h-9 text-sm"
                                                    autoFocus
                                                />
                                                <button onClick={() => handleUpdateFavorite(i)} className="text-green-600 font-bold text-sm">تأكيد</button>
                                                <button onClick={() => setEditingFavoriteIndex(null)} className="text-muted-foreground text-sm">الغاء</button>
                                            </div>
                                        ) : (
                                            <>
                                                <h4>{fav}</h4>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingFavoriteIndex(i);
                                                            setEditFavoriteValue(fav);
                                                        }}
                                                        className="p-2 hover:bg-white dark:hover:bg-card rounded-full transition-colors"
                                                    >
                                                        <CiEdit className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteFavorite(i)}
                                                        className="p-2 hover:bg-white dark:hover:bg-card rounded-full text-destructive transition-colors"
                                                    >
                                                        <FaRegTrashCan className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )
                            ))}
                            {favorites.length > 5 && (
                                <button
                                    onClick={() => setShowAllFavorites(!showAllFavorites)}
                                    className="text-[#579BE8] font-bold text-sm mt-2 hover:underline cursor-pointer w-fit mx-auto"
                                >
                                    {showAllFavorites ? "عرض أقل" : "عرض المزيد"}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Danger Zone */}
                <div className="mt-8 pt-6 border-t border-border">
                    <h3 className="text-lg font-bold text-destructive mb-4">منطقة الخطر</h3>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-destructive/5 border border-destructive/20 rounded-xl">
                        <div>
                            <h4 className="text-base font-bold text-destructive mb-1">تعطيل الحساب مؤقتا</h4>
                            <p className="text-sm text-destructive/80">سيتم اخفاء ملفك الشخصي ولن تتلقى أي اشعارات حتى تقوم بتسجيل الدخول مرة أخرى</p>
                        </div>
                        <button onClick={handleDisableAccount} className="bg-white dark:bg-card text-destructive border border-destructive/20 px-6 py-2.5 rounded-lg font-bold hover:bg-destructive hover:text-white transition-all shadow-sm min-w-fit">
                            تعطيل الحساب
                        </button>
                    </div>
                </div>
            </div>
            <div className="bg-white dark:bg-card rounded-2xl overflow-hidden p-6 shadow-sm fade-in-up">
                <h3 className="text-lg font-bold text-destructive mb-4">الخصوصية والأمان</h3>
                <div className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-secondary/30 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                        <div className="bg-secondary/50 group-hover:bg-white dark:group-hover:bg-card p-3 rounded-full transition-colors">
                            <BiCurrentLocation className="text-[#579BE8] w-6 h-6" />

                        </div>
                        <div>
                            <h4 className="text-lg font-semibold mb-1"> مشاركة الموقع </h4>
                            <p className="text-sm text-muted-foreground">السماح للوصول الى موقعك</p>
                        </div>
                    </div>
                    {/* Custom Switch Visual */}
                    <div className="w-12 h-6 bg-[#579BE8] rounded-full relative transition-colors cursor-pointer">
                        <div className="absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform"></div>
                    </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl   transition-colors cursor-pointer group">
                    <p>سياسية الخصوصية</p>
                    <Link href="/" className="text-[#579BE8] ">عرض التفاصيل</Link>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl   transition-colors cursor-pointer group">
                    <p>شروط الأستخدام</p>
                    <Link href="/" className="text-[#579BE8] ">عرض التفاصيل</Link>
                </div>
                {/* Danger Zone */}
                <div className="mt-8 pt-6 border-t border-border">
                    <h3 className="text-lg font-bold text-destructive mb-4">منطقة الخطر</h3>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-destructive/5 border border-destructive/20 rounded-xl">
                        <div>
                            <h4 className="text-base font-bold text-destructive mb-1">حذف الحساب نهائيا</h4>
                            <p className="text-sm text-destructive/80">هذا الاجراء لا يمكن التراجع عنه سيتم حذف جميع بياناتك بشكل دائم</p>
                        </div>
                        <button onClick={handleDeleteAccount} className="bg-white dark:bg-card text-destructive border border-destructive/20 px-6 py-2.5 rounded-lg font-bold hover:bg-destructive hover:text-white transition-all shadow-sm min-w-fit">
                            حذف حسابي
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}