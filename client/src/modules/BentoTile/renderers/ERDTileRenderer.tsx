import React, { useMemo, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import type { ErdTileContent, ErdNode, ErdEdge } from 'shared/types';

export interface ERDTileRendererProps {
  content: ErdTileContent;
  title: string;
}

// ─── Layout constants ────────────────────────────────────────────────────────

const NODE_WIDTH = 200;
const NODE_HEIGHT = 44;
const PADDING = 48;
const BRAND_PRIMARY = '#06b6d4';

// Focus state drives both styling and test assertions.
type FocusState = 'default' | 'selected' | 'active' | 'dimmed';

// Opacity per focus state — 'active' = a one-hop neighbor of the selection.
const NODE_OPACITY: Record<FocusState, number> = {
  default: 1,
  selected: 1,
  active: 1,
  dimmed: 0.18,
};
const EDGE_OPACITY: Record<FocusState, number> = {
  default: 0.7,
  selected: 0.95, // unused for edges, kept for the shared shape
  active: 0.95,
  dimmed: 0.1,
};

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

/** One-hop neighbourhood of `id` (the node itself plus every directly-linked node). */
function neighbourhood(id: string, edges: ErdEdge[]): Set<string> {
  const set = new Set<string>([id]);
  for (const e of edges) {
    if (e.from === id) set.add(e.to);
    if (e.to === id) set.add(e.from);
  }
  return set;
}

// ─── ERDTileRenderer ─────────────────────────────────────────────────────────

const ERDTileRenderer: React.FC<ERDTileRendererProps> = ({ content }) => {
  const { description, nodes, edges, status } = content;

  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-60px' });
  const prefersReducedMotion = useReducedMotion();

  // Which table the visitor is currently tracing (null = full diagram).
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { minX, minY, width, height } = computeViewBox(nodes);
  const viewBox = `${minX} ${minY} ${width} ${height}`;

  // Build a lookup map for fast node access
  const nodeMap: Record<string, ErdNode> = {};
  for (const node of nodes) {
    nodeMap[node.id] = node;
  }

  // One-hop neighbourhood of the current selection (null when nothing selected).
  const activeIds = useMemo(
    () => (selectedId ? neighbourhood(selectedId, edges) : null),
    [selectedId, edges]
  );

  const nodeFocus = (id: string): FocusState => {
    if (!selectedId) return 'default';
    if (id === selectedId) return 'selected';
    return activeIds?.has(id) ? 'active' : 'dimmed';
  };

  const edgeFocus = (edge: ErdEdge): FocusState => {
    if (!selectedId) return 'default';
    return edge.from === selectedId || edge.to === selectedId ? 'active' : 'dimmed';
  };

  const toggle = (id: string) => setSelectedId((cur) => (cur === id ? null : id));
  const reset = () => setSelectedId(null);

  // Animation should be 'complete' immediately when reduced-motion or in-view not yet triggered
  const shouldAnimate = isInView && !prefersReducedMotion;
  const pathLengthTarget = isInView ? 1 : 0;
  const transition = prefersReducedMotion ? undefined : 'opacity 0.25s ease';

  return (
    <div
      data-testid="erd-tile-renderer"
      ref={containerRef}
      className="flex flex-col md:flex-row flex-1 p-4 gap-4 font-mono text-brand-text text-sm overflow-hidden min-h-0 items-start"
    >
      {/* Left: text content */}
      <div className="flex flex-col gap-3 w-full md:w-2/5 md:shrink-0">
        {/* Status badge */}
        {status && (
          <div className="shrink-0">
            {status === 'live' ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-mono">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500" aria-hidden="true" />
                <span className="text-green-400">Live</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-mono">
                <span className="inline-block w-2 h-2 rounded-full bg-yellow-400" aria-hidden="true" />
                <span className="text-yellow-300">In Development</span>
              </span>
            )}
          </div>
        )}
        <p className="text-brand-text/85 text-xs leading-relaxed">
          {description}
        </p>
        {/* Discoverability hint — this is what makes people click. */}
        {nodes.length > 0 && (
          <p className="text-brand-primary/70 text-[11px] leading-relaxed select-none" aria-hidden="true">
            {selectedId
              ? '// click empty space to reset'
              : '// click a table to trace its connections'}
          </p>
        )}
      </div>

      {/* Right: ERD diagram */}
      {nodes.length > 0 && (
        <div className="flex-1 min-h-0 min-w-0 flex items-start md:-mt-8">
          <svg
            viewBox={viewBox}
            className="w-full h-full"
            role="group"
            aria-label="Entity Relationship Diagram — click a table to trace its connections"
            data-testid="erd-surface"
            onClick={reset}
            style={{ minHeight: '280px', maxHeight: '380px' }}
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
              const focus = edgeFocus(edge);
              // Labels: hidden when dimmed; otherwise follow the draw-in animation.
              const labelVisible = (shouldAnimate || prefersReducedMotion) && focus !== 'dimmed';

              return (
                <g key={`edge-${i}`} data-testid={`erd-edge-${i}`} data-focus={focus}>
                  <motion.path
                    d={d}
                    stroke={BRAND_PRIMARY}
                    strokeWidth={focus === 'active' ? 2.25 : 1.5}
                    fill="none"
                    style={{ transition }}
                    strokeOpacity={EDGE_OPACITY[focus]}
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
                    fontSize={11}
                    fontFamily="JetBrains Mono, monospace"
                    style={{ transition }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: labelVisible ? 1 : 0 }}
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
            {nodes.map((node) => {
              const focus = nodeFocus(node.id);
              const isSelected = focus === 'selected';
              const handleClick = (e: React.MouseEvent) => {
                e.stopPropagation(); // don't let the surface reset fire
                toggle(node.id);
              };
              const handleKeyDown = (e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  toggle(node.id);
                }
              };
              return (
                <g
                  key={node.id}
                  data-testid={`erd-node-${node.id}`}
                  data-focus={focus}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  aria-label={`${node.label} table — trace connections`}
                  onClick={handleClick}
                  onKeyDown={handleKeyDown}
                  style={{ cursor: 'pointer', opacity: NODE_OPACITY[focus], transition }}
                >
                  {/* Node background rect */}
                  <rect
                    x={node.x}
                    y={node.y}
                    width={NODE_WIDTH}
                    height={NODE_HEIGHT}
                    rx={4}
                    fill={isSelected ? '#0d2740' : '#0a1628'}
                    stroke={BRAND_PRIMARY}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                    strokeOpacity={0.9}
                  />
                  {/* Node label */}
                  <text
                    x={node.x + NODE_WIDTH / 2}
                    y={node.y + NODE_HEIGHT / 2 + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={BRAND_PRIMARY}
                    fontSize={12}
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="600"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {nodes.length === 0 && (
        <p className="text-brand-text/60 text-xs mt-2">{'// no nodes defined'}</p>
      )}
    </div>

  );
};

export default ERDTileRenderer;
