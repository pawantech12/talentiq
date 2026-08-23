import AIFeaturesSection from "@/components/landing/AIFeaturesSection";
import FinalCTA from "@/components/landing/FinalCTA";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorks from "@/components/landing/HowItWorks";
import PlatformPreviewSection from "@/components/landing/PlatformPreviewSection";
import WhoIsItForSection from "@/components/landing/WhoIsItForSection";
import WorkflowSection from "@/components/landing/WorkflowSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <PlatformPreviewSection />
      <HowItWorks />
      <WhoIsItForSection />
      <AIFeaturesSection />
      <WorkflowSection />
      <FinalCTA />
    </>
  );
}
