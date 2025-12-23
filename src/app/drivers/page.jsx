"use client";

import React from "react";
import IntroSection from "@/components/molecules/IntroSection";
import StatsSection from "@/components/molecules/StatsSection";
import StaticSection from "@/components/molecules/StaticSection";
import DriverServicesSection from "@/components/molecules/DriverServicesSection";
import CallToActionSection from "@/components/molecules/CallToActionSection";
import HowToUseAppSection from "@/components/molecules/HowToUseAppSection";
import Cover from "@/components/molecules/cover";
import AppPromotionSection from "@/components/molecules/AppPromotionSection";
import StartJourneySection from "@/components/molecules/StartJourneySection";

export default function DriversPage() {
  return (
    <main className="space-y-20">
      <Cover />
      <IntroSection />
      <StatsSection />
      <StaticSection />
      <DriverServicesSection />
      <StartJourneySection/>
      <HowToUseAppSection />
      <AppPromotionSection />
      <CallToActionSection />
    </main>
  );
}
