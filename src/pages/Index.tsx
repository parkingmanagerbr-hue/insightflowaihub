import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import SecuritySection from "@/components/SecuritySection";
import AuthSection from "@/components/AuthSection";
import PWASection from "@/components/PWASection";
import OllamaSection from "@/components/OllamaSection";
import PlansSection from "@/components/PlansSection";
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
      <OllamaSection />
      <PlansSection />
      {/* Video Showcase */}
      <section className="relative py-24 bg-secondary/30 overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Veja o <span className="gradient-text">InsightFlow</span> em Ação
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10">
            Conheça as principais funcionalidades da plataforma
          </p>
          <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-border bg-black">
            <video
              className="block w-full h-auto max-w-full aspect-video object-contain"
              controls
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            >
              <source src="/insightflow-showcase.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Index;
