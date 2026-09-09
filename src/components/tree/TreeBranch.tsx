import { motion } from "framer-motion";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { TreeNodeData } from "./treeData";
import "./tree.css";

interface TreeBranchProps {
  node: TreeNodeData;
  emphasize?: boolean;
  dim?: boolean;
  depth?: number;
}

/** Measure the center-x of the first and last .branch-child-slot
 *  to position a single continuous horizontal connector bar. */
function measureHLine(container: HTMLElement | null) {
  if (!container) return null;
  const slots = container.querySelectorAll<HTMLElement>(":scope > .branch-child-slot");
  if (slots.length < 2) return null;
  const parentRect = container.getBoundingClientRect();
  const firstRect = slots[0].getBoundingClientRect();
  const lastRect = slots[slots.length - 1].getBoundingClientRect();
  const left = firstRect.left + firstRect.width / 2 - parentRect.left;
  const right = lastRect.left + lastRect.width / 2 - parentRect.left;
  return { left, width: Math.max(0, right - left) };
}

export default function TreeBranch({ node, emphasize, dim, depth = 0 }: TreeBranchProps) {
  const hasChildren = !!node.children?.length;
  const childrenRef = useRef<HTMLDivElement>(null);
  const [hLine, setHLine] = useState<{ left: number; width: number } | null>(null);

  const measure = useCallback(() => {
    setHLine(measureHLine(childrenRef.current));
  }, []);

  useLayoutEffect(() => {
    measure();
    if (!childrenRef.current) return;
    const ro = new ResizeObserver(measure);
    ro.observe(childrenRef.current);
    return () => ro.disconnect();
  }, [measure]);

  return (
    <motion.div layout className="branch" data-depth={depth} transition={springT}>
      <motion.div
        layout
        className={
          "branch-node" +
          (emphasize ? " branch-node--emphasis" : "") +
          (dim ? " branch-node--dim" : "")
        }
        transition={springT}
      >
        {node.label}
      </motion.div>
      {hasChildren && (
        <motion.div
          ref={childrenRef}
          layout
          className="branch-children"
          data-depth={depth + 1}
          transition={springT}
          onLayoutAnimationComplete={measure}
        >
          {hLine && (
            <span
              className="branch-h-line"
              style={{ left: hLine.left, width: hLine.width }}
            />
          )}
          {node.children!.map((child) => (
            <div className="branch-child-slot" key={child.key}>
              <TreeBranch node={child} emphasize={emphasize} dim={dim} depth={depth + 1} />
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

export const springT = { type: "spring" as const, stiffness: 180, damping: 26, mass: 1 };

export { measureHLine };
