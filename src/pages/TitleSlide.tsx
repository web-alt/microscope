import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./TitleSlide.css";

export default function TitleSlide() {
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
      {/* ── Atmospheric Optical Glass & Ray Caustics ── */}
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
