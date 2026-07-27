export interface LinechartDataInterface {
    label: string,
    value: number,
}
export interface LinechartInterface {
    chartWidth: number,
    chartHeight: number,
    chartdata: LinechartDataInterface[],
    chartdatamaxvalue: number,
    showAvg: boolean,
    showLabels: boolean,
    AnimateLine: boolean,
    showGrid: boolean
}

export type LinechartPoint = [number, number];

export type LinechartPoints = LinechartPoint[];

export type commandInterface = (point: LinechartPoint, i: number, a: LinechartPoints) => string