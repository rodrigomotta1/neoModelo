import { Stage, Layer, Line } from "react-konva";
import { useRef, useState, useCallback, useLayoutEffect } from "react";
import { useERStore } from "@/core/store";
import { EntityNode } from "./nodes/EntityNode";
import { RelationshipNode } from "./nodes/RelationshipNode";
import { AttributeNode } from "./nodes/AttributeNode";
import { DefaultEdge } from "./edges/DefaultEdge";
import { MiniMap } from "./MiniMap";
import { ContextMenu, ContextMenuContent, ContextMenuItem } from "@/components/ui/context-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/theme/useTheme";
import type { KonvaEventObject } from "konva/lib/Node";
import type { Stage as StageType } from "konva/lib/Stage";
import { Plus, Trash2 } from "lucide-react";

export const stageRefGlobal: { current: StageType | null } = { current: null };

const GRID = 20;

function GridLayer({
  width, height, offset, scale, color,
}: { width: number; height: number; offset: { x: number; y: number }; scale: number; color: string }) {
  const lines: number[][] = [];
  const step = GRID * scale;
  for (let x = -offset.x % step; x < width; x += step) lines.push([x, 0, x, height]);
  for (let y = -offset.y % step; y < height; y += step) lines.push([0, y, width, y]);
  return (
    <Layer listening={false}>
      {lines.map((pts, i) => (
        <Line key={i} points={pts} stroke={color} strokeWidth={1} />
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
  const showGrid = useERStore(s => s.settings.showGrid);
  const showMinimap = useERStore(s => s.settings.showMinimap);
  const addAttribute = useERStore(s => s.addAttribute);
  const setNodeProp = useERStore(s => s.setNodeProp);
  const connect = useERStore(s => s.connect);
  const { theme } = useTheme();

  const stageRef = useRef<StageType | null>(null);
  useLayoutEffect(() => {
    stageRefGlobal.current = stageRef.current;
  });

  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [menu, setMenu] = useState<{ id: string; kind: string; x: number; y: number } | null>(null);
  const [attrParent, setAttrParent] = useState<string | null>(null);
  const [attrName, setAttrName] = useState("");
  const [attrDomain, setAttrDomain] = useState("");
  const [attrMulti, setAttrMulti] = useState(false);
  const [attrOpt, setAttrOpt] = useState(false);
  const [attrKey, setAttrKey] = useState(false);
  const [connection, setConnection] = useState<{ from: string; start: { x: number; y: number }; end: { x: number; y: number } } | null>(null);

  const startConnect = (id: string, start: { x: number; y: number }) => {
    setConnection({ from: id, start, end: start });
  };

  const onWheel = useCallback((e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const scaleBy = 1.06;
    const old = viewport.scale;
    const mouse = { x: e.evt.offsetX, y: e.evt.offsetY };
    const next = e.evt.deltaY > 0 ? old / scaleBy : old * scaleBy;
    const world = { x: (mouse.x - viewport.offset.x) / old, y: (mouse.y - viewport.offset.y) / old };
    const offset = { x: mouse.x - world.x * next, y: mouse.y - world.y * next };
    setViewport(next, offset);
  }, [viewport.scale, viewport.offset.x, viewport.offset.y, setViewport]);

  const onMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage() && !connection) {
      setDragStart({ x: e.evt.clientX, y: e.evt.clientY });
      clearSelection();
    }
  };
  const onMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (connection) {
      const pos = stageRef.current?.getPointerPosition();
      if (pos) setConnection(c => c ? { ...c, end: pos } : null);
      return;
    }
    if (!dragStart) return;
    const dx = e.evt.clientX - dragStart.x, dy = e.evt.clientY - dragStart.y;
    setDragStart({ x: e.evt.clientX, y: e.evt.clientY });
    setViewport(viewport.scale, { x: viewport.offset.x + dx, y: viewport.offset.y + dy });
  };
  const onMouseUp = () => {
    if (connection) {
      const pos = stageRef.current?.getPointerPosition();
      if (pos) {
        const target = useERStore.getState().nodes.find(n => {
          const dx = n.pos.x - pos.x;
          const dy = n.pos.y - pos.y;
          return Math.hypot(dx, dy) < 30 && n.id !== connection.from;
        });
        if (target) connect(connection.from, target.id);
      }
      setConnection(null);
      return;
    }
    setDragStart(null);
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const update = () => {
      if (containerRef.current) setSize({ w: containerRef.current.clientWidth, h: containerRef.current.clientHeight });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const gridColor = theme === "dark" ? "#3f3f46" : "#e5e7eb";

  const handleAddAttr = () => {
    const parent = nodes.find(n => n.id === attrParent);
    if (!parent) return;
    const id = addAttribute({ x: parent.pos.x + 80, y: parent.pos.y }, attrName || "attr");
    setNodeProp(id, { multivalued: attrMulti, optional: attrOpt, key: attrKey });
    connect(parent.id, id);
    setAttrParent(null);
    setAttrName("");
    setAttrDomain("");
    setAttrMulti(false);
    setAttrOpt(false);
    setAttrKey(false);
  };

  return (
    <div ref={containerRef} className="h-full w-full relative overflow-hidden">
      <Stage
        ref={stageRef}
        width={size.w} height={size.h}
        x={viewport.offset.x} y={viewport.offset.y}
        scaleX={viewport.scale} scaleY={viewport.scale}
        perfectDrawEnabled={false}
        imageSmoothingEnabled={false}
        onWheel={onWheel} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp}
      >
        {showGrid && <GridLayer width={size.w} height={size.h} offset={viewport.offset} scale={viewport.scale} color={gridColor} />}

        <Layer>
          {edges.map((e) => (
            <DefaultEdge key={e.id} edge={e} nodes={nodes} onContextMenu={(evt: KonvaEventObject<MouseEvent>) => {
              evt.evt.preventDefault();
              setMenu({ id: e.id, kind: "edge", x: evt.evt.clientX, y: evt.evt.clientY });
            }} />
          ))}
        </Layer>

        <Layer>
          {nodes.map((n) => {
            const handler = (evt: KonvaEventObject<MouseEvent>) => {
              evt.evt.preventDefault();
              setMenu({ id: n.id, kind: n.kind, x: evt.evt.clientX, y: evt.evt.clientY });
            };
            switch (n.kind) {
              case "entity": return <EntityNode key={n.id} node={n} onContextMenu={handler} onStartConnect={startConnect} />;
              case "relationship": return <RelationshipNode key={n.id} node={n} onContextMenu={handler} onStartConnect={startConnect} />;
              case "attribute": return <AttributeNode key={n.id} node={n} draggable={true} onStartConnect={startConnect} />;
              default: return null;
            }
          })}
        </Layer>

        {connection && (
          <Layer listening={false}>
            <Line points={[connection.start.x, connection.start.y, connection.end.x, connection.end.y]} stroke="#2563eb" dash={[4,4]} />
          </Layer>
        )}
      </Stage>

      {showMinimap && (
        <div className="absolute top-2 right-2 bg-muted/60">
          <MiniMap />
        </div>
      )}

      {menu && (
        <ContextMenu open onOpenChange={() => setMenu(null)}>
          <ContextMenuContent style={{ position: "absolute", top: menu.y, left: menu.x }} className="w-48">
            {(menu.kind === "entity" || menu.kind === "relationship") && (
              <ContextMenuItem onSelect={() => { setAttrParent(menu.id); setMenu(null); }}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar atributos
              </ContextMenuItem>
            )}
            <ContextMenuItem onSelect={() => {
              if (menu.kind === "edge") {
                useERStore.getState().setSelection([], [menu.id]);
              } else {
                useERStore.getState().setSelection([menu.id]);
              }
              useERStore.getState().deleteSelected();
              setMenu(null);
            }}>
              <Trash2 className="mr-2 h-4 w-4" /> Deletar
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      )}

      <Dialog open={!!attrParent} onOpenChange={(o) => !o && setAttrParent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Novo atributo</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="attr-name">Nome</Label>
            <Input id="attr-name" value={attrName} onChange={(e) => setAttrName(e.target.value)} />
            <Label htmlFor="attr-domain">Domínio (opcional)</Label>
            <Input id="attr-domain" value={attrDomain} onChange={(e) => setAttrDomain(e.target.value)} />
            <div className="flex items-center space-x-2 pt-2">
              <Switch id="attr-multi" checked={attrMulti} onCheckedChange={setAttrMulti} />
              <Label htmlFor="attr-multi">Multivalorado</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="attr-opt" checked={attrOpt} onCheckedChange={setAttrOpt} />
              <Label htmlFor="attr-opt">Opcional</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="attr-key" checked={attrKey} onCheckedChange={setAttrKey} />
              <Label htmlFor="attr-key">Identificador</Label>
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={handleAddAttr} className="gap-2"><Plus className="h-4 w-4" /> Adicionar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
