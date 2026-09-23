import React from "react";
import LandingNavbar from "../components/LandingNavbar";
import LandingHero from "../components/LandingHero";
import LandingTrustTicker from "../components/LandingTrustTicker";
import LandingHowItWorks from "../components/LandingHowItWorks";
import LandingModulesShowcase from "../components/LandingModulesShowcase";
import LandingScreenshotsGallery from "../components/LandingScreenshotsGallery";
import LandingPOSSandbox from "../components/LandingPOSSandbox";
import LandingLiveSimulators from "../components/LandingLiveSimulators";
import LandingEnrolledFarms from "../components/LandingEnrolledFarms";
import LandingTestimonialsFAQ from "../components/LandingTestimonialsFAQ";
import LandingCTAFooter from "../components/LandingCTAFooter";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-[#00a86b] selection:text-white font-sans antialiased overflow-x-hidden no-scrollbar">
      {/* 1. Header & Navigation */}
      <LandingNavbar />

      {/* 2. Hero Section */}
      <LandingHero />

      {/* 3. Live Telemetry Trust Ticker */}
      <LandingTrustTicker />

      {/* 4. How It Works - 4-Step Operational Lifecycle */}
      <LandingHowItWorks />

      {/* 5. Complete ERP Systems & Modules Showcase */}
      <LandingModulesShowcase />

      {/* 6. Live Interface Previews & Screenshots Showcase */}
      <LandingScreenshotsGallery />

      {/* 7. Interactive Live POS Sandbox */}
      <LandingPOSSandbox />

      {/* 7. Live Interactive Simulators (Profit & Mass-Balance) */}
      <LandingLiveSimulators />

      {/* 8. Enrolled Commercial Farms & Producer Hubs */}
      <LandingEnrolledFarms />

      {/* 9. Testimonials & FAQs Split-Screen */}
      <LandingTestimonialsFAQ />

      {/* 10. High-Conversion CTA & Compact Footer */}
      <LandingCTAFooter />
    </div>
  );
}
