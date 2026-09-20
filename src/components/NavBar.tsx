import { motion } from "framer-motion";
import { PenOnIcon, PenOffIcon } from "./LaserPen";
import "./NavBar.css";
import "./LaserPen.css";

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

export default function NavBar({ page, total, onGoto, onPrev, onNext, isPenEnabled, onTogglePen }: NavBarProps) {
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

      {/* ── Pen toggle ─────────────────────────────── */}
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
