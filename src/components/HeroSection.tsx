import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Database, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import InstallButton from "@/components/InstallButton";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 bg-gradient-to-br from-[hsl(216,82%,15%)] via-[hsl(216,82%,20%)] to-[hsl(210,100%,30%)]">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[hsl(210,100%,56%,0.1)]"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[hsl(210,100%,56%,0.15)]"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(hsl(210 100% 56% / 0.3) 1px, transparent 1px),
            linear-gradient(90deg, hsl(210 100% 56% / 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark mb-8"
          >
            <Sparkles className="w-4 h-4 text-[hsl(210,100%,56%)]" />
            <span className="text-sm font-medium text-white/90">
              Powered by Ollama — IA 100% Local
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white"
          >
            Relatórios Inteligentes com{" "}
            <span className="gradient-text">Ollama</span> e{" "}
            <span className="gradient-text">Power BI</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto"
          >
            Conecte seu banco de dados, gere SQL com IA local via Ollama e visualize
            tudo com Power BI Embedded. Privacidade total — seus dados nunca saem da sua máquina.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button 
              asChild
              size="lg" 
              className="bg-[hsl(210,100%,56%)] hover:bg-[hsl(210,100%,65%)] text-white font-semibold px-8 py-6 text-lg shadow-[0_4px_20px_hsl(210,100%,56%,0.25)] group"
            >
              <a href="/auth">
                Comece Agora
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Button 
              asChild
              size="lg" 
              variant="outline" 
              className="border-white/30 text-white hover:bg-white/10 hover:text-white px-8 py-6 text-lg bg-transparent"
            >
              <a href="#funcionalidades">Ver Funcionalidades</a>
            </Button>
          </motion.div>

          {/* Install PWA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-6 flex justify-center"
          >
            <InstallButton variant="hero" />
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-4 mt-10"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <Database className="w-4 h-4 text-[hsl(210,100%,56%)]" />
              <span className="text-sm text-white/80">Multi-Database</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <Sparkles className="w-4 h-4 text-[hsl(210,100%,56%)]" />
              <span className="text-sm text-white/80">SQL com Ollama Local</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <BarChart3 className="w-4 h-4 text-[hsl(210,100%,56%)]" />
              <span className="text-sm text-white/80">Power BI Embedded</span>
            </div>
          </motion.div>
        </div>

        {/* Hero Image/Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 relative max-w-5xl mx-auto"
        >
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <div className="bg-[hsl(216,82%,15%,0.9)] backdrop-blur-xl p-4">
              {/* Browser Chrome */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <div className="flex-1 mx-4 h-8 rounded-lg bg-white/10 flex items-center px-4">
                  <span className="text-xs text-white/50">insightflow.app</span>
                </div>
              </div>
              
              {/* Dashboard Preview */}
              <div className="grid grid-cols-4 gap-4 p-4 bg-gradient-to-br from-[hsl(216,82%,15%)] to-[hsl(216,82%,12%)] rounded-lg">
                {/* Sidebar */}
                <div className="hidden md:block space-y-3">
                  <div className="h-8 bg-white/10 rounded-lg animate-pulse" />
                  <div className="h-6 bg-white/5 rounded-lg" />
                  <div className="h-6 bg-white/5 rounded-lg" />
                  <div className="h-6 bg-[hsl(210,100%,56%,0.2)] rounded-lg border border-[hsl(210,100%,56%,0.3)]" />
                  <div className="h-6 bg-white/5 rounded-lg" />
                </div>
                
                {/* Main Content */}
                <div className="col-span-4 md:col-span-3 space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-20 bg-white/5 rounded-xl border border-white/10 p-3">
                        <div className="h-3 w-12 bg-[hsl(210,100%,56%,0.3)] rounded mb-2" />
                        <div className="h-6 w-16 bg-white/20 rounded" />
                      </div>
                    ))}
                  </div>
                  
                  {/* Chart Area */}
                  <div className="h-40 bg-white/5 rounded-xl border border-white/10 p-4 flex items-end justify-around gap-2">
                    {[40, 65, 45, 80, 55, 75, 60, 90, 70].map((h, i) => (
                      <motion.div
                        key={i}
                        className="w-full bg-gradient-to-t from-[hsl(210,100%,56%)] to-[hsl(210,100%,65%)] rounded-t"
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 0.8, delay: 0.6 + i * 0.1 }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Glow Effect */}
          <div className="absolute -inset-4 bg-[hsl(210,100%,56%,0.2)] rounded-3xl blur-3xl -z-10" />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
