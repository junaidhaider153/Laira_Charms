"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { formatMoney } from "@/lib/utils";
import { calculateShippingFee } from "@/lib/checkout/shipping";
import {
  PAKISTANI_PROVINCES,
  type ShippingAddress,
} from "@/lib/checkout/types";
import { shippingAddressSchema } from "@/lib/checkout/schemas";
import { createOrderAction } from "@/lib/checkout/actions";

export function CheckoutForm() {
  const router = useRouter();
  const { items, itemCount, subtotalMinor, clearCart } = useCart();

  const [idempotencyKey, setIdempotencyKey] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<ShippingAddress>({
    fullName: "",
    email: "",
    phone: "",
    streetAddress: "",
    city: "",
    province: "Punjab",
    postalCode: "",
    orderNotes: "",
  });

  // Generate unique idempotency key once per checkout session
  useEffect(() => {
    setIdempotencyKey(crypto.randomUUID());
  }, []);

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-strawberry-subtle flex items-center justify-center text-3xl shadow-xs">
          🛍️
        </div>
        <h1 className="font-headline font-bold text-2xl sm:text-3xl text-espresso-deep mb-2">
          Your Shopping Bag is Empty
        </h1>
        <p className="font-body-sm text-espresso-muted text-sm max-w-sm mx-auto mb-6">
          Please add at least one handcrafted keepsake to your bag before checking out.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-strawberry-blush text-on-primary font-bold text-xs hover:opacity-95 shadow-md transition-all active:scale-95"
        >
          Browse Keepsake Catalog &rarr;
        </Link>
      </div>
    );
  }

  const shippingFeeMinor = calculateShippingFee(subtotalMinor);
  const totalMinor = subtotalMinor + shippingFeeMinor;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // Client validation
    const parsed = shippingAddressSchema.safeParse(form);
    if (!parsed.success) {
      const errorMap: Record<string, string> = {};
      parsed.error.errors.forEach((err) => {
        const field = err.path[0]?.toString();
        if (field) {
          errorMap[field] = err.message;
        }
      });
      setErrors(errorMap);
      return;
    }

    setIsSubmitting(true);

    try {
      const lineItems = items.map((item) => ({
        productId: item.productId,
        slug: item.slug,
        title: item.title,
        unitPriceMinor: item.unitPriceMinor,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
        customization: item.customization,
        customText: item.customText,
      }));

      const result = await createOrderAction({
        idempotencyKey: idempotencyKey || crypto.randomUUID(),
        address: parsed.data,
        items: lineItems,
      });

      if (!result.success) {
        setServerError(result.message || "Failed to place order.");
        if (result.errors) {
          setErrors(result.errors);
        }
        setIsSubmitting(false);
        return;
      }

      // Order created successfully; clear bag and redirect
      clearCart();
      if (result.orderUrl) {
        router.push(result.orderUrl);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setServerError(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="mb-8">
        <Link
          href="/cart"
          className="text-xs font-semibold text-espresso-muted hover:text-espresso-deep mb-2 inline-flex items-center gap-1 transition-colors"
        >
          &larr; Back to Shopping Bag
        </Link>
        <h1 className="font-headline font-bold text-3xl sm:text-4xl text-espresso-deep">
          Checkout
        </h1>
        <p className="font-body-sm text-xs sm:text-sm text-espresso-muted mt-1">
          Complete your delivery details across Pakistan. Direct manual bank transfer instructions follow.
        </p>
      </div>

      {serverError && (
        <div className="mb-6 p-4 rounded-2xl bg-error/10 border border-error/30 text-error text-xs sm:text-sm flex items-start gap-3">
          <span className="text-base shrink-0">⚠️</span>
          <p>{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Shipping & Customer Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Contact Information */}
          <div className="p-6 sm:p-8 rounded-3xl bg-surface-cloud border border-border-warm/50 shadow-sm space-y-5">
            <h2 className="font-headline font-bold text-xl text-espresso-deep flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-strawberry-blush text-on-primary text-xs flex items-center justify-center font-bold">
                1
              </span>
              Contact Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-xs font-bold text-espresso-deep mb-1.5"
                >
                  Full Name <span className="text-strawberry-blush">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Ayesha Noor"
                  className={`w-full px-4 py-3 rounded-2xl border ${
                    errors.fullName ? "border-error ring-1 ring-error" : "border-border-warm"
                  } bg-canvas-butter text-espresso-deep text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-strawberry-blush shadow-xs transition-all`}
                />
                {errors.fullName && (
                  <p className="text-[11px] text-error mt-1">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-bold text-espresso-deep mb-1.5"
                >
                  Email Address <span className="text-strawberry-blush">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="ayesha@example.com"
                  className={`w-full px-4 py-3 rounded-2xl border ${
                    errors.email ? "border-error ring-1 ring-error" : "border-border-warm"
                  } bg-canvas-butter text-espresso-deep text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-strawberry-blush shadow-xs transition-all`}
                />
                {errors.email && (
                  <p className="text-[11px] text-error mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-xs font-bold text-espresso-deep mb-1.5"
              >
                Pakistani Mobile Number <span className="text-strawberry-blush">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                placeholder="03001234567"
                className={`w-full px-4 py-3 rounded-2xl border ${
                  errors.phone ? "border-error ring-1 ring-error" : "border-border-warm"
                } bg-canvas-butter text-espresso-deep text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-strawberry-blush shadow-xs transition-all`}
              />
              <p className="font-label-sm text-[11px] text-espresso-muted mt-1">
                Used by courier rider for delivery coordination (e.g. 03001234567).
              </p>
              {errors.phone && (
                <p className="text-[11px] text-error mt-1">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="p-6 sm:p-8 rounded-3xl bg-surface-cloud border border-border-warm/50 shadow-sm space-y-5">
            <h2 className="font-headline font-bold text-xl text-espresso-deep flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-strawberry-blush text-on-primary text-xs flex items-center justify-center font-bold">
                2
              </span>
              Delivery Address (Pakistan)
            </h2>

            <div>
              <label
                htmlFor="streetAddress"
                className="block text-xs font-bold text-espresso-deep mb-1.5"
              >
                Street Address / House / Flat <span className="text-strawberry-blush">*</span>
              </label>
              <input
                type="text"
                id="streetAddress"
                name="streetAddress"
                value={form.streetAddress}
                onChange={handleChange}
                required
                placeholder="House 14-B, Street 3, Sector F-7/1"
                className={`w-full px-4 py-3 rounded-2xl border ${
                  errors.streetAddress ? "border-error ring-1 ring-error" : "border-border-warm"
                } bg-canvas-butter text-espresso-deep text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-strawberry-blush shadow-xs transition-all`}
              />
              {errors.streetAddress && (
                <p className="text-[11px] text-error mt-1">{errors.streetAddress}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="city"
                  className="block text-xs font-bold text-espresso-deep mb-1.5"
                >
                  City <span className="text-strawberry-blush">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Islamabad"
                  className={`w-full px-4 py-3 rounded-2xl border ${
                    errors.city ? "border-error ring-1 ring-error" : "border-border-warm"
                  } bg-canvas-butter text-espresso-deep text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-strawberry-blush shadow-xs transition-all`}
                />
                {errors.city && (
                  <p className="text-[11px] text-error mt-1">{errors.city}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="province"
                  className="block text-xs font-bold text-espresso-deep mb-1.5"
                >
                  Province / Region <span className="text-strawberry-blush">*</span>
                </label>
                <select
                  id="province"
                  name="province"
                  value={form.province}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl border border-border-warm bg-canvas-butter text-espresso-deep text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-strawberry-blush shadow-xs"
                >
                  {PAKISTANI_PROVINCES.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
                {errors.province && (
                  <p className="text-[11px] text-error mt-1">{errors.province}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="postalCode"
                  className="block text-xs font-bold text-espresso-deep mb-1.5"
                >
                  Postal Code <span className="text-strawberry-blush">*</span>
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={form.postalCode}
                  onChange={handleChange}
                  required
                  maxLength={5}
                  placeholder="44000"
                  className={`w-full px-4 py-3 rounded-2xl border ${
                    errors.postalCode ? "border-error ring-1 ring-error" : "border-border-warm"
                  } bg-canvas-butter text-espresso-deep text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-strawberry-blush shadow-xs transition-all`}
                />
                {errors.postalCode && (
                  <p className="text-[11px] text-error mt-1">{errors.postalCode}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="orderNotes"
                className="block text-xs font-bold text-espresso-deep mb-1.5"
              >
                Special Delivery Instructions / Gift Message (Optional)
              </label>
              <textarea
                id="orderNotes"
                name="orderNotes"
                rows={2}
                value={form.orderNotes}
                onChange={handleChange}
                placeholder="e.g. Please ring bell twice or leave with security."
                className="w-full px-4 py-3 rounded-2xl border border-border-warm bg-canvas-butter text-espresso-deep text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-strawberry-blush shadow-xs"
              />
            </div>
          </div>

          {/* Payment Method Callout */}
          <div className="p-6 sm:p-8 rounded-3xl bg-surface-cloud border border-border-warm/50 shadow-sm space-y-3">
            <h2 className="font-headline font-bold text-xl text-espresso-deep flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-strawberry-blush text-on-primary text-xs flex items-center justify-center font-bold">
                3
              </span>
              Payment Method: Manual Transfer (Pakistan)
            </h2>

            <div className="p-5 rounded-2xl bg-surface-custard border border-border-warm/60 text-xs text-espresso-deep space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 font-bold text-espresso-deep text-sm">
                  <span>🏦</span> Meezan Bank &bull; EasyPaisa &bull; JazzCash
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-peach-tint text-espresso-deep font-bold text-[10px] border border-border-warm/40">
                  No Cash on Delivery (COD)
                </span>
              </div>
              <p className="text-xs text-espresso-muted leading-relaxed">
                To guarantee secure handmade commissions, we process payments exclusively via verified direct manual transfers. After clicking <span className="font-bold text-espresso-deep">&quot;Place Order&quot;</span>, our studio bank IBAN and wallet accounts will be presented on screen to upload your transfer screenshot proof.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Place Order CTA */}
        <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-surface-custard border border-border-warm/60 shadow-sm space-y-5 sticky top-28">
          <h2 className="font-headline font-bold text-xl text-espresso-deep border-b border-border-warm pb-3">
            Order Review ({itemCount})
          </h2>

          {/* Mini line items */}
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-2 border-b border-border-warm/40 text-xs">
                <div className="relative w-12 h-12 rounded-xl bg-surface-cloud overflow-hidden shrink-0 border border-border-warm/50 shadow-xs">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-espresso-muted">
                      Charm
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-espresso-deep truncate">{item.title}</p>
                  <p className="text-[11px] text-espresso-muted">Qty: {item.quantity}</p>
                  {item.customText && (
                    <p className="text-[10px] text-strawberry-blush font-mono truncate">
                      Stamped: &quot;{item.customText}&quot;
                    </p>
                  )}
                </div>
                <span className="font-bold text-espresso-deep shrink-0">
                  {formatMoney(item.unitPriceMinor * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Price Breakdown */}
          <div className="space-y-2 text-xs pt-2">
            <div className="flex justify-between text-espresso-muted">
              <span>Subtotal</span>
              <span className="font-semibold text-espresso-deep">{formatMoney(subtotalMinor)}</span>
            </div>
            <div className="flex justify-between text-espresso-muted items-center">
              <span>Standard Delivery</span>
              {shippingFeeMinor === 0 ? (
                <span className="font-bold text-secondary uppercase text-[11px]">FREE</span>
              ) : (
                <span className="font-semibold text-espresso-deep">{formatMoney(shippingFeeMinor)}</span>
              )}
            </div>
            <div className="border-t border-border-warm pt-3 flex justify-between items-baseline text-sm">
              <span className="font-headline font-bold text-espresso-deep">Total Due</span>
              <div className="text-right">
                <span className="font-headline font-bold text-2xl text-strawberry-blush">
                  {formatMoney(totalMinor)}
                </span>
                <span className="block text-[10px] text-espresso-muted">PKR (Includes Delivery)</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 rounded-full bg-strawberry-blush text-on-primary font-bold text-sm text-center block hover:opacity-95 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 active:scale-98"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Confirming Order...
              </span>
            ) : (
              `Place Order • ${formatMoney(totalMinor)}`
            )}
          </button>

          <p className="font-label-sm text-[11px] text-center text-espresso-muted leading-relaxed">
            By placing your order, you confirm acceptance of our <span className="font-bold text-espresso-deep">No COD</span> advance payment policy and <span className="font-bold text-espresso-deep">no-refunds/no-returns</span> policy on handmade pieces (covered under 48h transit protection).
          </p>
        </div>
      </form>
    </div>
  );
}
