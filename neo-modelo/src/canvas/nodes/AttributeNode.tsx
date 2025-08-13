import { memo } from "react";
import { Group, Circle, Text } from "react-konva";
import { useERStore } from "@/core/store";
import type { AttributeNode as A } from "@/core/types";
import { useTheme } from "@/theme/useTheme";

const GRID = 20;

/** Attribute circle with label to the side. */
function AttributeNodeBase({ node, draggable = true, onStartConnect }: { node: A; draggable?: boolean; onStartConnect?: (id: string, pos: { x: number; y: number }) => void }) {
  const setNodePos = useERStore((s) => s.setNodePos);
  const setSelection = useERStore((s) => s.setSelection);
  const connect = useERStore((s) => s.connect);
  const snap = useERStore((s) => s.settings.snap);
  const { theme } = useTheme();

  const R = 12;

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
    >
      <Circle
        radius={R}
        stroke={node.selected ? "#2563eb" : theme === "dark" ? "#e5e7eb" : "#111"}
        fill={node.key ? "#000" : theme === "dark" ? "#27272a" : "#fff"}
        strokeWidth={node.selected ? 2 : 1}
        dash={node.optional ? [4, 4] : undefined}
      />
      {node.multivalued && (
        <Circle
          radius={R - 4}
          stroke={theme === "dark" ? "#e5e7eb" : "#111"}
        />
      )}
      <Text
        text={node.name}
        x={R + 6}
        y={-6}
        fontFamily="var(--font-sans)"
        fill={theme === "dark" ? "#e5e7eb" : "#111"}
      />

      {[{x:0,y:-R},{x:R,y:0},{x:0,y:R},{x:-R,y:0}].map((a,i)=>(
        <Circle key={i} x={a.x} y={a.y} radius={4} fill={theme === "dark" ? "#27272a" : "#fff"} stroke="#2563eb" onMouseDown={(e)=>{e.cancelBubble=true; onStartConnect?.(node.id,{x:node.pos.x + a.x,y:node.pos.y + a.y});}} />
      ))}
    </Group>
  );
}

export const AttributeNode = memo(AttributeNodeBase, (prev, next) => {
  const a = prev.node, b = next.node;
  return (
    a.id === b.id &&
    a.name === b.name &&
    a.pos.x === b.pos.x &&
    a.pos.y === b.pos.y &&
    a.selected === b.selected &&
    a.key === b.key &&
    a.derived === b.derived &&
    a.multivalued === b.multivalued &&
    a.optional === b.optional
  );
});
