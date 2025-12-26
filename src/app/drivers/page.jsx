"use client";

import React from "react";
import IntroSection from "@/components/molecules/Drivers/IntroSection";
import StatsSection from "@/components/molecules/Drivers/StatsSection";
import StaticSection from "@/components/molecules/Drivers/StaticSection";
import DriverServicesSection from "@/components/molecules/Drivers/DriverServicesSection";
import AppPromotionSection from "@/components/molecules/Drivers/AppPromotionSection";
import CallToActionSection from "@/components/molecules/Drivers/CallToActionSection";
import HowToUseAppSection from "@/components/molecules/Drivers/HowToUseAppSection";
import Footer from "@/components/molecules/Footer";
import Cover from "@/components/molecules/Drivers/cover";
import StartJourneySection from "@/components/molecules/Drivers/StartJourneySection";

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
      <AppPromotionSection/>
      <CallToActionSection />
      <Footer/>
    </main>
  );
}
