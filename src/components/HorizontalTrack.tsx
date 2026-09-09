import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import "./HorizontalTrack.css";

interface HorizontalTrackProps {
  value: number; // 0..1
  onChange: (v: number) => void;
  leftLabel?: string;
  rightLabel?: string;
  ariaLabel: string;
  accent?: string;
  markers?: { at: number; label: string }[];
}

export default function HorizontalTrack({
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
