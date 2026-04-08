import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Sequence } from "remotion";

const features = [
  { icon: "🗄️", title: "Multi-Banco", desc: "PostgreSQL, MySQL, SQL Server, Oracle", color: "#3b82f6" },
  { icon: "✨", title: "SQL com IA", desc: "Linguagem natural → SQL otimizado", color: "#8b5cf6" },
  { icon: "📊", title: "Power BI", desc: "Dashboards interativos embarcados", color: "#f59e0b" },
  { icon: "📥", title: "Exportação", desc: "CSV, Excel, JSON com um clique", color: "#10b981" },
  { icon: "🔄", title: "Histórico", desc: "Re-execute queries em segundos", color: "#ef4444" },
  { icon: "📈", title: "KPIs Auto", desc: "Métricas relevantes identificadas", color: "#06b6d4" },
];

export const Scene2Features = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(
    spring({ frame, fps, config: { damping: 18, stiffness: 120 } }),
    [0, 1], [60, 0]
  );
  const subtitleOpacity = interpolate(frame, [10, 35], [0, 1], { extrapolateRight: "clamp" });

  // Decorative line animation
  const lineWidth = interpolate(
    spring({ frame: frame - 5, fps, config: { damping: 30, stiffness: 80 } }),
    [0, 1], [0, 200]
  );

  return (
    <AbsoluteFill style={{ padding: "60px 100px" }}>
      {/* Decorative background grid */}
      <AbsoluteFill>
        {Array.from({ length: 6 }).map((_, i) => {
          const gridOpacity = interpolate(frame, [10 + i * 5, 30 + i * 5], [0, 0.04], {
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={`h-${i}`}
              style={{
                position: "absolute",
                top: 180 + i * 150,
                left: 0,
                right: 0,
                height: 1,
                background: `rgba(59,130,246,${gridOpacity})`,
              }}
            />
          );
        })}
        {Array.from({ length: 8 }).map((_, i) => {
          const gridOpacity = interpolate(frame, [10 + i * 4, 30 + i * 4], [0, 0.03], {
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={`v-${i}`}
              style={{
                position: "absolute",
                left: 100 + i * 240,
                top: 0,
                bottom: 0,
                width: 1,
                background: `rgba(59,130,246,${gridOpacity})`,
              }}
            />
          );
        })}
      </AbsoluteFill>

      {/* Section title */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontSize: 52,
          fontWeight: 800,
          color: "white",
          textAlign: "center",
          letterSpacing: -1,
        }}
      >
        Funcionalidades <span style={{ color: "#3b82f6" }}>Completas</span>
      </div>

      {/* Decorative line under title */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 12, marginBottom: 8 }}>
        <div
          style={{
            width: lineWidth,
            height: 3,
            borderRadius: 2,
            background: "linear-gradient(90deg, transparent, #3b82f6, transparent)",
          }}
        />
      </div>

      {/* Subtitle */}
      <div
        style={{
          opacity: subtitleOpacity,
          fontSize: 22,
          color: "rgba(255,255,255,0.5)",
          textAlign: "center",
          marginBottom: 50,
          fontWeight: 400,
        }}
      >
        Tudo que você precisa para transformar dados em insights
      </div>

      {/* Feature cards grid — 3x2 */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 20,
          justifyContent: "center",
        }}
      >
        {features.map((f, i) => (
          <Sequence key={i} from={18 + i * 8}>
            <FeatureCard feature={f} index={i} />
          </Sequence>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const FeatureCard = ({
  feature,
  index,
}: {
  feature: (typeof features)[0];
  index: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({ frame, fps, config: { damping: 14, stiffness: 100 } });
  const scale = interpolate(progress, [0, 1], [0.85, 1]);
  const opacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const y = interpolate(progress, [0, 1], [30, 0]);

  // Subtle glow pulse after entry
  const glowIntensity = frame > 20
    ? interpolate(Math.sin((frame - 20) * 0.06 + index), [-1, 1], [0, 0.15])
    : 0;

  // Icon bounce after card appears
  const iconScale = frame > 12
    ? spring({ frame: frame - 12, fps, config: { damping: 8, stiffness: 200 } })
    : 0;

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale}) translateY(${y}px)`,
        width: 530,
        padding: "28px 32px",
        borderRadius: 18,
        background: `linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)`,
        border: `1px solid rgba(255,255,255,0.1)`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05), 0 0 ${20 + glowIntensity * 40}px ${feature.color}${Math.round(glowIntensity * 60).toString(16).padStart(2, "0")}`,
        display: "flex",
        alignItems: "center",
        gap: 20,
      }}
    >
      <div
        style={{
          fontSize: 38,
          width: 64,
          height: 64,
          borderRadius: 16,
          background: `${feature.color}22`,
          border: `1px solid ${feature.color}33`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transform: `scale(${iconScale})`,
        }}
      >
        {feature.icon}
      </div>
      <div>
        <div style={{ color: "white", fontSize: 23, fontWeight: 700, marginBottom: 4 }}>
          {feature.title}
        </div>
        <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 17, fontWeight: 400 }}>
          {feature.desc}
        </div>
      </div>
      {/* Accent dot */}
      <div
        style={{
          position: "absolute" as const,
          top: 12,
          right: 16,
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: feature.color,
          opacity: interpolate(frame, [15, 25], [0, 0.6], { extrapolateRight: "clamp" }),
        }}
      />
    </div>
  );
};
