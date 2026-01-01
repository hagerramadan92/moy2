"use client";

export default function Spinner({ size = "md", className = "" }) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-4",
    xl: "w-16 h-16 border-4",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} border-[#579BE8] border-t-transparent rounded-full animate-spin`}
      ></div>
    </div>
  );
}

