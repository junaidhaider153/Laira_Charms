import type {
  OptionGroup,
  SelectedCustomization,
  CustomizationValidationResult,
  OptionBreakdownItem,
} from "./types";

/**
 * Authoritatively validates customer selections and calculates unit price in paisa minor units.
 * Safe for both Client Components and Server Components.
 * Guards against client-side price tampering.
 */
export function validateAndCalculateCustomization(
  product: { basePriceMinor: number },
  groups: OptionGroup[],
  selection: SelectedCustomization
): CustomizationValidationResult {
  const errors: Record<string, string> = {};
  const breakdown: OptionBreakdownItem[] = [];
  const canonicalCustomization: Record<string, string> = {};
  let totalDeltaMinor = 0;

  for (const group of groups) {
    if (group.type === "text") {
      const textVal = (selection.customText || "").trim();
      const config = group.textConfig;

      if (group.isRequired && !textVal) {
        errors[group.id] = `${group.name} is required.`;
        continue;
      }

      if (textVal) {
        if (config?.maxLength && textVal.length > config.maxLength) {
          errors[group.id] = `${group.name} cannot exceed ${config.maxLength} characters.`;
        } else if (config?.allowedPattern) {
          const regex = new RegExp(config.allowedPattern);
          if (!regex.test(textVal)) {
            errors[group.id] = `${group.name} contains invalid characters.`;
          }
        }

        breakdown.push({
          groupName: group.name,
          valueLabel: `"${textVal.toUpperCase()}"`,
          deltaMinor: 0,
        });
      }
    } else {
      // Choice groups (single_choice, etc.)
      const selectedValueId = selection.options[group.id];

      if (group.isRequired && !selectedValueId) {
        errors[group.id] = `Please select an option for ${group.name}.`;
        continue;
      }

      if (selectedValueId) {
        const optionValue = group.values.find(
          (v) => v.id === selectedValueId && v.isAvailable
        );

        if (!optionValue) {
          errors[group.id] = `The selected option for ${group.name} is invalid or no longer available.`;
          continue;
        }

        canonicalCustomization[group.id] = optionValue.id;
        totalDeltaMinor += optionValue.priceDeltaMinor;

        breakdown.push({
          groupName: group.name,
          valueLabel: optionValue.label,
          deltaMinor: optionValue.priceDeltaMinor,
        });
      }
    }
  }

  const isValid = Object.keys(errors).length === 0;
  const calculatedUnitPriceMinor = product.basePriceMinor + totalDeltaMinor;

  return {
    isValid,
    errors,
    calculatedUnitPriceMinor,
    selectedBreakdown: breakdown,
    canonicalCustomization,
    canonicalCustomText: selection.customText ? selection.customText.trim().toUpperCase() : undefined,
  };
}
