import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Sequence } from "remotion";

const securityItems = [
  { icon: "🛡️", label: "Sanitização de entradas", color: "#3b82f6" },
  { icon: "🔒", label: "Proteção SQL Injection & XSS", color: "#8b5cf6" },
  { icon: "🔑", label: "Criptografia AES-GCM", color: "#f59e0b" },
  { icon: "⚡", label: "Rate Limiting", color: "#ef4444" },
  { icon: "🚫", label: "Zero exposição de credenciais", color: "#10b981" },
];

export const Scene3Security = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: "clamp" });
  const titleScale = spring({ frame, fps, config: { damping: 18, stiffness: 120 } });

  // Shield animation
  const shieldProgress = spring({ frame: frame - 8, fps, config: { damping: 12, stiffness: 80 } });
  const shieldScale = interpolate(shieldProgress, [0, 1], [0.3, 1]);
  const shieldRotate = interpolate(shieldProgress, [0, 1], [-15, 0]);

  // Pulsing glow
  const glowPhase = Math.sin(frame * 0.05) * 0.5 + 0.5;

  // Orbiting particles around shield
  const particleAngle1 = frame * 0.03;
  const particleAngle2 = frame * 0.03 + Math.PI * 0.66;
  const particleAngle3 = frame * 0.03 + Math.PI * 1.33;

  const orbitRadius = 180;

  return (
    <AbsoluteFill style={{ padding: "60px 100px" }}>
      {/* Background radial glow */}
      <div
        style={{
          position: "absolute",
          left: "25%",
          top: "30%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(59,130,246,${0.06 + glowPhase * 0.04}) 0%, transparent 70%)`,
          transform: "translate(-50%, -50%)",
        }}
      />

      <div style={{ display: "flex", gap: 80, alignItems: "center", height: "100%" }}>
        {/* Left: Shield visual */}
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
          }}
        >
          {/* Orbiting particles */}
          {[particleAngle1, particleAngle2, particleAngle3].map((angle, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `calc(50% + ${Math.cos(angle) * orbitRadius}px)`,
                top: `calc(50% + ${Math.sin(angle) * orbitRadius}px)`,
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: ["#3b82f6", "#8b5cf6", "#06b6d4"][i],
                opacity: interpolate(frame, [15, 30], [0, 0.7], { extrapolateRight: "clamp" }),
                boxShadow: `0 0 12px ${["#3b82f6", "#8b5cf6", "#06b6d4"][i]}`,
              }}
            />
          ))}

          {/* Outer ring */}
          <div
            style={{
              position: "absolute",
              width: 340,
              height: 340,
              borderRadius: "50%",
              border: `2px solid rgba(59,130,246,${0.1 + glowPhase * 0.1})`,
              transform: `scale(${shieldScale})`,
            }}
          />

          {/* Inner ring */}
          <div
            style={{
              position: "absolute",
              width: 300,
              height: 300,
              borderRadius: "50%",
              border: `1px solid rgba(59,130,246,${0.05 + glowPhase * 0.08})`,
              transform: `scale(${shieldScale})`,
            }}
          />

          {/* Shield */}
          <div
            style={{
              transform: `scale(${shieldScale}) rotate(${shieldRotate}deg)`,
              width: 240,
              height: 280,
              background: "linear-gradient(180deg, #3b82f6 0%, #1d4ed8 50%, #1e3a8a 100%)",
              borderRadius: "50% 50% 50% 50% / 35% 35% 65% 65%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 ${60 + glowPhase * 40}px rgba(59,130,246,${0.25 + glowPhase * 0.2}), inset 0 -20px 40px rgba(0,0,0,0.3), inset 0 2px 0 rgba(255,255,255,0.15)`,
              position: "relative",
            }}
          >
            {/* Shield highlight */}
            <div
              style={{
                position: "absolute",
                top: 20,
                left: "25%",
                width: "50%",
                height: "30%",
                borderRadius: "50%",
                background: "linear-gradient(180deg, rgba(255,255,255,0.15), transparent)",
              }}
            />
            <span style={{ fontSize: 80, filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.4))" }}>🛡️</span>
          </div>
        </div>

        {/* Right: Text content */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              opacity: titleOpacity,
              transform: `scale(${titleScale})`,
              fontSize: 46,
              fontWeight: 800,
              color: "white",
              marginBottom: 12,
              letterSpacing: -0.5,
            }}
          >
            Segurança <span style={{ color: "#3b82f6" }}>Enterprise</span>
          </div>

          {/* Subtitle */}
          <div
            style={{
              opacity: interpolate(frame, [8, 30], [0, 1], { extrapolateRight: "clamp" }),
              fontSize: 18,
              color: "rgba(255,255,255,0.45)",
              marginBottom: 32,
              fontWeight: 400,
            }}
          >
            Proteção completa dos seus dados
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {securityItems.map((item, i) => (
              <Sequence key={i} from={20 + i * 10}>
                <SecurityItem item={item} index={i} />
              </Sequence>
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const SecurityItem = ({ item, index }: { item: { icon: string; label: string; color: string }; index: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({ frame, fps, config: { damping: 16, stiffness: 100 } });
  const x = interpolate(progress, [0, 1], [60, 0]);
  const opacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });

  // Progress bar fill animation
  const barWidth = interpolate(
    spring({ frame: frame - 8, fps, config: { damping: 25, stiffness: 60 } }),
    [0, 1], [0, 100]
  );

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${x}px)`,
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 20px",
        borderRadius: 14,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Bottom progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: `${barWidth}%`,
          height: 2,
          background: `linear-gradient(90deg, ${item.color}00, ${item.color})`,
          borderRadius: 1,
        }}
      />
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: `${item.color}18`,
          border: `1px solid ${item.color}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 20 }}>{item.icon}</span>
      </div>
      <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 20, fontWeight: 500 }}>
        {item.label}
      </span>
    </div>
  );
};
