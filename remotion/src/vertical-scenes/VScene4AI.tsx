import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

export const VScene4AI = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const prompt = "Mostre o total de vendas por mês";
  const charsVisible = Math.floor(interpolate(frame, [25, 80], [0, prompt.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  const sqlLines = [
    "SELECT",
    "  DATE_TRUNC('month', sale_date) AS mes,",
    "  SUM(amount) AS total_vendas",
    "FROM sales",
    "GROUP BY mes",
    "ORDER BY mes;",
  ];
  const sqlStart = 85;
  const cursorBlink = Math.sin(frame * 0.15) > 0;

  return (
    <AbsoluteFill style={{ padding: "80px 50px", alignItems: "center" }}>
      <div style={{
        opacity: titleOpacity, fontSize: 48, fontWeight: 800,
        color: "white", textAlign: "center", marginBottom: 8, letterSpacing: -0.5,
      }}>
        IA <span style={{ color: "#8b5cf6" }}>Generativa</span>
      </div>

      <div style={{
        opacity: interpolate(frame, [5, 25], [0, 1], { extrapolateRight: "clamp" }),
        fontSize: 20, color: "rgba(255,255,255,0.45)", marginBottom: 40, textAlign: "center",
      }}>
        Linguagem natural → SQL otimizado
      </div>

      {/* Prompt box */}
      <div style={{
        width: "100%", padding: "24px 28px", borderRadius: 18,
        background: "rgba(255,255,255,0.06)", border: "1px solid rgba(139,92,246,0.3)",
        marginBottom: 30,
      }}>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 8 }}>PROMPT</div>
        <div style={{ color: "white", fontSize: 22, fontWeight: 500, minHeight: 30 }}>
          {prompt.slice(0, charsVisible)}
          {charsVisible < prompt.length && cursorBlink && (
            <span style={{ color: "#8b5cf6" }}>|</span>
          )}
        </div>
      </div>

      {/* Arrow */}
      <div style={{
        opacity: interpolate(frame, [82, 88], [0, 1], { extrapolateRight: "clamp" }),
        fontSize: 32, color: "#8b5cf6", marginBottom: 20,
        transform: `scale(${spring({ frame: frame - 82, fps, config: { damping: 10 } })})`,
      }}>
        ↓
      </div>

      {/* SQL output */}
      <div style={{
        width: "100%", padding: "24px 28px", borderRadius: 18,
        background: "rgba(0,0,0,0.4)", border: "1px solid rgba(59,130,246,0.2)",
      }}>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 12 }}>SQL GERADO</div>
        {sqlLines.map((line, i) => {
          const lineOpacity = interpolate(frame, [sqlStart + i * 6, sqlStart + i * 6 + 12], [0, 1], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          });
          return (
            <div key={i} style={{
              opacity: lineOpacity, fontFamily: "monospace",
              fontSize: 18, color: i === 0 || line.includes("FROM") || line.includes("GROUP") || line.includes("ORDER")
                ? "#60a5fa" : "rgba(255,255,255,0.8)",
              lineHeight: 1.6,
            }}>
              {line}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
