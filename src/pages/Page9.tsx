import "./Page9.css";
import DerivationStepper, { type DerivationStep } from "../components/DerivationStepper";

// SVG parameters for Case 1 Near-Point Visual Diagram
const VB_W = 680;
const VB_H = 290;
const O_X = 390; // Lens optical centre X
const AXIS_Y = 150; // Principal axis Y
const F_LEN = 110;
const D_DIST = 290; // Near point distance D px (v = -D)
const D_X = O_X - D_DIST; // Near point X = 100
const U_DIST = (D_DIST * F_LEN) / (D_DIST + F_LEN); // u = Df / (D + f) approx 79.75px
const OBJ_X = O_X - U_DIST; // Object X approx 310.25
const OBJ_H = 36; // Object height
const IMG_H = (D_DIST / U_DIST) * OBJ_H; // Image height approx 130px

const CASE_ONE_STEPS: DerivationStep[] = [
  {
    title: "Start with the lens formula",
    content: <div className="p9-step-formula"><span className="p9-frac"><span className="p9-frac-top">1</span><span className="p9-frac-bottom">v</span></span> − <span className="p9-frac"><span className="p9-frac-top">1</span><span className="p9-frac-bottom">u</span></span> = <span className="p9-frac"><span className="p9-frac-top">1</span><span className="p9-frac-bottom">f</span></span></div>,
  },
  {
    title: "Apply the sign convention",
    content: <div className="p9-tags-row"><span className="p9-code-pill">v = −D</span><span className="p9-code-pill">object distance = −u</span><span className="p9-code-pill">f = +f</span></div>,
  },
  {
    title: "Substitute the near-point condition",
    content: <><div className="p9-step-formula"><span className="p9-frac"><span className="p9-frac-top">1</span><span className="p9-frac-bottom">−D</span></span> − <span className="p9-frac"><span className="p9-frac-top">1</span><span className="p9-frac-bottom">−u</span></span> = <span className="p9-frac"><span className="p9-frac-top">1</span><span className="p9-frac-bottom">f</span></span></div><div className="p9-step-subformula">⇒ <span className="p9-frac"><span className="p9-frac-top">1</span><span className="p9-frac-bottom">u</span></span> = <span className="p9-frac"><span className="p9-frac-top">1</span><span className="p9-frac-bottom">f</span></span> + <span className="p9-frac"><span className="p9-frac-top">1</span><span className="p9-frac-bottom">D</span></span></div></>,
  },
  {
    title: "Express the ratio D / u",
    content: <div className="p9-step-formula"><span className="p9-frac"><span className="p9-frac-top">D</span><span className="p9-frac-bottom">u</span></span> = 1 + <span className="p9-frac"><span className="p9-frac-top">D</span><span className="p9-frac-bottom">f</span></span></div>,
  },
  {
    title: "Maximum angular magnification",
    content: <div className="p9-result-box"><div className="p9-result-meta"><span className="p9-result-badge">Final result</span><span className="p9-result-note">Since m = D / u</span></div><div className="p9-result-equation">m<sub className="p9-sub-max">max</sub> = 1 + <span className="p9-frac"><span className="p9-frac-top">D</span><span className="p9-frac-bottom">f</span></span></div><p className="p9-result-desc">The image forms at the least distance of distinct vision, D ≈ 25 cm.</p></div>,
  },
];

export default function Page9() {
  const betaDeg = (Math.atan(IMG_H / D_DIST) * 180) / Math.PI;

  return (
    <div className="p9-scene">
      {/* Header */}
      <div className="p9-header">
        <span className="eyebrow">Ray Optics · Derivation</span>
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
              m = <span className="p9-frac"><span className="p9-frac-top">β</span><span className="p9-frac-bottom">α</span></span>
            </div>
          </div>
          <div className="p9-minibox">
            <span className="p9-minibox-label">Small Angles</span>
            <div className="p9-minibox-math">
              β ≈ <span className="p9-frac"><span className="p9-frac-top">h<sub>o</sub></span><span className="p9-frac-bottom">-u</span></span>, α ≈ <span className="p9-frac"><span className="p9-frac-top">h<sub>o</sub></span><span className="p9-frac-bottom">-D</span></span>
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

      {/* Main Section: CASE 1 — Image Formed at the Near Point */}
      <div className="p9-case-wrapper glass-panel">
        <div className="p9-case-header">
          <div className="p9-case-badge-group">
            <span className="p9-case-tag">Special Case 1</span>
            <span className="p9-case-condition">v = -D &nbsp;·&nbsp; Maximum Angular Magnification</span>
          </div>
          <h2 className="p9-case-title">Case 1: Image Formed at the Near Point</h2>
        </div>

        <div className="p9-case-body">
          {/* Left Column: Case 1 Vector SVG Diagram */}
          <div className="p9-diagram-col glass-panel">
            <div className="p9-diagram-caption">
              <span>Visual Diagram with Visual Angle β (Image at Near Point D)</span>
              <span className="p9-diag-val">β ≈ {betaDeg.toFixed(1)}°</span>
            </div>

            <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="p9-svg" aria-label="Visual diagram for maximum angular magnification at near point">
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
              <line x1="20" y1={AXIS_Y} x2={VB_W - 20} y2={AXIS_Y} stroke="var(--hairline-strong)" strokeWidth="1.2" />

              {/* Convex Lens */}
              <path
                d={`M ${O_X} 35 Q ${O_X + 22} ${AXIS_Y} ${O_X} 265 Q ${O_X - 22} ${AXIS_Y} ${O_X} 35 Z`}
                fill="url(#p9-lens-grad)"
                stroke="var(--axis)"
                strokeWidth="1.6"
              />
              <line x1={O_X} y1="25" x2={O_X} y2={275} stroke="var(--hairline)" strokeWidth="1" strokeDasharray="3 4" />
              <circle cx={O_X} cy={AXIS_Y} r="3" fill="var(--ink-0)" />
              <text x={O_X + 6} y={AXIS_Y + 16} className="p9-mono">O</text>

              {/* Focus points */}
              <circle cx={O_X - F_LEN} cy={AXIS_Y} r="3" fill="var(--ray)" />
              <text x={O_X - F_LEN} y={AXIS_Y + 16} textAnchor="middle" className="p9-mono">F</text>
              <circle cx={O_X + F_LEN} cy={AXIS_Y} r="3" fill="var(--ray)" />
              <text x={O_X + F_LEN} y={AXIS_Y + 16} textAnchor="middle" className="p9-mono">F</text>

              {/* Near-point Virtual Image at D */}
              <g>
                <line
                  x1={D_X}
                  y1={AXIS_Y}
                  x2={D_X}
                  y2={AXIS_Y - IMG_H}
                  stroke="var(--axis)"
                  strokeWidth="2.4"
                  strokeDasharray="5 4"
                />
                <polygon
                  points={`${D_X - 6},${AXIS_Y - IMG_H + 10} ${D_X},${AXIS_Y - IMG_H} ${D_X + 6},${AXIS_Y - IMG_H + 10}`}
                  fill="var(--axis)"
                />
                <text x={D_X - 10} y={AXIS_Y - IMG_H / 2} textAnchor="end" className="p9-label" fill="var(--axis)">
                  Image at D
                </text>
              </g>

              {/* Object at u */}
              <g>
                <line
                  x1={OBJ_X}
                  y1={AXIS_Y}
                  x2={OBJ_X}
                  y2={AXIS_Y - OBJ_H}
                  stroke="var(--ink-0)"
                  strokeWidth="2.8"
                />
                <polygon
                  points={`${OBJ_X - 5},${AXIS_Y - OBJ_H + 8} ${OBJ_X},${AXIS_Y - OBJ_H} ${OBJ_X + 5},${AXIS_Y - OBJ_H + 8}`}
                  fill="var(--ink-0)"
                />
                <text x={OBJ_X - 8} y={AXIS_Y - OBJ_H / 2 + 4} textAnchor="end" className="p9-label">
                  h<tspan dy="4" fontSize="10">o</tspan>
                </text>
              </g>

              {/* Dashed Virtual Extensions back to top of Image */}
              <line x1={O_X} y1={AXIS_Y - OBJ_H} x2={D_X} y2={AXIS_Y - IMG_H} stroke="rgba(255, 180, 107, 0.45)" strokeWidth="1.4" strokeDasharray="4 4" />
              <line x1={OBJ_X} y1={AXIS_Y - OBJ_H} x2={D_X} y2={AXIS_Y - IMG_H} stroke="rgba(255, 180, 107, 0.45)" strokeWidth="1.4" strokeDasharray="4 4" />

              {/* Forward Rays */}
              <line x1={OBJ_X} y1={AXIS_Y - OBJ_H} x2={O_X} y2={AXIS_Y - OBJ_H} stroke="var(--ray)" strokeWidth="1.8" />
              <line x1={O_X} y1={AXIS_Y - OBJ_H} x2={600} y2={AXIS_Y - OBJ_H + (OBJ_H / F_LEN) * (600 - O_X)} stroke="var(--ray)" strokeWidth="1.8" markerMid="url(#p9-ray-arr)" />
              <line x1={OBJ_X} y1={AXIS_Y - OBJ_H} x2={600} y2={AXIS_Y + (OBJ_H / U_DIST) * (600 - O_X)} stroke="var(--ray)" strokeWidth="1.8" markerMid="url(#p9-ray-arr)" />

              {/* Angle Beta Arc */}
              <path
                d={`M ${O_X - 30} ${AXIS_Y} A 30 30 0 0 1 ${O_X - 30 * Math.cos(betaDeg * Math.PI / 180)} ${AXIS_Y - 30 * Math.sin(betaDeg * Math.PI / 180)}`}
                fill="none"
                stroke="var(--ray)"
                strokeWidth="1.5"
              />
              <text x={O_X - 44} y={AXIS_Y - 8} className="p9-angle">
                β
              </text>

              {/* Dimension u */}
              <g className="p9-dim">
                <line x1={OBJ_X} y1={AXIS_Y + 30} x2={O_X} y2={AXIS_Y + 30} stroke="var(--ray)" strokeWidth="1.2" />
                <line x1={OBJ_X} y1={AXIS_Y + 24} x2={OBJ_X} y2={AXIS_Y + 36} stroke="var(--ray)" strokeWidth="1.2" />
                <line x1={O_X} y1={AXIS_Y + 24} x2={O_X} y2={AXIS_Y + 36} stroke="var(--ray)" strokeWidth="1.2" />
                <text x={(OBJ_X + O_X) / 2} y={AXIS_Y + 44} textAnchor="middle" className="p9-dim-text">
                  u
                </text>
              </g>

              {/* Dimension v = -D */}
              <g className="p9-dim">
                <line x1={D_X} y1={AXIS_Y + 60} x2={O_X} y2={AXIS_Y + 60} stroke="var(--axis)" strokeWidth="1.2" />
                <line x1={D_X} y1={AXIS_Y + 54} x2={D_X} y2={AXIS_Y + 66} stroke="var(--axis)" strokeWidth="1.2" />
                <line x1={O_X} y1={AXIS_Y + 54} x2={O_X} y2={AXIS_Y + 66} stroke="var(--axis)" strokeWidth="1.2" />
                <text x={(D_X + O_X) / 2} y={AXIS_Y + 74} textAnchor="middle" className="p9-dim-text p9-dim-text--axis">
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
