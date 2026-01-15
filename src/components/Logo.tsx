import { motion } from "framer-motion";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const Logo = ({ size = "md", showText = true, className = "" }: LogoProps) => {
  const sizes = {
    sm: { icon: 32, text: "text-lg" },
    md: { icon: 40, text: "text-xl" },
    lg: { icon: 56, text: "text-3xl" },
  };

  return (
    <motion.div 
      className={`flex items-center gap-2 ${className}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div 
        className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-electric-blue to-deep-blue p-1.5"
        style={{ width: sizes[size].icon, height: sizes[size].icon }}
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Three flowing curves representing data flow */}
          <path
            d="M8 28C12 28 14 22 20 22C26 22 28 16 32 16"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M8 22C12 22 14 16 20 16C26 16 28 10 32 10"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
          />
          <path
            d="M8 16C12 16 14 10 20 10C26 10 28 6 32 6"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.6"
          />
          {/* Glowing connection points */}
          <circle cx="20" cy="22" r="2" fill="white" className="animate-pulse-slow" />
          <circle cx="20" cy="16" r="2" fill="white" opacity="0.8" />
          <circle cx="20" cy="10" r="2" fill="white" opacity="0.6" />
        </svg>
        <div className="absolute inset-0 rounded-xl bg-electric-blue/30 blur-md -z-10" />
      </div>
      {showText && (
        <span className={`font-bold ${sizes[size].text} tracking-tight`}>
          <span className="text-foreground">Insight</span>
          <span className="gradient-text">Flow</span>
        </span>
      )}
    </motion.div>
  );
};

export default Logo;
