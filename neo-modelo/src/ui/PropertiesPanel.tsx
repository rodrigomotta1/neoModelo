import { useMemo } from "react";
import { useERStore } from "@/core/store";
import type { AttributeNode, EntityNode, RelationshipNode } from "@/core/types";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export function PropertiesPanel() {
  const nodes = useERStore(s => s.nodes);
  const edges = useERStore(s => s.edges);
  const uiOpen = useERStore(s => s.ui.propertiesOpen);
  const toggleProperties = useERStore(s => s.toggleProperties);
  const setNodeProp = useERStore(s => s.setNodeProp);
  const setEdgeProp = useERStore(s => s.setEdgeProp);

  const selectedNode = useMemo(() => nodes.find((n) => n.selected), [nodes]);
  const selectedEdge = useMemo(() => edges.find((e) => e.selected), [edges]);

  return (
    <Sheet open={uiOpen} onOpenChange={(o) => toggleProperties(o)}>
      <SheetContent side="right" className="w-96">
        <SheetHeader><SheetTitle>Properties</SheetTitle></SheetHeader>

        {!selectedNode && !selectedEdge && (
          <p className="text-sm mt-4 text-muted-foreground">Select a node or edge to edit its properties.</p>
        )}

        {selectedNode && (
          <div className="mt-4 space-y-4">
            <Label className="text-xs">Name</Label>
            <Input
              value={selectedNode.name}
              onChange={(e) => setNodeProp(selectedNode.id, { name: e.target.value })}
            />

            <Separator />

            {selectedNode.kind === "entity" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Weak entity</Label>
                  <Switch
                    checked={Boolean((selectedNode as EntityNode).weak)}
                    onCheckedChange={(v) => setNodeProp(selectedNode.id, { weak: v })}
                  />
                </div>
              </div>
            )}

            {selectedNode.kind === "relationship" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Identifying</Label>
                  <Switch
                    checked={Boolean((selectedNode as RelationshipNode).identifying)}
                    onCheckedChange={(v) => setNodeProp(selectedNode.id, { identifying: v })}
                  />
                </div>
              </div>
            )}

            {selectedNode.kind === "attribute" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Key</Label>
                  <Switch
                    checked={Boolean((selectedNode as AttributeNode).key)}
                    onCheckedChange={(v) => setNodeProp(selectedNode.id, { key: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Derived</Label>
                  <Switch
                    checked={Boolean((selectedNode as AttributeNode).derived)}
                    onCheckedChange={(v) => setNodeProp(selectedNode.id, { derived: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Multivalued</Label>
                  <Switch
                    checked={Boolean((selectedNode as AttributeNode).multivalued)}
                    onCheckedChange={(v) => setNodeProp(selectedNode.id, { multivalued: v })}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {selectedEdge && (
          <div className="mt-6 space-y-4">
            <Separator />
            <Label className="text-xs">Edge</Label>

            <div className="space-y-2">
              <Label>Cardinality</Label>
              <Select
                value={selectedEdge.cardinality ?? ""}
                onValueChange={(v) => setEdgeProp(selectedEdge.id, { cardinality: v as any })}
              >
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="N">N</SelectItem>
                  <SelectItem value="M">M</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Participation</Label>
              <Select
                value={selectedEdge.participation ?? ""}
                onValueChange={(v) => setEdgeProp(selectedEdge.id, { participation: v as any })}
              >
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="total">total</SelectItem>
                  <SelectItem value="partial">partial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
