import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.insightflow.app",
  appName: "InsightFlow",
  webDir: "dist",
  server: {
    androidScheme: "https",
    // Para desenvolvimento com hot-reload, descomente e coloque seu IP:
    // url: "http://192.168.x.x:8080",
    // cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#0A1F44",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0A1F44",
    },
  },
};

export default config;
