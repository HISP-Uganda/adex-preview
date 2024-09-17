interface MetaData {
    items: Record<string, { name: string }>;
    dimensions: Dimensions;
}

interface Dimensions {
    dx: string[];
    pe: string[];
    ou: string[];
    co: string[];
}

interface Header {
    name: string;
    column: string;
    valueType: string;
    type: string;
    hidden: boolean;
    meta: boolean;
}

export interface Analytics {
    headers: Header[];
    metaData: MetaData;
    rows: string[][];
    height: number;
    headerWidth: number;
    width: number;
}
