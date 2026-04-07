import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Sequence } from "remotion";

const securityItems = [
  { icon: "🛡️", label: "Sanitização de entradas" },
  { icon: "🔒", label: "Proteção SQL Injection & XSS" },
  { icon: "🔑", label: "Criptografia AES-GCM" },
  { icon: "⚡", label: "Rate Limiting" },
  { icon: "🚫", label: "Zero exposição de credenciais" },
];

export const Scene3Security = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const titleScale = spring({ frame, fps, config: { damping: 20 } });

  // Shield animation
  const shieldScale = spring({ frame: frame - 10, fps, config: { damping: 12, stiffness: 80 } });
  const shieldGlow = interpolate(frame, [20, 50, 80, 110], [0, 0.6, 0.3, 0.6], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ padding: "80px 120px" }}>
      <div style={{ display: "flex", gap: 80, alignItems: "center", height: "100%" }}>
        {/* Left: Shield visual */}
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              transform: `scale(${shieldScale})`,
              width: 280,
              height: 320,
              background: "linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)",
              borderRadius: "50% 50% 50% 50% / 40% 40% 60% 60%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 ${80 + shieldGlow * 60}px rgba(59,130,246,${0.3 + shieldGlow * 0.3})`,
              position: "relative",
            }}
          >
            <span style={{ fontSize: 100, filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.3))" }}>🛡️</span>
            {/* Pulse ring */}
            <div
              style={{
                position: "absolute",
                inset: -20,
                borderRadius: "50% 50% 50% 50% / 40% 40% 60% 60%",
                border: `2px solid rgba(59,130,246,${shieldGlow * 0.5})`,
              }}
            />
          </div>
        </div>

        {/* Right: Text content */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              opacity: titleOpacity,
              transform: `scale(${titleScale})`,
              fontSize: 48,
              fontWeight: 800,
              color: "white",
              marginBottom: 40,
            }}
          >
            Segurança <span style={{ color: "#3b82f6" }}>Enterprise</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {securityItems.map((item, i) => (
              <Sequence key={i} from={25 + i * 12}>
                <SecurityItem item={item} />
              </Sequence>
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const SecurityItem = ({ item }: { item: { icon: string; label: string } }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const x = interpolate(
    spring({ frame, fps, config: { damping: 20, stiffness: 120 } }),
    [0, 1], [80, 0]
  );
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${x}px)`,
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "16px 24px",
        borderRadius: 14,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <span style={{ fontSize: 28 }}>{item.icon}</span>
      <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 22, fontWeight: 500 }}>
        {item.label}
      </span>
    </div>
  );
};
