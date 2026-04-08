import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { VScene1Intro } from "./vertical-scenes/VScene1Intro";
import { VScene2Features } from "./vertical-scenes/VScene2Features";
import { VScene3Security } from "./vertical-scenes/VScene3Security";
import { VScene4AI } from "./vertical-scenes/VScene4AI";
import { VScene5CTA } from "./vertical-scenes/VScene5CTA";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "600", "700", "800"],
  subsets: ["latin"],
});

export const VerticalVideo = () => {
  const frame = useCurrentFrame();
  const gradientAngle = interpolate(frame, [0, 600], [135, 180]);

  return (
    <AbsoluteFill style={{ fontFamily, backgroundColor: "#0a1628" }}>
      <AbsoluteFill
        style={{
          background: `linear-gradient(${gradientAngle}deg, #0a1628 0%, #0f2340 40%, #1a3a6e 100%)`,
        }}
      />
      <VerticalOrbs frame={frame} />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={140}>
          <VScene1Intro />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })}
        />
        <TransitionSeries.Sequence durationInFrames={130}>
          <VScene2Features />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-bottom" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })}
        />
        <TransitionSeries.Sequence durationInFrames={130}>
          <VScene3Security />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })}
        />
        <TransitionSeries.Sequence durationInFrames={130}>
          <VScene4AI />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 25 })}
        />
        <TransitionSeries.Sequence durationInFrames={135}>
          <VScene5CTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};

const VerticalOrbs = ({ frame }: { frame: number }) => {
  const orbs = [
    { x: 100, y: 400, size: 350, speed: 0.008, color: "rgba(59,130,246,0.08)" },
    { x: 700, y: 1200, size: 300, speed: 0.012, color: "rgba(59,130,246,0.06)" },
    { x: 400, y: 800, size: 400, speed: 0.006, color: "rgba(99,102,241,0.05)" },
  ];

  return (
    <AbsoluteFill>
      {orbs.map((orb, i) => {
        const offsetX = Math.sin(frame * orb.speed + i) * 30;
        const offsetY = Math.cos(frame * orb.speed + i * 2) * 25;
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
