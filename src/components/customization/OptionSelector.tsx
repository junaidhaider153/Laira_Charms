"use client";

import React, { useState, useId } from "react";
import { formatMoney } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import { Icon } from "@/components/ui/Icon";
import { validateAndCalculateCustomization } from "@/lib/customization/calculator";
import type { CatalogProduct } from "@/lib/catalog/types";
import type { OptionGroup } from "@/lib/customization/types";

interface OptionSelectorProps {
  product: CatalogProduct;
  groups: OptionGroup[];
}

export function OptionSelector({ product, groups }: OptionSelectorProps) {
  const { addItem, openDrawer } = useCart();
  const textInputId = useId();

  // Initialize with first value of required single-choice groups for frictionless UX
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const group of groups) {
      if (group.type === "single_choice" && group.values.length > 0) {
        initial[group.id] = group.values[0].id;
      }
    }
    return initial;
  });

  const [customText, setCustomText] = useState("");
  const [touched, setTouched] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  // Live evaluation & server-authoritative price delta calculation
  const validation = validateAndCalculateCustomization(
    product,
    groups,
    { options: selectedOptions, customText }
  );

  function handleOptionSelect(groupId: string, valueId: string) {
    setSelectedOptions((prev) => ({
      ...prev,
      [groupId]: valueId,
    }));
  }

  function handleAddToCart() {
    setTouched(true);

    if (!validation.isValid) {
      return;
    }

    addItem({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      basePriceMinor: product.basePriceMinor,
      unitPriceMinor: validation.calculatedUnitPriceMinor,
      quantity: 1,
      imageUrl: product.primaryImage,
      customization: validation.canonicalCustomization,
      customText: validation.canonicalCustomText,
      leadTimeDays: product.leadTimeDays,
    });

    setIsAdded(true);
    openDrawer();

    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  }

  return (
    <div className="space-y-6 pt-4 border-t border-border-warm" data-testid="customization-engine">
      {/* Live Customizer Price Header */}
      <div className="p-4 rounded-3xl bg-surface-custard border border-border-warm/60 flex items-center justify-between shadow-xs">
        <div>
          <span className="font-label-sm text-[11px] font-bold uppercase tracking-wider text-espresso-muted block">
            Customized Unit Price
          </span>
          <span className="font-headline text-2xl font-bold text-strawberry-blush">
            {formatMoney(validation.calculatedUnitPriceMinor)}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-semibold text-secondary uppercase bg-matcha-tint px-3 py-1 rounded-full inline-block shadow-xs">
            ⏱️ {product.leadTimeDays}d Craft Time
          </span>
          <span className="font-label-sm text-[11px] text-espresso-muted block mt-1">
            Handmade to order
          </span>
        </div>
      </div>

      {/* Option Groups */}
      <div className="space-y-5">
        {groups.map((group) => {
          const groupError = touched && validation.errors[group.id];

          // 1. Text input group (e.g. Stamped initial or name)
          if (group.type === "text") {
            const config = group.textConfig;
            const currentLen = customText.length;
            const maxLen = config?.maxLength || 10;

            return (
              <div key={group.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor={`${textInputId}-${group.id}`}
                    className="font-headline font-bold text-xs uppercase tracking-wider text-espresso-deep flex items-center gap-1.5"
                  >
                    <span>{group.name}</span>
                    {group.isRequired && <span className="text-strawberry-blush">*</span>}
                  </label>
                  <span className="text-[11px] text-espresso-muted font-mono">
                    {currentLen}/{maxLen}
                  </span>
                </div>

                <div className="relative">
                  <input
                    id={`${textInputId}-${group.id}`}
                    type="text"
                    value={customText}
                    maxLength={maxLen}
                    placeholder={config?.placeholder || "ENTER NAME"}
                    onChange={(e) => {
                      setCustomText(e.target.value.toUpperCase());
                    }}
                    className={`w-full px-4 py-3 rounded-2xl border font-headline font-bold tracking-widest text-sm bg-surface-cloud text-espresso-deep uppercase focus:outline-none focus:ring-2 transition-all shadow-xs ${
                      groupError
                        ? "border-error focus:ring-error"
                        : "border-border-warm focus:ring-primary/20 focus:border-strawberry-blush"
                    }`}
                  />
                </div>

                {config?.helperText && (
                  <p className="text-[11px] text-espresso-muted leading-tight">
                    {config.helperText}
                  </p>
                )}

                {groupError && (
                  <p className="text-xs text-error font-medium" role="alert">
                    ⚠️ {groupError}
                  </p>
                )}
              </div>
            );
          }

          // 2. Choice Groups (e.g. Base Color swatches or Hardware chips)
          const hasColorSwatches = group.values.some((v) => v.colorHex);

          return (
            <div key={group.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-headline font-bold text-xs uppercase tracking-wider text-espresso-deep flex items-center gap-1.5">
                  <span>{group.name}</span>
                  {group.isRequired && <span className="text-strawberry-blush">*</span>}
                </span>

                {/* Selected label preview */}
                <span className="text-xs font-semibold text-strawberry-blush">
                  {group.values.find((v) => v.id === selectedOptions[group.id])?.label}
                </span>
              </div>

              {/* Swatches Rail (for colors) */}
              {hasColorSwatches ? (
                <div className="flex items-center gap-2.5 flex-wrap pt-1">
                  {group.values.map((val) => {
                    const isSelected = selectedOptions[group.id] === val.id;
                    return (
                      <button
                        key={val.id}
                        type="button"
                        onClick={() => handleOptionSelect(group.id, val.id)}
                        className={`relative flex items-center gap-2 px-3.5 py-2 rounded-2xl border transition-all text-xs font-bold ${
                          isSelected
                            ? "border-strawberry-blush bg-surface-custard shadow-xs scale-102 ring-2 ring-strawberry-blush/40"
                            : "border-border-warm bg-surface-cloud hover:border-espresso-deep/30 text-espresso-muted"
                        }`}
                        aria-pressed={isSelected}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-black/10 shrink-0 shadow-xs"
                          style={{ backgroundColor: val.colorHex }}
                        />
                        <span>{val.label}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Hardware / Add-on Chips Rail */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {group.values.map((val) => {
                    const isSelected = selectedOptions[group.id] === val.id;
                    return (
                      <button
                        key={val.id}
                        type="button"
                        onClick={() => handleOptionSelect(group.id, val.id)}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between text-xs font-semibold ${
                          isSelected
                            ? "border-strawberry-blush bg-surface-custard text-espresso-deep shadow-xs ring-1 ring-strawberry-blush"
                            : "border-border-warm bg-surface-cloud hover:border-espresso-deep/30 text-espresso-deep"
                        }`}
                        aria-pressed={isSelected}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                            isSelected ? "border-strawberry-blush bg-strawberry-blush text-white" : "border-border-warm"
                          }`}>
                            {isSelected && "✓"}
                          </span>
                          <span className="font-bold">{val.label}</span>
                        </div>

                        {val.priceDeltaMinor > 0 ? (
                          <span className="text-[11px] font-bold text-secondary bg-matcha-tint px-2 py-0.5 rounded-full ml-2">
                            +{formatMoney(val.priceDeltaMinor)}
                          </span>
                        ) : (
                          <span className="text-[11px] text-espresso-muted font-medium ml-2">
                            Incl.
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {groupError && (
                <p className="text-xs text-error font-medium" role="alert">
                  ⚠️ {groupError}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Options Breakdown Summary */}
      {validation.selectedBreakdown.length > 0 && (
        <div className="p-4 rounded-3xl bg-surface-cloud border border-border-warm/60 space-y-1.5 text-xs shadow-xs">
          <span className="font-label-sm text-[10px] font-bold uppercase tracking-wider text-espresso-muted block mb-1">
            Customization Breakdown:
          </span>
          {validation.selectedBreakdown.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-espresso-deep/90">
              <span className="text-espresso-muted">
                {item.groupName}: <strong className="text-espresso-deep">{item.valueLabel}</strong>
              </span>
              {item.deltaMinor > 0 ? (
                <span className="font-bold text-secondary">+{formatMoney(item.deltaMinor)}</span>
              ) : (
                <span className="text-[10px] text-espresso-muted font-medium">Included</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Custom Charm to Bag Action */}
      <button
        type="button"
        onClick={handleAddToCart}
        className={`w-full py-4 px-8 rounded-full font-label-lg text-label-lg font-bold transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:scale-98 ${
          isAdded
            ? "bg-secondary text-white"
            : "bg-strawberry-blush hover:opacity-95 text-on-primary"
        }`}
      >
        {isAdded ? (
          <>✓ Custom Charm Added to Bag</>
        ) : (
          <>
            <Icon name="shopping_bag" className="text-[18px]" aria-hidden="true" />
            Add Custom Keepsake • {formatMoney(validation.calculatedUnitPriceMinor)}
          </>
        )}
      </button>
    </div>
  );
}
