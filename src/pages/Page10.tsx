import "./Page10.css";
import DerivationStepper, { type DerivationStep } from "../components/DerivationStepper";

// SVG coordinate constants for Case 2 (Image Formed at Infinity / Normal Adjustment)
const VB_W = 680;
const VB_H = 300;
const O_X = 370; // Lens optical centre X
const AXIS_Y = 150; // Principal axis Y
const F_LEN = 125; // Focal length in px
const F1_X = O_X - F_LEN; // Left focus F = 245 (where object is positioned, u = f)
const F2_X = O_X + F_LEN; // Right focus F = 495
const OBJ_H = 38; // Object height h_o in px

// Parallel ray slope = OBJ_H / F_LEN (u = f => parallel rays)
const raySlope = OBJ_H / F_LEN; // 38 / 125 = 0.304
const betaDeg = (Math.atan(raySlope) * 180) / Math.PI; // approx 16.9°

// Ray 1 forward: parallel to axis from object tip to lens (O_X), then refracts through F2
const r1EndX = 620;
const r1EndY = AXIS_Y - OBJ_H + raySlope * (r1EndX - O_X);

// Ray 2 forward: straight through optical centre O without deviation
const r2EndX = 620;
const r2EndY = AXIS_Y + raySlope * (r2EndX - O_X);

// Dashed backward virtual projections to infinity (parallel backwards)
const backEndX = 40;
const r1BackY = AXIS_Y - OBJ_H - raySlope * (O_X - backEndX);
const r2BackY = AXIS_Y - raySlope * (O_X - backEndX);

const CASE_TWO_STEPS: DerivationStep[] = [
  {
    title: "Start with the lens formula",
    content: <><div className="p10-step-formula"><span className="p10-frac"><span className="p10-frac-top">1</span><span className="p10-frac-bottom">v</span></span> − <span className="p10-frac"><span className="p10-frac-top">1</span><span className="p10-frac-bottom">u</span></span> = <span className="p10-frac"><span className="p10-frac-top">1</span><span className="p10-frac-bottom">f</span></span></div><div className="p10-tags-row"><span className="p10-code-pill">v = −∞</span><span className="p10-code-pill">object distance = −u</span><span className="p10-code-pill">f = +f</span></div></>,
  },
  {
    title: "Use the image-at-infinity condition",
    content: <><div className="p10-step-formula"><span className="p10-frac"><span className="p10-frac-top">1</span><span className="p10-frac-bottom">−∞</span></span> − <span className="p10-frac"><span className="p10-frac-top">1</span><span className="p10-frac-bottom">−u</span></span> = <span className="p10-frac"><span className="p10-frac-top">1</span><span className="p10-frac-bottom">f</span></span></div><div className="p10-step-subformula">Since 1/∞ = 0, &nbsp; <strong>u = f</strong></div></>,
  },
  {
    title: "Substitute u = f into magnification",
    content: <><div className="p10-step-formula">m = <span className="p10-frac"><span className="p10-frac-top">D</span><span className="p10-frac-bottom">u</span></span> ⇒ <span className="p10-result-m-tag">m = <span className="p10-frac"><span className="p10-frac-top">D</span><span className="p10-frac-bottom">f</span></span></span></div><span className="p10-step-note">Minimum magnification for a relaxed eye</span></>,
  },
  {
    title: "Relate linear and angular magnification",
    content: <><div className="p10-step-formula"><span className="p10-frac"><span className="p10-frac-top">v</span><span className="p10-frac-bottom">u</span></span> = <span className="p10-frac"><span className="p10-frac-top">−D</span><span className="p10-frac-bottom">−u</span></span> = <span className="p10-frac"><span className="p10-frac-top">D</span><span className="p10-frac-bottom">u</span></span></div><div className="p10-equivalence-box">Linear magnification = Angular magnification</div></>,
  },
  {
    title: "Key takeaway",
    content: <div className="p10-limit-box"><div className="p10-limit-header"><span className="p10-limit-badge">Practical limit</span></div><p className="p10-limit-text">A simple microscope has a limited maximum magnification, m ≤ 9, for realistic focal lengths.</p></div>,
  },
];

export default function Page10() {
  return (
    <div className="p10-scene">
      {/* Header */}
      <div className="p10-header">
        <span className="eyebrow">Ray Optics · Derivation · Case 2</span>
        <h1 className="p10-heading">Case 2: Image Formed at Infinity</h1>
      </div>

      {/* Top Banner: Normal Adjustment & Relaxed Eye Concept */}
      <div className="p10-summary-bar glass-panel">
        <div className="p10-summary-def">
          <div className="p10-summary-badge-row">
            <span className="p10-badge p10-badge--amber">Special Case 2</span>
            <span className="p10-badge p10-badge--cyan">Normal Adjustment</span>
            <span className="p10-badge p10-badge--violet">Relaxed Eye</span>
          </div>
          <p className="p10-summary-text">
            When the object is placed at the principal focus (<strong>u = f</strong>), the refracted rays emerge parallel
            and enter the eye with zero accommodation effort. The image is formed at infinity (<strong>v = −∞</strong>).
          </p>
        </div>

        <div className="p10-summary-math-grid">
          <div className="p10-minibox">
            <span className="p10-minibox-label">Object Position</span>
            <div className="p10-minibox-math p10-minibox-math--focus">
              u = f
            </div>
          </div>
          <div className="p10-minibox">
            <span className="p10-minibox-label">Image Distance</span>
            <div className="p10-minibox-math">
              v = −∞
            </div>
          </div>
          <div className="p10-minibox p10-minibox--accent">
            <span className="p10-minibox-label">Angular Magnification</span>
            <div className="p10-minibox-math p10-minibox-math--lg">
              m = <span className="p10-frac"><span className="p10-frac-top">D</span><span className="p10-frac-bottom">f</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Section: Optical Diagram on Left + Step-by-Step Derivation on Right */}
      <div className="p10-case-wrapper glass-panel">
        <div className="p10-case-header">
          <div className="p10-case-badge-group">
            <span className="p10-case-tag">Optical Ray Geometry</span>
            <span className="p10-case-condition">Emergent Parallel Beams · Relaxed Ciliary Muscles</span>
          </div>
          <h2 className="p10-case-title">Normal Adjustment · Relaxed Eye</h2>
        </div>

        <div className="p10-case-body">
          {/* Left Column: Dedicated Vector SVG Diagram */}
          <div className="p10-diagram-col glass-panel">
            <div className="p10-diagram-caption">
              <span>Ray Diagram for Minimum Angular Magnification (Image at ∞)</span>
              <span className="p10-diag-val">β ≈ {betaDeg.toFixed(1)}°</span>
            </div>

            <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="p10-svg" aria-label="Visual ray diagram for image formed at infinity with relaxed eye">
              <defs>
                <linearGradient id="p10-lens-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="rgba(95, 210, 232, 0.28)" />
                  <stop offset="50%" stopColor="rgba(95, 210, 232, 0.08)" />
                  <stop offset="100%" stopColor="rgba(95, 210, 232, 0.28)" />
                </linearGradient>
                <marker id="p10-ray-arr" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--ray)" />
                </marker>
              </defs>

              {/* Principal Axis */}
              <line x1="20" y1={AXIS_Y} x2={VB_W - 20} y2={AXIS_Y} stroke="var(--hairline-strong)" strokeWidth="1.2" />

              {/* Convex Lens at Optical Centre O */}
              <path
                d={`M ${O_X} 35 Q ${O_X + 22} ${AXIS_Y} ${O_X} 265 Q ${O_X - 22} ${AXIS_Y} ${O_X} 35 Z`}
                fill="url(#p10-lens-grad)"
                stroke="var(--axis)"
                strokeWidth="1.6"
              />
              <line x1={O_X} y1="25" x2={O_X} y2="275" stroke="var(--hairline)" strokeWidth="1" strokeDasharray="3 4" />
              <circle cx={O_X} cy={AXIS_Y} r="3" fill="var(--ink-0)" />
              <text x={O_X + 6} y={AXIS_Y + 16} className="p10-mono">O</text>

              {/* Left Principal Focus F (Object position u = f) */}
              <circle cx={F1_X} cy={AXIS_Y} r="3.5" fill="var(--ray)" />
              <text x={F1_X} y={AXIS_Y + 16} textAnchor="middle" className="p10-mono p10-mono--focus">F (u = f)</text>

              {/* Right Focus F */}
              <circle cx={F2_X} cy={AXIS_Y} r="3" fill="var(--ray)" />
              <text x={F2_X} y={AXIS_Y + 16} textAnchor="middle" className="p10-mono">F</text>

              {/* Real Object h_o Placed Exactly at Focus F */}
              <g>
                <line
                  x1={F1_X}
                  y1={AXIS_Y}
                  x2={F1_X}
                  y2={AXIS_Y - OBJ_H}
                  stroke="var(--ink-0)"
                  strokeWidth="2.8"
                />
                <polygon
                  points={`${F1_X - 5},${AXIS_Y - OBJ_H + 8} ${F1_X},${AXIS_Y - OBJ_H} ${F1_X + 5},${AXIS_Y - OBJ_H + 8}`}
                  fill="var(--ink-0)"
                />
                <text x={F1_X - 8} y={AXIS_Y - OBJ_H / 2 + 4} textAnchor="end" className="p10-label">
                  h<tspan dy="4" fontSize="10">o</tspan>
                </text>
              </g>

              {/* Dashed Parallel Backward Extensions to -Infinity */}
              <line
                x1={O_X}
                y1={AXIS_Y - OBJ_H}
                x2={backEndX}
                y2={r1BackY}
                stroke="rgba(255, 180, 107, 0.4)"
                strokeWidth="1.4"
                strokeDasharray="4 4"
              />
              <line
                x1={F1_X}
                y1={AXIS_Y - OBJ_H}
                x2={backEndX}
                y2={r2BackY}
                stroke="rgba(255, 180, 107, 0.4)"
                strokeWidth="1.4"
                strokeDasharray="4 4"
              />

              {/* Annotation badge indicating image at infinity */}
              <g transform="translate(30, 22)">
                <rect x="0" y="0" width="146" height="22" rx="6" fill="rgba(95, 210, 232, 0.1)" stroke="rgba(95, 210, 232, 0.3)" strokeWidth="1" />
                <text x="73" y="15" textAnchor="middle" className="p10-dim-text p10-dim-text--axis" fontWeight="600">
                  Image at ∞ (v = −∞)
                </text>
              </g>

              {/* Ray 1 Forward: Object tip -> Lens -> through right Focus F */}
              <line x1={F1_X} y1={AXIS_Y - OBJ_H} x2={O_X} y2={AXIS_Y - OBJ_H} stroke="var(--ray)" strokeWidth="1.8" />
              <line x1={O_X} y1={AXIS_Y - OBJ_H} x2={r1EndX} y2={r1EndY} stroke="var(--ray)" strokeWidth="1.8" markerMid="url(#p10-ray-arr)" />

              {/* Ray 2 Forward: Object tip straight through Optical Centre O */}
              <line x1={F1_X} y1={AXIS_Y - OBJ_H} x2={r2EndX} y2={r2EndY} stroke="var(--ray)" strokeWidth="1.8" markerMid="url(#p10-ray-arr)" />

              {/* Parallel Rays Indicator */}
              <text x={530} y={r1EndY - 12} className="p10-dim-text">
                Parallel rays (∥)
              </text>

              {/* Visual Angle Beta Arc at Optical Centre O */}
              <path
                d={`M ${O_X - 28} ${AXIS_Y} A 28 28 0 0 1 ${O_X - 28 * Math.cos(betaDeg * Math.PI / 180)} ${AXIS_Y - 28 * Math.sin(betaDeg * Math.PI / 180)}`}
                fill="none"
                stroke="var(--ray)"
                strokeWidth="1.5"
              />
              <text x={O_X - 42} y={AXIS_Y - 8} className="p10-angle">
                β
              </text>

              {/* Dimension line: Object Distance u = f */}
              <g className="p10-dim">
                <line x1={F1_X} y1={AXIS_Y + 34} x2={O_X} y2={AXIS_Y + 34} stroke="var(--ray)" strokeWidth="1.2" />
                <line x1={F1_X} y1={AXIS_Y + 28} x2={F1_X} y2={AXIS_Y + 40} stroke="var(--ray)" strokeWidth="1.2" />
                <line x1={O_X} y1={AXIS_Y + 28} x2={O_X} y2={AXIS_Y + 40} stroke="var(--ray)" strokeWidth="1.2" />
                <text x={(F1_X + O_X) / 2} y={AXIS_Y + 48} textAnchor="middle" className="p10-dim-text">
                  u = f
                </text>
              </g>

              {/* Dimension line: Focal Length f on right side */}
              <g className="p10-dim">
                <line x1={O_X} y1={AXIS_Y + 34} x2={F2_X} y2={AXIS_Y + 34} stroke="var(--axis)" strokeWidth="1.2" />
                <line x1={O_X} y1={AXIS_Y + 28} x2={O_X} y2={AXIS_Y + 40} stroke="var(--axis)" strokeWidth="1.2" />
                <line x1={F2_X} y1={AXIS_Y + 28} x2={F2_X} y2={AXIS_Y + 40} stroke="var(--axis)" strokeWidth="1.2" />
                <text x={(O_X + F2_X) / 2} y={AXIS_Y + 48} textAnchor="middle" className="p10-dim-text p10-dim-text--axis">
                  f
                </text>
              </g>

              {/* Relaxed Eye viewing parallel emerging beam */}
              <g transform="translate(565, 215)">
                <path
                  d="M -18 0 Q 0 -12 18 0 Q 0 12 -18 0 Z"
                  fill="#0d1520"
                  stroke="var(--axis)"
                  strokeWidth="1.5"
                />
                <circle cx="2" cy="0" r="5" fill="var(--axis)" />
                <circle cx="2" cy="0" r="2.5" fill="#000" />
                <text x="0" y="22" textAnchor="middle" className="p10-mono">Relaxed Eye</text>
              </g>
            </svg>
          </div>

        </div>
        <DerivationStepper className="p10-derivation" steps={CASE_TWO_STEPS} />
      </div>
    </div>
  );
}
