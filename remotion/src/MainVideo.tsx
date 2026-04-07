import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { Scene1Intro } from "./scenes/Scene1Intro";
import { Scene2Features } from "./scenes/Scene2Features";
import { Scene3Security } from "./scenes/Scene3Security";
import { Scene4AI } from "./scenes/Scene4AI";
import { Scene5CTA } from "./scenes/Scene5CTA";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "600", "700", "800"],
  subsets: ["latin"],
});

export const MainVideo = () => {
  const frame = useCurrentFrame();

  // Persistent animated background
  const gradientAngle = interpolate(frame, [0, 600], [135, 180]);
  
  return (
    <AbsoluteFill style={{ fontFamily, backgroundColor: "#0a1628" }}>
      {/* Animated gradient background */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(${gradientAngle}deg, #0a1628 0%, #0f2340 40%, #1a3a6e 100%)`,
        }}
      />

      {/* Floating orbs */}
      <FloatingOrbs frame={frame} />

      {/* Scenes */}
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={140}>
          <Scene1Intro />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })}
        />
        <TransitionSeries.Sequence durationInFrames={130}>
          <Scene2Features />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-left" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })}
        />
        <TransitionSeries.Sequence durationInFrames={130}>
          <Scene3Security />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })}
        />
        <TransitionSeries.Sequence durationInFrames={130}>
          <Scene4AI />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 25 })}
        />
        <TransitionSeries.Sequence durationInFrames={135}>
          <Scene5CTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};

const FloatingOrbs = ({ frame }: { frame: number }) => {
  const orbs = [
    { x: 200, y: 300, size: 400, speed: 0.008, color: "rgba(59,130,246,0.08)" },
    { x: 1400, y: 600, size: 350, speed: 0.012, color: "rgba(59,130,246,0.06)" },
    { x: 800, y: 200, size: 500, speed: 0.006, color: "rgba(99,102,241,0.05)" },
  ];

  return (
    <AbsoluteFill>
      {orbs.map((orb, i) => {
        const offsetX = Math.sin(frame * orb.speed + i) * 40;
        const offsetY = Math.cos(frame * orb.speed + i * 2) * 30;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: orb.x + offsetX,
              top: orb.y + offsetY,
              width: orb.size,
              height: orb.size,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
