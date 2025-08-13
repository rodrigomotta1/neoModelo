export type Vec2 = { x: number; y: number };

export type NodeBase = {
    id: string;
    kind: "entity" | "relationship" | "attribute";
    name: string;
    pos: Vec2;
    selected?: boolean;
};

export type EntityNode = NodeBase & { kind: "entity"; weak?: boolean };
export type RelationshipNode = NodeBase & { kind: "relationship"; identifying?: boolean };
export type AttributeNode = NodeBase & {
    kind: "attribute";
    key?: boolean;
    derived?: boolean;
    multivalued?: boolean;
    optional?: boolean;
};

export type Cardinality = "1" | "N" | "M";
export type Participation = "total" | "partial";

export type Edge = {
    id: string;
    from: string; // node id
    to: string;   // node id
    cardinality?: Cardinality;
    participation?: Participation;
    selected?: boolean;
};

export type ERState = {
    nodes: Array<EntityNode | RelationshipNode | AttributeNode>;
    edges: Edge[];
    viewport: { scale: number; offset: Vec2 };
    settings: {
        showGrid: boolean;
        snap: boolean;
        showMinimap: boolean;
    };
};
