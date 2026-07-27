export interface BarchartDataInterface {
    label: string,
    value: number,
}
export interface BarchartInterface {
    chartWidth:number,
    chartHeight:number,
    chartBarstrokeWidth:number,
    chartdata:BarchartDataInterface[],
    showAvg:boolean,
    showLabels:boolean,
    AnimateBar:boolean
}