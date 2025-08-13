import { Line, Text, Group } from "react-konva";
import type { Edge, ERState } from "@/core/types";
import { useTheme } from "@/theme/useTheme";
import type { KonvaEventObject } from "konva/lib/Node";

function borderPoint(node: ERState['nodes'][number], target: { x: number; y: number }) {
  const dx = target.x - node.pos.x;
  const dy = target.y - node.pos.y;
  switch (node.kind) {
    case 'entity': {
      const W = Math.max(100, node.name.length * 9);
      const H = 50;
      const hw = W / 2, hh = H / 2;
      const tx = dx !== 0 ? hw / Math.abs(dx) : Infinity;
      const ty = dy !== 0 ? hh / Math.abs(dy) : Infinity;
      const t = Math.min(tx, ty);
      return { x: node.pos.x + dx * t, y: node.pos.y + dy * t };
    }
    case 'relationship': {
      const W = Math.max(120, node.name.length * 10);
      const H = W * 0.6;
      const hx = W / 2, hy = H / 2;
      const t = 1 / (Math.abs(dx) / hx + Math.abs(dy) / hy);
      return { x: node.pos.x + dx * t, y: node.pos.y + dy * t };
    }
    case 'attribute': {
      const R = 12;
      const len = Math.hypot(dx, dy) || 1;
      const t = R / len;
      return { x: node.pos.x + dx * t, y: node.pos.y + dy * t };
    }
    default:
      return { x: node.pos.x, y: node.pos.y };
  }
}

/**
 * Straight line edge connecting the centers of source/target nodes.
 * Renders simple labels near the midpoint (cardinality/participation).
 */
export function DefaultEdge({ edge, nodes, onContextMenu }: { edge: Edge; nodes: ERState["nodes"]; onContextMenu?: (e: KonvaEventObject<MouseEvent>) => void }) {
  const from = nodes.find((n) => n.id === edge.from);
  const to = nodes.find((n) => n.id === edge.to);
  const { theme } = useTheme();
  if (!from || !to) return null;

  const p1 = borderPoint(from, to.pos);
  const p2 = borderPoint(to, from.pos);
  const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

  return (
    <Group onContextMenu={(e) => onContextMenu?.(e)}>
      <Line
        points={[p1.x, p1.y, p2.x, p2.y]}
        stroke={edge.selected ? "#2563eb" : theme === "dark" ? "#e5e7eb" : "#111"}
        strokeWidth={edge.selected ? 2 : 1}
      />
      {(edge.cardinality || edge.participation) && (
        <Text
          x={mid.x + 6}
          y={mid.y + 6}
          text={[edge.cardinality ?? "", edge.participation ?? ""].filter(Boolean).join(" / ")}
          fontSize={12}
          fontFamily="var(--font-sans)"
          fill={theme === "dark" ? "#e5e7eb" : "#111"}
        />
      )}
    </Group>
  );
}
