import { memo } from "react";
import { Group, Rect, Text } from "react-konva";
import { useERStore } from "@/core/store";
import type { EntityNode as E } from "@/core/types";

const GRID = 20;

/** Entity rectangle with optional double border when weak. */
function EntityNodeBase({ node }: { node: E }) {
  const setNodePos = useERStore((s) => s.setNodePos);
  const setSelection = useERStore((s) => s.setSelection);

  const W = Math.max(100, node.name.length * 9);
  const H = 50;

  return (
    <Group
      x={node.pos.x}
      y={node.pos.y}
      draggable
      /* Snap is applied here without touching React/Zustand */
      dragBoundFunc={(pos) => ({
        x: Math.round(pos.x / GRID) * GRID,
        y: Math.round(pos.y / GRID) * GRID,
      })}
      /* Commit once at the end (cheap) */
      onDragEnd={(e) => setNodePos(node.id, { x: e.target.x(), y: e.target.y() }, 1)}
      onClick={(e) => {
        e.cancelBubble = true;
        setSelection([node.id]);
      }}
    >
      <Rect
        width={W}
        height={H}
        cornerRadius={6}
        fill="#fff"
        stroke={node.selected ? "#2563eb" : "#111"}
        strokeWidth={node.selected ? 2 : 1}
      />
      <Text text={node.name} x={8} y={H / 2 - 8} />
      {node.weak && (
        <Rect
          width={W}
          height={H}
          cornerRadius={6}
          listening={false}
          stroke="#111"
          strokeWidth={1}
        />
      )}
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
