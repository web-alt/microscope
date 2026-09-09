import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import HorizontalTrack from "../components/HorizontalTrack";
import "./Page3.css";

const VB_W = 800;
const VB_H = 480;
const VANISH = { x: 400, y: 66 };
const BASE_Y = 452;
const ROAD_TOP_HALF = 22;
const ROAD_BOTTOM_HALF = 340;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export default function Page3() {
  const [t, setT] = useState(0.06);

  const eased = Math.pow(t, 1.55);
  const carY = lerp(VANISH.y + 14, BASE_Y - 8, eased);
  const carScale = lerp(0.1, 1, eased);
  const roadHalfAtCar = lerp(ROAD_TOP_HALF, ROAD_BOTTOM_HALF, eased);

  const distanceM = useMemo(() => lerp(58, 3.2, t), [t]);
  const apparentAngle = useMemo(() => {
    const objectHeight = 1.5;
    const rad = 2 * Math.atan(objectHeight / 2 / distanceM);
    return (rad * 180) / Math.PI;
  }, [distanceM]);

  const roadPath = `M ${VANISH.x - ROAD_TOP_HALF} ${VANISH.y} L ${VANISH.x - ROAD_BOTTOM_HALF} ${BASE_Y} L ${VANISH.x + ROAD_BOTTOM_HALF} ${BASE_Y} L ${VANISH.x + ROAD_TOP_HALF} ${VANISH.y} Z`;

  return (
    <div className="p3-scene">
      <div className="p3-header">
        <span className="eyebrow">Before the instrument</span>
        <h1 className="p3-heading">
          Can only optical instruments be used to magnify an object?
        </h1>
      </div>

      <div className="p3-body">
        <div className="p3-visual glass-panel">
          <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="p3-svg" aria-hidden="true">
            <defs>
              <linearGradient id="p3-sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0c1520" />
                <stop offset="100%" stopColor="#0a1018" />
              </linearGradient>
              <linearGradient id="p3-road" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#161e2a" />
                <stop offset="100%" stopColor="#1b2432" />
              </linearGradient>
              <radialGradient id="p3-glow" cx="50%" cy="0%" r="75%">
                <stop offset="0%" stopColor="rgba(95,210,232,0.16)" />
                <stop offset="100%" stopColor="rgba(95,210,232,0)" />
              </radialGradient>
            </defs>

            <rect x="0" y="0" width={VB_W} height={VB_H} fill="url(#p3-sky)" />
            <rect x="0" y="0" width={VB_W} height={VANISH.y + 40} fill="url(#p3-glow)" />

            <path d={roadPath} fill="url(#p3-road)" stroke="var(--hairline-strong)" strokeWidth="1" />

            {/* center dashed line */}
            <line
              x1={VANISH.x}
              y1={VANISH.y}
              x2={VANISH.x}
              y2={BASE_Y}
              stroke="rgba(255,180,107,0.35)"
              strokeWidth="2"
              strokeDasharray="10 14"
            />

            {/* horizon */}
            <line x1="0" y1={VANISH.y} x2={VB_W} y2={VANISH.y} stroke="var(--hairline)" strokeWidth="1" />

            {/* viewer marker at bottom */}
            <g transform={`translate(${VANISH.x}, ${BASE_Y + 14})`}>
              <circle r="5" fill="var(--axis)" />
              <text y="22" textAnchor="middle" className="p3-svg-label">
                viewer
              </text>
            </g>

            {/* car */}
            <motion.g
              animate={{ x: VANISH.x, y: carY, scale: carScale }}
              transition={{ type: "spring", stiffness: 220, damping: 32 }}
              style={{ transformOrigin: "0px 0px" }}
            >
              <CarGlyph />
            </motion.g>

            {/* apparent-size bracket */}
            <motion.g
              animate={{
                x: VANISH.x,
                y: carY,
                opacity: eased > 0.04 ? 1 : 0,
              }}
              transition={{ type: "spring", stiffness: 220, damping: 32 }}
            >
              <line
                x1={-roadHalfAtCar * 0.34}
                x2={-roadHalfAtCar * 0.34}
                y1={-46 * carScale}
                y2={10}
                stroke="var(--ray)"
                strokeWidth="1"
                strokeDasharray="3 4"
                opacity={0.55}
              />
              <line
                x1={roadHalfAtCar * 0.34}
                x2={roadHalfAtCar * 0.34}
                y1={-46 * carScale}
                y2={10}
                stroke="var(--ray)"
                strokeWidth="1"
                strokeDasharray="3 4"
                opacity={0.55}
              />
            </motion.g>
          </svg>
        </div>

        <div className="p3-side">
          <div className="p3-readouts">
            <div className="p3-readout">
              <span className="p3-readout-label">Distance to viewer</span>
              <span className="p3-readout-value readout">{distanceM.toFixed(1)} m</span>
              <div className="p3-bar">
                <motion.div
                  className="p3-bar-fill"
                  animate={{ width: `${(distanceM / 58) * 100}%` }}
                  transition={{ type: "spring", stiffness: 200, damping: 30 }}
                  style={{ background: "var(--axis)" }}
                />
              </div>
            </div>
            <div className="p3-readout">
              <span className="p3-readout-label">Apparent (visual) size</span>
              <span className="p3-readout-value readout">{apparentAngle.toFixed(1)}&deg;</span>
              <div className="p3-bar">
                <motion.div
                  className="p3-bar-fill"
                  animate={{ width: `${Math.min(100, (apparentAngle / 26) * 100)}%` }}
                  transition={{ type: "spring", stiffness: 200, damping: 30 }}
                  style={{ background: "var(--ray)" }}
                />
              </div>
            </div>
          </div>

          <div className="p3-track">
            <HorizontalTrack
              value={t}
              onChange={setT}
              leftLabel="far"
              rightLabel="near"
              ariaLabel="Move the car closer to or farther from the viewer"
            />
          </div>

          <p className="p3-caption">
            Drag the control to bring the car toward the viewer. As distance
            falls, the same object spans a wider angle at the eye — it
            simply <em>looks</em> bigger, with no instrument involved.
          </p>
        </div>
      </div>
    </div>
  );
}

function CarGlyph() {
  return (
    <g>
      <ellipse cx="0" cy="14" rx="46" ry="7" fill="rgba(0,0,0,0.35)" />
      <path
        d="M -40 6 L -34 -14 Q -30 -22 -16 -22 L 16 -22 Q 30 -22 34 -14 L 40 6 Q 40 14 32 14 L -32 14 Q -40 14 -40 6 Z"
        fill="#f4b860"
        stroke="#c98a3c"
        strokeWidth="1.5"
      />
      <path
        d="M -22 -14 L -16 -26 Q -14 -30 -8 -30 L 8 -30 Q 14 -30 16 -26 L 22 -14 Z"
        fill="#0e1520"
        opacity="0.85"
      />
      <circle cx="-22" cy="16" r="8" fill="#0a0e14" stroke="#2a3441" strokeWidth="2" />
      <circle cx="22" cy="16" r="8" fill="#0a0e14" stroke="#2a3441" strokeWidth="2" />
      <circle cx="-38" cy="2" r="2.4" fill="#fff3d6" />
      <circle cx="38" cy="2" r="2.4" fill="#ff6a5f" />
    </g>
  );
}
