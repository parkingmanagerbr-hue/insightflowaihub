import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

export const Scene5CTA = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: { damping: 12, stiffness: 60 } });
  const titleOpacity = interpolate(frame, [15, 35], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(
    spring({ frame: frame - 15, fps, config: { damping: 20 } }),
    [0, 1], [50, 0]
  );

  const subOpacity = interpolate(frame, [40, 60], [0, 1], { extrapolateRight: "clamp" });

  const badgeOpacity = interpolate(frame, [60, 80], [0, 1], { extrapolateRight: "clamp" });
  const badgeScale = spring({ frame: frame - 60, fps, config: { damping: 15 } });

  // URL
  const urlOpacity = interpolate(frame, [80, 100], [0, 1], { extrapolateRight: "clamp" });

  // Pulsing glow
  const glowIntensity = interpolate(
    Math.sin(frame * 0.08),
    [-1, 1], [0.2, 0.5]
  );

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {/* Central glow */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(59,130,246,${glowIntensity}) 0%, transparent 70%)`,
        }}
      />

      {/* Logo */}
      <div
        style={{
          transform: `scale(${logoScale})`,
          width: 100,
          height: 100,
          borderRadius: 24,
          background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 30,
          boxShadow: "0 0 80px rgba(59,130,246,0.4)",
        }}
      >
        <span style={{ color: "white", fontSize: 44, fontWeight: 800 }}>IF</span>
      </div>

      {/* Title */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontSize: 64,
          fontWeight: 800,
          color: "white",
          textAlign: "center",
          marginBottom: 16,
        }}
      >
        Insight<span style={{ color: "#3b82f6" }}>Flow</span>
      </div>

      {/* Subtitle */}
      <div
        style={{
          opacity: subOpacity,
          fontSize: 28,
          fontWeight: 500,
          color: "rgba(255,255,255,0.7)",
          textAlign: "center",
          marginBottom: 30,
        }}
      >
        Seus dados, suas decisões, sua vantagem.
      </div>

      {/* Badges */}
      <div
        style={{
          opacity: badgeOpacity,
          transform: `scale(${badgeScale})`,
          display: "flex",
          gap: 16,
          marginBottom: 30,
        }}
      >
        {["PWA Ready", "Multi-Banco", "Gemini AI", "Enterprise Security"].map((badge) => (
          <div
            key={badge}
            style={{
              padding: "10px 22px",
              borderRadius: 30,
              background: "rgba(59,130,246,0.15)",
              border: "1px solid rgba(59,130,246,0.3)",
              color: "#93c5fd",
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            {badge}
          </div>
        ))}
      </div>

      {/* URL */}
      <div
        style={{
          opacity: urlOpacity,
          fontSize: 22,
          color: "rgba(255,255,255,0.4)",
          fontWeight: 400,
        }}
      >
        insightflowaihub.lovable.app
      </div>
    </AbsoluteFill>
  );
};
