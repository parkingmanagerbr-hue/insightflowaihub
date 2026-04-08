import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Sequence } from "remotion";

const securityItems = [
  { icon: "🛡️", label: "Sanitização de entradas", color: "#3b82f6" },
  { icon: "🔒", label: "Proteção SQL Injection", color: "#8b5cf6" },
  { icon: "🔑", label: "Criptografia AES-GCM", color: "#f59e0b" },
  { icon: "⚡", label: "Rate Limiting", color: "#ef4444" },
  { icon: "🚫", label: "Zero exposição de credenciais", color: "#10b981" },
];

export const VScene3Security = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const shieldProgress = spring({ frame: frame - 5, fps, config: { damping: 12, stiffness: 80 } });
  const shieldScale = interpolate(shieldProgress, [0, 1], [0.3, 1]);
  const glowPhase = Math.sin(frame * 0.05) * 0.5 + 0.5;
  const titleOpacity = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ padding: "80px 50px", alignItems: "center" }}>
      {/* Shield */}
      <div style={{ position: "relative", marginBottom: 40 }}>
        <div style={{
          position: "absolute", width: 280, height: 280, borderRadius: "50%",
          border: `2px solid rgba(59,130,246,${0.1 + glowPhase * 0.1})`,
          transform: `scale(${shieldScale})`, left: -20, top: -20,
        }} />
        <div style={{
          transform: `scale(${shieldScale})`,
          width: 200, height: 230,
          background: "linear-gradient(180deg, #3b82f6 0%, #1d4ed8 50%, #1e3a8a 100%)",
          borderRadius: "50% 50% 50% 50% / 35% 35% 65% 65%",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 0 ${50 + glowPhase * 30}px rgba(59,130,246,${0.2 + glowPhase * 0.15})`,
        }}>
          <span style={{ fontSize: 70 }}>🛡️</span>
        </div>
      </div>

      <div style={{
        opacity: titleOpacity, fontSize: 48, fontWeight: 800,
        color: "white", textAlign: "center", marginBottom: 10, letterSpacing: -0.5,
      }}>
        Segurança{"\n"}<span style={{ color: "#3b82f6" }}>Enterprise</span>
      </div>

      <div style={{
        opacity: interpolate(frame, [8, 30], [0, 1], { extrapolateRight: "clamp" }),
        fontSize: 20, color: "rgba(255,255,255,0.45)", marginBottom: 40, textAlign: "center",
      }}>
        Proteção completa dos seus dados
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%" }}>
        {securityItems.map((item, i) => (
          <Sequence key={i} from={20 + i * 10}>
            <SecurityItem item={item} />
          </Sequence>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const SecurityItem = ({ item }: { item: { icon: string; label: string; color: string } }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame, fps, config: { damping: 16, stiffness: 100 } });
  const x = interpolate(progress, [0, 1], [60, 0]);
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{
      opacity, transform: `translateX(${x}px)`,
      display: "flex", alignItems: "center", gap: 14,
      padding: "16px 22px", borderRadius: 14,
      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: `${item.color}18`, border: `1px solid ${item.color}30`,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <span style={{ fontSize: 22 }}>{item.icon}</span>
      </div>
      <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 20, fontWeight: 500 }}>{item.label}</span>
    </div>
  );
};
