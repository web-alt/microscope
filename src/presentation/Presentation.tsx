import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LaserPenCanvas, { NavBar } from "../components/components";
import { MicroscopeIntroScene, Page3, Page4, Page5, Page6, Page7, Page8, Page9, Page10, Page11, Page12, TitleSlide } from "../pages/pages";

const TOTAL_PAGES = 13;

export default function Presentation() {
  const [page, setPage] = useState(1);
  const [direction, setDirection] = useState(1);
  const lastPage = useRef(1);

  /* ── Laser pen state ─────────────────────────────────────── */
  const [isPenEnabled, setIsPenEnabled] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);

  const togglePen = useCallback(() => {
    setIsPenEnabled((prev) => {
      const next = !prev;
      if (next) setShowCanvas(true); // mount canvas
      // When turning off, canvas stays so strokes can fade
      return next;
    });
  }, []);

  const handleAllFaded = useCallback(() => {
    // All strokes have faded and pen is off — unmount canvas
    if (!isPenEnabled) {
      setShowCanvas(false);
    }
  }, [isPenEnabled]);

  /* ── Page navigation ─────────────────────────────────────── */

  const goto = useCallback((next: number) => {
    if (next < 1 || next > TOTAL_PAGES || next === lastPage.current) return;
    setDirection(next > lastPage.current ? 1 : -1);
    lastPage.current = next;
    setPage(next);
  }, []);

  const onNext = useCallback(() => goto(page + 1), [page, goto]);
  const onPrev = useCallback(() => goto(page - 1), [page, goto]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.getAttribute("role") === "slider") return;
      if (["ArrowRight", "PageDown", " "].includes(e.key)) {
        onNext();
      } else if (["ArrowLeft", "PageUp"].includes(e.key)) {
        onPrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onNext, onPrev]);

  const introKey = page >= 2 && page <= 3 ? "intro" : `p${page}`;

  return (
    <div className="stage">
      <div className="grain" />

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={introKey}
          className="scene-slot"
          custom={direction}
          variants={sceneVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {page === 1 && <TitleSlide />}
          {page >= 2 && page <= 3 && (
            <MicroscopeIntroScene
              page={(page - 1) as 1 | 2}
              onAdvance={() => goto(3)}
              onGoVisualAngle={() => goto(6)}
            />
          )}
          {page === 4 && <Page3 />}
          {page === 5 && <Page4 onBack={() => goto(3)} />}
          {page === 6 && <Page5 />}
          {page === 7 && <Page6 />}
          {page === 8 && <Page7 />}
          {page === 9 && <Page8 />}
          {page === 10 && <Page9 />}
          {page === 11 && <Page10 />}
          {page === 12 && <Page11 />}
          {page === 13 && <Page12 />}
        </motion.div>
      </AnimatePresence>

      {/* Laser pen canvas overlay (z-index 35, below navbar 40) */}
      {showCanvas && (
        <LaserPenCanvas enabled={isPenEnabled} onAllFaded={handleAllFaded} />
      )}

      <NavBar
        page={page}
        total={TOTAL_PAGES}
        onGoto={goto}
        onPrev={onPrev}
        onNext={onNext}
        isPenEnabled={isPenEnabled}
        onTogglePen={togglePen}
      />
    </div>
  );
}

const sceneVariants = {
  enter: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? 36 : -36,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? -36 : 36,
  }),
};

