import { useState, useEffect, useMemo, useRef, useCallback, useLayoutEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { type DerivationStep, DerivationStepper, HorizontalTrack, TreeBranch, opticalTree, springT, measureHLine } from "../components/components";
// ═══════════════════════════════════════════════════════════════════════════
// pages.tsx — All page components merged into one file
// ═══════════════════════════════════════════════════════════════════════════

// ──────────────────────────── MicroscopeIntroScene ────────────────────────────────

interface Props {
  page: 1 | 2;
  onAdvance: () => void;
  onGoVisualAngle: () => void;
}

export function MicroscopeIntroScene({ page, onAdvance, onGoVisualAngle }: Props) {
  const focused = page === 2;
  const microscopeNode = opticalTree.children!.find((c) => c.key === "microscope")!;
  const otherBranches = opticalTree.children!.filter((c) => c.key !== "microscope");

  /* â”€â”€ horizontal connector measurement for the top-level branch row â”€â”€ */
  const topChildrenRef = useRef<HTMLDivElement>(null);
  const [hLine, setHLine] = useState<{ left: number; width: number } | null>(null);

  const measure = useCallback(() => {
    setHLine(measureHLine(topChildrenRef.current));
  }, []);

  useLayoutEffect(() => {
    if (focused) return;
    measure();
    if (!topChildrenRef.current) return;
    const ro = new ResizeObserver(measure);
    ro.observe(topChildrenRef.current);
    return () => ro.disconnect();
  }, [measure, focused]);

  return (
    <div className="intro-scene">
      <motion.div className="intro-scene-header" layout transition={springT}>
        <span className="eyebrow">Optical Instruments &middot; Class 12 Physics</span>
        <div className="intro-title-stack">
          <AnimatePresence initial={false}>
            {!focused ? (
              <motion.h1
                key="t1"
                className="intro-title"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                Optical Instruments
              </motion.h1>
            ) : (
              <motion.h1
                key="t2"
                className="intro-title"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="intro-title-sub">Optical Instruments</span>
                <em>Simple Microscope</em>
              </motion.h1>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {!focused && (
            <motion.div
              className="intro-def"
              initial={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
              style={{ overflow: "hidden" }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <p>
                <strong>Definition â€”</strong> optical instruments are used
                primarily to assist the eye in viewing an object.
              </p>
              <p className="intro-def-sub">
                Depending upon the use, optical instruments can be
                categorised in the following way:
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className={"tree-stage" + (focused ? " tree-stage--focused" : "")}>
        <motion.div layout className="branch" transition={springT}>
          <AnimatePresence>
            {!focused && (
              <motion.div
                layout
                className="branch-node branch-node--root"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.9, height: 0, padding: 0, border: "none", overflow: "hidden" }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                {opticalTree.label}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            ref={topChildrenRef}
            layout
            className="branch-children branch-children--top"
            transition={springT}
            onLayoutAnimationComplete={measure}
          >
            <AnimatePresence>
              {!focused && hLine && (
                <motion.span
                  key="h-line"
                  className="branch-h-line"
                  style={{ left: hLine.left, width: hLine.width }}
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {!focused &&
                otherBranches.map((b) => (
                  <motion.div
                    key={b.key}
                    className="branch-child-slot"
                    initial={{ opacity: 1 }}
                    exit={{
                      opacity: 0,
                      scale: 0.85,
                      filter: "blur(4px)",
                      width: 0,
                      paddingLeft: 0,
                      paddingRight: 0,
                      overflow: "hidden",
                    }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <TreeBranch node={b} dim />
                  </motion.div>
                ))}
            </AnimatePresence>

            <motion.div
              layout
              className={
                "branch-child-slot branch-child-slot--microscope" +
                (!focused ? " branch-child-slot--clickable" : "")
              }
              transition={springT}
              onClick={() => !focused && onAdvance()}
              role={!focused ? "button" : undefined}
              tabIndex={!focused ? 0 : -1}
              onKeyDown={(e) => {
                if (!focused && (e.key === "Enter" || e.key === " ")) onAdvance();
              }}
              aria-label={!focused ? "Focus on Microscope" : undefined}
            >
              <TreeBranch node={microscopeNode} emphasize />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      <AnimatePresence>
        {focused && (
          <motion.div
            className="microscope-copy"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.55, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="microscope-copy-label">Microscope</span>
            <p>
              It is an optical instrument used to increase the{" "}
              <button className="visual-angle-trigger" onClick={onGoVisualAngle}>
                visual angle
              </button>{" "}
              of near objects which are too small to be seen by the naked eye.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {!focused && (
        <motion.div
          className="advance-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.35, 0.75, 0.35] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          select microscope, or continue &rarr;
        </motion.div>
      )}
    </div>
  );
}


// ──────────────────────────── TitleSlide ────────────────────────────────

export function TitleSlide() {
  // Silky smooth mouse parallax for ambient optical caustics
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 18;
      const y = (e.clientY / innerHeight - 0.5) * 18;
      setOffset({ x, y });
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <main className="title-slide">
      {/* â”€â”€ Atmospheric Optical Glass & Ray Caustics â”€â”€ */}
      <div
        className="title-slide__ambient"
        aria-hidden="true"
        style={{
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
        }}
      >
        <div className="title-slide__bloom title-slide__bloom--amber" />
        <div className="title-slide__bloom title-slide__bloom--cyan" />

        {/* Minimalist SVG Precision Optical Elements */}
        <svg
          className="title-slide__ambient-svg"
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="lensCaustic" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5fd2e8" stopOpacity="0" />
              <stop offset="30%" stopColor="#5fd2e8" stopOpacity="0.18" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#ffb46b" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#5fd2e8" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="lightRayGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ffb46b" stopOpacity="0" />
              <stop offset="50%" stopColor="#ffb46b" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#5fd2e8" stopOpacity="0.45" />
            </linearGradient>

            <radialGradient id="focusGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffb46b" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#ffb46b" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Faint precision reticle ring (whisper quiet, 6% opacity) */}
          <circle
            cx="600"
            cy="400"
            r="280"
            fill="none"
            stroke="#5fd2e8"
            strokeWidth="0.8"
            strokeDasharray="4 16"
            opacity="0.08"
          />
          <circle
            cx="600"
            cy="400"
            r="160"
            fill="none"
            stroke="#ffb46b"
            strokeWidth="0.6"
            opacity="0.06"
          />

          {/* Horizontal Optical Axis */}
          <line
            x1="100"
            y1="400"
            x2="1100"
            y2="400"
            stroke="#5fd2e8"
            strokeWidth="0.75"
            strokeDasharray="8 10"
            opacity="0.18"
          />

          {/* Elegant biconvex lens silhouette */}
          <path
            d="M 600 160 C 640 240 640 560 600 640 C 560 560 560 240 600 160 Z"
            fill="url(#lensCaustic)"
            opacity="0.22"
          />
          <line
            x1="600"
            y1="160"
            x2="600"
            y2="640"
            stroke="url(#lensCaustic)"
            strokeWidth="1.2"
            opacity="0.7"
          />

          {/* Slender refracted rays meeting at optical center / focus */}
          <line
            x1="180"
            y1="320"
            x2="600"
            y2="400"
            stroke="url(#lightRayGrad)"
            strokeWidth="1.2"
            opacity="0.38"
          />
          <line
            x1="180"
            y1="480"
            x2="600"
            y2="400"
            stroke="url(#lightRayGrad)"
            strokeWidth="1.2"
            opacity="0.38"
          />
          <line
            x1="600"
            y1="400"
            x2="1020"
            y2="400"
            stroke="#ffb46b"
            strokeWidth="1.5"
            opacity="0.32"
          />

          {/* Soft focal point bloom */}
          <circle cx="600" cy="400" r="22" fill="url(#focusGlow)" />
          <circle cx="600" cy="400" r="2.5" fill="#ffffff" opacity="0.8" />
        </svg>
      </div>

      <motion.div
        className="title-slide__container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Refined Eyebrow */}
        <div className="title-slide__eyebrow-wrap">
          <span className="title-slide__eyebrow-dot" />
          <span className="title-slide__eyebrow">
            Class 12 Physics &middot; Ray Optics
          </span>
        </div>

        {/* Prestigious Main Title */}
        <h1 className="title-slide__title">
          <span className="title-slide__heading-top">Optical Instruments:</span>
          <em className="title-slide__heading-main">Simple Microscope</em>
        </h1>

        {/* Authors attribution with balancing subtle rule to the right */}
        <div className="title-slide__authors-wrap">
          <div className="title-slide__authors-rule" aria-hidden="true" />
          <p className="title-slide__authors">
            <span className="title-slide__dash">-</span>
            <span className="title-slide__author">Shree Kumaran</span>
            <span className="title-slide__amp">&amp;</span>
            <span className="title-slide__author">Sanjay Krishna</span>
          </p>
        </div>
      </motion.div>
    </main>
  );
}


// ──────────────────────────── Page3 ────────────────────────────────

const PAGE3_VB_W = 800;
const PAGE3_VB_H = 480;
const VANISH = { x: 400, y: 66 };
const BASE_Y = 452;
const ROAD_TOP_HALF = 22;
const ROAD_BOTTOM_HALF = 340;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function Page3() {
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
          <svg viewBox={`0 0 ${PAGE3_VB_W} ${PAGE3_VB_H}`} className="p3-svg" aria-hidden="true">
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

            <rect x="0" y="0" width={PAGE3_VB_W} height={PAGE3_VB_H} fill="url(#p3-sky)" />
            <rect x="0" y="0" width={PAGE3_VB_W} height={VANISH.y + 40} fill="url(#p3-glow)" />

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
            <line x1="0" y1={VANISH.y} x2={PAGE3_VB_W} y2={VANISH.y} stroke="var(--hairline)" strokeWidth="1" />

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


// ──────────────────────────── Page4 ────────────────────────────────

const PAGE4_VB_W = 800;
const PAGE4_VB_H = 420;
const PAGE4_EYE_X = 640;
const PAGE4_EYE_Y = 210;
const PAGE4_NEAR_POINT = 0.62;

export function Page4({ onBack }: { onBack: () => void }) {
  const [t, setT] = useState(0.06);

  const objX = lerp(120, PAGE4_EYE_X - 150, t);
  const scale = lerp(0.55, 1.85, Math.pow(t, 0.85));
  const blurPast = Math.max(0, (t - PAGE4_NEAR_POINT) / (1 - PAGE4_NEAR_POINT));
  const blurStd = blurPast * 5.5;
  const ghostOffset = blurPast * 15;
  const ghostOpacity = blurPast * 0.62;
  const strain = Math.max(0, (t - PAGE4_NEAR_POINT - 0.08) / 0.3);

  const clarity =
    t < PAGE4_NEAR_POINT ? "sharpening" : blurPast > 0.55 ? "strained" : "blurring";

  return (
    <div className="p4-scene">
      <div className="p4-header">
        <span className="eyebrow">The unaided eye</span>
        <h1 className="p4-heading">Then why do we use optical instruments?</h1>
      </div>

      <div className="p4-body">
        <div className="p4-visual glass-panel">
          <svg viewBox={`0 0 ${PAGE4_VB_W} ${PAGE4_VB_H}`} className="p4-svg">
            <defs>
              <filter id="p4-blur">
                <feGaussianBlur stdDeviation={blurStd} />
              </filter>
              <linearGradient id="p4-bg" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0a0f16" />
                <stop offset="100%" stopColor="#0d1520" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width={PAGE4_VB_W} height={PAGE4_VB_H} fill="url(#p4-bg)" />

            {/* optical axis */}
            <line
              x1="90"
              y1={PAGE4_EYE_Y}
              x2={PAGE4_EYE_X - 60}
              y2={PAGE4_EYE_Y}
              stroke="rgba(255,180,107,0.3)"
              strokeWidth="1.5"
              strokeDasharray="8 10"
            />

            {/* ghost (doubled) image */}
            {ghostOpacity > 0.01 && (
              <g
                transform={`translate(${objX + ghostOffset} ${PAGE4_EYE_Y - ghostOffset * 0.35}) scale(${scale})`}
                opacity={ghostOpacity}
                filter="url(#p4-blur)"
              >
                <ObjectGlyph />
              </g>
            )}

            {/* main object */}
            <g
              transform={`translate(${objX} ${PAGE4_EYE_Y}) scale(${scale})`}
              filter={blurStd > 0.05 ? "url(#p4-blur)" : undefined}
            >
              <ObjectGlyph />
            </g>

            {/* eye, side profile */}
            <EyeGlyph x={PAGE4_EYE_X} y={PAGE4_EYE_Y} strain={strain} />
          </svg>

          <motion.div
            className="p4-state-chip"
            animate={{ opacity: 1 }}
            key={clarity}
            initial={{ opacity: 0, y: -4 }}
          >
            {clarity === "sharpening" && "Coming into focus"}
            {clarity === "blurring" && "Past the eye's limit â€” blurring"}
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
              markers={[{ at: PAGE4_NEAR_POINT, label: "limit" }]}
            />
          </div>
          <p className="p4-caption">
            Bringing the object closer helps â€” up to a point. Push past the
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


// ──────────────────────────── Page5 ────────────────────────────────

const PAGE5_VB_W = 920;
const PAGE5_VB_H = 480;
const PAGE5_EYE_X = 760;
const PAGE5_EYE_Y = 300;
const FAR_X = 150;
const NEAR_X = 655;
const PAGE5_OBJ_H = 150;
const PAGE5_NEAR_POINT = 0.82;
const ARC_R = 58;


export function Page5() {
  const [t, setT] = useState(0.1);
  const [defRevealed, setDefRevealed] = useState(false);

  const objX = lerp(FAR_X, NEAR_X, t);
  const topX = objX;
  const topY = PAGE5_EYE_Y - PAGE5_OBJ_H;
  const distancePx = PAGE5_EYE_X - objX;

  const thetaDeg = useMemo(
    () => (Math.atan(PAGE5_OBJ_H / distancePx) * 180) / Math.PI,
    [distancePx]
  );

  const distanceUnits = useMemo(() => lerp(25, 2.2, t), [t]);

  const blurPast = Math.max(0, (t - PAGE5_NEAR_POINT) / (1 - PAGE5_NEAR_POINT));
  const blurStd = blurPast * 5;
  const ghostDx = blurPast * 12;
  const ghostOpacity = blurPast * 0.6;

  /* definition is revealed only by the manual arrow button */

  const angleTop = Math.atan2(topY - PAGE5_EYE_Y, topX - PAGE5_EYE_X);
  const arcStart = { x: PAGE5_EYE_X + ARC_R * Math.cos(Math.PI), y: PAGE5_EYE_Y + ARC_R * Math.sin(Math.PI) };
  const arcEnd = { x: PAGE5_EYE_X + ARC_R * Math.cos(angleTop), y: PAGE5_EYE_Y + ARC_R * Math.sin(angleTop) };

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
          <svg viewBox={`0 0 ${PAGE5_VB_W} ${PAGE5_VB_H}`} className="p5-svg">
            <defs>
              <filter id="p5-blur">
                <feGaussianBlur stdDeviation={blurStd} />
              </filter>
            </defs>

            {/* optical axis */}
            <line
              x1={FAR_X - 40}
              y1={PAGE5_EYE_Y}
              x2={PAGE5_EYE_X - 40}
              y2={PAGE5_EYE_Y}
              stroke="var(--hairline-strong)"
              strokeWidth="1.5"
            />

            {/* distance dimension line */}
            <g className="p5-dim">
              <line x1={objX} y1={PAGE5_EYE_Y + 46} x2={PAGE5_EYE_X - 34} y2={PAGE5_EYE_Y + 46} stroke="var(--axis)" strokeWidth="1.2" />
              <line x1={objX} y1={PAGE5_EYE_Y + 38} x2={objX} y2={PAGE5_EYE_Y + 54} stroke="var(--axis)" strokeWidth="1.2" />
              <line x1={PAGE5_EYE_X - 34} y1={PAGE5_EYE_Y + 38} x2={PAGE5_EYE_X - 34} y2={PAGE5_EYE_Y + 54} stroke="var(--axis)" strokeWidth="1.2" />
              <text
                x={(objX + PAGE5_EYE_X - 34) / 2}
                y={PAGE5_EYE_Y + 70}
                textAnchor="middle"
                className="p5-svg-label p5-svg-label--axis"
              >
                distance
              </text>
            </g>

            {/* ho height marker */}
            <g className="p5-dim">
              <line x1={objX - 26} y1={PAGE5_EYE_Y} x2={objX - 26} y2={topY} stroke="var(--ray)" strokeWidth="1.2" />
              <line x1={objX - 34} y1={PAGE5_EYE_Y} x2={objX - 18} y2={PAGE5_EYE_Y} stroke="var(--ray)" strokeWidth="1.2" />
              <line x1={objX - 34} y1={topY} x2={objX - 18} y2={topY} stroke="var(--ray)" strokeWidth="1.2" />
              <text x={objX - 42} y={(PAGE5_EYE_Y + topY) / 2 + 4} textAnchor="middle" className="p5-svg-label">
                h&#8320;
              </text>
            </g>

            {/* rays */}
            <line x1={objX} y1={PAGE5_EYE_Y} x2={PAGE5_EYE_X} y2={PAGE5_EYE_Y} stroke="rgba(163,190,216,0.5)" strokeWidth="1.4" />
            <line x1={topX} y1={topY} x2={PAGE5_EYE_X} y2={PAGE5_EYE_Y} stroke="var(--ink-0)" strokeWidth="1.6" />
            <line x1={objX} y1={PAGE5_EYE_Y} x2={topX} y2={topY} stroke="rgba(163,190,216,0.35)" strokeWidth="1.2" strokeDasharray="3 5" />

            {/* angle arc */}
            <path
              d={`M ${arcStart.x} ${arcStart.y} A ${ARC_R} ${ARC_R} 0 0 0 ${arcEnd.x} ${arcEnd.y}`}
              fill="none"
              stroke="var(--ray)"
              strokeWidth="1.6"
            />
            <text
              x={PAGE5_EYE_X - ARC_R * 1.42}
              y={PAGE5_EYE_Y - 12}
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
                  y2={PAGE5_EYE_Y}
                  stroke="var(--ink-1)"
                  strokeWidth="3"
                />
                <ArrowObject x={topX + ghostDx} baseY={PAGE5_EYE_Y} topY={topY} />
              </g>
            )}

            {/* object arrow */}
            <g filter={blurStd > 0.05 ? "url(#p5-blur)" : undefined}>
              <ArrowObject x={topX} baseY={PAGE5_EYE_Y} topY={topY} />
            </g>

            {/* viewer */}
            <ViewerGlyph x={PAGE5_EYE_X} y={PAGE5_EYE_Y} strain={blurPast} />
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
              markers={[{ at: PAGE5_NEAR_POINT, label: "limit" }]}
            />
          </div>

          <p className="p5-caption">
            As the object slides toward the viewer, the same height h&#8320;
            spans a wider angle &theta; at the eye â€” the visual angle grows,
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


// ──────────────────────────── Page6 ────────────────────────────────

// SVG Canvas dimensions
const PAGE6_VB_W = 860;
const PAGE6_VB_H = 380;

// Optical axis / text line Y position
const PAGE6_AXIS_Y = 180;

// Text parameters
const TEXT_STR = "ABC123";
const TEXT_X = 430; // Center of ABC123 in SVG
const TEXT_Y = PAGE6_AXIS_Y + 18; // Text baseline

// Lens parameters
const LENS_R = 72; // Radius of magnifying lens
const MAG_FACTOR = 1.85; // Magnification factor

// Horizontal movement boundaries for lens center
const X_MIN = 220;
const X_MAX = 640;
const X_SPAN = X_MAX - X_MIN;

export function Page6() {
  // Interaction 1: "converging" â†” "convex" toggle
  const [lensTerm, setLensTerm] = useState<"converging" | "convex">("converging");

  // Lens horizontal position (normalized 0..1)
  const [pos, setPos] = useState(0.5);

  // Current pixel X coordinate of lens center
  const lensX = X_MIN + pos * X_SPAN;
  const lensY = PAGE6_AXIS_Y;

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
            <svg viewBox={`0 0 ${PAGE6_VB_W} ${PAGE6_VB_H}`} className="p6-svg" aria-label="Magnifying glass sliding across text ABC123">
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
                y1={PAGE6_AXIS_Y}
                x2={PAGE6_VB_W - 80}
                y2={PAGE6_AXIS_Y}
                stroke="var(--hairline-strong)"
                strokeWidth="1.2"
                strokeDasharray="6 8"
                opacity="0.4"
              />

              {/* Reference boundary markers */}
              <line x1={X_MIN} y1={PAGE6_AXIS_Y - 50} x2={X_MIN} y2={PAGE6_AXIS_Y + 50} stroke="var(--hairline)" strokeWidth="1" strokeDasharray="3 4" />
              <line x1={X_MAX} y1={PAGE6_AXIS_Y - 50} x2={X_MAX} y2={PAGE6_AXIS_Y + 50} stroke="var(--hairline)" strokeWidth="1" strokeDasharray="3 4" />

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
              <text x={PAGE6_VB_W - 32} y="36" textAnchor="end" className="p6-svg-mag-tag">
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
              {/* Interaction 1: "converging" â†” "convex" interactive word */}
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
                  <strong>Object Position:</strong> Placed between Principal Focus (Fâ‚) and Optical Centre (O).
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


// ──────────────────────────── Page7 ────────────────────────────────

interface ConvexCase {
  id: number;
  caseNum: string;
  objectPos: React.ReactNode;
  imagePos: React.ReactNode;
  imageSize: string;
  imageNature: string;
  isMicroscopeCase?: boolean;
}

const CASES: ConvexCase[] = [
  {
    id: 1,
    caseNum: "Case 1",
    objectPos: "At infinity",
    imagePos: (
      <>
        At focus F<sub>2</sub>
      </>
    ),
    imageSize: "Highly diminished, point-sized",
    imageNature: "Real and inverted",
  },
  {
    id: 2,
    caseNum: "Case 2",
    objectPos: (
      <>
        Beyond 2F<sub>1</sub>
      </>
    ),
    imagePos: (
      <>
        Between F<sub>2</sub> and 2F<sub>2</sub>
      </>
    ),
    imageSize: "Diminished",
    imageNature: "Real and inverted",
  },
  {
    id: 3,
    caseNum: "Case 3",
    objectPos: (
      <>
        At 2F<sub>1</sub>
      </>
    ),
    imagePos: (
      <>
        At 2F<sub>2</sub>
      </>
    ),
    imageSize: "Same size",
    imageNature: "Real and inverted",
  },
  {
    id: 4,
    caseNum: "Case 4",
    objectPos: (
      <>
        Between F<sub>1</sub> and 2F<sub>1</sub>
      </>
    ),
    imagePos: (
      <>
        Beyond 2F<sub>2</sub>
      </>
    ),
    imageSize: "Enlarged",
    imageNature: "Real and inverted",
  },
  {
    id: 5,
    caseNum: "Case 5",
    objectPos: (
      <>
        At focus F<sub>1</sub>
      </>
    ),
    imagePos: "At infinity",
    imageSize: "Infinitely large or highly enlarged",
    imageNature: "Real and inverted",
  },
  {
    id: 6,
    caseNum: "Case 6",
    objectPos: (
      <>
        Between focus F<sub>1</sub> and optical centre O
      </>
    ),
    imagePos: "On the same side of the lens as the object",
    imageSize: "Enlarged",
    imageNature: "Virtual and erect",
    isMicroscopeCase: true,
  },
];

export function Page7() {
  return (
    <div className="p7-scene">
      {/* Header */}
      <div className="p7-header">
        <span className="eyebrow">Ray Optics Reference &middot; Convex Lens</span>
        <h1 className="p7-heading">Different cases of a convex lens</h1>
      </div>

      {/* Main Table Container */}
      <motion.div
        className="p7-table-card glass-panel"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="p7-table-wrapper">
          <table className="p7-table" aria-label="Different cases of image formation by a convex lens">
            <thead>
              <tr className="p7-thead-row">
                <th scope="col" className="p7-th p7-th--case">
                  Case
                </th>
                <th scope="col" className="p7-th p7-th--obj">
                  Position of object
                </th>
                <th scope="col" className="p7-th p7-th--img">
                  Position of image
                </th>
                <th scope="col" className="p7-th p7-th--size">
                  Relative size of image
                </th>
                <th scope="col" className="p7-th p7-th--nature">
                  Nature of image
                </th>
              </tr>
            </thead>
            <tbody>
              {CASES.map((c, index) => {
                const isFinal = c.isMicroscopeCase;
                return (
                  <motion.tr
                    key={c.id}
                    className={"p7-row" + (isFinal ? " p7-row--final" : "")}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={
                      isFinal
                        ? {
                            duration: 0.5,
                            delay: 0.25,
                            ease: [0.22, 1, 0.36, 1],
                          }
                        : {
                            duration: 0.35,
                            delay: 0.05 * index,
                            ease: [0.22, 1, 0.36, 1],
                          }
                    }
                  >
                    <td className="p7-td p7-td--case">
                      <span className="p7-case-badge">{c.caseNum}</span>
                      {isFinal && (
                        <motion.span
                          className="p7-microscope-tag"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.35, delay: 0.35 }}
                        >
                          Simple Microscope
                        </motion.span>
                      )}
                    </td>
                    <td className="p7-td p7-td--obj">
                      <span className="p7-cell-content">{c.objectPos}</span>
                    </td>
                    <td className="p7-td p7-td--img">
                      <span className="p7-cell-content">{c.imagePos}</span>
                    </td>
                    <td className="p7-td p7-td--size">
                      <span className={"p7-cell-content" + (isFinal ? " p7-cell--enlarged" : "")}>
                        {c.imageSize}
                      </span>
                    </td>
                    <td className="p7-td p7-td--nature">
                      <span className={"p7-nature-pill" + (isFinal ? " p7-nature-pill--virtual" : "")}>
                        {c.imageNature}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Seminar Key Takeaway Note */}
        <motion.div
          className="p7-takeaway"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.4 }}
        >
          <div className="p7-takeaway-indicator" />
          <p className="p7-takeaway-text">
            In Cases 1&ndash;5, a convex lens always forms a{" "}
            <em>real and inverted</em> image. Only <strong>Case 6</strong> (object between focus Fâ‚ and optical centre O)
            produces an <strong>enlarged, virtual and erect</strong> image &mdash; forming the foundational principle of the{" "}
            <strong>Simple Microscope</strong>.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}


// ──────────────────────────── Page8 ────────────────────────────────

// SVG coordinate constants for Left Diagram (Simple Microscope)
const L_W = 620;
const L_H = 320;
const PAGE8_O_X = 330; // Optical centre X
const PAGE8_AXIS_Y = 160; // Principal axis Y
const PAGE8_F_LEN = 135; // Focal length in px
const PAGE8_F1_X = PAGE8_O_X - PAGE8_F_LEN; // Left focus F1 = 195
const PAGE8_F2_X = PAGE8_O_X + PAGE8_F_LEN; // Right focus F2 = 465
const PAGE8_OBJ_H = 42; // Object height h_o in px

// SVG coordinate constants for Right Diagram (Naked Eye at D)
const R_W = 340;
const R_H = 320;
const R_EYE_X = 270;
const R_AXIS_Y = 210;
const D_DEFAULT = 200; // Distance D = 200px (representing 25 cm)

const MAGNIFICATION_STEPS: DerivationStep[] = [
  {
    title: "Define angular magnification",
    content: (
      <>
        <div className="p8-math-eq">
          m ={" "}
          <span className="p8-frac">
            <span className="p8-frac-top">Visual angle subtended by image on eye (Î²)</span>
            <span className="p8-frac-bottom">Visual angle subtended by object at D (Î±)</span>
          </span>
        </div>
        <div className="p8-math-eq p8-math-eq--highlight">
          m ={" "}
          <span className="p8-frac">
            <span className="p8-frac-top">Î²</span>
            <span className="p8-frac-bottom">Î±</span>
          </span>
        </div>
      </>
    ),
  },
  {
    title: "Use the small-angle approximation",
    content: (
      <>
        <div className="p8-math-line">
          tan Î² ={" "}
          <span className="p8-frac">
            <span className="p8-frac-top">h<sub>o</sub></span>
            <span className="p8-frac-bottom">âˆ’u</span>
          </span>{" "}
          â‡’ Î² â‰ˆ{" "}
          <span className="p8-frac">
            <span className="p8-frac-top">h<sub>o</sub></span>
            <span className="p8-frac-bottom">âˆ’u</span>
          </span>
        </div>
        <div className="p8-math-line">
          tan Î± ={" "}
          <span className="p8-frac">
            <span className="p8-frac-top">h<sub>o</sub></span>
            <span className="p8-frac-bottom">âˆ’D</span>
          </span>{" "}
          â‡’ Î± â‰ˆ{" "}
          <span className="p8-frac">
            <span className="p8-frac-top">h<sub>o</sub></span>
            <span className="p8-frac-bottom">âˆ’D</span>
          </span>
        </div>
      </>
    ),
  },
  {
    title: "Divide the two visual angles",
    content: (
      <div className="p8-math-eq">
        m ={" "}
        <span className="p8-frac">
          <span className="p8-frac-top">Î²</span>
          <span className="p8-frac-bottom">Î±</span>
        </span>{" "}
        ={" "}
        <span className="p8-frac">
          <span className="p8-frac-top">(h<sub>o</sub> / u)</span>
          <span className="p8-frac-bottom">(h<sub>o</sub> / D)</span>
        </span>
      </div>
    ),
  },
  {
    title: "Angular magnification formula",
    content: (
      <div className="p8-math-result">
        m ={" "}
        <span className="p8-frac">
          <span className="p8-frac-top">D</span>
          <span className="p8-frac-bottom">u</span>
        </span>
      </div>
    ),
  },
];


export function Page8() {
  // Left Diagram: Normalized object position strictly between F and O
  // 0 = close to F, 1 = close to O
  const [tObj, setTObj] = useState(0.5);

  // Right Diagram: Interactive distance d for naked eye (default D = 200px)
  const [rDist, setRDist] = useState(D_DEFAULT);

  // Calculate object distance u (px from optical centre O)
  // Bounds: min 0.22*PAGE8_F_LEN (close to O) to max 0.86*PAGE8_F_LEN (close to F)
  const u = lerp(PAGE8_F_LEN * 0.86, PAGE8_F_LEN * 0.24, tObj);
  const objX = PAGE8_O_X - u;

  // Lens formula: 1/v - 1/(-u) = 1/f  =>  v = -(u*f) / (f - u)
  const denom = Math.max(8, PAGE8_F_LEN - u);
  const mag = PAGE8_F_LEN / denom;
  const vDist = mag * u;

  // Image position and height
  const rawImgX = PAGE8_O_X - vDist;
  const imgX = Math.max(35, rawImgX); // clamp visual arrow inside SVG
  const imgH = Math.min(130, mag * PAGE8_OBJ_H);

  // Ray 1: Parallel to axis, refracts through F2 (right focus)
  const r1Slope = PAGE8_OBJ_H / PAGE8_F_LEN;
  const r1EndX = 560;
  const r1EndY = PAGE8_AXIS_Y - PAGE8_OBJ_H + r1Slope * (r1EndX - PAGE8_O_X);

  // Ray 2: Straight through optical centre O without deviation
  const r2Slope = PAGE8_OBJ_H / u;
  const r2EndX = 560;
  const r2EndY = PAGE8_AXIS_Y + r2Slope * (r2EndX - PAGE8_O_X);

  // Angle beta (visual angle with instrument) in degrees
  const betaDeg = (Math.atan(PAGE8_OBJ_H / u) * 180) / Math.PI;

  // Right diagram object X
  const rObjX = R_EYE_X - rDist;
  // Angle alpha (visual angle of naked eye) in degrees
  const alphaDeg = (Math.atan(PAGE8_OBJ_H / rDist) * 180) / Math.PI;

  // Horizontal dragging along principal axis for left diagram
  const svgLeftRef = useRef<SVGSVGElement>(null);
  const [dragLeft, setDragLeft] = useState(false);

  const handleLeftPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDragLeft(true);
  };
  const handleLeftPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragLeft || !svgLeftRef.current) return;
      const rect = svgLeftRef.current.getBoundingClientRect();
      const scaleX = L_W / rect.width;
      const clientSvgX = (e.clientX - rect.left) * scaleX;
      // Object is between PAGE8_F1_X (195) and PAGE8_O_X (330)
      const minX = PAGE8_F1_X + 18;
      const maxX = PAGE8_O_X - 25;
      const clampedX = Math.max(minX, Math.min(maxX, clientSvgX));
      const newU = PAGE8_O_X - clampedX;
      const newT = (PAGE8_F_LEN * 0.86 - newU) / (PAGE8_F_LEN * 0.86 - PAGE8_F_LEN * 0.24);
      setTObj(Math.max(0, Math.min(1, newT)));
    },
    [dragLeft]
  );
  const handleLeftPointerUp = () => setDragLeft(false);

  // Horizontal dragging along baseline for right diagram
  const svgRightRef = useRef<SVGSVGElement>(null);
  const [dragRight, setDragRight] = useState(false);

  const handleRightPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDragRight(true);
  };
  const handleRightPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRight || !svgRightRef.current) return;
      const rect = svgRightRef.current.getBoundingClientRect();
      const scaleX = R_W / rect.width;
      const clientSvgX = (e.clientX - rect.left) * scaleX;
      // Distance from eye: min 110px to max 230px
      const newDist = Math.max(110, Math.min(230, R_EYE_X - clientSvgX));
      setRDist(newDist);
    },
    [dragRight]
  );
  const handleRightPointerUp = () => setDragRight(false);

  return (
    <div className="p8-scene">
      {/* Header */}
      <div className="p8-header">
        <span className="eyebrow">Ray Optics Â· Working Principle</span>
        <h1 className="p8-heading">Working of a Simple Microscope by ray diagram :-</h1>
      </div>

      {/* Image Properties Highlight Box */}
      <div className="p8-props-bar glass-panel">
        <span className="p8-props-label">Image Properties:</span>
        <div className="p8-props-badges">
          <div className="p8-prop-badge p8-prop-badge--virtual">
            <span className="p8-prop-dot" />
            <strong>Virtual</strong>
            <span className="p8-prop-sub">(Formed on same side as object)</span>
          </div>
          <div className="p8-prop-badge p8-prop-badge--erect">
            <span className="p8-prop-dot" />
            <strong>Erect</strong>
            <span className="p8-prop-sub">(Upright orientation)</span>
          </div>
          <div className="p8-prop-badge p8-prop-badge--enlarged">
            <span className="p8-prop-dot" />
            <strong>Enlarged</strong>
            <span className="p8-prop-sub">
              (h<sub>i</sub> &gt; h<sub>o</sub>, magnified)
            </span>
          </div>
        </div>
      </div>

      {/* Two Ray Diagrams: Left (Simple Microscope) and Right (Naked Eye at D) */}
      <div className="p8-diagrams-grid">
        {/* LEFT DIAGRAM: Simple Microscope Ray Diagram */}
        <div className="p8-diag-card glass-panel">
          <div className="p8-diag-header">
            <span className="p8-diag-title">Simple Microscope (With Converging Lens)</span>
            <span className="p8-diag-tag">Angle Î² â‰ˆ {betaDeg.toFixed(1)}Â°</span>
          </div>

          <svg
            ref={svgLeftRef}
            viewBox={`0 0 ${L_W} ${L_H}`}
            className="p8-svg"
            onPointerMove={handleLeftPointerMove}
            onPointerUp={handleLeftPointerUp}
            onPointerCancel={handleLeftPointerUp}
            aria-label="Simple Microscope ray diagram"
          >
            <defs>
              <linearGradient id="p8-lens-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(95, 210, 232, 0.28)" />
                <stop offset="50%" stopColor="rgba(95, 210, 232, 0.08)" />
                <stop offset="100%" stopColor="rgba(95, 210, 232, 0.28)" />
              </linearGradient>

              <marker
                id="p8-arrow-ray"
                viewBox="0 0 10 10"
                refX="5"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--ray)" />
              </marker>
            </defs>

            {/* Principal Optical Axis */}
            <line
              x1="20"
              y1={PAGE8_AXIS_Y}
              x2={L_W - 20}
              y2={PAGE8_AXIS_Y}
              stroke="var(--hairline-strong)"
              strokeWidth="1.2"
            />

            {/* Convex Lens at Optical Centre O */}
            <path
              d={`M ${PAGE8_O_X} 50 Q ${PAGE8_O_X + 26} ${PAGE8_AXIS_Y} ${PAGE8_O_X} 270 Q ${PAGE8_O_X - 26} ${PAGE8_AXIS_Y} ${PAGE8_O_X} 50 Z`}
              fill="url(#p8-lens-grad)"
              stroke="var(--axis)"
              strokeWidth="1.6"
            />
            {/* Lens central vertical axis */}
            <line
              x1={PAGE8_O_X}
              y1="40"
              x2={PAGE8_O_X}
              y2="280"
              stroke="var(--hairline)"
              strokeWidth="1"
              strokeDasharray="3 4"
            />
            <circle cx={PAGE8_O_X} cy={PAGE8_AXIS_Y} r="3" fill="var(--ink-0)" />
            <text x={PAGE8_O_X + 6} y={PAGE8_AXIS_Y + 16} className="p8-svg-mono">
              O
            </text>

            {/* Focal Points F1 (left) and F2 (right) */}
            <circle cx={PAGE8_F1_X} cy={PAGE8_AXIS_Y} r="3" fill="var(--ray)" />
            <text x={PAGE8_F1_X} y={PAGE8_AXIS_Y + 16} textAnchor="middle" className="p8-svg-mono">
              F
            </text>
            <circle cx={PAGE8_F2_X} cy={PAGE8_AXIS_Y} r="3" fill="var(--ray)" />
            <text x={PAGE8_F2_X} y={PAGE8_AXIS_Y + 16} textAnchor="middle" className="p8-svg-mono">
              F
            </text>

            {/* Virtual Image Arrow (Dashed erect arrow h_i) */}
            <g className="p8-svg-image">
              <line
                x1={imgX}
                y1={PAGE8_AXIS_Y}
                x2={imgX}
                y2={PAGE8_AXIS_Y - imgH}
                stroke="var(--axis)"
                strokeWidth="2.4"
                strokeDasharray="5 4"
              />
              <polygon
                points={`${imgX - 6},${PAGE8_AXIS_Y - imgH + 10} ${imgX},${PAGE8_AXIS_Y - imgH} ${imgX + 6},${PAGE8_AXIS_Y - imgH + 10}`}
                fill="var(--axis)"
              />
              <text
                x={imgX - 10}
                y={PAGE8_AXIS_Y - imgH / 2}
                textAnchor="end"
                className="p8-svg-label p8-svg-label--axis"
              >
                h<tspan dy="4" fontSize="11">i</tspan>
              </text>
            </g>

            {/* Real Object Arrow (Solid erect arrow h_o) */}
            <g
              className="p8-svg-object"
              style={{ cursor: "ew-resize" }}
              onPointerDown={handleLeftPointerDown}
            >
              <line
                x1={objX}
                y1={PAGE8_AXIS_Y}
                x2={objX}
                y2={PAGE8_AXIS_Y - PAGE8_OBJ_H}
                stroke="var(--ink-0)"
                strokeWidth="2.8"
              />
              <polygon
                points={`${objX - 6},${PAGE8_AXIS_Y - PAGE8_OBJ_H + 10} ${objX},${PAGE8_AXIS_Y - PAGE8_OBJ_H} ${objX + 6},${PAGE8_AXIS_Y - PAGE8_OBJ_H + 10}`}
                fill="var(--ink-0)"
              />
              <text
                x={objX - 10}
                y={PAGE8_AXIS_Y - PAGE8_OBJ_H / 2 + 4}
                textAnchor="end"
                className="p8-svg-label"
              >
                h<tspan dy="4" fontSize="11">o</tspan>
              </text>
              <circle cx={objX} cy={PAGE8_AXIS_Y - PAGE8_OBJ_H} r="12" fill="transparent" />
            </g>

            {/* Dashed Virtual Extension 1 (From lens back to top of image) */}
            <line
              x1={PAGE8_O_X}
              y1={PAGE8_AXIS_Y - PAGE8_OBJ_H}
              x2={imgX}
              y2={PAGE8_AXIS_Y - imgH}
              stroke="rgba(255, 180, 107, 0.45)"
              strokeWidth="1.4"
              strokeDasharray="4 4"
            />

            {/* Dashed Virtual Extension 2 (Through O back to top of image) */}
            <line
              x1={objX}
              y1={PAGE8_AXIS_Y - PAGE8_OBJ_H}
              x2={imgX}
              y2={PAGE8_AXIS_Y - imgH}
              stroke="rgba(255, 180, 107, 0.45)"
              strokeWidth="1.4"
              strokeDasharray="4 4"
            />

            {/* Ray 1 Forward: Object -> Lens -> Focus F2 -> Eye */}
            <line
              x1={objX}
              y1={PAGE8_AXIS_Y - PAGE8_OBJ_H}
              x2={PAGE8_O_X}
              y2={PAGE8_AXIS_Y - PAGE8_OBJ_H}
              stroke="var(--ray)"
              strokeWidth="1.8"
            />
            <line
              x1={PAGE8_O_X}
              y1={PAGE8_AXIS_Y - PAGE8_OBJ_H}
              x2={r1EndX}
              y2={r1EndY}
              stroke="var(--ray)"
              strokeWidth="1.8"
              markerMid="url(#p8-arrow-ray)"
            />

            {/* Ray 2 Forward: Object -> O -> Eye */}
            <line
              x1={objX}
              y1={PAGE8_AXIS_Y - PAGE8_OBJ_H}
              x2={r2EndX}
              y2={r2EndY}
              stroke="var(--ray)"
              strokeWidth="1.8"
              markerMid="url(#p8-arrow-ray)"
            />

            {/* Angle Beta arc at Optical Centre O */}
            <path
              d={`M ${PAGE8_O_X - 28} ${PAGE8_AXIS_Y} A 28 28 0 0 1 ${
                PAGE8_O_X - 28 * Math.cos((betaDeg * Math.PI) / 180)
              } ${PAGE8_AXIS_Y - 28 * Math.sin((betaDeg * Math.PI) / 180)}`}
              fill="none"
              stroke="var(--ray)"
              strokeWidth="1.5"
            />
            <text x={PAGE8_O_X - 44} y={PAGE8_AXIS_Y - 8} className="p8-svg-angle">
              Î²
            </text>

            {/* Dimension Line for Object Distance u */}
            <g className="p8-dim-line">
              <line
                x1={objX}
                y1={PAGE8_AXIS_Y + 34}
                x2={PAGE8_O_X}
                y2={PAGE8_AXIS_Y + 34}
                stroke="var(--ray)"
                strokeWidth="1.2"
              />
              <line
                x1={objX}
                y1={PAGE8_AXIS_Y + 28}
                x2={objX}
                y2={PAGE8_AXIS_Y + 40}
                stroke="var(--ray)"
                strokeWidth="1.2"
              />
              <line
                x1={PAGE8_O_X}
                y1={PAGE8_AXIS_Y + 28}
                x2={PAGE8_O_X}
                y2={PAGE8_AXIS_Y + 40}
                stroke="var(--ray)"
                strokeWidth="1.2"
              />
              <text
                x={(objX + PAGE8_O_X) / 2}
                y={PAGE8_AXIS_Y + 48}
                textAnchor="middle"
                className="p8-svg-dim"
              >
                u
              </text>
            </g>

            {/* Dimension Line for Image Distance v */}
            <g className="p8-dim-line">
              <line
                x1={imgX}
                y1={PAGE8_AXIS_Y + 68}
                x2={PAGE8_O_X}
                y2={PAGE8_AXIS_Y + 68}
                stroke="var(--axis)"
                strokeWidth="1.2"
              />
              <line
                x1={imgX}
                y1={PAGE8_AXIS_Y + 62}
                x2={imgX}
                y2={PAGE8_AXIS_Y + 74}
                stroke="var(--axis)"
                strokeWidth="1.2"
              />
              <line
                x1={PAGE8_O_X}
                y1={PAGE8_AXIS_Y + 62}
                x2={PAGE8_O_X}
                y2={PAGE8_AXIS_Y + 74}
                stroke="var(--axis)"
                strokeWidth="1.2"
              />
              <text
                x={(imgX + PAGE8_O_X) / 2}
                y={PAGE8_AXIS_Y + 82}
                textAnchor="middle"
                className="p8-svg-dim p8-svg-dim--axis"
              >
                v
              </text>
            </g>

            {/* Eye / Observer on Right looking through lens */}
            <g transform="translate(490, 245)">
              <path
                d="M -20 0 Q 0 -13 20 0 Q 0 13 -20 0 Z"
                fill="#0d1520"
                stroke="var(--axis)"
                strokeWidth="1.5"
              />
              <circle cx="2" cy="0" r="5" fill="var(--axis)" />
              <circle cx="2" cy="0" r="2.5" fill="#000" />
              <line x1="-8" y1="-10" x2="-10" y2="-16" stroke="var(--axis)" strokeWidth="1.2" />
              <line x1="0" y1="-12" x2="0" y2="-18" stroke="var(--axis)" strokeWidth="1.2" />
              <line x1="8" y1="-10" x2="10" y2="-16" stroke="var(--axis)" strokeWidth="1.2" />
              <text x="0" y="24" textAnchor="middle" className="p8-svg-mono">
                Eye
              </text>
            </g>
          </svg>
        </div>

        {/* RIGHT DIAGRAM: Recreated Red-Inked Diagram from DOCX (Naked Eye at D) */}
        <div className="p8-diag-card p8-diag-card--red glass-panel">
          <div className="p8-diag-header">
            <span className="p8-diag-title">Naked Eye (Object Kept at D)</span>
            <div className="p8-diag-header-actions">
              {rDist !== D_DEFAULT && (
                <button
                  type="button"
                  className="p8-diag-reset-btn"
                  onClick={() => setRDist(D_DEFAULT)}
                  title="Reset object to Near Point D (25 cm)"
                >
                  Snap to D
                </button>
              )}
            </div>
          </div>

          <svg
            ref={svgRightRef}
            viewBox={`0 0 ${R_W} ${R_H}`}
            className="p8-svg p8-svg--red"
            onPointerMove={handleRightPointerMove}
            onPointerUp={handleRightPointerUp}
            onPointerCancel={handleRightPointerUp}
            aria-label="Naked eye viewing object at distance D diagram"
          >
            <defs>
              <marker
                id="p8-arrow-alpha"
                viewBox="0 0 10 10"
                refX="5"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--ray)" />
              </marker>
            </defs>

            {/* Baseline */}
            <line
              x1="15"
              y1={R_AXIS_Y}
              x2={R_W - 15}
              y2={R_AXIS_Y}
              stroke="var(--hairline-strong)"
              strokeWidth="1.2"
            />

            {/* Upright Red Arrow (Real Object h_o at distance d from eye) */}
            <g
              className="p8-svg-object"
              style={{ cursor: "ew-resize" }}
              onPointerDown={handleRightPointerDown}
            >
              <line
                x1={rObjX}
                y1={R_AXIS_Y}
                x2={rObjX}
                y2={R_AXIS_Y - PAGE8_OBJ_H}
                stroke="var(--ray)"
                strokeWidth="2.8"
              />
              <polygon
                points={`${rObjX - 6},${R_AXIS_Y - PAGE8_OBJ_H + 10} ${rObjX},${R_AXIS_Y - PAGE8_OBJ_H} ${rObjX + 6},${R_AXIS_Y - PAGE8_OBJ_H + 10}`}
                fill="var(--ray)"
              />
              <text
                x={rObjX - 10}
                y={R_AXIS_Y - PAGE8_OBJ_H / 2 + 4}
                textAnchor="end"
                className="p8-svg-label"
                fill="var(--ray)"
              >
                h<tspan dy="4" fontSize="11">o</tspan>
              </text>
              <circle cx={rObjX} cy={R_AXIS_Y - PAGE8_OBJ_H} r="12" fill="transparent" />
            </g>

            {/* Direct Line of Sight to Naked Eye */}
            <line
              x1={rObjX}
              y1={R_AXIS_Y - PAGE8_OBJ_H}
              x2={R_EYE_X}
              y2={R_AXIS_Y}
              stroke="var(--ray)"
              strokeWidth="1.8"
              markerMid="url(#p8-arrow-alpha)"
            />

            {/* Angle Alpha Arc */}
            <path
              d={`M ${R_EYE_X - 36} ${R_AXIS_Y} A 36 36 0 0 1 ${
                R_EYE_X - 36 * Math.cos((alphaDeg * Math.PI) / 180)
              } ${R_AXIS_Y - 36 * Math.sin((alphaDeg * Math.PI) / 180)}`}
              fill="none"
              stroke="var(--ray)"
              strokeWidth="1.6"
            />
            <text x={R_EYE_X - 52} y={R_AXIS_Y - 8} className="p8-svg-angle">
              Î±
            </text>

            {/* Dimension line for Distance D */}
            <g className="p8-dim-line">
              <line
                x1={rObjX}
                y1={R_AXIS_Y + 32}
                x2={R_EYE_X}
                y2={R_AXIS_Y + 32}
                stroke="var(--ray)"
                strokeWidth="1.2"
              />
              <line
                x1={rObjX}
                y1={R_AXIS_Y + 26}
                x2={rObjX}
                y2={R_AXIS_Y + 38}
                stroke="var(--ray)"
                strokeWidth="1.2"
              />
              <line
                x1={R_EYE_X}
                y1={R_AXIS_Y + 26}
                x2={R_EYE_X}
                y2={R_AXIS_Y + 38}
                stroke="var(--ray)"
                strokeWidth="1.2"
              />
              <text
                x={(rObjX + R_EYE_X) / 2}
                y={R_AXIS_Y + 48}
                textAnchor="middle"
                className="p8-svg-dim"
              >
                {rDist === D_DEFAULT
                  ? "D (25 cm)"
                  : `d = ${(((rDist / D_DEFAULT) * 25)).toFixed(1)} cm`}
              </text>
            </g>

            {/* Naked Eye */}
            <g transform={`translate(${R_EYE_X}, ${R_AXIS_Y})`}>
              <path
                d="M -22 0 Q 0 -15 22 0 Q 0 15 -22 0 Z"
                fill="#0d1520"
                stroke="var(--ray)"
                strokeWidth="1.5"
              />
              <circle cx="2" cy="0" r="6" fill="var(--ray)" />
              <circle cx="2" cy="0" r="3" fill="#000" />
              <text x="32" y="4" className="p8-svg-mono">
                eye
              </text>
            </g>
          </svg>
        </div>
      </div>

      {/* Interactive Object Position Slider: Constrained ONLY between F and O */}
      <div className="p8-controls glass-panel">
        <div className="p8-controls-header">
          <span className="p8-controls-title">
            Interactive Object Position (Constrained Strictly Between F and O)
          </span>
          <span className="p8-controls-val">
            u = {(((u / D_DEFAULT) * 25)).toFixed(1)} cm &nbsp;Â·&nbsp; Magnification M â‰ˆ{" "}
            {mag.toFixed(2)}Ã—
          </span>
        </div>
        <HorizontalTrack
          value={tObj}
          onChange={setTObj}
          leftLabel="Near Focus F (u â†’ f)"
          rightLabel="Near Optical Centre O (u â†’ 0)"
          ariaLabel="Move object strictly along horizontal optical axis between F and O"
          accent="var(--ray)"
          markers={[
            { at: 0.05, label: "F" },
            { at: 0.5, label: "Midway" },
            { at: 0.95, label: "O" },
          ]}
        />
      </div>

      <DerivationStepper className="p8-derivation" steps={MAGNIFICATION_STEPS} />
    </div>
  );
}


// ──────────────────────────── Page9 ────────────────────────────────

// SVG parameters for Case 1 Near-Point Visual Diagram
const PAGE9_VB_W = 680;
const PAGE9_VB_H = 290;
const PAGE9_O_X = 390; // Lens optical centre X
const PAGE9_AXIS_Y = 150; // Principal axis Y
const PAGE9_F_LEN = 110;
const D_DIST = 290; // Near point distance D px (v = -D)
const D_X = PAGE9_O_X - D_DIST; // Near point X = 100
const U_DIST = (D_DIST * PAGE9_F_LEN) / (D_DIST + PAGE9_F_LEN); // u = Df / (D + f) approx 79.75px
const OBJ_X = PAGE9_O_X - U_DIST; // Object X approx 310.25
const PAGE9_OBJ_H = 36; // Object height
const IMG_H = (D_DIST / U_DIST) * PAGE9_OBJ_H; // Image height approx 130px

const CASE_ONE_STEPS: DerivationStep[] = [
  {
    title: "Start with the lens formula",
    content: <div className="p9-step-formula"><span className="p9-frac"><span className="p9-frac-top">1</span><span className="p9-frac-bottom">v</span></span> âˆ’ <span className="p9-frac"><span className="p9-frac-top">1</span><span className="p9-frac-bottom">u</span></span> = <span className="p9-frac"><span className="p9-frac-top">1</span><span className="p9-frac-bottom">f</span></span></div>,
  },
  {
    title: "Apply the sign convention",
    content: <div className="p9-tags-row"><span className="p9-code-pill">v = âˆ’D</span><span className="p9-code-pill">object distance = âˆ’u</span><span className="p9-code-pill">f = +f</span></div>,
  },
  {
    title: "Substitute the near-point condition",
    content: <><div className="p9-step-formula"><span className="p9-frac"><span className="p9-frac-top">1</span><span className="p9-frac-bottom">âˆ’D</span></span> âˆ’ <span className="p9-frac"><span className="p9-frac-top">1</span><span className="p9-frac-bottom">âˆ’u</span></span> = <span className="p9-frac"><span className="p9-frac-top">1</span><span className="p9-frac-bottom">f</span></span></div><div className="p9-step-subformula">â‡’ <span className="p9-frac"><span className="p9-frac-top">1</span><span className="p9-frac-bottom">u</span></span> = <span className="p9-frac"><span className="p9-frac-top">1</span><span className="p9-frac-bottom">f</span></span> + <span className="p9-frac"><span className="p9-frac-top">1</span><span className="p9-frac-bottom">D</span></span></div></>,
  },
  {
    title: "Express the ratio D / u",
    content: <div className="p9-step-formula"><span className="p9-frac"><span className="p9-frac-top">D</span><span className="p9-frac-bottom">u</span></span> = 1 + <span className="p9-frac"><span className="p9-frac-top">D</span><span className="p9-frac-bottom">f</span></span></div>,
  },
  {
    title: "Maximum angular magnification",
    content: <div className="p9-result-box"><div className="p9-result-meta"><span className="p9-result-badge">Final result</span><span className="p9-result-note">Since m = D / u</span></div><div className="p9-result-equation">m<sub className="p9-sub-max">max</sub> = 1 + <span className="p9-frac"><span className="p9-frac-top">D</span><span className="p9-frac-bottom">f</span></span></div><p className="p9-result-desc">The image forms at the least distance of distinct vision, D â‰ˆ 25 cm.</p></div>,
  },
];

export function Page9() {
  const betaDeg = (Math.atan(IMG_H / D_DIST) * 180) / Math.PI;

  return (
    <div className="p9-scene">
      {/* Header */}
      <div className="p9-header">
        <span className="eyebrow">Ray Optics Â· Derivation</span>
        <h1 className="p9-heading">Angular Magnification</h1>
      </div>

      {/* Top Banner: Concise Definition & General Formula */}
      <div className="p9-summary-bar glass-panel">
        <div className="p9-summary-def">
          <div className="p9-summary-badge-row">
            <span className="p9-badge p9-badge--amber">Definition</span>
            <span className="p9-badge p9-badge--cyan">Optical Ratio</span>
          </div>
          <p className="p9-summary-text">
            The ratio of the angle subtended at the eye by the image formed by an optical instrument to that
            subtended at the eye by the object when not viewed through the instrument (kept at least distance of distinct vision D).
          </p>
        </div>

        <div className="p9-summary-math-grid">
          <div className="p9-minibox">
            <span className="p9-minibox-label">Angle Ratio</span>
            <div className="p9-minibox-math">
              m = <span className="p9-frac"><span className="p9-frac-top">Î²</span><span className="p9-frac-bottom">Î±</span></span>
            </div>
          </div>
          <div className="p9-minibox">
            <span className="p9-minibox-label">Small Angles</span>
            <div className="p9-minibox-math">
              Î² â‰ˆ <span className="p9-frac"><span className="p9-frac-top">h<sub>o</sub></span><span className="p9-frac-bottom">-u</span></span>, Î± â‰ˆ <span className="p9-frac"><span className="p9-frac-top">h<sub>o</sub></span><span className="p9-frac-bottom">-D</span></span>
            </div>
          </div>
          <div className="p9-minibox p9-minibox--accent">
            <span className="p9-minibox-label">General Formula</span>
            <div className="p9-minibox-math p9-minibox-math--lg">
              m = <span className="p9-frac"><span className="p9-frac-top">D</span><span className="p9-frac-bottom">u</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Section: CASE 1 â€” Image Formed at the Near Point */}
      <div className="p9-case-wrapper glass-panel">
        <div className="p9-case-header">
          <div className="p9-case-badge-group">
            <span className="p9-case-tag">Special Case 1</span>
            <span className="p9-case-condition">v = -D &nbsp;Â·&nbsp; Maximum Angular Magnification</span>
          </div>
          <h2 className="p9-case-title">Case 1: Image Formed at the Near Point</h2>
        </div>

        <div className="p9-case-body">
          {/* Left Column: Case 1 Vector SVG Diagram */}
          <div className="p9-diagram-col glass-panel">
            <div className="p9-diagram-caption">
              <span>Visual Diagram with Visual Angle Î² (Image at Near Point D)</span>
              <span className="p9-diag-val">Î² â‰ˆ {betaDeg.toFixed(1)}Â°</span>
            </div>

            <svg viewBox={`0 0 ${PAGE9_VB_W} ${PAGE9_VB_H}`} className="p9-svg" aria-label="Visual diagram for maximum angular magnification at near point">
              <defs>
                <linearGradient id="p9-lens-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="rgba(95, 210, 232, 0.28)" />
                  <stop offset="50%" stopColor="rgba(95, 210, 232, 0.08)" />
                  <stop offset="100%" stopColor="rgba(95, 210, 232, 0.28)" />
                </linearGradient>
                <marker id="p9-ray-arr" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--ray)" />
                </marker>
              </defs>

              {/* Principal Axis */}
              <line x1="20" y1={PAGE9_AXIS_Y} x2={PAGE9_VB_W - 20} y2={PAGE9_AXIS_Y} stroke="var(--hairline-strong)" strokeWidth="1.2" />

              {/* Convex Lens */}
              <path
                d={`M ${PAGE9_O_X} 35 Q ${PAGE9_O_X + 22} ${PAGE9_AXIS_Y} ${PAGE9_O_X} 265 Q ${PAGE9_O_X - 22} ${PAGE9_AXIS_Y} ${PAGE9_O_X} 35 Z`}
                fill="url(#p9-lens-grad)"
                stroke="var(--axis)"
                strokeWidth="1.6"
              />
              <line x1={PAGE9_O_X} y1="25" x2={PAGE9_O_X} y2={275} stroke="var(--hairline)" strokeWidth="1" strokeDasharray="3 4" />
              <circle cx={PAGE9_O_X} cy={PAGE9_AXIS_Y} r="3" fill="var(--ink-0)" />
              <text x={PAGE9_O_X + 6} y={PAGE9_AXIS_Y + 16} className="p9-mono">O</text>

              {/* Focus points */}
              <circle cx={PAGE9_O_X - PAGE9_F_LEN} cy={PAGE9_AXIS_Y} r="3" fill="var(--ray)" />
              <text x={PAGE9_O_X - PAGE9_F_LEN} y={PAGE9_AXIS_Y + 16} textAnchor="middle" className="p9-mono">F</text>
              <circle cx={PAGE9_O_X + PAGE9_F_LEN} cy={PAGE9_AXIS_Y} r="3" fill="var(--ray)" />
              <text x={PAGE9_O_X + PAGE9_F_LEN} y={PAGE9_AXIS_Y + 16} textAnchor="middle" className="p9-mono">F</text>

              {/* Near-point Virtual Image at D */}
              <g>
                <line
                  x1={D_X}
                  y1={PAGE9_AXIS_Y}
                  x2={D_X}
                  y2={PAGE9_AXIS_Y - IMG_H}
                  stroke="var(--axis)"
                  strokeWidth="2.4"
                  strokeDasharray="5 4"
                />
                <polygon
                  points={`${D_X - 6},${PAGE9_AXIS_Y - IMG_H + 10} ${D_X},${PAGE9_AXIS_Y - IMG_H} ${D_X + 6},${PAGE9_AXIS_Y - IMG_H + 10}`}
                  fill="var(--axis)"
                />
                <text x={D_X - 10} y={PAGE9_AXIS_Y - IMG_H / 2} textAnchor="end" className="p9-label" fill="var(--axis)">
                  Image at D
                </text>
              </g>

              {/* Object at u */}
              <g>
                <line
                  x1={OBJ_X}
                  y1={PAGE9_AXIS_Y}
                  x2={OBJ_X}
                  y2={PAGE9_AXIS_Y - PAGE9_OBJ_H}
                  stroke="var(--ink-0)"
                  strokeWidth="2.8"
                />
                <polygon
                  points={`${OBJ_X - 5},${PAGE9_AXIS_Y - PAGE9_OBJ_H + 8} ${OBJ_X},${PAGE9_AXIS_Y - PAGE9_OBJ_H} ${OBJ_X + 5},${PAGE9_AXIS_Y - PAGE9_OBJ_H + 8}`}
                  fill="var(--ink-0)"
                />
                <text x={OBJ_X - 8} y={PAGE9_AXIS_Y - PAGE9_OBJ_H / 2 + 4} textAnchor="end" className="p9-label">
                  h<tspan dy="4" fontSize="10">o</tspan>
                </text>
              </g>

              {/* Dashed Virtual Extensions back to top of Image */}
              <line x1={PAGE9_O_X} y1={PAGE9_AXIS_Y - PAGE9_OBJ_H} x2={D_X} y2={PAGE9_AXIS_Y - IMG_H} stroke="rgba(255, 180, 107, 0.45)" strokeWidth="1.4" strokeDasharray="4 4" />
              <line x1={OBJ_X} y1={PAGE9_AXIS_Y - PAGE9_OBJ_H} x2={D_X} y2={PAGE9_AXIS_Y - IMG_H} stroke="rgba(255, 180, 107, 0.45)" strokeWidth="1.4" strokeDasharray="4 4" />

              {/* Forward Rays */}
              <line x1={OBJ_X} y1={PAGE9_AXIS_Y - PAGE9_OBJ_H} x2={PAGE9_O_X} y2={PAGE9_AXIS_Y - PAGE9_OBJ_H} stroke="var(--ray)" strokeWidth="1.8" />
              <line x1={PAGE9_O_X} y1={PAGE9_AXIS_Y - PAGE9_OBJ_H} x2={600} y2={PAGE9_AXIS_Y - PAGE9_OBJ_H + (PAGE9_OBJ_H / PAGE9_F_LEN) * (600 - PAGE9_O_X)} stroke="var(--ray)" strokeWidth="1.8" markerMid="url(#p9-ray-arr)" />
              <line x1={OBJ_X} y1={PAGE9_AXIS_Y - PAGE9_OBJ_H} x2={600} y2={PAGE9_AXIS_Y + (PAGE9_OBJ_H / U_DIST) * (600 - PAGE9_O_X)} stroke="var(--ray)" strokeWidth="1.8" markerMid="url(#p9-ray-arr)" />

              {/* Angle Beta Arc */}
              <path
                d={`M ${PAGE9_O_X - 30} ${PAGE9_AXIS_Y} A 30 30 0 0 1 ${PAGE9_O_X - 30 * Math.cos(betaDeg * Math.PI / 180)} ${PAGE9_AXIS_Y - 30 * Math.sin(betaDeg * Math.PI / 180)}`}
                fill="none"
                stroke="var(--ray)"
                strokeWidth="1.5"
              />
              <text x={PAGE9_O_X - 44} y={PAGE9_AXIS_Y - 8} className="p9-angle">
                Î²
              </text>

              {/* Dimension u */}
              <g className="p9-dim">
                <line x1={OBJ_X} y1={PAGE9_AXIS_Y + 30} x2={PAGE9_O_X} y2={PAGE9_AXIS_Y + 30} stroke="var(--ray)" strokeWidth="1.2" />
                <line x1={OBJ_X} y1={PAGE9_AXIS_Y + 24} x2={OBJ_X} y2={PAGE9_AXIS_Y + 36} stroke="var(--ray)" strokeWidth="1.2" />
                <line x1={PAGE9_O_X} y1={PAGE9_AXIS_Y + 24} x2={PAGE9_O_X} y2={PAGE9_AXIS_Y + 36} stroke="var(--ray)" strokeWidth="1.2" />
                <text x={(OBJ_X + PAGE9_O_X) / 2} y={PAGE9_AXIS_Y + 44} textAnchor="middle" className="p9-dim-text">
                  u
                </text>
              </g>

              {/* Dimension v = -D */}
              <g className="p9-dim">
                <line x1={D_X} y1={PAGE9_AXIS_Y + 60} x2={PAGE9_O_X} y2={PAGE9_AXIS_Y + 60} stroke="var(--axis)" strokeWidth="1.2" />
                <line x1={D_X} y1={PAGE9_AXIS_Y + 54} x2={D_X} y2={PAGE9_AXIS_Y + 66} stroke="var(--axis)" strokeWidth="1.2" />
                <line x1={PAGE9_O_X} y1={PAGE9_AXIS_Y + 54} x2={PAGE9_O_X} y2={PAGE9_AXIS_Y + 66} stroke="var(--axis)" strokeWidth="1.2" />
                <text x={(D_X + PAGE9_O_X) / 2} y={PAGE9_AXIS_Y + 74} textAnchor="middle" className="p9-dim-text p9-dim-text--axis">
                  v = -D (Near Point)
                </text>
              </g>

              {/* Eye Glyph */}
              <g transform="translate(560, 215)">
                <path
                  d="M -18 0 Q 0 -12 18 0 Q 0 12 -18 0 Z"
                  fill="#0d1520"
                  stroke="var(--axis)"
                  strokeWidth="1.5"
                />
                <circle cx="2" cy="0" r="5" fill="var(--axis)" />
                <circle cx="2" cy="0" r="2.5" fill="#000" />
                <text x="0" y="22" textAnchor="middle" className="p9-mono">Eye</text>
              </g>
            </svg>
          </div>

        </div>
        <DerivationStepper className="p9-derivation" steps={CASE_ONE_STEPS} />
      </div>
    </div>
  );
}


// ──────────────────────────── Page10 ────────────────────────────────

// SVG coordinate constants for Case 2 (Image Formed at Infinity / Normal Adjustment)
const PAGE10_VB_W = 680;
const PAGE10_VB_H = 300;
const PAGE10_O_X = 370; // Lens optical centre X
const PAGE10_AXIS_Y = 150; // Principal axis Y
const PAGE10_F_LEN = 125; // Focal length in px
const PAGE10_F1_X = PAGE10_O_X - PAGE10_F_LEN; // Left focus F = 245 (where object is positioned, u = f)
const PAGE10_F2_X = PAGE10_O_X + PAGE10_F_LEN; // Right focus F = 495
const PAGE10_OBJ_H = 38; // Object height h_o in px

// Parallel ray slope = PAGE10_OBJ_H / PAGE10_F_LEN (u = f => parallel rays)
const raySlope = PAGE10_OBJ_H / PAGE10_F_LEN; // 38 / 125 = 0.304
const betaDeg = (Math.atan(raySlope) * 180) / Math.PI; // approx 16.9Â°

// Ray 1 forward: parallel to axis from object tip to lens (PAGE10_O_X), then refracts through F2
const r1EndX = 620;
const r1EndY = PAGE10_AXIS_Y - PAGE10_OBJ_H + raySlope * (r1EndX - PAGE10_O_X);

// Ray 2 forward: straight through optical centre O without deviation
const r2EndX = 620;
const r2EndY = PAGE10_AXIS_Y + raySlope * (r2EndX - PAGE10_O_X);

// Dashed backward virtual projections to infinity (parallel backwards)
const backEndX = 40;
const r1BackY = PAGE10_AXIS_Y - PAGE10_OBJ_H - raySlope * (PAGE10_O_X - backEndX);
const r2BackY = PAGE10_AXIS_Y - raySlope * (PAGE10_O_X - backEndX);

const CASE_TWO_STEPS: DerivationStep[] = [
  {
    title: "Start with the lens formula",
    content: <><div className="p10-step-formula"><span className="p10-frac"><span className="p10-frac-top">1</span><span className="p10-frac-bottom">v</span></span> âˆ’ <span className="p10-frac"><span className="p10-frac-top">1</span><span className="p10-frac-bottom">u</span></span> = <span className="p10-frac"><span className="p10-frac-top">1</span><span className="p10-frac-bottom">f</span></span></div><div className="p10-tags-row"><span className="p10-code-pill">v = âˆ’âˆž</span><span className="p10-code-pill">object distance = âˆ’u</span><span className="p10-code-pill">f = +f</span></div></>,
  },
  {
    title: "Use the image-at-infinity condition",
    content: <><div className="p10-step-formula"><span className="p10-frac"><span className="p10-frac-top">1</span><span className="p10-frac-bottom">âˆ’âˆž</span></span> âˆ’ <span className="p10-frac"><span className="p10-frac-top">1</span><span className="p10-frac-bottom">âˆ’u</span></span> = <span className="p10-frac"><span className="p10-frac-top">1</span><span className="p10-frac-bottom">f</span></span></div><div className="p10-step-subformula">Since 1/âˆž = 0, &nbsp; <strong>u = f</strong></div></>,
  },
  {
    title: "Substitute u = f into magnification",
    content: <><div className="p10-step-formula">m = <span className="p10-frac"><span className="p10-frac-top">D</span><span className="p10-frac-bottom">u</span></span> â‡’ <span className="p10-result-m-tag">m = <span className="p10-frac"><span className="p10-frac-top">D</span><span className="p10-frac-bottom">f</span></span></span></div><span className="p10-step-note">Minimum magnification for a relaxed eye</span></>,
  },
  {
    title: "Key takeaway",
    content: <div className="p10-limit-box"><div className="p10-limit-header"><span className="p10-limit-badge">Practical limit</span></div><p className="p10-limit-text">A simple microscope has a limited maximum magnification, m â‰¤ 9, for realistic focal lengths.</p></div>,
  },
];

export function Page10() {
  return (
    <div className="p10-scene">
      {/* Header */}
      <div className="p10-header">
        <span className="eyebrow">Ray Optics Â· Derivation Â· Case 2</span>
        <h1 className="p10-heading">Case 2: Image Formed at Infinity</h1>
      </div>

      {/* Top Banner: Normal Adjustment & Relaxed Eye Concept */}
      <div className="p10-summary-bar glass-panel">
        <div className="p10-summary-def">
          <div className="p10-summary-badge-row">
            <span className="p10-badge p10-badge--amber">Special Case 2</span>
            <span className="p10-badge p10-badge--cyan">Normal Adjustment</span>
            <span className="p10-badge p10-badge--violet">Relaxed Eye</span>
          </div>
          <p className="p10-summary-text">
            When the object is placed at the principal focus (<strong>u = f</strong>), the refracted rays emerge parallel
            and enter the eye with zero accommodation effort. The image is formed at infinity (<strong>v = âˆ’âˆž</strong>).
          </p>
        </div>

        <div className="p10-summary-math-grid">
          <div className="p10-minibox">
            <span className="p10-minibox-label">Object Position</span>
            <div className="p10-minibox-math p10-minibox-math--focus">
              u = f
            </div>
          </div>
          <div className="p10-minibox">
            <span className="p10-minibox-label">Image Distance</span>
            <div className="p10-minibox-math">
              v = âˆ’âˆž
            </div>
          </div>
          <div className="p10-minibox p10-minibox--accent">
            <span className="p10-minibox-label">Angular Magnification</span>
            <div className="p10-minibox-math p10-minibox-math--lg">
              m = <span className="p10-frac"><span className="p10-frac-top">D</span><span className="p10-frac-bottom">f</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Section: Optical Diagram on Left + Step-by-Step Derivation on Right */}
      <div className="p10-case-wrapper glass-panel">
        <div className="p10-case-header">
          <div className="p10-case-badge-group">
            <span className="p10-case-tag">Optical Ray Geometry</span>
            <span className="p10-case-condition">Emergent Parallel Beams Â· Relaxed Ciliary Muscles</span>
          </div>
          <h2 className="p10-case-title">Normal Adjustment Â· Relaxed Eye</h2>
        </div>

        <div className="p10-case-body">
          {/* Left Column: Dedicated Vector SVG Diagram */}
          <div className="p10-diagram-col glass-panel">
            <div className="p10-diagram-caption">
              <span>Ray Diagram for Minimum Angular Magnification (Image at âˆž)</span>
              <span className="p10-diag-val">Î² â‰ˆ {betaDeg.toFixed(1)}Â°</span>
            </div>

            <svg viewBox={`0 0 ${PAGE10_VB_W} ${PAGE10_VB_H}`} className="p10-svg" aria-label="Visual ray diagram for image formed at infinity with relaxed eye">
              <defs>
                <linearGradient id="p10-lens-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="rgba(95, 210, 232, 0.28)" />
                  <stop offset="50%" stopColor="rgba(95, 210, 232, 0.08)" />
                  <stop offset="100%" stopColor="rgba(95, 210, 232, 0.28)" />
                </linearGradient>
                <marker id="p10-ray-arr" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--ray)" />
                </marker>
              </defs>

              {/* Principal Axis */}
              <line x1="20" y1={PAGE10_AXIS_Y} x2={PAGE10_VB_W - 20} y2={PAGE10_AXIS_Y} stroke="var(--hairline-strong)" strokeWidth="1.2" />

              {/* Convex Lens at Optical Centre O */}
              <path
                d={`M ${PAGE10_O_X} 35 Q ${PAGE10_O_X + 22} ${PAGE10_AXIS_Y} ${PAGE10_O_X} 265 Q ${PAGE10_O_X - 22} ${PAGE10_AXIS_Y} ${PAGE10_O_X} 35 Z`}
                fill="url(#p10-lens-grad)"
                stroke="var(--axis)"
                strokeWidth="1.6"
              />
              <line x1={PAGE10_O_X} y1="25" x2={PAGE10_O_X} y2="275" stroke="var(--hairline)" strokeWidth="1" strokeDasharray="3 4" />
              <circle cx={PAGE10_O_X} cy={PAGE10_AXIS_Y} r="3" fill="var(--ink-0)" />
              <text x={PAGE10_O_X + 6} y={PAGE10_AXIS_Y + 16} className="p10-mono">O</text>

              {/* Left Principal Focus F (Object position u = f) */}
              <circle cx={PAGE10_F1_X} cy={PAGE10_AXIS_Y} r="3.5" fill="var(--ray)" />
              <text x={PAGE10_F1_X} y={PAGE10_AXIS_Y + 16} textAnchor="middle" className="p10-mono p10-mono--focus">F (u = f)</text>

              {/* Right Focus F */}
              <circle cx={PAGE10_F2_X} cy={PAGE10_AXIS_Y} r="3" fill="var(--ray)" />
              <text x={PAGE10_F2_X} y={PAGE10_AXIS_Y + 16} textAnchor="middle" className="p10-mono">F</text>

              {/* Real Object h_o Placed Exactly at Focus F */}
              <g>
                <line
                  x1={PAGE10_F1_X}
                  y1={PAGE10_AXIS_Y}
                  x2={PAGE10_F1_X}
                  y2={PAGE10_AXIS_Y - PAGE10_OBJ_H}
                  stroke="var(--ink-0)"
                  strokeWidth="2.8"
                />
                <polygon
                  points={`${PAGE10_F1_X - 5},${PAGE10_AXIS_Y - PAGE10_OBJ_H + 8} ${PAGE10_F1_X},${PAGE10_AXIS_Y - PAGE10_OBJ_H} ${PAGE10_F1_X + 5},${PAGE10_AXIS_Y - PAGE10_OBJ_H + 8}`}
                  fill="var(--ink-0)"
                />
                <text x={PAGE10_F1_X - 8} y={PAGE10_AXIS_Y - PAGE10_OBJ_H / 2 + 4} textAnchor="end" className="p10-label">
                  h<tspan dy="4" fontSize="10">o</tspan>
                </text>
              </g>

              {/* Dashed Parallel Backward Extensions to -Infinity */}
              <line
                x1={PAGE10_O_X}
                y1={PAGE10_AXIS_Y - PAGE10_OBJ_H}
                x2={backEndX}
                y2={r1BackY}
                stroke="rgba(255, 180, 107, 0.4)"
                strokeWidth="1.4"
                strokeDasharray="4 4"
              />
              <line
                x1={PAGE10_F1_X}
                y1={PAGE10_AXIS_Y - PAGE10_OBJ_H}
                x2={backEndX}
                y2={r2BackY}
                stroke="rgba(255, 180, 107, 0.4)"
                strokeWidth="1.4"
                strokeDasharray="4 4"
              />

              {/* Annotation badge indicating image at infinity */}
              <g transform="translate(30, 22)">
                <rect x="0" y="0" width="146" height="22" rx="6" fill="rgba(95, 210, 232, 0.1)" stroke="rgba(95, 210, 232, 0.3)" strokeWidth="1" />
                <text x="73" y="15" textAnchor="middle" className="p10-dim-text p10-dim-text--axis" fontWeight="600">
                  Image at âˆž (v = âˆ’âˆž)
                </text>
              </g>

              {/* Ray 1 Forward: Object tip -> Lens -> through right Focus F */}
              <line x1={PAGE10_F1_X} y1={PAGE10_AXIS_Y - PAGE10_OBJ_H} x2={PAGE10_O_X} y2={PAGE10_AXIS_Y - PAGE10_OBJ_H} stroke="var(--ray)" strokeWidth="1.8" />
              <line x1={PAGE10_O_X} y1={PAGE10_AXIS_Y - PAGE10_OBJ_H} x2={r1EndX} y2={r1EndY} stroke="var(--ray)" strokeWidth="1.8" markerMid="url(#p10-ray-arr)" />

              {/* Ray 2 Forward: Object tip straight through Optical Centre O */}
              <line x1={PAGE10_F1_X} y1={PAGE10_AXIS_Y - PAGE10_OBJ_H} x2={r2EndX} y2={r2EndY} stroke="var(--ray)" strokeWidth="1.8" markerMid="url(#p10-ray-arr)" />

              {/* Parallel Rays Indicator */}
              <text x={530} y={r1EndY - 12} className="p10-dim-text">
                Parallel rays (âˆ¥)
              </text>

              {/* Visual Angle Beta Arc at Optical Centre O */}
              <path
                d={`M ${PAGE10_O_X - 28} ${PAGE10_AXIS_Y} A 28 28 0 0 1 ${PAGE10_O_X - 28 * Math.cos(betaDeg * Math.PI / 180)} ${PAGE10_AXIS_Y - 28 * Math.sin(betaDeg * Math.PI / 180)}`}
                fill="none"
                stroke="var(--ray)"
                strokeWidth="1.5"
              />
              <text x={PAGE10_O_X - 42} y={PAGE10_AXIS_Y - 8} className="p10-angle">
                Î²
              </text>

              {/* Dimension line: Object Distance u = f */}
              <g className="p10-dim">
                <line x1={PAGE10_F1_X} y1={PAGE10_AXIS_Y + 34} x2={PAGE10_O_X} y2={PAGE10_AXIS_Y + 34} stroke="var(--ray)" strokeWidth="1.2" />
                <line x1={PAGE10_F1_X} y1={PAGE10_AXIS_Y + 28} x2={PAGE10_F1_X} y2={PAGE10_AXIS_Y + 40} stroke="var(--ray)" strokeWidth="1.2" />
                <line x1={PAGE10_O_X} y1={PAGE10_AXIS_Y + 28} x2={PAGE10_O_X} y2={PAGE10_AXIS_Y + 40} stroke="var(--ray)" strokeWidth="1.2" />
                <text x={(PAGE10_F1_X + PAGE10_O_X) / 2} y={PAGE10_AXIS_Y + 48} textAnchor="middle" className="p10-dim-text">
                  u = f
                </text>
              </g>

              {/* Dimension line: Focal Length f on right side */}
              <g className="p10-dim">
                <line x1={PAGE10_O_X} y1={PAGE10_AXIS_Y + 34} x2={PAGE10_F2_X} y2={PAGE10_AXIS_Y + 34} stroke="var(--axis)" strokeWidth="1.2" />
                <line x1={PAGE10_O_X} y1={PAGE10_AXIS_Y + 28} x2={PAGE10_O_X} y2={PAGE10_AXIS_Y + 40} stroke="var(--axis)" strokeWidth="1.2" />
                <line x1={PAGE10_F2_X} y1={PAGE10_AXIS_Y + 28} x2={PAGE10_F2_X} y2={PAGE10_AXIS_Y + 40} stroke="var(--axis)" strokeWidth="1.2" />
                <text x={(PAGE10_O_X + PAGE10_F2_X) / 2} y={PAGE10_AXIS_Y + 48} textAnchor="middle" className="p10-dim-text p10-dim-text--axis">
                  f
                </text>
              </g>

              {/* Relaxed Eye viewing parallel emerging beam */}
              <g transform="translate(565, 215)">
                <path
                  d="M -18 0 Q 0 -12 18 0 Q 0 12 -18 0 Z"
                  fill="#0d1520"
                  stroke="var(--axis)"
                  strokeWidth="1.5"
                />
                <circle cx="2" cy="0" r="5" fill="var(--axis)" />
                <circle cx="2" cy="0" r="2.5" fill="#000" />
                <text x="0" y="22" textAnchor="middle" className="p10-mono">Relaxed Eye</text>
              </g>
            </svg>
          </div>

        </div>
        <DerivationStepper className="p10-derivation" steps={CASE_TWO_STEPS} />
      </div>
    </div>
  );
}


// ──────────────────────────── Page11 ────────────────────────────────

export function Page11() {
  return (
    <div className="pq-scene">
      <div className="pq-header">
        <span className="eyebrow">Practice · Simple Microscope · Question 1</span>
        <h1 className="pq-heading">Magnifying Power at Near Point</h1>
      </div>

      <div className="pq-question-card glass-panel">
        <div className="pq-question-badge-row">
          <span className="pq-badge pq-badge--amber">Numerical</span>
          <span className="pq-badge pq-badge--cyan">Magnifying Power</span>
          <span className="pq-badge pq-badge--violet">Focal Length</span>
        </div>
        <p className="pq-question-text">
          A simple microscope has a magnifying power of <strong>3.0</strong> when the image is formed
          at the <strong>near point (25 cm)</strong> of a normal eye.
        </p>
        <ol className="pq-sub-list" type="a">
          <li>What is its <strong>focal length</strong>?</li>
          <li>What will be its <strong>magnifying power</strong> if the image is formed at <strong>infinity</strong>?</li>
        </ol>
      </div>

      <div className="pq-workspace glass-panel">
        <div className="pq-workspace-header">
          <span className="pq-workspace-label">Solution</span>
          <span className="pq-workspace-sub">D = 25 cm</span>
        </div>
        <div className="pq-part-row">
          <div className="pq-part-block">
            <span className="pq-part-tag">(a) Focal length</span>
            <div className="pq-blank-area" />
          </div>
          <div className="pq-part-block">
            <span className="pq-part-tag">(b) Magnifying power at ∞</span>
            <div className="pq-blank-area" />
          </div>
        </div>
      </div>
    </div>
  );
}


// ──────────────────────────── Page12 ────────────────────────────────

export function Page12() {
  return (
    <div className="pq-scene">
      <div className="pq-header">
        <span className="eyebrow">Practice · Simple Microscope · Question 2</span>
        <h1 className="pq-heading">Comparing Two Simple Microscopes</h1>
      </div>

      <div className="pq-question-card glass-panel">
        <div className="pq-question-badge-row">
          <span className="pq-badge pq-badge--amber">Numerical</span>
          <span className="pq-badge pq-badge--cyan">Lens Power</span>
          <span className="pq-badge pq-badge--violet">Magnifying Power</span>
        </div>
        <p className="pq-question-text">
          The magnifying power of a simple microscope <strong>A</strong> is <strong>1.25 less</strong> than
          that of a simple microscope <strong>B</strong>. If the power of the lens used in <strong>B</strong> is{" "}
          <strong>+25 D</strong>, find the power of the lens used in <strong>A</strong>.
        </p>
        <p className="pq-question-given">
          (Given that the least distance of distinct vision is 25 cm.)
        </p>
      </div>

      <div className="pq-workspace glass-panel">
        <div className="pq-workspace-header">
          <span className="pq-workspace-label">Solution</span>
          <span className="pq-workspace-sub">D = 25 cm</span>
        </div>
        <div className="pq-part-row pq-part-row--single">
          <div className="pq-part-block">
            <div className="pq-blank-area" />
          </div>
        </div>
      </div>
    </div>
  );
}
