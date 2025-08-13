import { memo, useState } from "react";
import { Group, Rect, Text, Circle } from "react-konva";
import { useERStore } from "@/core/store";
import type { EntityNode as E } from "@/core/types";
import { useTheme } from "@/theme/useTheme";
import type { KonvaEventObject } from "konva/lib/Node";

const GRID = 20;

/** Entity rectangle with optional double border when weak. */
function EntityNodeBase({ node, onContextMenu, draggable = true, onStartConnect }: { node: E; onContextMenu?: (e: KonvaEventObject<MouseEvent>) => void; draggable?: boolean; onStartConnect?: (id: string, pos: { x: number; y: number }) => void }) {
  const setNodePos = useERStore((s) => s.setNodePos);
  const setSelection = useERStore((s) => s.setSelection);
  const connect = useERStore((s) => s.connect);
  const snap = useERStore((s) => s.settings.snap);
  const { theme } = useTheme();

  const [hover, setHover] = useState(false);

  const W = Math.max(100, node.name.length * 9);
  const H = 50;

  return (
    <Group
      x={node.pos.x}
      y={node.pos.y}
      draggable={draggable}
      dragBoundFunc={(pos) => (
        snap ? { x: Math.round(pos.x / GRID) * GRID, y: Math.round(pos.y / GRID) * GRID } : pos
      )}
      onDragEnd={(e) => setNodePos(node.id, { x: e.target.x(), y: e.target.y() }, snap ? GRID : 1)}
      onClick={(e) => {
        e.cancelBubble = true;
        const ids = useERStore.getState().nodes.filter(n => n.selected).map(n => n.id);
        if (e.evt.ctrlKey && ids.length === 1 && ids[0] !== node.id) {
          connect(ids[0], node.id);
        } else if (e.evt.shiftKey) {
          setSelection(Array.from(new Set([...ids, node.id])));
        } else {
          setSelection([node.id]);
        }
      }}
      onContextMenu={(e) => {
        onContextMenu?.(e);
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Rect
        x={-W/2}
        y={-H/2}
        width={W}
        height={H}
        fill={theme === "dark" ? "#27272a" : "#fff"}
        stroke={node.selected ? "#2563eb" : theme === "dark" ? "#e5e7eb" : "#111"}
        strokeWidth={node.selected ? 2 : 1}
      />
      <Text
        text={node.name}
        x={-W/2}
        y={-H/2}
        width={W}
        height={H}
        align="center"
        verticalAlign="middle"
        fontFamily="var(--font-sans)"
        fill={theme === "dark" ? "#e5e7eb" : "#111"}
      />
      {node.weak && (
        <Rect
          x={-W/2}
          y={-H/2}
          width={W}
          height={H}
          listening={false}
          stroke={theme === "dark" ? "#e5e7eb" : "#111"}
          strokeWidth={1}
        />
      )}

      {[{x:0,y:-H/2},{x:W/2,y:0},{x:0,y:H/2},{x:-W/2,y:0}].map((a,i)=>(
        <Circle
          key={i}
          x={a.x}
          y={a.y}
          radius={4}
          visible={hover}
          fill={theme === "dark" ? "#27272a" : "#fff"}
          stroke="#2563eb"
          onMouseDown={(e)=>{e.cancelBubble=true; onStartConnect?.(node.id,{x:node.pos.x + a.x,y:node.pos.y + a.y});}}
        />
      ))}
    </Group>
  );
}

/** Memoize to avoid re-render on unrelated store updates */
export const EntityNode = memo(EntityNodeBase, (prev, next) => {
  const a = prev.node, b = next.node;
  return (
    a.id === b.id &&
    a.name === b.name &&
    a.pos.x === b.pos.x &&
    a.pos.y === b.pos.y &&
    a.selected === b.selected &&
    a.weak === b.weak
  );
});
