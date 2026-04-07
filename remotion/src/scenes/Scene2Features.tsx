import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Sequence } from "remotion";

const features = [
  { icon: "🗄️", title: "Multi-Banco", desc: "PostgreSQL, MySQL, SQL Server, Oracle" },
  { icon: "✨", title: "SQL com IA", desc: "Linguagem natural → SQL otimizado" },
  { icon: "📊", title: "Power BI", desc: "Dashboards interativos embarcados" },
  { icon: "📥", title: "Exportação", desc: "CSV, Excel, JSON com um clique" },
  { icon: "🔄", title: "Histórico", desc: "Re-execute queries em segundos" },
  { icon: "📈", title: "KPIs Auto", desc: "Métricas relevantes identificadas" },
];

export const Scene2Features = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(
    spring({ frame, fps, config: { damping: 20 } }),
    [0, 1], [40, 0]
  );

  return (
    <AbsoluteFill style={{ padding: "80px 120px" }}>
      {/* Section title */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontSize: 52,
          fontWeight: 800,
          color: "white",
          marginBottom: 60,
          textAlign: "center",
        }}
      >
        Funcionalidades <span style={{ color: "#3b82f6" }}>Completas</span>
      </div>

      {/* Feature cards grid */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 24,
          justifyContent: "center",
        }}
      >
        {features.map((f, i) => (
          <Sequence key={i} from={15 + i * 10}>
            <FeatureCard feature={f} index={i} />
          </Sequence>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const FeatureCard = ({ feature, index }: { feature: typeof features[0]; index: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame, fps, config: { damping: 15, stiffness: 120 } });
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        width: 520,
        padding: "32px 36px",
        borderRadius: 20,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        display: "flex",
        alignItems: "center",
        gap: 20,
      }}
    >
      <div
        style={{
          fontSize: 40,
          width: 64,
          height: 64,
          borderRadius: 16,
          background: "rgba(59,130,246,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {feature.icon}
      </div>
      <div>
        <div style={{ color: "white", fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
          {feature.title}
        </div>
        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 18, fontWeight: 400 }}>
          {feature.desc}
        </div>
      </div>
    </div>
  );
};
