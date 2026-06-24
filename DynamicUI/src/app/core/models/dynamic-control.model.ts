// Model for dynamic control
export interface DynamicControl {
  label?: string;
  dataType?: string;
  value?: string[] | number;
  default?: string;
  placeHolder?: string;
  minValue?: number;
}
