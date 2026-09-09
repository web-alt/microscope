import { useState, useRef, useCallback } from "react";
import DerivationStepper, { type DerivationStep } from "../components/DerivationStepper";
import HorizontalTrack from "../components/HorizontalTrack";
import "./Page8.css";

// SVG coordinate constants for Left Diagram (Simple Microscope)
const L_W = 620;
const L_H = 320;
const O_X = 330; // Optical centre X
const AXIS_Y = 160; // Principal axis Y
const F_LEN = 135; // Focal length in px
const F1_X = O_X - F_LEN; // Left focus F1 = 195
const F2_X = O_X + F_LEN; // Right focus F2 = 465
const OBJ_H = 42; // Object height h_o in px

// SVG coordinate constants for Right Diagram (Naked Eye at D)
const R_W = 340;
const R_H = 320;
const R_EYE_X = 270;
const R_AXIS_Y = 210;
const D_DEFAULT = 200; // Distance D = 200px (representing 25 cm)

const MAGNIFICATION_STEPS: DerivationStep[] = [
  {
    title: "Define angular magnification",
    content: (
      <>
        <div className="p8-math-eq">
          m ={" "}
          <span className="p8-frac">
            <span className="p8-frac-top">Visual angle subtended by image on eye (β)</span>
            <span className="p8-frac-bottom">Visual angle subtended by object at D (α)</span>
          </span>
        </div>
        <div className="p8-math-eq p8-math-eq--highlight">
          m ={" "}
          <span className="p8-frac">
            <span className="p8-frac-top">β</span>
            <span className="p8-frac-bottom">α</span>
          </span>
        </div>
      </>
    ),
  },
  {
    title: "Use the small-angle approximation",
    content: (
      <>
        <div className="p8-math-line">
          tan β ={" "}
          <span className="p8-frac">
            <span className="p8-frac-top">h<sub>o</sub></span>
            <span className="p8-frac-bottom">−u</span>
          </span>{" "}
          ⇒ β ≈{" "}
          <span className="p8-frac">
            <span className="p8-frac-top">h<sub>o</sub></span>
            <span className="p8-frac-bottom">−u</span>
          </span>
        </div>
        <div className="p8-math-line">
          tan α ={" "}
          <span className="p8-frac">
            <span className="p8-frac-top">h<sub>o</sub></span>
            <span className="p8-frac-bottom">−D</span>
          </span>{" "}
          ⇒ α ≈{" "}
          <span className="p8-frac">
            <span className="p8-frac-top">h<sub>o</sub></span>
            <span className="p8-frac-bottom">−D</span>
          </span>
        </div>
      </>
    ),
  },
  {
    title: "Divide the two visual angles",
    content: (
      <div className="p8-math-eq">
        m ={" "}
        <span className="p8-frac">
          <span className="p8-frac-top">β</span>
          <span className="p8-frac-bottom">α</span>
        </span>{" "}
        ={" "}
        <span className="p8-frac">
          <span className="p8-frac-top">(h<sub>o</sub> / u)</span>
          <span className="p8-frac-bottom">(h<sub>o</sub> / D)</span>
        </span>
      </div>
    ),
  },
  {
    title: "Angular magnification formula",
    content: (
      <div className="p8-math-result">
        m ={" "}
        <span className="p8-frac">
          <span className="p8-frac-top">D</span>
          <span className="p8-frac-bottom">u</span>
        </span>
      </div>
    ),
  },
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export default function Page8() {
  // Left Diagram: Normalized object position strictly between F and O
  // 0 = close to F, 1 = close to O
  const [tObj, setTObj] = useState(0.5);

  // Right Diagram: Interactive distance d for naked eye (default D = 200px)
  const [rDist, setRDist] = useState(D_DEFAULT);

  // Calculate object distance u (px from optical centre O)
  // Bounds: min 0.22*F_LEN (close to O) to max 0.86*F_LEN (close to F)
  const u = lerp(F_LEN * 0.86, F_LEN * 0.24, tObj);
  const objX = O_X - u;

  // Lens formula: 1/v - 1/(-u) = 1/f  =>  v = -(u*f) / (f - u)
  const denom = Math.max(8, F_LEN - u);
  const mag = F_LEN / denom;
  const vDist = mag * u;

  // Image position and height
  const rawImgX = O_X - vDist;
  const imgX = Math.max(35, rawImgX); // clamp visual arrow inside SVG
  const imgH = Math.min(130, mag * OBJ_H);

  // Ray 1: Parallel to axis, refracts through F2 (right focus)
  const r1Slope = OBJ_H / F_LEN;
  const r1EndX = 560;
  const r1EndY = AXIS_Y - OBJ_H + r1Slope * (r1EndX - O_X);

  // Ray 2: Straight through optical centre O without deviation
  const r2Slope = OBJ_H / u;
  const r2EndX = 560;
  const r2EndY = AXIS_Y + r2Slope * (r2EndX - O_X);

  // Angle beta (visual angle with instrument) in degrees
  const betaDeg = (Math.atan(OBJ_H / u) * 180) / Math.PI;

  // Right diagram object X
  const rObjX = R_EYE_X - rDist;
  // Angle alpha (visual angle of naked eye) in degrees
  const alphaDeg = (Math.atan(OBJ_H / rDist) * 180) / Math.PI;

  // Horizontal dragging along principal axis for left diagram
  const svgLeftRef = useRef<SVGSVGElement>(null);
  const [dragLeft, setDragLeft] = useState(false);

  const handleLeftPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDragLeft(true);
  };
  const handleLeftPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragLeft || !svgLeftRef.current) return;
      const rect = svgLeftRef.current.getBoundingClientRect();
      const scaleX = L_W / rect.width;
      const clientSvgX = (e.clientX - rect.left) * scaleX;
      // Object is between F1_X (195) and O_X (330)
      const minX = F1_X + 18;
      const maxX = O_X - 25;
      const clampedX = Math.max(minX, Math.min(maxX, clientSvgX));
      const newU = O_X - clampedX;
      const newT = (F_LEN * 0.86 - newU) / (F_LEN * 0.86 - F_LEN * 0.24);
      setTObj(Math.max(0, Math.min(1, newT)));
    },
    [dragLeft]
  );
  const handleLeftPointerUp = () => setDragLeft(false);

  // Horizontal dragging along baseline for right diagram
  const svgRightRef = useRef<SVGSVGElement>(null);
  const [dragRight, setDragRight] = useState(false);

  const handleRightPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDragRight(true);
  };
  const handleRightPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRight || !svgRightRef.current) return;
      const rect = svgRightRef.current.getBoundingClientRect();
      const scaleX = R_W / rect.width;
      const clientSvgX = (e.clientX - rect.left) * scaleX;
      // Distance from eye: min 110px to max 230px
      const newDist = Math.max(110, Math.min(230, R_EYE_X - clientSvgX));
      setRDist(newDist);
    },
    [dragRight]
  );
  const handleRightPointerUp = () => setDragRight(false);

  return (
    <div className="p8-scene">
      {/* Header */}
      <div className="p8-header">
        <span className="eyebrow">Ray Optics · Working Principle</span>
        <h1 className="p8-heading">Working of a Simple Microscope by ray diagram :-</h1>
      </div>

      {/* Image Properties Highlight Box */}
      <div className="p8-props-bar glass-panel">
        <span className="p8-props-label">Image Properties:</span>
        <div className="p8-props-badges">
          <div className="p8-prop-badge p8-prop-badge--virtual">
            <span className="p8-prop-dot" />
            <strong>Virtual</strong>
            <span className="p8-prop-sub">(Formed on same side as object)</span>
          </div>
          <div className="p8-prop-badge p8-prop-badge--erect">
            <span className="p8-prop-dot" />
            <strong>Erect</strong>
            <span className="p8-prop-sub">(Upright orientation)</span>
          </div>
          <div className="p8-prop-badge p8-prop-badge--enlarged">
            <span className="p8-prop-dot" />
            <strong>Enlarged</strong>
            <span className="p8-prop-sub">
              (h<sub>i</sub> &gt; h<sub>o</sub>, magnified)
            </span>
          </div>
        </div>
      </div>

      {/* Two Ray Diagrams: Left (Simple Microscope) and Right (Naked Eye at D) */}
      <div className="p8-diagrams-grid">
        {/* LEFT DIAGRAM: Simple Microscope Ray Diagram */}
        <div className="p8-diag-card glass-panel">
          <div className="p8-diag-header">
            <span className="p8-diag-title">Simple Microscope (With Converging Lens)</span>
            <span className="p8-diag-tag">Angle β ≈ {betaDeg.toFixed(1)}°</span>
          </div>

          <svg
            ref={svgLeftRef}
            viewBox={`0 0 ${L_W} ${L_H}`}
            className="p8-svg"
            onPointerMove={handleLeftPointerMove}
            onPointerUp={handleLeftPointerUp}
            onPointerCancel={handleLeftPointerUp}
            aria-label="Simple Microscope ray diagram"
          >
            <defs>
              <linearGradient id="p8-lens-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(95, 210, 232, 0.28)" />
                <stop offset="50%" stopColor="rgba(95, 210, 232, 0.08)" />
                <stop offset="100%" stopColor="rgba(95, 210, 232, 0.28)" />
              </linearGradient>

              <marker
                id="p8-arrow-ray"
                viewBox="0 0 10 10"
                refX="5"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--ray)" />
              </marker>
            </defs>

            {/* Principal Optical Axis */}
            <line
              x1="20"
              y1={AXIS_Y}
              x2={L_W - 20}
              y2={AXIS_Y}
              stroke="var(--hairline-strong)"
              strokeWidth="1.2"
            />

            {/* Convex Lens at Optical Centre O */}
            <path
              d={`M ${O_X} 50 Q ${O_X + 26} ${AXIS_Y} ${O_X} 270 Q ${O_X - 26} ${AXIS_Y} ${O_X} 50 Z`}
              fill="url(#p8-lens-grad)"
              stroke="var(--axis)"
              strokeWidth="1.6"
            />
            {/* Lens central vertical axis */}
            <line
              x1={O_X}
              y1="40"
              x2={O_X}
              y2="280"
              stroke="var(--hairline)"
              strokeWidth="1"
              strokeDasharray="3 4"
            />
            <circle cx={O_X} cy={AXIS_Y} r="3" fill="var(--ink-0)" />
            <text x={O_X + 6} y={AXIS_Y + 16} className="p8-svg-mono">
              O
            </text>

            {/* Focal Points F1 (left) and F2 (right) */}
            <circle cx={F1_X} cy={AXIS_Y} r="3" fill="var(--ray)" />
            <text x={F1_X} y={AXIS_Y + 16} textAnchor="middle" className="p8-svg-mono">
              F
            </text>
            <circle cx={F2_X} cy={AXIS_Y} r="3" fill="var(--ray)" />
            <text x={F2_X} y={AXIS_Y + 16} textAnchor="middle" className="p8-svg-mono">
              F
            </text>

            {/* Virtual Image Arrow (Dashed erect arrow h_i) */}
            <g className="p8-svg-image">
              <line
                x1={imgX}
                y1={AXIS_Y}
                x2={imgX}
                y2={AXIS_Y - imgH}
                stroke="var(--axis)"
                strokeWidth="2.4"
                strokeDasharray="5 4"
              />
              <polygon
                points={`${imgX - 6},${AXIS_Y - imgH + 10} ${imgX},${AXIS_Y - imgH} ${imgX + 6},${AXIS_Y - imgH + 10}`}
                fill="var(--axis)"
              />
              <text
                x={imgX - 10}
                y={AXIS_Y - imgH / 2}
                textAnchor="end"
                className="p8-svg-label p8-svg-label--axis"
              >
                h<tspan dy="4" fontSize="11">i</tspan>
              </text>
            </g>

            {/* Real Object Arrow (Solid erect arrow h_o) */}
            <g
              className="p8-svg-object"
              style={{ cursor: "ew-resize" }}
              onPointerDown={handleLeftPointerDown}
            >
              <line
                x1={objX}
                y1={AXIS_Y}
                x2={objX}
                y2={AXIS_Y - OBJ_H}
                stroke="var(--ink-0)"
                strokeWidth="2.8"
              />
              <polygon
                points={`${objX - 6},${AXIS_Y - OBJ_H + 10} ${objX},${AXIS_Y - OBJ_H} ${objX + 6},${AXIS_Y - OBJ_H + 10}`}
                fill="var(--ink-0)"
              />
              <text
                x={objX - 10}
                y={AXIS_Y - OBJ_H / 2 + 4}
                textAnchor="end"
                className="p8-svg-label"
              >
                h<tspan dy="4" fontSize="11">o</tspan>
              </text>
              <circle cx={objX} cy={AXIS_Y - OBJ_H} r="12" fill="transparent" />
            </g>

            {/* Dashed Virtual Extension 1 (From lens back to top of image) */}
            <line
              x1={O_X}
              y1={AXIS_Y - OBJ_H}
              x2={imgX}
              y2={AXIS_Y - imgH}
              stroke="rgba(255, 180, 107, 0.45)"
              strokeWidth="1.4"
              strokeDasharray="4 4"
            />

            {/* Dashed Virtual Extension 2 (Through O back to top of image) */}
            <line
              x1={objX}
              y1={AXIS_Y - OBJ_H}
              x2={imgX}
              y2={AXIS_Y - imgH}
              stroke="rgba(255, 180, 107, 0.45)"
              strokeWidth="1.4"
              strokeDasharray="4 4"
            />

            {/* Ray 1 Forward: Object -> Lens -> Focus F2 -> Eye */}
            <line
              x1={objX}
              y1={AXIS_Y - OBJ_H}
              x2={O_X}
              y2={AXIS_Y - OBJ_H}
              stroke="var(--ray)"
              strokeWidth="1.8"
            />
            <line
              x1={O_X}
              y1={AXIS_Y - OBJ_H}
              x2={r1EndX}
              y2={r1EndY}
              stroke="var(--ray)"
              strokeWidth="1.8"
              markerMid="url(#p8-arrow-ray)"
            />

            {/* Ray 2 Forward: Object -> O -> Eye */}
            <line
              x1={objX}
              y1={AXIS_Y - OBJ_H}
              x2={r2EndX}
              y2={r2EndY}
              stroke="var(--ray)"
              strokeWidth="1.8"
              markerMid="url(#p8-arrow-ray)"
            />

            {/* Angle Beta arc at Optical Centre O */}
            <path
              d={`M ${O_X - 28} ${AXIS_Y} A 28 28 0 0 1 ${
                O_X - 28 * Math.cos((betaDeg * Math.PI) / 180)
              } ${AXIS_Y - 28 * Math.sin((betaDeg * Math.PI) / 180)}`}
              fill="none"
              stroke="var(--ray)"
              strokeWidth="1.5"
            />
            <text x={O_X - 44} y={AXIS_Y - 8} className="p8-svg-angle">
              β
            </text>

            {/* Dimension Line for Object Distance u */}
            <g className="p8-dim-line">
              <line
                x1={objX}
                y1={AXIS_Y + 34}
                x2={O_X}
                y2={AXIS_Y + 34}
                stroke="var(--ray)"
                strokeWidth="1.2"
              />
              <line
                x1={objX}
                y1={AXIS_Y + 28}
                x2={objX}
                y2={AXIS_Y + 40}
                stroke="var(--ray)"
                strokeWidth="1.2"
              />
              <line
                x1={O_X}
                y1={AXIS_Y + 28}
                x2={O_X}
                y2={AXIS_Y + 40}
                stroke="var(--ray)"
                strokeWidth="1.2"
              />
              <text
                x={(objX + O_X) / 2}
                y={AXIS_Y + 48}
                textAnchor="middle"
                className="p8-svg-dim"
              >
                u
              </text>
            </g>

            {/* Dimension Line for Image Distance v */}
            <g className="p8-dim-line">
              <line
                x1={imgX}
                y1={AXIS_Y + 68}
                x2={O_X}
                y2={AXIS_Y + 68}
                stroke="var(--axis)"
                strokeWidth="1.2"
              />
              <line
                x1={imgX}
                y1={AXIS_Y + 62}
                x2={imgX}
                y2={AXIS_Y + 74}
                stroke="var(--axis)"
                strokeWidth="1.2"
              />
              <line
                x1={O_X}
                y1={AXIS_Y + 62}
                x2={O_X}
                y2={AXIS_Y + 74}
                stroke="var(--axis)"
                strokeWidth="1.2"
              />
              <text
                x={(imgX + O_X) / 2}
                y={AXIS_Y + 82}
                textAnchor="middle"
                className="p8-svg-dim p8-svg-dim--axis"
              >
                v
              </text>
            </g>

            {/* Eye / Observer on Right looking through lens */}
            <g transform="translate(490, 245)">
              <path
                d="M -20 0 Q 0 -13 20 0 Q 0 13 -20 0 Z"
                fill="#0d1520"
                stroke="var(--axis)"
                strokeWidth="1.5"
              />
              <circle cx="2" cy="0" r="5" fill="var(--axis)" />
              <circle cx="2" cy="0" r="2.5" fill="#000" />
              <line x1="-8" y1="-10" x2="-10" y2="-16" stroke="var(--axis)" strokeWidth="1.2" />
              <line x1="0" y1="-12" x2="0" y2="-18" stroke="var(--axis)" strokeWidth="1.2" />
              <line x1="8" y1="-10" x2="10" y2="-16" stroke="var(--axis)" strokeWidth="1.2" />
              <text x="0" y="24" textAnchor="middle" className="p8-svg-mono">
                Eye
              </text>
            </g>
          </svg>
        </div>

        {/* RIGHT DIAGRAM: Recreated Red-Inked Diagram from DOCX (Naked Eye at D) */}
        <div className="p8-diag-card p8-diag-card--red glass-panel">
          <div className="p8-diag-header">
            <span className="p8-diag-title">Naked Eye (Object Kept at D)</span>
            <div className="p8-diag-header-actions">
              {rDist !== D_DEFAULT && (
                <button
                  type="button"
                  className="p8-diag-reset-btn"
                  onClick={() => setRDist(D_DEFAULT)}
                  title="Reset object to Near Point D (25 cm)"
                >
                  Snap to D
                </button>
              )}
            </div>
          </div>

          <svg
            ref={svgRightRef}
            viewBox={`0 0 ${R_W} ${R_H}`}
            className="p8-svg p8-svg--red"
            onPointerMove={handleRightPointerMove}
            onPointerUp={handleRightPointerUp}
            onPointerCancel={handleRightPointerUp}
            aria-label="Naked eye viewing object at distance D diagram"
          >
            <defs>
              <marker
                id="p8-arrow-alpha"
                viewBox="0 0 10 10"
                refX="5"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--ray)" />
              </marker>
            </defs>

            {/* Baseline */}
            <line
              x1="15"
              y1={R_AXIS_Y}
              x2={R_W - 15}
              y2={R_AXIS_Y}
              stroke="var(--hairline-strong)"
              strokeWidth="1.2"
            />

            {/* Upright Red Arrow (Real Object h_o at distance d from eye) */}
            <g
              className="p8-svg-object"
              style={{ cursor: "ew-resize" }}
              onPointerDown={handleRightPointerDown}
            >
              <line
                x1={rObjX}
                y1={R_AXIS_Y}
                x2={rObjX}
                y2={R_AXIS_Y - OBJ_H}
                stroke="var(--ray)"
                strokeWidth="2.8"
              />
              <polygon
                points={`${rObjX - 6},${R_AXIS_Y - OBJ_H + 10} ${rObjX},${R_AXIS_Y - OBJ_H} ${rObjX + 6},${R_AXIS_Y - OBJ_H + 10}`}
                fill="var(--ray)"
              />
              <text
                x={rObjX - 10}
                y={R_AXIS_Y - OBJ_H / 2 + 4}
                textAnchor="end"
                className="p8-svg-label"
                fill="var(--ray)"
              >
                h<tspan dy="4" fontSize="11">o</tspan>
              </text>
              <circle cx={rObjX} cy={R_AXIS_Y - OBJ_H} r="12" fill="transparent" />
            </g>

            {/* Direct Line of Sight to Naked Eye */}
            <line
              x1={rObjX}
              y1={R_AXIS_Y - OBJ_H}
              x2={R_EYE_X}
              y2={R_AXIS_Y}
              stroke="var(--ray)"
              strokeWidth="1.8"
              markerMid="url(#p8-arrow-alpha)"
            />

            {/* Angle Alpha Arc */}
            <path
              d={`M ${R_EYE_X - 36} ${R_AXIS_Y} A 36 36 0 0 1 ${
                R_EYE_X - 36 * Math.cos((alphaDeg * Math.PI) / 180)
              } ${R_AXIS_Y - 36 * Math.sin((alphaDeg * Math.PI) / 180)}`}
              fill="none"
              stroke="var(--ray)"
              strokeWidth="1.6"
            />
            <text x={R_EYE_X - 52} y={R_AXIS_Y - 8} className="p8-svg-angle">
              α
            </text>

            {/* Dimension line for Distance D */}
            <g className="p8-dim-line">
              <line
                x1={rObjX}
                y1={R_AXIS_Y + 32}
                x2={R_EYE_X}
                y2={R_AXIS_Y + 32}
                stroke="var(--ray)"
                strokeWidth="1.2"
              />
              <line
                x1={rObjX}
                y1={R_AXIS_Y + 26}
                x2={rObjX}
                y2={R_AXIS_Y + 38}
                stroke="var(--ray)"
                strokeWidth="1.2"
              />
              <line
                x1={R_EYE_X}
                y1={R_AXIS_Y + 26}
                x2={R_EYE_X}
                y2={R_AXIS_Y + 38}
                stroke="var(--ray)"
                strokeWidth="1.2"
              />
              <text
                x={(rObjX + R_EYE_X) / 2}
                y={R_AXIS_Y + 48}
                textAnchor="middle"
                className="p8-svg-dim"
              >
                {rDist === D_DEFAULT
                  ? "D (25 cm)"
                  : `d = ${(((rDist / D_DEFAULT) * 25)).toFixed(1)} cm`}
              </text>
            </g>

            {/* Naked Eye */}
            <g transform={`translate(${R_EYE_X}, ${R_AXIS_Y})`}>
              <path
                d="M -22 0 Q 0 -15 22 0 Q 0 15 -22 0 Z"
                fill="#0d1520"
                stroke="var(--ray)"
                strokeWidth="1.5"
              />
              <circle cx="2" cy="0" r="6" fill="var(--ray)" />
              <circle cx="2" cy="0" r="3" fill="#000" />
              <text x="32" y="4" className="p8-svg-mono">
                eye
              </text>
            </g>
          </svg>
        </div>
      </div>

      {/* Interactive Object Position Slider: Constrained ONLY between F and O */}
      <div className="p8-controls glass-panel">
        <div className="p8-controls-header">
          <span className="p8-controls-title">
            Interactive Object Position (Constrained Strictly Between F and O)
          </span>
          <span className="p8-controls-val">
            u = {(((u / D_DEFAULT) * 25)).toFixed(1)} cm &nbsp;·&nbsp; Magnification M ≈{" "}
            {mag.toFixed(2)}×
          </span>
        </div>
        <HorizontalTrack
          value={tObj}
          onChange={setTObj}
          leftLabel="Near Focus F (u → f)"
          rightLabel="Near Optical Centre O (u → 0)"
          ariaLabel="Move object strictly along horizontal optical axis between F and O"
          accent="var(--ray)"
          markers={[
            { at: 0.05, label: "F" },
            { at: 0.5, label: "Midway" },
            { at: 0.95, label: "O" },
          ]}
        />
      </div>

      <DerivationStepper className="p8-derivation" steps={MAGNIFICATION_STEPS} />
    </div>
  );
}
