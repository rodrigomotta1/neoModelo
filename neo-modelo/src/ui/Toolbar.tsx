import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useERStore } from "@/core/store";
import { ModeToggle } from "@/ui/ModeToggle";
import { Square, Diamond, Circle as CircleIcon, ZoomIn, ZoomOut, Grid as GridIcon, Magnet, Map as MapIcon } from "lucide-react";

export function Toolbar() {
  const addEntity = useERStore(s => s.addEntity);
  const addRelationship = useERStore(s => s.addRelationship);
  const addAttribute = useERStore(s => s.addAttribute);
  const toggleGrid = useERStore(s => s.toggleGrid);
  const toggleSnap = useERStore(s => s.toggleSnap);
  const toggleMinimap = useERStore(s => s.toggleMinimap);
  const showGrid = useERStore(s => s.settings.showGrid);
  const snap = useERStore(s => s.settings.snap);
  const showMinimap = useERStore(s => s.settings.showMinimap);
  const viewport = useERStore(s => s.viewport);
  const setViewport = useERStore(s => s.setViewport);

  const spawn = (fn: (pos: { x: number; y: number }) => void) =>
    fn({ x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 });

  const zoom = (delta: number) => setViewport(viewport.scale * delta, viewport.offset);

  return (
    <header className="h-14 w-full border-b border-border bg-background/60 backdrop-blur flex items-center px-4 py-2 gap-3">
      <Button variant="outline" size="sm" onClick={() => spawn(addEntity)} className="gap-1">
        <Square className="h-4 w-4" /> Entity
      </Button>
      <Button variant="outline" size="sm" onClick={() => spawn(addRelationship)} className="gap-1">
        <Diamond className="h-4 w-4" /> Relationship
      </Button>
      <Button variant="outline" size="sm" onClick={() => spawn(addAttribute)} className="gap-1">
        <CircleIcon className="h-4 w-4" /> Attribute
      </Button>

      <Separator orientation="vertical" className="mx-2 h-6" />

      <Button variant="ghost" size="sm" onClick={() => zoom(1.1)} className="gap-1">
        <ZoomIn className="h-4 w-4" /> Zoom +
      </Button>
      <Button variant="ghost" size="sm" onClick={() => zoom(1/1.1)} className="gap-1">
        <ZoomOut className="h-4 w-4" /> Zoom -
      </Button>

      <Separator orientation="vertical" className="mx-2 h-6" />

      <div className="flex items-center gap-1">
        <Label htmlFor="grid" className="text-xs flex items-center gap-1"><GridIcon className="h-3 w-3" /> Grid</Label>
        <Switch id="grid" checked={showGrid} onCheckedChange={toggleGrid} />
      </div>
      <div className="flex items-center gap-1">
        <Label htmlFor="snap" className="text-xs flex items-center gap-1"><Magnet className="h-3 w-3" /> Snap</Label>
        <Switch id="snap" checked={snap} onCheckedChange={toggleSnap} />
      </div>
      <div className="flex items-center gap-1">
        <Label htmlFor="map" className="text-xs flex items-center gap-1"><MapIcon className="h-3 w-3" /> Minimap</Label>
        <Switch id="map" checked={showMinimap} onCheckedChange={toggleMinimap} />
      </div>

      <div className="ml-auto"><ModeToggle /></div>
    </header>
  );
}
