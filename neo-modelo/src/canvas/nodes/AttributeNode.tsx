import { memo } from "react";
import { Group, Ellipse, Text, Line } from "react-konva";
import { useERStore } from "@/core/store";
import type { AttributeNode as A } from "@/core/types";

const GRID = 20;

/** Attribute ellipse; styles: key (underline), derived (dashed), multivalued (double ellipse). */
function AttributeNodeBase({ node }: { node: A }) {
  const setNodePos = useERStore((s) => s.setNodePos);
  const setSelection = useERStore((s) => s.setSelection);

  const W = Math.max(90, node.name.length * 9), H = 40;

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
      <Ellipse
        radiusX={W / 2}
        radiusY={H / 2}
        stroke={node.selected ? "#2563eb" : "#111"}
        fill="#fff"
        strokeWidth={node.selected ? 2 : 1}
      />
      <Text text={node.name} x={-W / 2 + 8} y={-8} />
      {node.multivalued && <Ellipse radiusX={W / 2 - 6} radiusY={H / 2 - 6} stroke="#111" />}
      {node.derived && <Line points={[-W / 2, H / 2, W / 2, -H / 2]} stroke="#111" dash={[4, 4]} />}
      {node.key && <Line points={[-W / 2, H / 2 + 6, W / 2, H / 2 + 6]} stroke="#111" />}
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
    a.multivalued === b.multivalued
  );
});
