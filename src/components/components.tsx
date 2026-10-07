import { useState, useEffect, useRef, useCallback, useLayoutEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
// ═══════════════════════════════════════════════════════════════════════════
// components.tsx — All components merged: LaserPen, NavBar, DerivationStepper,
//                  HorizontalTrack, TreeBranch, treeData
// ═══════════════════════════════════════════════════════════════════════════


/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

interface Point {
  x: number;
  y: number;
  t: number; // timestamp ms
}

interface Stroke {
  points: Point[];
  createdAt: number;
  finishedAt: number | null;
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Timing â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

const HOLD_MS = 350;       // fully visible after pointer lifts
const FADE_MS = 900;       // ease-out fade duration

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

interface LaserPenCanvasProps {
  enabled: boolean;
  /** Called when the last fading stroke finishes & canvas is removed */
  onAllFaded?: () => void;
}

export default function LaserPenCanvas({ enabled, onAllFaded }: LaserPenCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const drawingRef = useRef(false);
  const rafRef = useRef<number>(0);
  const mountedRef = useRef(true);

  /* â”€â”€ helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  /** Compute per-stroke opacity (0â€“1) based on current time */
  const strokeOpacity = useCallback((s: Stroke, now: number): number => {
    if (s.finishedAt === null) return 1;           // still being drawn
    const sinceFinish = now - s.finishedAt;
    if (sinceFinish < HOLD_MS) return 1;           // hold period
    const fadeProgress = (sinceFinish - HOLD_MS) / FADE_MS;
    if (fadeProgress >= 1) return 0;               // fully faded
    // ease-out (quadratic)
    return 1 - fadeProgress * fadeProgress;
  }, []);

  /* â”€â”€ render loop â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  const renderLoop = useCallback(() => {
    if (!mountedRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    // Size canvas to viewport (only resize when needed)
    if (
      canvas.width !== canvas.clientWidth * dpr ||
      canvas.height !== canvas.clientHeight * dpr
    ) {
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    const now = performance.now();

    // Draw each visible stroke
    const alive: Stroke[] = [];

    for (const stroke of strokesRef.current) {
      const alpha = strokeOpacity(stroke, now);
      if (alpha <= 0) continue; // skip fully faded
      alive.push(stroke);

      const pts = stroke.points;
      if (pts.length < 2) continue;

      /* â”€â”€ Per-segment trailing fade â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
      for (let i = 1; i < pts.length; i++) {
        const p0 = pts[i - 1];
        const p1 = pts[i];

        // Per-segment age-based opacity (trailing ink effect)
        let segAlpha = alpha;
        if (stroke.finishedAt === null) {
          // While still drawing, old segments start fading too
          const segAge = now - p1.t;
          if (segAge > HOLD_MS + FADE_MS) continue;
          if (segAge > HOLD_MS) {
            const fp = (segAge - HOLD_MS) / FADE_MS;
            segAlpha = 1 - fp * fp;
          }
        } else {
          // After lift, per-point fade for trailing effect
          const segDelay = p1.t - stroke.points[0].t; // age relative to stroke start
          const totalDur = (stroke.finishedAt - stroke.points[0].t);
          const segFrac = totalDur > 0 ? segDelay / totalDur : 0;
          // Older segments start fading earlier
          const segSinceFinish = now - stroke.finishedAt + (1 - segFrac) * 200;
          if (segSinceFinish < HOLD_MS) {
            segAlpha = 1;
          } else {
            const fp = (segSinceFinish - HOLD_MS) / FADE_MS;
            if (fp >= 1) continue;
            segAlpha = 1 - fp * fp;
          }
        }

        if (segAlpha <= 0.001) continue;

        /* â”€â”€ Pass 1: outer red glow â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
        ctx.save();
        ctx.globalAlpha = segAlpha * 0.55;
        ctx.strokeStyle = "#FF3B30";
        ctx.lineWidth = 10;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.shadowColor = "#FF3B30";
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
        ctx.restore();

        /* â”€â”€ Pass 2: white-hot core â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
        ctx.save();
        ctx.globalAlpha = segAlpha;
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 3.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.shadowColor = "rgba(255,255,255,0.6)";
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
        ctx.restore();
      }
    }

    strokesRef.current = alive;

    // Continue loop only if strokes remain or user is drawing
    if (alive.length > 0 || drawingRef.current) {
      rafRef.current = requestAnimationFrame(renderLoop);
    } else {
      rafRef.current = 0;
      // All strokes faded â€” notify parent
      onAllFaded?.();
    }
  }, [strokeOpacity, onAllFaded]);

  /** Ensure the render loop is running */
  const ensureLoop = useCallback(() => {
    if (rafRef.current === 0) {
      rafRef.current = requestAnimationFrame(renderLoop);
    }
  }, [renderLoop]);

  /* â”€â”€ pointer handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  const handlePointerDown = useCallback(
    (e: PointerEvent) => {
      if (!enabled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.setPointerCapture(e.pointerId);
      drawingRef.current = true;

      const now = performance.now();
      const newStroke: Stroke = {
        points: [{ x: e.clientX, y: e.clientY, t: now }],
        createdAt: now,
        finishedAt: null,
      };
      strokesRef.current.push(newStroke);
      ensureLoop();
    },
    [enabled, ensureLoop]
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!drawingRef.current) return;
      const strokes = strokesRef.current;
      const current = strokes[strokes.length - 1];
      if (!current || current.finishedAt !== null) return;

      current.points.push({
        x: e.clientX,
        y: e.clientY,
        t: performance.now(),
      });
    },
    []
  );

  const handlePointerUp = useCallback(() => {
    if (!drawingRef.current) return;
    drawingRef.current = false;

    const strokes = strokesRef.current;
    const current = strokes[strokes.length - 1];
    if (current && current.finishedAt === null) {
      current.finishedAt = performance.now();
    }
    ensureLoop();
  }, [ensureLoop]);

  /* â”€â”€ attach / detach listeners & lifecycle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, []);

  // Attach pointer listeners to the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointercancel", handlePointerUp);

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [handlePointerDown, handlePointerMove, handlePointerUp]);

  // When pen is disabled but strokes still visible, keep the rAF running
  // but don't allow new input; once all faded, parent unmounts us.
  useEffect(() => {
    if (!enabled && strokesRef.current.length > 0) {
      ensureLoop();
    }
  }, [enabled, ensureLoop]);

  /* â”€â”€ render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  return (
    <canvas
      ref={canvasRef}
      className={`laser-canvas${enabled ? "" : " laser-canvas--fading"}`}
      aria-hidden="true"
    />
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Icon helpers (for NavBar buttons) â”€â”€ */

/** Pen-on icon: a pen nib with radiating lines */
export function PenOnIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      {/* pen nib */}
      <path
        d="M10.5 2.5L13.5 5.5 6 13H3V10L10.5 2.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* glow rays */}
      <line x1="14" y1="1" x2="14.8" y2="0.2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
      <line x1="15" y1="3.5" x2="16" y2="3.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <line x1="12" y1="0" x2="12" y2="-0.8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

/** Pen-off icon: a pen nib with a diagonal slash */
export function PenOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M10.5 2.5L13.5 5.5 6 13H3V10L10.5 2.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* slash */}
      <line
        x1="2" y1="2" x2="14" y2="14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}


// ──────────────────────────── NavBar ────────────────────────────────────────

interface NavBarProps {
  page: number;
  total: number;
  onGoto: (page: number) => void;
  onPrev: () => void;
  onNext: () => void;
  isPenEnabled: boolean;
  onTogglePen: () => void;
}

const LABELS = [
  "Optical Instruments: Simple Microscope",
  "Optical Instruments",
  "Simple Microscope",
  "Magnifying by Proximity",
  "The Eye's Limit",
  "Visual Angle",
  "The Simple Microscope",
  "Cases of Convex Lens",
  "Ray Diagram & Working",
  "Angular Magnification",
  "Image at Infinity (Normal Adjustment)",
];

export function NavBar({ page, total, onGoto, onPrev, onNext, isPenEnabled, onTogglePen }: NavBarProps) {
  return (
    <div className="navbar">
      <button
        className="navbar-arrow focus-visible-ring"
        onClick={onPrev}
        disabled={page === 1}
        aria-label="Previous page"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="navbar-dots">
        {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            className="navbar-dot-btn focus-visible-ring"
            onClick={() => onGoto(n)}
            aria-label={`Go to ${LABELS[n - 1]}`}
            aria-current={n === page}
          >
            <motion.span
              className="navbar-dot"
              animate={{
                width: n === page ? 22 : 6,
                opacity: n === page ? 1 : 0.35,
              }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            />
          </button>
        ))}
      </div>

      <button
        className="navbar-arrow focus-visible-ring"
        onClick={onNext}
        disabled={page === total}
        aria-label="Next page"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* â”€â”€ Pen toggle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <span className="navbar-pen-sep" aria-hidden="true" />

      <button
        className={`navbar-pen-btn focus-visible-ring${isPenEnabled ? " navbar-pen-btn--active" : ""}`}
        onClick={onTogglePen}
        aria-label={isPenEnabled ? "Disable annotation pen" : "Enable annotation pen"}
        aria-pressed={isPenEnabled}
        title={isPenEnabled ? "Disable Pen" : "Enable Pen"}
      >
        {isPenEnabled ? <PenOffIcon /> : <PenOnIcon />}
      </button>
    </div>
  );
}


// ──────────────────────────── DerivationStepper ─────────────────────────────

export interface DerivationStep {
  title: string;
  content: ReactNode;
}

export function DerivationStepper({
  className,
  steps,
}: {
  className?: string;
  steps: DerivationStep[];
}) {
  const [active, setActive] = useState(0);

  const changeStep = (next: number) => {
    if (next < 0 || next >= steps.length) return;
    setActive(next);
  };

  return (
    <section
      className={`derivation-stepper${className ? ` ${className}` : ""}`}
      aria-label="Step-by-step derivation"
    >
      {/* Derivation Step Cards */}
      <div className="derivation-stepper__stack">
        <AnimatePresence initial={false}>
          {steps.slice(0, active + 1).map((step, index) => (
            <motion.article
              key={step.title}
              className="derivation-stepper__card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="derivation-stepper__step-number">Step {index + 1}</span>
              <span className="derivation-stepper__title">{step.title}</span>
              <div className="derivation-stepper__content">{step.content}</div>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>

      {/* Navigation Controls Docked Underneath */}
      <div className="derivation-stepper__bottom-controls">
        <div className="derivation-stepper__dots" aria-hidden="true">
          {steps.map((_, index) => (
            <span
              key={index}
              className={
                index === active ? "is-active" : index < active ? "is-complete" : ""
              }
            />
          ))}
        </div>

        <div className="derivation-stepper__nav">
          <button
            className="derivation-stepper__arrow focus-visible-ring"
            type="button"
            onClick={() => changeStep(active - 1)}
            disabled={active === 0}
            aria-label="Previous derivation step"
          >
            <Arrow direction="left" />
          </button>
          <div className="derivation-stepper__status" aria-live="polite">
            <span className="derivation-stepper__count">
              {active + 1} of {steps.length} steps shown
            </span>
          </div>
          <button
            className="derivation-stepper__arrow focus-visible-ring"
            type="button"
            onClick={() => changeStep(active + 1)}
            disabled={active === steps.length - 1}
            aria-label="Next derivation step"
          >
            <Arrow direction="right" />
          </button>
        </div>
      </div>
    </section>
  );
}

function Arrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d={direction === "left" ? "M10 3L5 8l5 5" : "M6 3l5 5-5 5"}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


// ──────────────────────────── HorizontalTrack ───────────────────────────────

interface HorizontalTrackProps {
  value: number; // 0..1
  onChange: (v: number) => void;
  leftLabel?: string;
  rightLabel?: string;
  ariaLabel: string;
  accent?: string;
  markers?: { at: number; label: string }[];
}

export function HorizontalTrack({
  value,
  onChange,
  leftLabel,
  rightLabel,
  ariaLabel,
  accent = "var(--ray)",
  markers,
}: HorizontalTrackProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const setFromClientX = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const t = (clientX - rect.left) / rect.width;
      onChange(Math.min(1, Math.max(0, t)));
    },
    [onChange]
  );

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDragging(true);
    setFromClientX(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setFromClientX(e.clientX);
  };
  const endDrag = () => setDragging(false);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 0.1 : 0.03;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      onChange(Math.max(0, value - step));
      e.preventDefault();
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      onChange(Math.min(1, value + step));
      e.preventDefault();
    } else if (e.key === "Home") {
      onChange(0);
      e.preventDefault();
    } else if (e.key === "End") {
      onChange(1);
      e.preventDefault();
    }
  };

  return (
    <div className="h-track-wrap">
      {(leftLabel || rightLabel) && (
        <div className="h-track-labels">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      )}
      <div
        ref={trackRef}
        className="h-track"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div className="h-track-rail" />
        <div
          className="h-track-fill"
          style={{ width: `${value * 100}%`, background: accent }}
        />
        {markers?.map((m) => (
          <div
            key={m.label}
            className="h-track-marker"
            style={{ left: `${m.at * 100}%` }}
          >
            <span className="h-track-marker-tick" />
            <span className="h-track-marker-label">{m.label}</span>
          </div>
        ))}
        <motion.button
          type="button"
          className="h-track-knob focus-visible-ring"
          role="slider"
          aria-label={ariaLabel}
          aria-valuemin={0}
          aria-valuemax={1}
          aria-valuenow={Number(value.toFixed(2))}
          tabIndex={0}
          onKeyDown={onKeyDown}
          animate={{ left: `${value * 100}%` }}
          transition={
            dragging
              ? { duration: 0 }
              : { type: "spring", stiffness: 260, damping: 30 }
          }
          style={{ borderColor: accent }}
          whileHover={{ scale: 1.08 }}
          whileFocus={{ scale: 1.08 }}
        >
          <span className="h-track-knob-grip" style={{ background: accent }} />
        </motion.button>
      </div>
    </div>
  );
}


// ──────────────────────────── treeData ──────────────────────────────────────
export interface TreeNodeData {
  label: string;
  key: string;
  children?: TreeNodeData[];
}

export const opticalTree: TreeNodeData = {
  label: "Optical Instrument",
  key: "root",
  children: [
    { label: "Projector", key: "projector" },
    {
      label: "Camera",
      key: "camera",
      children: [
        { label: "Pinhole", key: "pinhole" },
        { label: "Lens", key: "lens" },
      ],
    },
    {
      label: "Microscope",
      key: "microscope",
      children: [
        { label: "Simple", key: "simple" },
        { label: "Compound", key: "compound" },
      ],
    },
    {
      label: "Telescope",
      key: "telescope",
      children: [
        {
          label: "Astronomical",
          key: "astronomical",
          children: [
            { label: "Refracting", key: "refracting" },
            { label: "Reflecting", key: "reflecting" },
            { label: "Infrared", key: "infrared" },
          ],
        },
        {
          label: "Terrestrial",
          key: "terrestrial",
          children: [
            { label: "Galilean", key: "galilean" },
            { label: "Binocular", key: "binocular" },
          ],
        },
      ],
    },
  ],
};


// ──────────────────────────── TreeBranch ────────────────────────────────────

interface TreeBranchProps {
  node: TreeNodeData;
  emphasize?: boolean;
  dim?: boolean;
  depth?: number;
}

/** Measure the center-x of the first and last .branch-child-slot
 *  to position a single continuous horizontal connector bar. */
function measureHLine(container: HTMLElement | null) {
  if (!container) return null;
  const slots = container.querySelectorAll<HTMLElement>(":scope > .branch-child-slot");
  if (slots.length < 2) return null;
  const parentRect = container.getBoundingClientRect();
  const firstRect = slots[0].getBoundingClientRect();
  const lastRect = slots[slots.length - 1].getBoundingClientRect();
  const left = firstRect.left + firstRect.width / 2 - parentRect.left;
  const right = lastRect.left + lastRect.width / 2 - parentRect.left;
  return { left, width: Math.max(0, right - left) };
}

export function TreeBranch({ node, emphasize, dim, depth = 0 }: TreeBranchProps) {
  const hasChildren = !!node.children?.length;
  const childrenRef = useRef<HTMLDivElement>(null);
  const [hLine, setHLine] = useState<{ left: number; width: number } | null>(null);

  const measure = useCallback(() => {
    setHLine(measureHLine(childrenRef.current));
  }, []);

  useLayoutEffect(() => {
    measure();
    if (!childrenRef.current) return;
    const ro = new ResizeObserver(measure);
    ro.observe(childrenRef.current);
    return () => ro.disconnect();
  }, [measure]);

  return (
    <motion.div layout className="branch" data-depth={depth} transition={springT}>
      <motion.div
        layout
        className={
          "branch-node" +
          (emphasize ? " branch-node--emphasis" : "") +
          (dim ? " branch-node--dim" : "")
        }
        transition={springT}
      >
        {node.label}
      </motion.div>
      {hasChildren && (
        <motion.div
          ref={childrenRef}
          layout
          className="branch-children"
          data-depth={depth + 1}
          transition={springT}
          onLayoutAnimationComplete={measure}
        >
          {hLine && (
            <span
              className="branch-h-line"
              style={{ left: hLine.left, width: hLine.width }}
            />
          )}
          {node.children!.map((child) => (
            <div className="branch-child-slot" key={child.key}>
              <TreeBranch node={child} emphasize={emphasize} dim={dim} depth={depth + 1} />
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

export const springT = { type: "spring" as const, stiffness: 180, damping: 26, mass: 1 };

export { measureHLine };


