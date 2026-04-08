import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Sequence } from "remotion";

const features = [
  { icon: "🗄️", title: "Multi-Banco", desc: "PostgreSQL, MySQL, SQL Server", color: "#3b82f6" },
  { icon: "✨", title: "SQL com IA", desc: "Linguagem natural → SQL", color: "#8b5cf6" },
  { icon: "📊", title: "Power BI", desc: "Dashboards embarcados", color: "#f59e0b" },
  { icon: "📥", title: "Exportação", desc: "CSV, Excel, JSON", color: "#10b981" },
  { icon: "🔄", title: "Histórico", desc: "Re-execute em segundos", color: "#ef4444" },
  { icon: "📈", title: "KPIs Auto", desc: "Métricas identificadas", color: "#06b6d4" },
];

export const VScene2Features = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(spring({ frame, fps, config: { damping: 18 } }), [0, 1], [60, 0]);
  const lineWidth = interpolate(spring({ frame: frame - 5, fps, config: { damping: 30, stiffness: 80 } }), [0, 1], [0, 300]);

  return (
    <AbsoluteFill style={{ padding: "100px 50px", justifyContent: "flex-start", alignItems: "center" }}>
      <div style={{
        opacity: titleOpacity, transform: `translateY(${titleY}px)`,
        fontSize: 52, fontWeight: 800, color: "white", textAlign: "center",
        letterSpacing: -1, marginBottom: 8,
      }}>
        Funcionalidades{"\n"}<span style={{ color: "#3b82f6" }}>Completas</span>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 50 }}>
        <div style={{
          width: lineWidth, height: 3, borderRadius: 2,
          background: "linear-gradient(90deg, transparent, #3b82f6, transparent)",
        }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18, width: "100%" }}>
        {features.map((f, i) => (
          <Sequence key={i} from={15 + i * 8}>
            <FeatureCard feature={f} />
          </Sequence>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const FeatureCard = ({ feature }: { feature: typeof features[0] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame, fps, config: { damping: 14, stiffness: 100 } });
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const x = interpolate(progress, [0, 1], [80, 0]);

  return (
    <div style={{
      opacity, transform: `translateX(${x}px)`,
      padding: "22px 28px", borderRadius: 18,
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.1)",
      display: "flex", alignItems: "center", gap: 18,
    }}>
      <div style={{
        fontSize: 36, width: 60, height: 60, borderRadius: 16,
        background: `${feature.color}22`, border: `1px solid ${feature.color}33`,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        {feature.icon}
      </div>
      <div>
        <div style={{ color: "white", fontSize: 24, fontWeight: 700, marginBottom: 2 }}>{feature.title}</div>
        <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 18 }}>{feature.desc}</div>
      </div>
    </div>
  );
};
