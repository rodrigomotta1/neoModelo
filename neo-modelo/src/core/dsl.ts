import type { ERState } from "./types";

/**
 * Minimal JSON-based DSL.
 * Keep this simple for now; later you can evolve to a YAML ER-ML with links/roles.
 */
export function serializeState(state: ERState): string {
    return JSON.stringify(state, null, 2);
}

export function parseState(text: string): Partial<ERState> {
    const obj = JSON.parse(text) as Partial<ERState>;
    if (!obj.viewport) obj.viewport = { scale: 1, offset: { x: 0, y: 0 } };
    if (!obj.nodes) obj.nodes = [];
    if (!obj.edges) obj.edges = [];
    if (!obj.ui) obj.ui = { propertiesOpen: false };
    return obj;
}
