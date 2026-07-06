// MODELS
export interface DynamicControlModel {
  id?: number;
  label?: string;
  controllId?: string;
  dataType?: string;
  value?: string[] | number;
  default?: string;
  placeHolder?: string;
  minValue?: number;
}
