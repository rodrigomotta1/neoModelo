import { Stage, Layer, Line } from "react-konva";
import { useRef, useState, useCallback } from "react";
import { useERStore } from "@/core/store";
import { EntityNode } from "./nodes/EntityNode";
import { RelationshipNode } from "./nodes/RelationshipNode";
import { AttributeNode } from "./nodes/AttributeNode";
import { DefaultEdge } from "./edges/DefaultEdge";

export const stageRefGlobal: { current: any } = { current: null };

const GRID = 20;

function GridLayer({
  width, height, offset, scale,
}: { width: number; height: number; offset: { x: number; y: number }; scale: number }) {
  const lines: number[][] = [];
  const step = GRID * scale;
  for (let x = -offset.x % step; x < width; x += step) lines.push([x, 0, x, height]);
  for (let y = -offset.y % step; y < height; y += step) lines.push([0, y, width, y]);
  return (
    <Layer listening={false}>
      {lines.map((pts, i) => (
        <Line key={i} points={pts as any} stroke="#e5e7eb" strokeWidth={1} />
      ))}
    </Layer>
  );
}

export function Canvas() {
  // ✅ Read slices separately to keep stable snapshots
  const nodes = useERStore(s => s.nodes);
  const edges = useERStore(s => s.edges);
  const viewport = useERStore(s => s.viewport);
  const setViewport = useERStore(s => s.setViewport);
  const clearSelection = useERStore(s => s.clearSelection);

  const stageRef = useRef<any>(null);
  stageRefGlobal.current = stageRef.current;

  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  const onWheel = useCallback((e: any) => {
    e.evt.preventDefault();
    const scaleBy = 1.06;
    const old = viewport.scale;
    const mouse = { x: e.evt.offsetX, y: e.evt.offsetY };
    const next = e.evt.deltaY > 0 ? old / scaleBy : old * scaleBy;
    const world = { x: (mouse.x - viewport.offset.x) / old, y: (mouse.y - viewport.offset.y) / old };
    const offset = { x: mouse.x - world.x * next, y: mouse.y - world.y * next };
    setViewport(next, offset);
  }, [viewport.scale, viewport.offset.x, viewport.offset.y, setViewport]);

  const onMouseDown = (e: any) => {
    if (e.target === e.target.getStage()) {
      setDragStart({ x: e.evt.clientX, y: e.evt.clientY });
      clearSelection();
    }
  };
  const onMouseMove = (e: any) => {
    if (!dragStart) return;
    const dx = e.evt.clientX - dragStart.x, dy = e.evt.clientY - dragStart.y;
    setDragStart({ x: e.evt.clientX, y: e.evt.clientY });
    setViewport(viewport.scale, { x: viewport.offset.x + dx, y: viewport.offset.y + dy });
  };
  const onMouseUp = () => setDragStart(null);

  const w = window.innerWidth, h = window.innerHeight;

  return (
    <div className="h-full w-full">
      <Stage
        ref={stageRef}
        width={w} height={h}
        x={viewport.offset.x} y={viewport.offset.y}
        scaleX={viewport.scale} scaleY={viewport.scale}
        /* Konva performance knobs */
        perfectDrawEnabled={false}
        imageSmoothingEnabled={false}
        onWheel={onWheel} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp}
      >
        <GridLayer width={w} height={h} offset={viewport.offset} scale={viewport.scale} />

        <Layer>
          {edges.map((e) => (
            <DefaultEdge key={e.id} edge={e} nodes={nodes} />
          ))}
        </Layer>

        <Layer>
          {nodes.map((n) => {
            switch (n.kind) {
              case "entity": return <EntityNode key={n.id} node={n} />;
              case "relationship": return <RelationshipNode key={n.id} node={n} />;
              case "attribute": return <AttributeNode key={n.id} node={n} />;
              default: return null;
            }
          })}
        </Layer>
      </Stage>
    </div>
  );
}
