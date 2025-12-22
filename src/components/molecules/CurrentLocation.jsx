"use client";

import React from "react";
import LocationMap from "@/components/maps/LocationMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CurrentLocation() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl text-center">
              نظام التتبع والتحديد الجغرافي
            </CardTitle>
            <p className="text-center text-gray-600 mt-2">
              حدد موقعك بدقة واحصل على أفضل خدمة توصيل
            </p>
          </CardHeader>
        </Card>
        
        <LocationMap />
      </div>
    </div>
  );
}