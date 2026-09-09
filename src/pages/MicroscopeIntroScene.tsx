import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { opticalTree } from "../components/tree/treeData";
import TreeBranch, { measureHLine, springT } from "../components/tree/TreeBranch";
import "./MicroscopeIntroScene.css";

interface Props {
  page: 1 | 2;
  onAdvance: () => void;
  onGoVisualAngle: () => void;
}

export default function MicroscopeIntroScene({ page, onAdvance, onGoVisualAngle }: Props) {
  const focused = page === 2;
  const microscopeNode = opticalTree.children!.find((c) => c.key === "microscope")!;
  const otherBranches = opticalTree.children!.filter((c) => c.key !== "microscope");

  /* ── horizontal connector measurement for the top-level branch row ── */
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
                <strong>Definition —</strong> optical instruments are used
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
