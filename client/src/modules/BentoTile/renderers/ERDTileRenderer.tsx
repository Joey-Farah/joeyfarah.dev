import React, { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import type { ErdTileContent, ErdNode } from 'shared/types';

export interface ERDTileRendererProps {
  content: ErdTileContent;
  title: string;
}

// ─── Layout constants ────────────────────────────────────────────────────────

const NODE_WIDTH = 160;
const NODE_HEIGHT = 36;
const PADDING = 48;
const BRAND_PRIMARY = '#06b6d4';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function computeViewBox(nodes: ErdNode[]): { minX: number; minY: number; width: number; height: number } {
  if (nodes.length === 0) {
    return { minX: 0, minY: 0, width: 200, height: 200 };
  }
  const xs = nodes.map((n) => n.x);
  const ys = nodes.map((n) => n.y);
  const minX = Math.min(...xs) - PADDING;
  const minY = Math.min(...ys) - PADDING;
  const maxX = Math.max(...xs) + NODE_WIDTH + PADDING;
  const maxY = Math.max(...ys) + NODE_HEIGHT + PADDING;
  return { minX, minY, width: maxX - minX, height: maxY - minY };
}

function nodeCenter(node: ErdNode): { cx: number; cy: number } {
  return {
    cx: node.x + NODE_WIDTH / 2,
    cy: node.y + NODE_HEIGHT / 2,
  };
}

function edgeMidpoint(
  from: { cx: number; cy: number },
  to: { cx: number; cy: number }
): { mx: number; my: number } {
  return {
    mx: (from.cx + to.cx) / 2,
    my: (from.cy + to.cy) / 2,
  };
}

// ─── ERDTileRenderer ─────────────────────────────────────────────────────────

const ERDTileRenderer: React.FC<ERDTileRendererProps> = ({ content }) => {
  const { description, nodes, edges } = content;

  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-60px' });
  const prefersReducedMotion = useReducedMotion();

  const { minX, minY, width, height } = computeViewBox(nodes);
  const viewBox = `${minX} ${minY} ${width} ${height}`;

  // Build a lookup map for fast node access
  const nodeMap: Record<string, ErdNode> = {};
  for (const node of nodes) {
    nodeMap[node.id] = node;
  }

  // Animation should be 'complete' immediately when reduced-motion or in-view not yet triggered
  const shouldAnimate = isInView && !prefersReducedMotion;
  const pathLengthTarget = isInView ? 1 : 0;

  return (
    <div
      data-testid="erd-tile-renderer"
      ref={containerRef}
      className="flex flex-col flex-1 p-4 gap-3 font-mono text-brand-text text-sm overflow-auto min-h-0"
    >
      {/* Description */}
      <p className="text-brand-text/70 text-xs leading-relaxed shrink-0">
        {description}
      </p>

      {/* SVG ERD diagram */}
      {nodes.length > 0 && (
        <div className="flex-1 min-h-0">
          <svg
            viewBox={viewBox}
            className="w-full h-full"
            aria-label="Entity Relationship Diagram"
            role="img"
            style={{ minHeight: '200px' }}
          >
            {/* ── Edges ── */}
            {edges.map((edge, i) => {
              const fromNode = nodeMap[edge.from];
              const toNode = nodeMap[edge.to];
              if (!fromNode || !toNode) return null;

              const from = nodeCenter(fromNode);
              const to = nodeCenter(toNode);
              const { mx, my } = edgeMidpoint(from, to);
              const d = `M ${from.cx} ${from.cy} L ${to.cx} ${to.cy}`;

              return (
                <g key={`edge-${i}`}>
                  <motion.path
                    d={d}
                    stroke={BRAND_PRIMARY}
                    strokeWidth={1.5}
                    fill="none"
                    strokeOpacity={0.7}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: pathLengthTarget }}
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : {
                            duration: 0.8,
                            delay: i * 0.12,
                            ease: 'easeOut',
                          }
                    }
                  />
                  {/* Edge label near midpoint */}
                  <motion.text
                    x={mx}
                    y={my - 5}
                    textAnchor="middle"
                    fill={BRAND_PRIMARY}
                    fillOpacity={0.8}
                    fontSize={8}
                    fontFamily="JetBrains Mono, monospace"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: shouldAnimate || prefersReducedMotion ? 1 : 0 }}
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : { duration: 0.4, delay: i * 0.12 + 0.5 }
                    }
                  >
                    {edge.label}
                  </motion.text>
                </g>
              );
            })}

            {/* ── Nodes ── */}
            {nodes.map((node) => (
              <g key={node.id}>
                {/* Node background rect */}
                <rect
                  x={node.x}
                  y={node.y}
                  width={NODE_WIDTH}
                  height={NODE_HEIGHT}
                  rx={4}
                  fill="#0a1628"
                  stroke={BRAND_PRIMARY}
                  strokeWidth={1.5}
                  strokeOpacity={0.9}
                />
                {/* Node label */}
                <text
                  x={node.x + NODE_WIDTH / 2}
                  y={node.y + NODE_HEIGHT / 2 + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={BRAND_PRIMARY}
                  fontSize={9}
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="600"
                >
                  {node.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      )}

      {nodes.length === 0 && (
        <p className="text-brand-text/30 text-xs mt-2">{'// no nodes defined'}</p>
      )}
    </div>
  );
};

export default ERDTileRenderer;
