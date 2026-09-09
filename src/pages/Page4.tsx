import { useState } from "react";
import { motion } from "framer-motion";
import HorizontalTrack from "../components/HorizontalTrack";
import "./Page4.css";

const VB_W = 800;
const VB_H = 420;
const EYE_X = 640;
const EYE_Y = 210;
const NEAR_POINT = 0.62;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export default function Page4({ onBack }: { onBack: () => void }) {
  const [t, setT] = useState(0.06);

  const objX = lerp(120, EYE_X - 150, t);
  const scale = lerp(0.55, 1.85, Math.pow(t, 0.85));
  const blurPast = Math.max(0, (t - NEAR_POINT) / (1 - NEAR_POINT));
  const blurStd = blurPast * 5.5;
  const ghostOffset = blurPast * 15;
  const ghostOpacity = blurPast * 0.62;
  const strain = Math.max(0, (t - NEAR_POINT - 0.08) / 0.3);

  const clarity =
    t < NEAR_POINT ? "sharpening" : blurPast > 0.55 ? "strained" : "blurring";

  return (
    <div className="p4-scene">
      <div className="p4-header">
        <span className="eyebrow">The unaided eye</span>
        <h1 className="p4-heading">Then why do we use optical instruments?</h1>
      </div>

      <div className="p4-body">
        <div className="p4-visual glass-panel">
          <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="p4-svg">
            <defs>
              <filter id="p4-blur">
                <feGaussianBlur stdDeviation={blurStd} />
              </filter>
              <linearGradient id="p4-bg" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0a0f16" />
                <stop offset="100%" stopColor="#0d1520" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width={VB_W} height={VB_H} fill="url(#p4-bg)" />

            {/* optical axis */}
            <line
              x1="90"
              y1={EYE_Y}
              x2={EYE_X - 60}
              y2={EYE_Y}
              stroke="rgba(255,180,107,0.3)"
              strokeWidth="1.5"
              strokeDasharray="8 10"
            />

            {/* ghost (doubled) image */}
            {ghostOpacity > 0.01 && (
              <g
                transform={`translate(${objX + ghostOffset} ${EYE_Y - ghostOffset * 0.35}) scale(${scale})`}
                opacity={ghostOpacity}
                filter="url(#p4-blur)"
              >
                <ObjectGlyph />
              </g>
            )}

            {/* main object */}
            <g
              transform={`translate(${objX} ${EYE_Y}) scale(${scale})`}
              filter={blurStd > 0.05 ? "url(#p4-blur)" : undefined}
            >
              <ObjectGlyph />
            </g>

            {/* eye, side profile */}
            <EyeGlyph x={EYE_X} y={EYE_Y} strain={strain} />
          </svg>

          <motion.div
            className="p4-state-chip"
            animate={{ opacity: 1 }}
            key={clarity}
            initial={{ opacity: 0, y: -4 }}
          >
            {clarity === "sharpening" && "Coming into focus"}
            {clarity === "blurring" && "Past the eye's limit — blurring"}
            {clarity === "strained" && "Doubled & straining"}
          </motion.div>
        </div>

        <div className="p4-side">
          <div className="p4-track">
            <HorizontalTrack
              value={t}
              onChange={setT}
              leftLabel="far"
              rightLabel="very close"
              ariaLabel="Move the object toward the eye"
              markers={[{ at: NEAR_POINT, label: "limit" }]}
            />
          </div>
          <p className="p4-caption">
            Bringing the object closer helps — up to a point. Push past the
            eye's near-point limit and the lens inside the eye can no
            longer bend light enough to focus it: the image blurs, briefly
            doubles, and the eye strains.
          </p>
        </div>
      </div>

      <button className="p4-back" onClick={onBack} aria-label="Back to Simple Microscope">
        <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

function ObjectGlyph() {
  return (
    <g>
      <line x1="0" y1="0" x2="0" y2="34" stroke="#6f9c5a" strokeWidth="2.4" />
      <g>
        <ellipse cx="0" cy="-2" rx="12" ry="7" fill="#f4b860" transform="rotate(0)" />
        <ellipse cx="0" cy="-2" rx="12" ry="7" fill="#f0894f" opacity="0.85" transform="rotate(60)" />
        <ellipse cx="0" cy="-2" rx="12" ry="7" fill="#f4b860" opacity="0.9" transform="rotate(120)" />
        <circle cx="0" cy="-2" r="4.4" fill="#ffe9b8" />
      </g>
    </g>
  );
}

function EyeGlyph({ x, y, strain }: { x: number; y: number; strain: number }) {
  const browTilt = -6 - strain * 14;
  return (
    <g transform={`translate(${x} ${y})`}>
      {strain > 0.15 &&
        [0, 1, 2].map((i) => (
          <line
            key={i}
            x1={18 + i * 7}
            y1={-30 - i * 3}
            x2={26 + i * 7}
            y2={-40 - i * 3}
            stroke="rgba(255,110,110,0.55)"
            strokeWidth="2"
            strokeLinecap="round"
            opacity={Math.min(1, strain * 1.4)}
          />
        ))}
      <path
        d="M -70 0 Q -20 -34 60 0 Q -20 34 -70 0 Z"
        fill="#12202c"
        stroke="rgba(163,190,216,0.4)"
        strokeWidth="1.5"
      />
      <circle cx="-10" cy="0" r="15" fill="#8fb8cc" />
      <circle cx="-6" cy="0" r="9" fill="#0a0e14" />
      <circle cx="-3" cy="-3" r="2.4" fill="#dfe9f2" />
      <path
        d="M -70 -6 Q -20 -34 60 -6"
        fill="none"
        stroke="#3a4756"
        strokeWidth="4"
        strokeLinecap="round"
        transform={`rotate(${browTilt} -20 -34)`}
        opacity="0.85"
      />
      <text x="-10" y="56" textAnchor="middle" className="p4-eye-label">
        eye
      </text>
    </g>
  );
}
