declare interface Segment {
  startTime: number,
  endTime: number,
  type: string
}

declare interface SegmentClientside extends Segment {
  disabled?: boolean
}
