import { GraphicsObject } from "graphics-debug"

/**

interface Point {
    x: number;
    y: number;
    color?: string;
    label?: string;
    layer?: string;
    step?: number;
}
interface Line {
    points: {
        x: number;
        y: number;
    }[];
    strokeWidth?: number;
    strokeColor?: string;
    strokeDash?: string | number[];
    layer?: string;
    step?: number;
    label?: string;
}
interface Rect {
    center: {
        x: number;
        y: number;
    };
    width: number;
    height: number;
    fill?: string;
    stroke?: string;
    color?: string;
    layer?: string;
    step?: number;
    label?: string;
}
interface Circle {
    center: {
        x: number;
        y: number;
    };
    radius: number;
    fill?: string;
    stroke?: string;
    layer?: string;
    step?: number;
    label?: string;
}
interface GraphicsObject {
    points?: Point[];
    lines?: Line[];
    rects?: Rect[];
    circles?: Circle[];
    coordinateSystem?: "cartesian" | "screen";
    title?: string;
}
interface Viewbox {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
}
interface CenterViewbox {
    center: {
        x: number;
        y: number;
    };
    width: number;
    height: number;
}
type TransformOptions = {
    transform?: transformation_matrix.Matrix;
    viewbox?: Viewbox | CenterViewbox;
    padding?: number;
    yFlip?: boolean;
    disableLabels?: boolean;
};

export type { CenterViewbox, Circle, GraphicsObject, Line, Point, Rect, TransformOptions, Viewbox };

 */
