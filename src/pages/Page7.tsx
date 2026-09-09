import { motion } from "framer-motion";
import "./Page7.css";

interface ConvexCase {
  id: number;
  caseNum: string;
  objectPos: React.ReactNode;
  imagePos: React.ReactNode;
  imageSize: string;
  imageNature: string;
  isMicroscopeCase?: boolean;
}

const CASES: ConvexCase[] = [
  {
    id: 1,
    caseNum: "Case 1",
    objectPos: "At infinity",
    imagePos: (
      <>
        At focus F<sub>2</sub>
      </>
    ),
    imageSize: "Highly diminished, point-sized",
    imageNature: "Real and inverted",
  },
  {
    id: 2,
    caseNum: "Case 2",
    objectPos: (
      <>
        Beyond 2F<sub>1</sub>
      </>
    ),
    imagePos: (
      <>
        Between F<sub>2</sub> and 2F<sub>2</sub>
      </>
    ),
    imageSize: "Diminished",
    imageNature: "Real and inverted",
  },
  {
    id: 3,
    caseNum: "Case 3",
    objectPos: (
      <>
        At 2F<sub>1</sub>
      </>
    ),
    imagePos: (
      <>
        At 2F<sub>2</sub>
      </>
    ),
    imageSize: "Same size",
    imageNature: "Real and inverted",
  },
  {
    id: 4,
    caseNum: "Case 4",
    objectPos: (
      <>
        Between F<sub>1</sub> and 2F<sub>1</sub>
      </>
    ),
    imagePos: (
      <>
        Beyond 2F<sub>2</sub>
      </>
    ),
    imageSize: "Enlarged",
    imageNature: "Real and inverted",
  },
  {
    id: 5,
    caseNum: "Case 5",
    objectPos: (
      <>
        At focus F<sub>1</sub>
      </>
    ),
    imagePos: "At infinity",
    imageSize: "Infinitely large or highly enlarged",
    imageNature: "Real and inverted",
  },
  {
    id: 6,
    caseNum: "Case 6",
    objectPos: (
      <>
        Between focus F<sub>1</sub> and optical centre O
      </>
    ),
    imagePos: "On the same side of the lens as the object",
    imageSize: "Enlarged",
    imageNature: "Virtual and erect",
    isMicroscopeCase: true,
  },
];

export default function Page7() {
  return (
    <div className="p7-scene">
      {/* Header */}
      <div className="p7-header">
        <span className="eyebrow">Ray Optics Reference &middot; Convex Lens</span>
        <h1 className="p7-heading">Different cases of a convex lens</h1>
      </div>

      {/* Main Table Container */}
      <motion.div
        className="p7-table-card glass-panel"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="p7-table-wrapper">
          <table className="p7-table" aria-label="Different cases of image formation by a convex lens">
            <thead>
              <tr className="p7-thead-row">
                <th scope="col" className="p7-th p7-th--case">
                  Case
                </th>
                <th scope="col" className="p7-th p7-th--obj">
                  Position of object
                </th>
                <th scope="col" className="p7-th p7-th--img">
                  Position of image
                </th>
                <th scope="col" className="p7-th p7-th--size">
                  Relative size of image
                </th>
                <th scope="col" className="p7-th p7-th--nature">
                  Nature of image
                </th>
              </tr>
            </thead>
            <tbody>
              {CASES.map((c, index) => {
                const isFinal = c.isMicroscopeCase;
                return (
                  <motion.tr
                    key={c.id}
                    className={"p7-row" + (isFinal ? " p7-row--final" : "")}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={
                      isFinal
                        ? {
                            duration: 0.5,
                            delay: 0.25,
                            ease: [0.22, 1, 0.36, 1],
                          }
                        : {
                            duration: 0.35,
                            delay: 0.05 * index,
                            ease: [0.22, 1, 0.36, 1],
                          }
                    }
                  >
                    <td className="p7-td p7-td--case">
                      <span className="p7-case-badge">{c.caseNum}</span>
                      {isFinal && (
                        <motion.span
                          className="p7-microscope-tag"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.35, delay: 0.35 }}
                        >
                          Simple Microscope
                        </motion.span>
                      )}
                    </td>
                    <td className="p7-td p7-td--obj">
                      <span className="p7-cell-content">{c.objectPos}</span>
                    </td>
                    <td className="p7-td p7-td--img">
                      <span className="p7-cell-content">{c.imagePos}</span>
                    </td>
                    <td className="p7-td p7-td--size">
                      <span className={"p7-cell-content" + (isFinal ? " p7-cell--enlarged" : "")}>
                        {c.imageSize}
                      </span>
                    </td>
                    <td className="p7-td p7-td--nature">
                      <span className={"p7-nature-pill" + (isFinal ? " p7-nature-pill--virtual" : "")}>
                        {c.imageNature}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Seminar Key Takeaway Note */}
        <motion.div
          className="p7-takeaway"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.4 }}
        >
          <div className="p7-takeaway-indicator" />
          <p className="p7-takeaway-text">
            In Cases 1&ndash;5, a convex lens always forms a{" "}
            <em>real and inverted</em> image. Only <strong>Case 6</strong> (object between focus F₁ and optical centre O)
            produces an <strong>enlarged, virtual and erect</strong> image &mdash; forming the foundational principle of the{" "}
            <strong>Simple Microscope</strong>.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
