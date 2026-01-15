import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import SecuritySection from "@/components/SecuritySection";
import AuthSection from "@/components/AuthSection";
import PWASection from "@/components/PWASection";
import GeminiSection from "@/components/GeminiSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <SecuritySection />
      <AuthSection />
      <PWASection />
      <GeminiSection />
      <Footer />
    </div>
  );
};

export default Index;
