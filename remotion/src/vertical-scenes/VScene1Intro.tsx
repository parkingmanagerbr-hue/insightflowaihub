import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

export const VScene1Intro = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: { damping: 12, stiffness: 100 } });
  const titleOpacity = interpolate(frame, [20, 45], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(spring({ frame: frame - 20, fps, config: { damping: 18 } }), [0, 1], [80, 0]);
  const subtitleOpacity = interpolate(frame, [40, 65], [0, 1], { extrapolateRight: "clamp" });
  const subtitleY = interpolate(spring({ frame: frame - 40, fps, config: { damping: 18 } }), [0, 1], [40, 0]);
  const tagOpacity = interpolate(frame, [60, 80], [0, 1], { extrapolateRight: "clamp" });

  const pulseGlow = Math.sin(frame * 0.06) * 0.3 + 0.7;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "80px 60px" }}>
      {/* Radial glow */}
      <div style={{
        position: "absolute", width: 600, height: 600, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(59,130,246,${0.12 * pulseGlow}) 0%, transparent 70%)`,
      }} />

      {/* Logo */}
      <div style={{
        transform: `scale(${logoScale})`,
        width: 140, height: 140, borderRadius: 35,
        background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 0 ${40 + pulseGlow * 30}px rgba(59,130,246,${0.3 * pulseGlow})`,
        marginBottom: 50,
      }}>
        <span style={{ fontSize: 70, color: "white", fontWeight: 800 }}>IF</span>
      </div>

      {/* Title */}
      <div style={{
        opacity: titleOpacity, transform: `translateY(${titleY}px)`,
        fontSize: 72, fontWeight: 800, color: "white", textAlign: "center",
        letterSpacing: -2, lineHeight: 1.1, marginBottom: 20,
      }}>
        Insight<span style={{ color: "#3b82f6" }}>Flow</span>
      </div>

      {/* Subtitle */}
      <div style={{
        opacity: subtitleOpacity, transform: `translateY(${subtitleY}px)`,
        fontSize: 32, color: "rgba(255,255,255,0.7)", textAlign: "center",
        lineHeight: 1.4, marginBottom: 40,
      }}>
        Plataforma Inteligente{"\n"}de Consultas SQL
      </div>

      {/* Tag */}
      <div style={{
        opacity: tagOpacity,
        padding: "14px 36px", borderRadius: 50,
        background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)",
        color: "#60a5fa", fontSize: 22, fontWeight: 600,
      }}>
        IA + Multi-Banco + Power BI
      </div>
    </AbsoluteFill>
  );
};
