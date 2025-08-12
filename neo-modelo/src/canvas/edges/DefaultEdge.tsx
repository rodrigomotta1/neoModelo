import { Line, Text, Group } from "react-konva";
import type { Edge, ERState } from "@/core/types";

/**
 * Straight line edge connecting the centers of source/target nodes.
 * Renders simple labels near the midpoint (cardinality/participation).
 */
export function DefaultEdge({ edge, nodes }: { edge: Edge; nodes: ERState["nodes"] }) {
  const from = nodes.find((n) => n.id === edge.from);
  const to = nodes.find((n) => n.id === edge.to);
  if (!from || !to) return null;

  const x1 = from.pos.x, y1 = from.pos.y;
  const x2 = to.pos.x, y2 = to.pos.y;
  const mid = { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };

  return (
    <Group>
      <Line
        points={[x1, y1, x2, y2]}
        stroke={edge.selected ? "#2563eb" : "#111"}
        strokeWidth={edge.selected ? 2 : 1}
      />
      {(edge.cardinality || edge.participation) && (
        <Text
          x={mid.x + 6}
          y={mid.y + 6}
          text={[edge.cardinality ?? "", edge.participation ?? ""].filter(Boolean).join(" / ")}
          fontSize={12}
          fill="#111"
        />
      )}
    </Group>
  );
}
