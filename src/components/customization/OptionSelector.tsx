"use client";

import React, { useState, useId } from "react";
import { formatMoney } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
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
      <div className="p-4 rounded-2xl bg-surface-custard border border-border-warm flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-espresso-muted block">
            Customized Unit Price
          </span>
          <span className="font-headline text-2xl font-bold text-primary">
            {formatMoney(validation.calculatedUnitPriceMinor)}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-semibold text-secondary uppercase bg-matcha-tint px-2.5 py-1 rounded-full inline-block">
            ⏱️ {product.leadTimeDays}d Craft Time
          </span>
          <span className="text-[11px] text-espresso-muted block mt-1">
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
                    {group.isRequired && <span className="text-primary">*</span>}
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
                    className={`w-full px-4 py-3 rounded-2xl border font-headline font-bold tracking-widest text-sm bg-surface-cloud text-espresso-deep uppercase focus:outline-none focus:ring-2 transition-all ${
                      groupError
                        ? "border-error focus:ring-error"
                        : "border-border-warm focus:ring-primary focus:border-primary"
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
                  {group.isRequired && <span className="text-primary">*</span>}
                </span>

                {/* Selected label preview */}
                <span className="text-xs font-semibold text-primary">
                  {group.values.find((v) => v.id === selectedOptions[group.id])?.label}
                </span>
              </div>

              {/* Swatches Rail (for colors) */}
              {hasColorSwatches ? (
                <div className="flex items-center gap-3 flex-wrap pt-1">
                  {group.values.map((val) => {
                    const isSelected = selectedOptions[group.id] === val.id;
                    return (
                      <button
                        key={val.id}
                        type="button"
                        onClick={() => handleOptionSelect(group.id, val.id)}
                        className={`relative flex items-center gap-2 px-3.5 py-2 rounded-2xl border transition-all text-xs font-bold ${
                          isSelected
                            ? "border-primary bg-surface-cloud shadow-xs scale-102 ring-2 ring-primary ring-offset-1"
                            : "border-border-warm bg-surface-cloud/60 hover:border-espresso-deep/30 text-espresso-muted"
                        }`}
                        aria-pressed={isSelected}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-black/10 shrink-0"
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
                        className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between text-xs font-semibold ${
                          isSelected
                            ? "border-primary bg-primary/5 text-primary shadow-xs ring-1 ring-primary"
                            : "border-border-warm bg-surface-cloud hover:border-espresso-deep/30 text-espresso-deep"
                        }`}
                        aria-pressed={isSelected}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            isSelected ? "border-primary bg-primary text-white text-[9px]" : "border-border-warm"
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
        <div className="p-3.5 rounded-2xl bg-surface-cloud border border-border-warm/70 space-y-1 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-espresso-muted block mb-1">
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
                <span className="text-[10px] text-espresso-muted">Included</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Custom Charm to Bag Action */}
      <button
        type="button"
        onClick={handleAddToCart}
        className={`w-full py-4 px-8 rounded-full font-bold text-sm transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center justify-center gap-2 ${
          isAdded
            ? "bg-emerald-600 text-white"
            : "bg-primary hover:bg-opacity-95 text-white active:scale-98"
        }`}
      >
        {isAdded ? (
          <>✓ Custom Charm Added to Bag</>
        ) : (
          <>🛍️ Add Custom Keepsake • {formatMoney(validation.calculatedUnitPriceMinor)}</>
        )}
      </button>
    </div>
  );
}

