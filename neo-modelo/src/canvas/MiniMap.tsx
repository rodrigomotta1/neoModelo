import { Stage, Layer, Line, Rect, Circle } from "react-konva";
import { useERStore } from "@/core/store";
import { useTheme } from "@/theme/useTheme";
import { stageRefGlobal } from "./Canvas";

export function MiniMap() {
  const nodes = useERStore(s => s.nodes);
  const edges = useERStore(s => s.edges);
  const viewport = useERStore(s => s.viewport);
  const { theme } = useTheme();

  const w = 200, h = 150;
  const scale = 0.2;
  const stroke = theme === "dark" ? "#a1a1aa" : "#6b7280";

  return (
    <Stage
      width={w}
      height={h}
      scaleX={scale}
      scaleY={scale}
      x={-(viewport.offset.x / viewport.scale) * scale}
      y={-(viewport.offset.y / viewport.scale) * scale}
      listening={false}
    >
      <Layer>
        {edges.map(e => {
          const from = nodes.find(n => n.id === e.from);
          const to = nodes.find(n => n.id === e.to);
          if (!from || !to) return null;
          return <Line key={e.id} points={[from.pos.x, from.pos.y, to.pos.x, to.pos.y]} stroke={stroke} />;
        })}
      </Layer>
      <Layer>
        {nodes.map(n => {
          switch (n.kind) {
            case "entity": {
              return <Rect key={n.id} x={n.pos.x - 50} y={n.pos.y - 25} width={100} height={50} stroke={stroke} />;
            }
            case "relationship": {
              const W = 60, H = 40; const d = [0, -H / 2, W / 2, 0, 0, H / 2, -W / 2, 0];
              return <Line key={n.id} x={n.pos.x} y={n.pos.y} points={d} closed stroke={stroke} />;
            }
            case "attribute": {
              return <Circle key={n.id} x={n.pos.x} y={n.pos.y} radius={12} stroke={stroke} />;
            }
            default:
              return null;
          }
        })}
      </Layer>
      <Layer>
        {(() => {
          const stage = stageRefGlobal.current;
          if (!stage) return null;
          const vw = stage.width() / viewport.scale;
          const vh = stage.height() / viewport.scale;
          return <Rect x={-viewport.offset.x} y={-viewport.offset.y} width={vw} height={vh} stroke={"#2563eb"} />;
        })()}
      </Layer>
    </Stage>
  );
}
