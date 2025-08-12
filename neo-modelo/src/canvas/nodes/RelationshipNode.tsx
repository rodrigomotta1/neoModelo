import { memo } from "react";
import { Group, Line, Text } from "react-konva";
import { useERStore } from "@/core/store";
import type { RelationshipNode as R } from "@/core/types";

const GRID = 20;

/** Diamond shape for relationship; double outline when identifying. */
function RelationshipNodeBase({ node }: { node: R }) {
  const setNodePos = useERStore((s) => s.setNodePos);
  const setSelection = useERStore((s) => s.setSelection);

  const S = Math.max(80, node.name.length * 9);
  const diamond = [0, -S / 2, S / 2, 0, 0, S / 2, -S / 2, 0];

  return (
    <Group
      x={node.pos.x}
      y={node.pos.y}
      draggable
      dragBoundFunc={(pos) => ({
        x: Math.round(pos.x / GRID) * GRID,
        y: Math.round(pos.y / GRID) * GRID,
      })}
      onDragEnd={(e) => setNodePos(node.id, { x: e.target.x(), y: e.target.y() }, 1)}
      onClick={(e) => {
        e.cancelBubble = true;
        setSelection([node.id]);
      }}
    >
      <Line
        points={diamond}
        closed
        stroke={node.selected ? "#2563eb" : "#111"}
        fill="#fff"
        strokeWidth={node.selected ? 2 : 1}
      />
      <Text text={node.name} x={-S / 2 + 8} y={-10} />
      {node.identifying && <Line points={diamond.map((v) => v * 0.9)} closed stroke="#111" />}
    </Group>
  );
}

export const RelationshipNode = memo(RelationshipNodeBase, (prev, next) => {
  const a = prev.node, b = next.node;
  return (
    a.id === b.id &&
    a.name === b.name &&
    a.pos.x === b.pos.x &&
    a.pos.y === b.pos.y &&
    a.selected === b.selected &&
    a.identifying === b.identifying
  );
});
