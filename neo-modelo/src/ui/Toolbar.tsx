import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useERStore } from "@/core/store";
import { ModeToggle } from "@/ui/ModeToggle";
import { exportStageToPNG } from "@/core/exporters";
import { stageRefGlobal } from "@/canvas/Canvas";
import { serializeState, parseState } from "@/core/dsl";
import { useState } from "react";

export function Toolbar() {
  // ✅ pick only the actions we need
  const addEntity = useERStore(s => s.addEntity);
  const addRelationship = useERStore(s => s.addRelationship);
  const addAttribute = useERStore(s => s.addAttribute);
  const undo = useERStore(s => s.undo);
  const redo = useERStore(s => s.redo);
  const reset = useERStore(s => s.reset);
  const toggleProperties = useERStore(s => s.toggleProperties);

  const [dsl, setDsl] = useState("");

  const spawn = (fn: (pos: { x: number; y: number }) => void) =>
    fn({ x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 });

  return (
    <header className="h-11 w-full border-b border-border bg-background/60 backdrop-blur flex items-center px-2 gap-2">
      <Button variant="outline" size="sm" onClick={() => spawn(addEntity)}>+ Entity</Button>
      <Button variant="outline" size="sm" onClick={() => spawn(addRelationship)}>+ Relationship</Button>
      <Button variant="outline" size="sm" onClick={() => spawn(addAttribute)}>+ Attribute</Button>

      <Separator orientation="vertical" className="mx-2 h-6" />

      <Button variant="ghost" size="sm" onClick={undo}>↶ Undo</Button>
      <Button variant="ghost" size="sm" onClick={redo}>↷ Redo</Button>

      <Separator orientation="vertical" className="mx-2 h-6" />

      <Button variant="outline" size="sm" onClick={() => exportStageToPNG(stageRefGlobal.current)}>Export PNG</Button>

      <Dialog>
        <DialogTrigger asChild><Button size="sm" variant="outline">Export DSL</Button></DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>Export (JSON, temporary DSL)</DialogTitle></DialogHeader>
          {/* read current snapshot on open; ok usar getState() aqui */}
          <Textarea className="h-64" readOnly value={serializeState(useERStore.getState())} />
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild><Button size="sm" variant="outline">Import DSL</Button></DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>Import (paste JSON)</DialogTitle></DialogHeader>
          <Textarea className="h-64" value={dsl} onChange={(e) => setDsl(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button onClick={() => { reset(parseState(dsl)); }}>Import</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Separator orientation="vertical" className="mx-2 h-6" />

      <Button size="sm" variant="outline" onClick={() => toggleProperties(true)}>Properties</Button>

      <div className="ml-auto"><ModeToggle /></div>
    </header>
  );
}
