import { commandInterface, LinechartPoint, LinechartPoints } from "@components/_types/Linechart.i";

export const svgPath = (points: LinechartPoints, command: commandInterface) => {
    //Convert point data to svg path
    const d = points.reduce(
        (acc, point, i, a) =>
            i === 0
                ? `M2 ${point[1]}` // move to the first point
                : `${acc} ${command(point, i, a)}`, // use a command for the rest of the points ( bezierCommand )
        ""
    );
    return d; // return path (svg path d)
};
const line = (pointA: LinechartPoint, pointB: LinechartPoint) => {
    const lengthX = pointB[0] - pointA[0];
    const lengthY = pointB[1] - pointA[1];
    return {
        length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
        angle: Math.atan2(lengthY, lengthX),
    };
};
const controlPoint = (current: LinechartPoint, previous: LinechartPoint, next: LinechartPoint, reverse: boolean) => {
    const p = previous || current;
    const n = next || current; // The smoothing ratio
    const smoothing = 0.2; // Properties of the opposed-line
    const o = line(p, n); // If is end-control-point, add PI to the angle to go backward
    const angle = o.angle + (reverse ? Math.PI : 0);
    const length = o.length * smoothing; // The control point position is relative to the current point
    const x = current[0] + Math.cos(angle) * length;
    const y = current[1] + Math.sin(angle) * length;
    return [x, y];
};
export const bezierCommand = (point: LinechartPoint, i: number, a: LinechartPoints) => {
    // start control point
    const [cpsX, cpsY] = controlPoint(a[i - 1], a[i - 2], point, false); // end control point
    const [cpeX, cpeY] = controlPoint(point, a[i - 1], a[i + 1], true);
    return `C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point[0]},${point[1]}`;
};