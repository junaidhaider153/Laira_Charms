export type OptionGroupType = "single_choice" | "text" | "multi_choice";

export interface OptionValue {
  id: string;
  groupId: string;
  label: string;
  priceDeltaMinor: number; // in paisa (100 paisa = 1 PKR)
  isAvailable: boolean;
  sortOrder: number;
  colorHex?: string; // Optional hex for swatch rendering
}

export interface OptionTextConfig {
  maxLength: number;
  placeholder: string;
  helperText: string;
  allowedPattern?: string; // e.g. "^[a-zA-Z0-9 ]+$"
}

export interface OptionGroup {
  id: string;
  productId: string;
  name: string;
  type: OptionGroupType;
  isRequired: boolean;
  sortOrder: number;
  values: OptionValue[];
  textConfig?: OptionTextConfig;
}

export interface SelectedCustomization {
  options: Record<string, string>; // groupId -> valueId
  customText?: string;
}

export interface OptionBreakdownItem {
  groupName: string;
  valueLabel: string;
  deltaMinor: number;
}

export interface CustomizationValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  calculatedUnitPriceMinor: number;
  selectedBreakdown: OptionBreakdownItem[];
  canonicalCustomization: Record<string, string>;
  canonicalCustomText?: string;
}

