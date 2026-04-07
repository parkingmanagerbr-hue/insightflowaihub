import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

export const Scene4AI = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  // Typing animation for prompt
  const promptText = "Mostre o total de vendas por região no último trimestre";
  const visibleChars = Math.min(
    Math.floor(interpolate(frame, [25, 85], [0, promptText.length], { extrapolateRight: "clamp" })),
    promptText.length
  );

  // SQL reveal
  const sqlOpacity = interpolate(frame, [90, 105], [0, 1], { extrapolateRight: "clamp" });
  const sqlY = interpolate(
    spring({ frame: frame - 90, fps, config: { damping: 20 } }),
    [0, 1], [30, 0]
  );

  return (
    <AbsoluteFill style={{ padding: "80px 120px", justifyContent: "center" }}>
      {/* Title */}
      <div
        style={{
          opacity: titleOpacity,
          fontSize: 48,
          fontWeight: 800,
          color: "white",
          textAlign: "center",
          marginBottom: 50,
        }}
      >
        SQL Automático com <span style={{ color: "#3b82f6" }}>Gemini AI</span>
      </div>

      {/* Chat-like interface */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {/* User prompt */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div
            style={{
              background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              padding: "20px 28px",
              borderRadius: "20px 20px 4px 20px",
              maxWidth: 700,
              fontSize: 22,
              color: "white",
              fontWeight: 500,
              boxShadow: "0 8px 30px rgba(59,130,246,0.3)",
            }}
          >
            {promptText.slice(0, visibleChars)}
            {visibleChars < promptText.length && (
              <span
                style={{
                  opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0,
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                |
              </span>
            )}
          </div>
        </div>

        {/* AI response */}
        <div
          style={{
            opacity: sqlOpacity,
            transform: `translateY(${sqlY}px)`,
            display: "flex",
            justifyContent: "flex-start",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              padding: "24px 28px",
              borderRadius: "20px 20px 20px 4px",
              maxWidth: 800,
            }}
          >
            <div
              style={{
                fontSize: 14,
                color: "#3b82f6",
                fontWeight: 600,
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              ✨ SQL Gerado
            </div>
            <pre
              style={{
                fontSize: 18,
                color: "#93c5fd",
                fontFamily: "monospace",
                margin: 0,
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
              }}
            >
{`SELECT r.nome AS regiao,
       SUM(v.valor) AS total_vendas
FROM vendas v
JOIN regioes r ON v.regiao_id = r.id
WHERE v.data >= DATE_TRUNC('quarter',
      CURRENT_DATE - INTERVAL '3 months')
GROUP BY r.nome
ORDER BY total_vendas DESC;`}
            </pre>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
