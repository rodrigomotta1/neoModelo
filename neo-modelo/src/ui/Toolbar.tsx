import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useERStore } from "@/core/store";
import { ModeToggle } from "@/ui/ModeToggle";

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
    <header className="h-11 w-full border-b border-border bg-background/60 backdrop-blur flex items-center px-2 gap-2">
      <Button variant="outline" size="sm" onClick={() => spawn(addEntity)}>+ Entity</Button>
      <Button variant="outline" size="sm" onClick={() => spawn(addRelationship)}>+ Relationship</Button>
      <Button variant="outline" size="sm" onClick={() => spawn(addAttribute)}>+ Attribute</Button>

      <Separator orientation="vertical" className="mx-2 h-6" />

      <Button variant="ghost" size="sm" onClick={() => zoom(1.1)}>Zoom +</Button>
      <Button variant="ghost" size="sm" onClick={() => zoom(1/1.1)}>Zoom -</Button>

      <Separator orientation="vertical" className="mx-2 h-6" />

      <div className="flex items-center gap-1">
        <Label htmlFor="grid" className="text-xs">Grid</Label>
        <Switch id="grid" checked={showGrid} onCheckedChange={toggleGrid} />
      </div>
      <div className="flex items-center gap-1">
        <Label htmlFor="snap" className="text-xs">Snap</Label>
        <Switch id="snap" checked={snap} onCheckedChange={toggleSnap} />
      </div>
      <div className="flex items-center gap-1">
        <Label htmlFor="map" className="text-xs">Minimap</Label>
        <Switch id="map" checked={showMinimap} onCheckedChange={toggleMinimap} />
      </div>

      <div className="ml-auto"><ModeToggle /></div>
    </header>
  );
}
