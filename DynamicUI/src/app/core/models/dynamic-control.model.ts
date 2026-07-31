// MODELS
export interface DynamicControlModel {
  id?: number;
  label?: string;
  controllId?: string;
  dataType?: string;
  value?: number;
  default?: string;
  placeHolder?: string;
  minValue?: number;
  options?: string[];
}
