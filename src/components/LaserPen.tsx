import { useCallback, useEffect, useRef } from "react";
import "./LaserPen.css";

/* ──────────────────────────── Types ──────────────────────────── */

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

/* ──────────────────────────── Timing ─────────────────────────── */

const HOLD_MS = 350;       // fully visible after pointer lifts
const FADE_MS = 900;       // ease-out fade duration

/* ──────────────────────────── Component ──────────────────────── */

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

  /* ── helpers ─────────────────────────────────────────────────── */

  /** Compute per-stroke opacity (0–1) based on current time */
  const strokeOpacity = useCallback((s: Stroke, now: number): number => {
    if (s.finishedAt === null) return 1;           // still being drawn
    const sinceFinish = now - s.finishedAt;
    if (sinceFinish < HOLD_MS) return 1;           // hold period
    const fadeProgress = (sinceFinish - HOLD_MS) / FADE_MS;
    if (fadeProgress >= 1) return 0;               // fully faded
    // ease-out (quadratic)
    return 1 - fadeProgress * fadeProgress;
  }, []);

  /* ── render loop ────────────────────────────────────────────── */

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

      /* ── Per-segment trailing fade ────────────────────────── */
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

        /* ── Pass 1: outer red glow ─────────────────────────── */
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

        /* ── Pass 2: white-hot core ─────────────────────────── */
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
      // All strokes faded — notify parent
      onAllFaded?.();
    }
  }, [strokeOpacity, onAllFaded]);

  /** Ensure the render loop is running */
  const ensureLoop = useCallback(() => {
    if (rafRef.current === 0) {
      rafRef.current = requestAnimationFrame(renderLoop);
    }
  }, [renderLoop]);

  /* ── pointer handlers ───────────────────────────────────────── */

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

  /* ── attach / detach listeners & lifecycle ──────────────────── */

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

  /* ── render ─────────────────────────────────────────────────── */

  return (
    <canvas
      ref={canvasRef}
      className={`laser-canvas${enabled ? "" : " laser-canvas--fading"}`}
      aria-hidden="true"
    />
  );
}

/* ──────────────────────────── Icon helpers (for NavBar buttons) ── */

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
