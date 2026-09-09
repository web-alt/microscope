import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import HorizontalTrack from "../components/HorizontalTrack";
import "./Page6.css";

// SVG Canvas dimensions
const VB_W = 860;
const VB_H = 380;

// Optical axis / text line Y position
const AXIS_Y = 180;

// Text parameters
const TEXT_STR = "ABC123";
const TEXT_X = 430; // Center of ABC123 in SVG
const TEXT_Y = AXIS_Y + 18; // Text baseline

// Lens parameters
const LENS_R = 72; // Radius of magnifying lens
const MAG_FACTOR = 1.85; // Magnification factor

// Horizontal movement boundaries for lens center
const X_MIN = 220;
const X_MAX = 640;
const X_SPAN = X_MAX - X_MIN;

export default function Page6() {
  // Interaction 1: "converging" ↔ "convex" toggle
  const [lensTerm, setLensTerm] = useState<"converging" | "convex">("converging");

  // Lens horizontal position (normalized 0..1)
  const [pos, setPos] = useState(0.5);

  // Current pixel X coordinate of lens center
  const lensX = X_MIN + pos * X_SPAN;
  const lensY = AXIS_Y;

  // Handle manual scrub from HorizontalTrack
  const handleScrub = useCallback((newPos: number) => {
    setPos(Math.max(0, Math.min(1, newPos)));
  }, []);

  // Handle interactive word toggle
  const toggleLensTerm = () => {
    setLensTerm((prev) => (prev === "converging" ? "convex" : "converging"));
  };

  return (
    <div className="p6-scene">
      {/* Header */}
      <div className="p6-header">
        <span className="eyebrow">Optical Instruments &middot; Simple Microscope</span>
        <h1 className="p6-heading">Simple Microscope</h1>
      </div>

      {/* Main Content Layout */}
      <div className="p6-body">
        {/* Left Column: Interactive Magnifying Glass Visual */}
        <div className="p6-visual-column">
          <div className="p6-visual glass-panel">
            <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="p6-svg" aria-label="Magnifying glass sliding across text ABC123">
              <defs>
                {/* Metallic rim gradient */}
                <linearGradient id="p6-rim-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ffd8a8" />
                  <stop offset="35%" stopColor="#ffb46b" />
                  <stop offset="70%" stopColor="#9e6630" />
                  <stop offset="100%" stopColor="#ffd8a8" />
                </linearGradient>

                {/* Handle grip gradient */}
                <linearGradient id="p6-handle-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#1a2533" />
                  <stop offset="50%" stopColor="#0b1118" />
                  <stop offset="100%" stopColor="#1e2c3d" />
                </linearGradient>

                {/* Handle collar metallic accent */}
                <linearGradient id="p6-brass-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#d4934b" />
                  <stop offset="50%" stopColor="#ffd49f" />
                  <stop offset="100%" stopColor="#a8682a" />
                </linearGradient>

                {/* Lens glass subtle radial tint */}
                <radialGradient id="p6-glass-tint" cx="45%" cy="40%" r="65%">
                  <stop offset="0%" stopColor="rgba(95, 210, 232, 0.12)" />
                  <stop offset="60%" stopColor="rgba(95, 210, 232, 0.03)" />
                  <stop offset="100%" stopColor="rgba(0, 0, 0, 0.45)" />
                </radialGradient>

                {/* Clip Path: Strictly circular lens window */}
                <clipPath id="p6-lens-clip">
                  <circle cx={lensX} cy={lensY} r={LENS_R - 1} />
                </clipPath>

                {/* Subtle glow filter */}
                <filter id="p6-rim-shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="rgba(0,0,0,0.65)" />
                </filter>
              </defs>

              {/* Background optical reference axis */}
              <line
                x1="80"
                y1={AXIS_Y}
                x2={VB_W - 80}
                y2={AXIS_Y}
                stroke="var(--hairline-strong)"
                strokeWidth="1.2"
                strokeDasharray="6 8"
                opacity="0.4"
              />

              {/* Reference boundary markers */}
              <line x1={X_MIN} y1={AXIS_Y - 50} x2={X_MIN} y2={AXIS_Y + 50} stroke="var(--hairline)" strokeWidth="1" strokeDasharray="3 4" />
              <line x1={X_MAX} y1={AXIS_Y - 50} x2={X_MAX} y2={AXIS_Y + 50} stroke="var(--hairline)" strokeWidth="1" strokeDasharray="3 4" />

              {/* 1. LAYER 1: UNMAGNIFIED BASE TEXT (Always normal size) */}
              <g className="p6-base-text-group">
                <text
                  x={TEXT_X}
                  y={TEXT_Y}
                  textAnchor="middle"
                  className="p6-base-text"
                >
                  {TEXT_STR}
                </text>
              </g>

              {/* 2. LAYER 2: MAGNIFIED TEXT LAYER (Clipped inside circular lens) */}
              <g clipPath="url(#p6-lens-clip)">
                {/* Lens glass backdrop: occludes the underlying base text */}
                <circle
                  cx={lensX}
                  cy={lensY}
                  r={LENS_R}
                  fill="#0c121a"
                />
                <circle
                  cx={lensX}
                  cy={lensY}
                  r={LENS_R}
                  fill="url(#p6-glass-tint)"
                />

                {/* Enlarged text centered at the current lens position */}
                <g transform={`translate(${lensX} ${lensY}) scale(${MAG_FACTOR}) translate(${-lensX} ${-lensY})`}>
                  <text
                    x={TEXT_X}
                    y={TEXT_Y}
                    textAnchor="middle"
                    className="p6-magnified-text"
                  >
                    {TEXT_STR}
                  </text>
                </g>

                {/* Inner glass curvature vignette */}
                <circle
                  cx={lensX}
                  cy={lensY}
                  r={LENS_R - 2}
                  fill="none"
                  stroke="rgba(95, 210, 232, 0.18)"
                  strokeWidth="3"
                />

                {/* Specular glare arc on lens surface */}
                <path
                  d={`M ${lensX - LENS_R * 0.65} ${lensY - LENS_R * 0.45} A ${LENS_R * 0.78} ${LENS_R * 0.78} 0 0 1 ${lensX + LENS_R * 0.45} ${lensY - LENS_R * 0.65}`}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.45)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </g>

              {/* 3. LAYER 3: MAGNIFYING GLASS FRAME & HANDLE (Sits visually above text) */}
              <g transform={`translate(${lensX} ${lensY})`} filter="url(#p6-rim-shadow)">
                {/* Handle angled at 42 degrees down-right */}
                <g transform="rotate(42)">
                  {/* Brass connector / neck */}
                  <rect
                    x={-5}
                    y={LENS_R + 1}
                    width={10}
                    height={16}
                    rx={2}
                    fill="url(#p6-brass-grad)"
                    stroke="rgba(0,0,0,0.5)"
                    strokeWidth="0.8"
                  />
                  {/* Outer collar rim */}
                  <line
                    x1={-7}
                    y1={LENS_R + 9}
                    x2={7}
                    y2={LENS_R + 9}
                    stroke="#ffd8a8"
                    strokeWidth="1.5"
                  />
                  {/* Main grip */}
                  <path
                    d={`M -7 ${LENS_R + 17} L -8 ${LENS_R + 120} Q -8 ${LENS_R + 128} 0 ${LENS_R + 128} Q 8 ${LENS_R + 128} 8 ${LENS_R + 120} L 7 ${LENS_R + 17} Z`}
                    fill="url(#p6-handle-grad)"
                    stroke="rgba(255, 180, 107, 0.4)"
                    strokeWidth="1.2"
                  />
                  {/* Grip ribbed accents */}
                  <line x1={-6} y1={LENS_R + 45} x2={6} y2={LENS_R + 45} stroke="rgba(255, 180, 107, 0.25)" strokeWidth="1" />
                  <line x1={-6} y1={LENS_R + 65} x2={6} y2={LENS_R + 65} stroke="rgba(255, 180, 107, 0.25)" strokeWidth="1" />
                  <line x1={-6} y1={LENS_R + 85} x2={6} y2={LENS_R + 85} stroke="rgba(255, 180, 107, 0.25)" strokeWidth="1" />
                  {/* End cap */}
                  <circle cx={0} cy={LENS_R + 124} r={3} fill="url(#p6-brass-grad)" />
                </g>

                {/* Primary metallic bezel */}
                <circle
                  cx={0}
                  cy={0}
                  r={LENS_R + 2}
                  fill="none"
                  stroke="url(#p6-rim-grad)"
                  strokeWidth="5"
                />

                {/* Inner bevel ring */}
                <circle
                  cx={0}
                  cy={0}
                  r={LENS_R - 1}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.35)"
                  strokeWidth="1"
                />

                {/* Outer hairline ring */}
                <circle
                  cx={0}
                  cy={0}
                  r={LENS_R + 5}
                  fill="none"
                  stroke="rgba(255, 180, 107, 0.3)"
                  strokeWidth="0.8"
                />
              </g>

              {/* Label readouts inside SVG */}
              <text x="32" y="36" className="p6-svg-tag">
                MAGNIFICATION VISUALIZATION
              </text>
              <text x={VB_W - 32} y="36" textAnchor="end" className="p6-svg-mag-tag">
                M &asymp; 1.85&times;
              </text>
            </svg>
          </div>

          {/* Interactive Horizontal Scrubber */}
          <div className="p6-controls glass-panel">
            <div className="p6-controls-top">
              <span className="p6-control-title">Horizontal lens traverse</span>
            </div>
            <HorizontalTrack
              value={pos}
              onChange={handleScrub}
              leftLabel="A B C"
              rightLabel="1 2 3"
              ariaLabel="Slide magnifying glass horizontally across text"
              accent="var(--ray)"
              markers={[
                { at: 0.15, label: "A" },
                { at: 0.35, label: "B" },
                { at: 0.5, label: "C" },
                { at: 0.65, label: "1" },
                { at: 0.85, label: "2" },
              ]}
            />
          </div>
        </div>

        {/* Right Column: Educational Text & Interactive Word */}
        <div className="p6-side">
          {/* Main DOCX Definition Card */}
          <div className="p6-card glass-panel">
            <div className="p6-card-header">
              <span className="p6-card-badge">Magnifying Glass</span>
            </div>

            <p className="p6-prose">
              It is also known as <strong>magnifying glass</strong> or simply <strong>magnifier</strong> and consists of a{" "}
              {/* Interaction 1: "converging" ↔ "convex" interactive word */}
              <button
                type="button"
                className="p6-interactive-word focus-visible-ring"
                onClick={toggleLensTerm}
                title={`Click to switch to "${lensTerm === "converging" ? "convex" : "converging"}"`}
                aria-label={`Current term is ${lensTerm}. Click to change to ${lensTerm === "converging" ? "convex" : "converging"}.`}
              >
                <span className="p6-word-slot">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={lensTerm}
                      className="p6-word-text"
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -3 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {lensTerm}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <span className="p6-word-icon" aria-hidden="true">
                  &harr;
                </span>
              </button>{" "}
              lens with object between its focus and optical centre and eye close to it.
            </p>
          </div>

          {/* Key Operating Conditions Card */}
          <div className="p6-conditions-card glass-panel">
            <span className="p6-conditions-heading">Key Operating Conditions</span>
            <div className="p6-conditions-list">
              <div className="p6-condition-item">
                <span className="p6-cond-bullet" />
                <div className="p6-cond-content">
                  <strong>Lens Type:</strong> Converging (biconvex) lens of small focal length.
                </div>
              </div>
              <div className="p6-condition-item">
                <span className="p6-cond-bullet" />
                <div className="p6-cond-content">
                  <strong>Object Position:</strong> Placed between Principal Focus (F₁) and Optical Centre (O).
                </div>
              </div>
              <div className="p6-condition-item">
                <span className="p6-cond-bullet" />
                <div className="p6-cond-content">
                  <strong>Image Formed:</strong> Virtual, erect, and magnified on the same side.
                </div>
              </div>
              <div className="p6-condition-item">
                <span className="p6-cond-bullet" />
                <div className="p6-cond-content">
                  <strong>Observer:</strong> Eye is held close to the lens for maximum visual angle.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
