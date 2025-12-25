import ProfileSidebar from "@/components/molecules/ProfileSidebar";

export default function ProfileLayout({ children }) {
    return (
        <div className="bg-[#f8f8f9]">
            <div className="container mx-auto py-10 px-4 ">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">الملف الشخصي</h1>
                    <p className="text-muted-foreground">ادارة معلوماتك واداداتك الشخصية</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start relative">
                    {/* Sidebar */}
                    <div className="w-full lg:w-64 flex-shrink-0">
                        <ProfileSidebar />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 w-full min-h-[600px] rounded-2xl">
                        {children}
                    </div>
                </div>
            </div>
        </div>

    );
}
