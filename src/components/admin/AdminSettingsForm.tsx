"use client";

import React, { useState } from "react";
import type { AllStoreSettings } from "@/lib/settings/settings-service";
import {
  updateShippingSettingsAction,
  updateBannerSettingsAction,
  updatePaymentSettingsAction,
} from "@/lib/settings/settings-actions";

interface AdminSettingsFormProps {
  initialSettings: AllStoreSettings;
}

export function AdminSettingsForm({ initialSettings }: AdminSettingsFormProps) {
  // Shipping states
  const [standardRatePkr, setStandardRatePkr] = useState<number>(
    Math.round(initialSettings.shippingPolicy.standardRateMinor / 100)
  );
  const [freeShippingThresholdPkr, setFreeShippingThresholdPkr] = useState<number>(
    Math.round(initialSettings.shippingPolicy.freeShippingThresholdMinor / 100)
  );
  const [couriers, setCouriers] = useState(initialSettings.shippingPolicy.couriers);
  const [estimatedDays, setEstimatedDays] = useState(initialSettings.shippingPolicy.estimatedDays);

  // Banner states
  const [bannerText, setBannerText] = useState(initialSettings.banner.text);
  const [bannerEnabled, setBannerEnabled] = useState(initialSettings.banner.isEnabled);

  // Payment states
  const [bankName, setBankName] = useState(initialSettings.paymentInstructions.bankName);
  const [accountTitle, setAccountTitle] = useState(initialSettings.paymentInstructions.accountTitle);
  const [accountNumber, setAccountNumber] = useState(initialSettings.paymentInstructions.accountNumber);
  const [iban, setIban] = useState(initialSettings.paymentInstructions.iban);
  const [instructions, setInstructions] = useState(initialSettings.paymentInstructions.instructions);

  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  const handleSaveShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSection("shipping");
    setFeedback(null);

    const result = await updateShippingSettingsAction({
      standardRatePkr: Number(standardRatePkr),
      freeShippingThresholdPkr: Number(freeShippingThresholdPkr),
      couriers,
      estimatedDays,
    });

    if (result.success) {
      setFeedback({ type: "success", message: result.message });
    } else {
      setFeedback({ type: "error", message: result.message });
    }
    setSavingSection(null);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSection("banner");
    setFeedback(null);

    const result = await updateBannerSettingsAction({
      text: bannerText,
      isEnabled: bannerEnabled,
    });

    if (result.success) {
      setFeedback({ type: "success", message: result.message });
    } else {
      setFeedback({ type: "error", message: result.message });
    }
    setSavingSection(null);
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSection("payment");
    setFeedback(null);

    const result = await updatePaymentSettingsAction({
      bankName,
      accountTitle,
      accountNumber,
      iban,
      instructions,
    });

    if (result.success) {
      setFeedback({ type: "success", message: result.message });
    } else {
      setFeedback({ type: "error", message: result.message });
    }
    setSavingSection(null);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="font-headline font-bold text-3xl text-espresso-deep">
          Studio Store Settings
        </h1>
        <p className="text-xs sm:text-sm text-espresso-muted mt-1">
          Configure nationwide shipping rates, couriers, homepage announcement bar, and bank transfer details.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold ${
            feedback.type === "success"
              ? "bg-secondary/15 text-secondary border border-secondary/30"
              : "bg-error/10 text-error border border-error/30"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* 1. Shipping Policy Section */}
      <form
        onSubmit={handleSaveShipping}
        className="bg-canvas-butter/50 p-6 sm:p-8 rounded-3xl border border-border-warm/60 shadow-xs space-y-6"
      >
        <div className="border-b border-border-warm/40 pb-3">
          <h2 className="font-headline font-bold text-lg text-espresso-deep">
            📦 Shipping &amp; Delivery Rules
          </h2>
          <p className="text-xs text-espresso-muted">
            Configure delivery fees, couriers, and free shipping qualification threshold.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-espresso-deep uppercase tracking-wider mb-2">
              Standard Delivery Fee (PKR)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-xs font-bold text-espresso-muted">Rs.</span>
              <input
                type="number"
                min="0"
                required
                value={standardRatePkr}
                onChange={(e) => setStandardRatePkr(Number(e.target.value))}
                className="w-full text-xs rounded-xl border border-border-warm bg-white pl-10 pr-4 py-2.5 text-espresso-deep focus:outline-none focus:ring-2 focus:ring-strawberry-blush font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-espresso-deep uppercase tracking-wider mb-2">
              Free Delivery Order Threshold (PKR)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-xs font-bold text-espresso-muted">Rs.</span>
              <input
                type="number"
                min="0"
                required
                value={freeShippingThresholdPkr}
                onChange={(e) => setFreeShippingThresholdPkr(Number(e.target.value))}
                className="w-full text-xs rounded-xl border border-border-warm bg-white pl-10 pr-4 py-2.5 text-espresso-deep focus:outline-none focus:ring-2 focus:ring-strawberry-blush font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-espresso-deep uppercase tracking-wider mb-2">
              Couriers &amp; Dispatch Partners
            </label>
            <input
              type="text"
              required
              value={couriers}
              onChange={(e) => setCouriers(e.target.value)}
              placeholder="TCS, PostEx & others"
              className="w-full text-xs rounded-xl border border-border-warm bg-white px-4 py-2.5 text-espresso-deep focus:outline-none focus:ring-2 focus:ring-strawberry-blush font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-espresso-deep uppercase tracking-wider mb-2">
              Estimated Delivery Window
            </label>
            <input
              type="text"
              required
              value={estimatedDays}
              onChange={(e) => setEstimatedDays(e.target.value)}
              placeholder="3 to 5 business days across Pakistan"
              className="w-full text-xs rounded-xl border border-border-warm bg-white px-4 py-2.5 text-espresso-deep focus:outline-none focus:ring-2 focus:ring-strawberry-blush font-medium"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={savingSection === "shipping"}
            className="px-6 py-2.5 rounded-full bg-espresso-deep text-white text-xs font-bold hover:bg-espresso-muted transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {savingSection === "shipping" ? "Saving Shipping Policy..." : "Save Shipping Policy"}
          </button>
        </div>
      </form>

      {/* 2. Announcement Banner Section */}
      <form
        onSubmit={handleSaveBanner}
        className="bg-canvas-butter/50 p-6 sm:p-8 rounded-3xl border border-border-warm/60 shadow-xs space-y-6"
      >
        <div className="border-b border-border-warm/40 pb-3">
          <h2 className="font-headline font-bold text-lg text-espresso-deep">
            ✨ Storefront Announcement Banner
          </h2>
          <p className="text-xs text-espresso-muted">
            Header tagline banner visible to all visitors at the top of the storefront.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-espresso-deep uppercase tracking-wider mb-2">
              Banner Tagline Text
            </label>
            <input
              type="text"
              required
              value={bannerText}
              onChange={(e) => setBannerText(e.target.value)}
              placeholder="🚚 Free delivery across Pakistan on orders over Rs. 3,000 🍓"
              className="w-full text-xs rounded-xl border border-border-warm bg-white px-4 py-2.5 text-espresso-deep focus:outline-none focus:ring-2 focus:ring-strawberry-blush"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="bannerEnabled"
              checked={bannerEnabled}
              onChange={(e) => setBannerEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-border-warm text-strawberry-deep focus:ring-strawberry-blush"
            />
            <label htmlFor="bannerEnabled" className="text-xs font-bold text-espresso-deep cursor-pointer">
              Display announcement bar on website header
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={savingSection === "banner"}
            className="px-6 py-2.5 rounded-full bg-espresso-deep text-white text-xs font-bold hover:bg-espresso-muted transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {savingSection === "banner" ? "Saving Banner..." : "Save Announcement Banner"}
          </button>
        </div>
      </form>

      {/* 3. Manual Bank Transfer Instructions Section */}
      <form
        onSubmit={handleSavePayment}
        className="bg-canvas-butter/50 p-6 sm:p-8 rounded-3xl border border-border-warm/60 shadow-xs space-y-6"
      >
        <div className="border-b border-border-warm/40 pb-3">
          <h2 className="font-headline font-bold text-lg text-espresso-deep">
            💳 Manual Bank Account &amp; Transfer Info
          </h2>
          <p className="text-xs text-espresso-muted">
            Displayed on order payment screens where customers upload deposit slips.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-espresso-deep uppercase tracking-wider mb-2">
              Bank Name
            </label>
            <input
              type="text"
              required
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full text-xs rounded-xl border border-border-warm bg-white px-4 py-2.5 text-espresso-deep focus:outline-none focus:ring-2 focus:ring-strawberry-blush"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-espresso-deep uppercase tracking-wider mb-2">
              Account Title
            </label>
            <input
              type="text"
              required
              value={accountTitle}
              onChange={(e) => setAccountTitle(e.target.value)}
              className="w-full text-xs rounded-xl border border-border-warm bg-white px-4 py-2.5 text-espresso-deep focus:outline-none focus:ring-2 focus:ring-strawberry-blush font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-espresso-deep uppercase tracking-wider mb-2">
              Account Number
            </label>
            <input
              type="text"
              required
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full text-xs rounded-xl border border-border-warm bg-white px-4 py-2.5 text-espresso-deep focus:outline-none focus:ring-2 focus:ring-strawberry-blush font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-espresso-deep uppercase tracking-wider mb-2">
              IBAN
            </label>
            <input
              type="text"
              required
              value={iban}
              onChange={(e) => setIban(e.target.value)}
              className="w-full text-xs rounded-xl border border-border-warm bg-white px-4 py-2.5 text-espresso-deep focus:outline-none focus:ring-2 focus:ring-strawberry-blush font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-espresso-deep uppercase tracking-wider mb-2">
              Payment Guidance Instructions
            </label>
            <textarea
              rows={3}
              required
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full text-xs rounded-xl border border-border-warm bg-white px-4 py-2.5 text-espresso-deep focus:outline-none focus:ring-2 focus:ring-strawberry-blush"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={savingSection === "payment"}
            className="px-6 py-2.5 rounded-full bg-espresso-deep text-white text-xs font-bold hover:bg-espresso-muted transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {savingSection === "payment" ? "Saving Payment Info..." : "Save Payment Details"}
          </button>
        </div>
      </form>
    </div>
  );
}

