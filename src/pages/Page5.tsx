import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import HorizontalTrack from "../components/HorizontalTrack";
import "./Page5.css";

const VB_W = 920;
const VB_H = 480;
const EYE_X = 760;
const EYE_Y = 300;
const FAR_X = 150;
const NEAR_X = 655;
const OBJ_H = 150;
const NEAR_POINT = 0.82;
const ARC_R = 58;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export default function Page5() {
  const [t, setT] = useState(0.1);
  const [defRevealed, setDefRevealed] = useState(false);

  const objX = lerp(FAR_X, NEAR_X, t);
  const topX = objX;
  const topY = EYE_Y - OBJ_H;
  const distancePx = EYE_X - objX;

  const thetaDeg = useMemo(
    () => (Math.atan(OBJ_H / distancePx) * 180) / Math.PI,
    [distancePx]
  );

  const distanceUnits = useMemo(() => lerp(25, 2.2, t), [t]);

  const blurPast = Math.max(0, (t - NEAR_POINT) / (1 - NEAR_POINT));
  const blurStd = blurPast * 5;
  const ghostDx = blurPast * 12;
  const ghostOpacity = blurPast * 0.6;

  /* definition is revealed only by the manual arrow button */

  const angleTop = Math.atan2(topY - EYE_Y, topX - EYE_X);
  const arcStart = { x: EYE_X + ARC_R * Math.cos(Math.PI), y: EYE_Y + ARC_R * Math.sin(Math.PI) };
  const arcEnd = { x: EYE_X + ARC_R * Math.cos(angleTop), y: EYE_Y + ARC_R * Math.sin(angleTop) };

  return (
    <div className="p5-scene">
      <div className="p5-header">
        <span className="eyebrow">The core concept</span>
        <h1 className="p5-heading">
          Visual angle: the angle subtended by the object on the eye
        </h1>
      </div>

      <div className="p5-body">
        <div className="p5-visual glass-panel">
          <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="p5-svg">
            <defs>
              <filter id="p5-blur">
                <feGaussianBlur stdDeviation={blurStd} />
              </filter>
            </defs>

            {/* optical axis */}
            <line
              x1={FAR_X - 40}
              y1={EYE_Y}
              x2={EYE_X - 40}
              y2={EYE_Y}
              stroke="var(--hairline-strong)"
              strokeWidth="1.5"
            />

            {/* distance dimension line */}
            <g className="p5-dim">
              <line x1={objX} y1={EYE_Y + 46} x2={EYE_X - 34} y2={EYE_Y + 46} stroke="var(--axis)" strokeWidth="1.2" />
              <line x1={objX} y1={EYE_Y + 38} x2={objX} y2={EYE_Y + 54} stroke="var(--axis)" strokeWidth="1.2" />
              <line x1={EYE_X - 34} y1={EYE_Y + 38} x2={EYE_X - 34} y2={EYE_Y + 54} stroke="var(--axis)" strokeWidth="1.2" />
              <text
                x={(objX + EYE_X - 34) / 2}
                y={EYE_Y + 70}
                textAnchor="middle"
                className="p5-svg-label p5-svg-label--axis"
              >
                distance
              </text>
            </g>

            {/* ho height marker */}
            <g className="p5-dim">
              <line x1={objX - 26} y1={EYE_Y} x2={objX - 26} y2={topY} stroke="var(--ray)" strokeWidth="1.2" />
              <line x1={objX - 34} y1={EYE_Y} x2={objX - 18} y2={EYE_Y} stroke="var(--ray)" strokeWidth="1.2" />
              <line x1={objX - 34} y1={topY} x2={objX - 18} y2={topY} stroke="var(--ray)" strokeWidth="1.2" />
              <text x={objX - 42} y={(EYE_Y + topY) / 2 + 4} textAnchor="middle" className="p5-svg-label">
                h&#8320;
              </text>
            </g>

            {/* rays */}
            <line x1={objX} y1={EYE_Y} x2={EYE_X} y2={EYE_Y} stroke="rgba(163,190,216,0.5)" strokeWidth="1.4" />
            <line x1={topX} y1={topY} x2={EYE_X} y2={EYE_Y} stroke="var(--ink-0)" strokeWidth="1.6" />
            <line x1={objX} y1={EYE_Y} x2={topX} y2={topY} stroke="rgba(163,190,216,0.35)" strokeWidth="1.2" strokeDasharray="3 5" />

            {/* angle arc */}
            <path
              d={`M ${arcStart.x} ${arcStart.y} A ${ARC_R} ${ARC_R} 0 0 0 ${arcEnd.x} ${arcEnd.y}`}
              fill="none"
              stroke="var(--ray)"
              strokeWidth="1.6"
            />
            <text
              x={EYE_X - ARC_R * 1.42}
              y={EYE_Y - 12}
              textAnchor="middle"
              className="p5-svg-label p5-svg-label--theta"
            >
              &theta;
            </text>

            {/* ghost duplicate for near-point blur */}
            {ghostOpacity > 0.01 && (
              <g opacity={ghostOpacity} filter="url(#p5-blur)">
                <line
                  x1={topX + ghostDx}
                  y1={topY}
                  x2={topX + ghostDx}
                  y2={EYE_Y}
                  stroke="var(--ink-1)"
                  strokeWidth="3"
                />
                <ArrowObject x={topX + ghostDx} baseY={EYE_Y} topY={topY} />
              </g>
            )}

            {/* object arrow */}
            <g filter={blurStd > 0.05 ? "url(#p5-blur)" : undefined}>
              <ArrowObject x={topX} baseY={EYE_Y} topY={topY} />
            </g>

            {/* viewer */}
            <ViewerGlyph x={EYE_X} y={EYE_Y} strain={blurPast} />
          </svg>
        </div>

        <div className="p5-side">
          <div className="p5-readouts">
            <div className="p5-readout">
              <span className="p5-readout-label">Distance</span>
              <span className="p5-readout-value readout">{distanceUnits.toFixed(1)} cm</span>
            </div>
            <div className="p5-readout">
              <span className="p5-readout-label">Visual angle &theta;</span>
              <span className="p5-readout-value readout" style={{ color: "var(--ray)" }}>
                {thetaDeg.toFixed(1)}&deg;
              </span>
            </div>
          </div>

          <div className="p5-track">
            <HorizontalTrack
              value={t}
              onChange={setT}
              leftLabel="far"
              rightLabel="very close"
              ariaLabel="Move the object along the optical axis"
              markers={[{ at: NEAR_POINT, label: "limit" }]}
            />
          </div>

          <p className="p5-caption">
            As the object slides toward the viewer, the same height h&#8320;
            spans a wider angle &theta; at the eye — the visual angle grows,
            and the object looks larger, purely from the change in
            distance.
          </p>

          <div className="p5-def-trigger-wrap">
            <button
              type="button"
              className={"p5-arrow-btn" + (defRevealed ? " p5-arrow-btn--active" : "")}
              onClick={() => setDefRevealed((v) => !v)}
              aria-expanded={defRevealed}
              aria-label={defRevealed ? "Hide definition" : "Show definition"}
              title={defRevealed ? "Hide definition" : "Show definition"}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="p5-arrow-icon"
              >
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </button>
          </div>

          <AnimatePresence>
            {defRevealed && (
              <motion.div
                className="p5-definition"
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.97 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="p5-definition-label">Least distance of distinct vision</span>
                <p>
                  The least distance from the eye at which an object can be
                  seen clearly and distinctly without strain is called the
                  least distance of distinct vision.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function ArrowObject({ x, baseY, topY }: { x: number; baseY: number; topY: number }) {
  return (
    <g>
      <line x1={x} y1={baseY} x2={x} y2={topY + 10} stroke="var(--ink-0)" strokeWidth="2.4" />
      <path d={`M ${x - 7} ${topY + 16} L ${x} ${topY} L ${x + 7} ${topY + 16} Z`} fill="var(--ink-0)" />
    </g>
  );
}

function ViewerGlyph({ x, y, strain }: { x: number; y: number; strain: number }) {
  const browTilt = -4 - strain * 12;
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* shoulders / bust silhouette */}
      <path
        d="M -34 150 Q -46 84 -20 46 Q 4 18 44 30 L 60 150 Z"
        fill="#101923"
        stroke="var(--hairline-strong)"
        strokeWidth="1.2"
      />
      {/* head */}
      <path
        d="M -22 42 Q -30 -6 6 -14 Q 42 -18 48 18 Q 50 46 24 54 Q -6 62 -22 42 Z"
        fill="#152230"
        stroke="var(--hairline-strong)"
        strokeWidth="1.4"
      />
      {/* eye */}
      <g transform="translate(20 20)">
        <path d="M -18 0 Q 0 -12 18 0 Q 0 12 -18 0 Z" fill="#0a121a" stroke="rgba(163,190,216,0.5)" strokeWidth="1.2" />
        <circle cx="4" cy="0" r="5.4" fill="#8fb8cc" />
        <circle cx="4" cy="0" r="2.6" fill="#050708" />
        <path
          d="M -18 -6 Q 0 -18 18 -6"
          fill="none"
          stroke="#3a4756"
          strokeWidth="3"
          strokeLinecap="round"
          transform={`rotate(${browTilt} 0 -10)`}
        />
      </g>
      {strain > 0.15 &&
        [0, 1].map((i) => (
          <line
            key={i}
            x1={44 + i * 8}
            y1={-4 - i * 8}
            x2={52 + i * 8}
            y2={-14 - i * 8}
            stroke="rgba(255,110,110,0.55)"
            strokeWidth="2"
            strokeLinecap="round"
            opacity={Math.min(1, strain * 1.5)}
          />
        ))}
      <text x="10" y="176" textAnchor="middle" className="p5-svg-label">
        viewer
      </text>
    </g>
  );
}
