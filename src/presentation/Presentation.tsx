import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import NavBar from "../components/NavBar";
import MicroscopeIntroScene from "../pages/MicroscopeIntroScene";
import Page3 from "../pages/Page3";
import Page4 from "../pages/Page4";
import Page5 from "../pages/Page5";
import Page6 from "../pages/Page6";
import Page7 from "../pages/Page7";
import Page8 from "../pages/Page8";
import Page9 from "../pages/Page9";
import Page10 from "../pages/Page10";
import TitleSlide from "../pages/TitleSlide";
import "./Presentation.css";

const TOTAL_PAGES = 11;

export default function Presentation() {
  const [page, setPage] = useState(1);
  const [direction, setDirection] = useState(1);
  const lastPage = useRef(1);

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
        </motion.div>
      </AnimatePresence>

      <NavBar page={page} total={TOTAL_PAGES} onGoto={goto} onPrev={onPrev} onNext={onNext} />
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
