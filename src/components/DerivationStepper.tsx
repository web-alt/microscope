import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./DerivationStepper.css";

export interface DerivationStep {
  title: string;
  content: ReactNode;
}

export default function DerivationStepper({
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
