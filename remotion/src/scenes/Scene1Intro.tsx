import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

export const Scene1Intro = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo animation
  const logoScale = spring({ frame, fps, config: { damping: 15, stiffness: 80 } });
  const logoOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  // Title
  const titleY = interpolate(
    spring({ frame: frame - 20, fps, config: { damping: 20, stiffness: 100 } }),
    [0, 1], [60, 0]
  );
  const titleOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp" });

  // Subtitle
  const subOpacity = interpolate(frame, [45, 65], [0, 1], { extrapolateRight: "clamp" });
  const subY = interpolate(
    spring({ frame: frame - 45, fps, config: { damping: 20 } }),
    [0, 1], [40, 0]
  );

  // Tagline
  const tagOpacity = interpolate(frame, [70, 90], [0, 1], { extrapolateRight: "clamp" });

  // Decorative line
  const lineWidth = interpolate(frame, [30, 60], [0, 300], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {/* Logo */}
      <div
        style={{
          transform: `scale(${logoScale})`,
          opacity: logoOpacity,
          marginBottom: 30,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 60px rgba(59,130,246,0.4)",
          }}
        >
          <span style={{ color: "white", fontSize: 36, fontWeight: 800 }}>IF</span>
        </div>
      </div>

      {/* Title */}
      <div
        style={{
          transform: `translateY(${titleY}px)`,
          opacity: titleOpacity,
          fontSize: 82,
          fontWeight: 800,
          color: "white",
          textAlign: "center",
          letterSpacing: -2,
        }}
      >
        Insight<span style={{ color: "#3b82f6" }}>Flow</span>
      </div>

      {/* Decorative line */}
      <div
        style={{
          width: lineWidth,
          height: 3,
          background: "linear-gradient(90deg, transparent, #3b82f6, transparent)",
          marginTop: 20,
          marginBottom: 20,
          borderRadius: 2,
        }}
      />

      {/* Subtitle */}
      <div
        style={{
          transform: `translateY(${subY}px)`,
          opacity: subOpacity,
          fontSize: 32,
          fontWeight: 600,
          color: "rgba(255,255,255,0.85)",
          textAlign: "center",
          maxWidth: 900,
        }}
      >
        Transforme dados em insights acionáveis
      </div>

      {/* Tagline */}
      <div
        style={{
          opacity: tagOpacity,
          fontSize: 20,
          fontWeight: 400,
          color: "rgba(255,255,255,0.5)",
          marginTop: 16,
          textAlign: "center",
        }}
      >
        IA Generativa • Multi-Banco • Power BI • Segurança Enterprise
      </div>
    </AbsoluteFill>
  );
};
