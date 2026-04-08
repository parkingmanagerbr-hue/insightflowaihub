import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

export const VScene5CTA = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: { damping: 12 } });
  const titleOpacity = interpolate(frame, [15, 35], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(spring({ frame: frame - 15, fps, config: { damping: 18 } }), [0, 1], [50, 0]);
  const badgesOpacity = interpolate(frame, [40, 60], [0, 1], { extrapolateRight: "clamp" });
  const urlOpacity = interpolate(frame, [55, 75], [0, 1], { extrapolateRight: "clamp" });
  const pulseGlow = Math.sin(frame * 0.06) * 0.3 + 0.7;

  const badges = ["Multi-Banco", "IA Generativa", "Power BI", "Exportação", "Segurança Enterprise"];

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "80px 50px" }}>
      <div style={{
        position: "absolute", width: 500, height: 500, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(59,130,246,${0.08 * pulseGlow}) 0%, transparent 70%)`,
      }} />

      <div style={{
        transform: `scale(${logoScale})`,
        width: 120, height: 120, borderRadius: 30,
        background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 0 ${30 + pulseGlow * 25}px rgba(59,130,246,${0.25 * pulseGlow})`,
        marginBottom: 40,
      }}>
        <span style={{ fontSize: 56, color: "white", fontWeight: 800 }}>IF</span>
      </div>

      <div style={{
        opacity: titleOpacity, transform: `translateY(${titleY}px)`,
        fontSize: 56, fontWeight: 800, color: "white", textAlign: "center",
        letterSpacing: -1, marginBottom: 16,
      }}>
        Insight<span style={{ color: "#3b82f6" }}>Flow</span>
      </div>

      <div style={{
        opacity: titleOpacity, fontSize: 24, color: "rgba(255,255,255,0.6)",
        textAlign: "center", marginBottom: 40,
      }}>
        Transforme dados em decisões
      </div>

      <div style={{
        opacity: badgesOpacity, display: "flex", flexWrap: "wrap",
        gap: 10, justifyContent: "center", marginBottom: 50,
      }}>
        {badges.map((b, i) => (
          <div key={i} style={{
            padding: "10px 20px", borderRadius: 50,
            background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)",
            color: "#93c5fd", fontSize: 16, fontWeight: 600,
          }}>
            {b}
          </div>
        ))}
      </div>

      <div style={{
        opacity: urlOpacity, fontSize: 22, fontWeight: 600,
        color: "#60a5fa", padding: "16px 40px", borderRadius: 16,
        background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)",
      }}>
        insightflowaihub.lovable.app
      </div>
    </AbsoluteFill>
  );
};
