import { create } from "zustand";
import { nanoid } from "nanoid";
import { produce } from "immer";
import { temporal } from "zundo";
import type { ERState, Vec2 } from "./types";

/**
 * Actions define all mutations allowed on the ER editor state.
 * Keep them minimal and predictable; UI consumes these via selectors to avoid excess re-renders.
 */
type Actions = {
    addEntity: (pos: Vec2, name?: string) => void;
    addRelationship: (pos: Vec2, name?: string) => void;
    addAttribute: (pos: Vec2, name?: string) => void;

    setNodePos: (id: string, pos: Vec2, snap?: number) => void;
    setNodeProp: (id: string, patch: Partial<ERState["nodes"][number]>) => void;
    setEdgeProp: (id: string, patch: Partial<ERState["edges"][number]>) => void;

    setSelection: (ids: string[], edgeIds?: string[]) => void;
    clearSelection: () => void;

    connect: (from: string, to: string) => void;
    deleteSelected: () => void;

    setViewport: (scale: number, offset: Vec2) => void;

    toggleProperties: (open?: boolean) => void;

    undo: () => void;
    redo: () => void;
    reset: (s?: Partial<ERState>) => void;
};

const initial: ERState = {
    nodes: [],
    edges: [],
    viewport: { scale: 1, offset: { x: 0, y: 0 } },
    ui: { propertiesOpen: false },
};

export const useERStore = create(
    temporal<ERState & Actions>(
        (set, get) => ({
            ...initial,

            addEntity: (pos, name = "Entity") =>
                set(produce((s: ERState) => { s.nodes.push({ id: nanoid(), kind: "entity", name, pos }); })),

            addRelationship: (pos, name = "Rel") =>
                set(produce((s: ERState) => { s.nodes.push({ id: nanoid(), kind: "relationship", name, pos }); })),

            addAttribute: (pos, name = "attr") =>
                set(produce((s: ERState) => { s.nodes.push({ id: nanoid(), kind: "attribute", name, pos }); })),

            setNodePos: (id, pos, snap = 10) =>
                set(produce((s: ERState) => {
                const n = s.nodes.find(n => n.id === id); if (!n) return;
                n.pos = { x: Math.round(pos.x / snap) * snap, y: Math.round(pos.y / snap) * snap };
                })),

            setNodeProp: (id, patch) =>
                set(produce((s: ERState) => {
                const idx = s.nodes.findIndex(n => n.id === id);
                if (idx >= 0) Object.assign(s.nodes[idx], patch);
                })),

            setEdgeProp: (id, patch) =>
                set(produce((s: ERState) => {
                const idx = s.edges.findIndex(e => e.id === id);
                if (idx >= 0) Object.assign(s.edges[idx], patch);
                })),

            setSelection: (ids, edgeIds = []) =>
                set(produce((s: ERState) => {
                s.nodes.forEach(n => n.selected = ids.includes(n.id));
                s.edges.forEach(e => e.selected = edgeIds.includes(e.id));
                })),

            clearSelection: () =>
                set(produce((s: ERState) => {
                s.nodes.forEach(n => n.selected = false);
                s.edges.forEach(e => e.selected = false);
                })),

            connect: (from, to) =>
                set(produce((s: ERState) => {
                if (from === to) return;
                const exists = s.edges.some(e => (e.from === from && e.to === to) || (e.from === to && e.to === from));
                if (!exists) s.edges.push({ id: nanoid(), from, to });
                })),

            deleteSelected: () =>
                set(produce((s: ERState) => {
                const selectedIds = new Set(s.nodes.filter(n => n.selected).map(n => n.id));
                s.edges = s.edges.filter(e => !e.selected && !selectedIds.has(e.from) && !selectedIds.has(e.to));
                s.nodes = s.nodes.filter(n => !n.selected);
                })),

            setViewport: (scale, offset) =>
                set(produce((s: ERState) => { s.viewport = { scale, offset }; })),

            toggleProperties: (open) =>
                set(produce((s: ERState) => { s.ui.propertiesOpen = open ?? !s.ui.propertiesOpen; })),

            undo: () => (get() as any).temporal.undo(),
            redo: () => (get() as any).temporal.redo(),
            reset: (s) => set({ ...(s ? { ...initial, ...s } : initial) }),
        }),
    { limit: 100 }
  )
);
