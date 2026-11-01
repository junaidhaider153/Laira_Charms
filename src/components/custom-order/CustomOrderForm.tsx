"use client";

import React, { useState } from "react";
import Link from "next/link";
import { submitCustomRequestAction } from "@/lib/custom-order/actions";

interface CustomOrderFormProps {
  initialProductRef?: string;
  initialTitle?: string;
}

export function CustomOrderForm({
  initialProductRef = "",
  initialTitle = "",
}: CustomOrderFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [brief, setBrief] = useState("");
  const [desiredDeliveryDate, setDesiredDeliveryDate] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [referenceFiles, setReferenceFiles] = useState<File[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submissionResult, setSubmissionResult] = useState<{
    requestId: string;
    guestToken?: string;
    trackingUrl: string;
  } | null>(null);

  // Minimum delivery date is 7 days from now
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 7);
  const minDateStr = minDate.toISOString().split("T")[0];

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const valid = files.filter((f) => {
      if (f.size > 5 * 1024 * 1024) {
        alert(`${f.name} exceeds 5MB limit.`);
        return false;
      }
      return true;
    });
    setReferenceFiles((prev) => [...prev, ...valid].slice(0, 5));
  }

  function handleRemoveFile(index: number) {
    setReferenceFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});

    const formData = new FormData();
    formData.set("title", title);
    formData.set("brief", brief);
    if (desiredDeliveryDate) {
      formData.set("desiredDeliveryDate", desiredDeliveryDate);
    }
    formData.set("customerName", customerName);
    formData.set("customerEmail", customerEmail);
    formData.set("customerPhone", customerPhone);
    if (initialProductRef) {
      formData.set("productReferenceId", initialProductRef);
    }

    referenceFiles.forEach((file) => {
      formData.append("referenceFiles", file);
    });

    const res = await submitCustomRequestAction(null, formData);
    setIsSubmitting(false);

    if (res.success && res.requestId) {
      setSubmissionResult({
        requestId: res.requestId,
        guestToken: res.guestToken,
        trackingUrl: res.trackingUrl,
      });
    } else if (res.errors) {
      setFormErrors(res.errors);
    } else if (res.message) {
      setFormErrors({ general: res.message });
    }
  }

  if (submissionResult) {
    return (
      <div className="bg-surface-cloud p-8 sm:p-12 rounded-3xl border border-border-warm shadow-sm text-center max-w-2xl mx-auto space-y-6">
        <div className="w-16 h-16 rounded-full bg-strawberry-subtle text-strawberry-blush flex items-center justify-center text-3xl mx-auto shadow-xs">
          🎨
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-primary">
            Inquiry Logged Successfully
          </span>
          <h2 className="font-headline text-2xl sm:text-3xl font-bold text-espresso-deep">
            Your Bespoke Concept is in Studio Review
          </h2>
          <p className="text-sm text-espresso-muted leading-relaxed">
            Our master craft artisan will review your sculpture brief, reference photos, and required lead time. You will receive a formalized itemized quotation within 24 hours.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-surface-custard border border-border-warm text-left space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-espresso-muted">Inquiry Reference Code:</span>
            <code className="font-mono font-bold text-espresso-deep bg-surface-cloud px-2 py-0.5 rounded">
              {submissionResult.requestId.slice(0, 8).toUpperCase()}
            </code>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-espresso-muted">Confirmation Sent To:</span>
            <span className="font-semibold text-espresso-deep">{customerEmail}</span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={submissionResult.trackingUrl}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-primary hover:bg-opacity-95 text-white font-bold text-xs transition-all shadow-sm"
          >
            Track Commission Status →
          </Link>
          <Link
            href="/shop"
            className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-surface-custard hover:bg-border-warm/60 text-espresso-deep font-bold text-xs border border-border-warm transition-all"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8" data-testid="custom-order-form">
      {formErrors.general && (
        <div className="p-4 rounded-2xl bg-red-50 border border-error/30 text-error text-xs font-semibold" role="alert">
          ⚠️ {formErrors.general}
        </div>
      )}

      {/* Step 1: Commission Concept & Brief */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface-cloud border border-border-warm space-y-5">
        <div className="border-b border-border-warm pb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary block">
            Step 1 of 3
          </span>
          <h3 className="font-headline font-bold text-lg text-espresso-deep">
            Artisanal Concept &amp; Specifications
          </h3>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <label htmlFor="custom-title" className="block text-xs font-bold uppercase tracking-wider text-espresso-deep">
            Keepsake Concept Title <span className="text-primary">*</span>
          </label>
          <input
            id="custom-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Miniature Calico Cat with Gold Bell"
            className="w-full px-4 py-3 rounded-2xl border border-border-warm bg-surface-custard text-espresso-deep text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          />
          {formErrors.title && <p className="text-xs text-error font-medium">{formErrors.title}</p>}
        </div>

        {/* Brief */}
        <div className="space-y-1.5">
          <label htmlFor="custom-brief" className="block text-xs font-bold uppercase tracking-wider text-espresso-deep">
            Detailed Sculpture Brief <span className="text-primary">*</span>
          </label>
          <textarea
            id="custom-brief"
            required
            rows={4}
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="Describe your vision in detail: colors, character expressions, pose, special accessories (mini hat, collar, floral wreath), and preferred dimensions..."
            className="w-full px-4 py-3 rounded-2xl border border-border-warm bg-surface-custard text-espresso-deep text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          />
          <p className="text-[11px] text-espresso-muted">
            Minimum 15 characters. Be as specific as possible to help us sculpt the exact likeness.
          </p>
          {formErrors.brief && <p className="text-xs text-error font-medium">{formErrors.brief}</p>}
        </div>

        {/* Desired Delivery Date */}
        <div className="space-y-1.5">
          <label htmlFor="custom-date" className="block text-xs font-bold uppercase tracking-wider text-espresso-deep">
            Desired Delivery Date (Optional)
          </label>
          <input
            id="custom-date"
            type="date"
            min={minDateStr}
            value={desiredDeliveryDate}
            onChange={(e) => setDesiredDeliveryDate(e.target.value)}
            className="w-full sm:w-64 px-4 py-2.5 rounded-2xl border border-border-warm bg-surface-custard text-espresso-deep text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          />
          <p className="text-[11px] text-espresso-muted">
            Bespoke hand-sculpting, curing, and triple diamond glazing requires at least 7 studio business days.
          </p>
          {formErrors.desiredDeliveryDate && (
            <p className="text-xs text-error font-medium">{formErrors.desiredDeliveryDate}</p>
          )}
        </div>
      </div>

      {/* Step 2: Reference Image Uploads */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface-cloud border border-border-warm space-y-4">
        <div className="border-b border-border-warm pb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary block">
            Step 2 of 3
          </span>
          <h3 className="font-headline font-bold text-lg text-espresso-deep">
            Reference Photographs &amp; Sketches
          </h3>
          <p className="text-xs text-espresso-muted mt-0.5">
            Upload clear photos of your pet, character reference, or sketches (up to 5 photos, max 5MB each).
          </p>
        </div>

        <div className="border-2 border-dashed border-border-warm rounded-2xl p-6 text-center hover:border-primary transition-colors bg-surface-custard/50">
          <input
            type="file"
            id="reference-files"
            multiple
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
          <label
            htmlFor="reference-files"
            className="cursor-pointer flex flex-col items-center justify-center gap-2"
          >
            <span className="text-2xl">📸</span>
            <span className="text-xs font-bold text-primary hover:underline">
              Click to select reference images
            </span>
            <span className="text-[11px] text-espresso-muted">
              PNG, JPG, or WebP up to 5MB
            </span>
          </label>
        </div>

        {referenceFiles.length > 0 && (
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-bold uppercase text-espresso-muted">
              Selected Attachments ({referenceFiles.length}/5):
            </span>
            <ul className="space-y-1.5">
              {referenceFiles.map((file, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-surface-custard border border-border-warm text-xs text-espresso-deep"
                >
                  <span className="truncate max-w-xs">{file.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-espresso-muted font-mono">
                      {(file.size / 1024).toFixed(0)} KB
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      className="text-error hover:text-red-700 font-bold text-xs"
                      aria-label={`Remove ${file.name}`}
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Step 3: Customer Information */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface-cloud border border-border-warm space-y-4">
        <div className="border-b border-border-warm pb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary block">
            Step 3 of 3
          </span>
          <h3 className="font-headline font-bold text-lg text-espresso-deep">
            Contact &amp; Studio Quotation Dispatch
          </h3>
          <p className="text-xs text-espresso-muted mt-0.5">
            We deliver quotation decisions directly via your portal link and email.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="customer-name" className="block text-xs font-bold uppercase tracking-wider text-espresso-deep">
              Your Name <span className="text-primary">*</span>
            </label>
            <input
              id="customer-name"
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Fatima Tariq"
              className="w-full px-4 py-3 rounded-2xl border border-border-warm bg-surface-custard text-espresso-deep text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
            {formErrors.customerName && (
              <p className="text-xs text-error font-medium">{formErrors.customerName}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="customer-email" className="block text-xs font-bold uppercase tracking-wider text-espresso-deep">
              Email Address <span className="text-primary">*</span>
            </label>
            <input
              id="customer-email"
              type="email"
              required
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="fatima@example.com"
              className="w-full px-4 py-3 rounded-2xl border border-border-warm bg-surface-custard text-espresso-deep text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
            {formErrors.customerEmail && (
              <p className="text-xs text-error font-medium">{formErrors.customerEmail}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="customer-phone" className="block text-xs font-bold uppercase tracking-wider text-espresso-deep">
            Pakistani Mobile Number <span className="text-primary">*</span>
          </label>
          <input
            id="customer-phone"
            type="tel"
            required
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="03001234567"
            className="w-full sm:w-64 px-4 py-3 rounded-2xl border border-border-warm bg-surface-custard text-espresso-deep text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
          <p className="text-[11px] text-espresso-muted">
            Used for delivery tracking and courier SMS updates.
          </p>
          {formErrors.customerPhone && (
            <p className="text-xs text-error font-medium">{formErrors.customerPhone}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="text-center pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto min-w-[280px] py-4 px-10 rounded-full bg-primary hover:bg-opacity-95 text-white font-bold text-sm transition-all shadow-md active:scale-98 disabled:opacity-50"
        >
          {isSubmitting ? "Transmitting to Atelier..." : "✨ Submit Bespoke Inquiry for Review"}
        </button>
      </div>
    </form>
  );
}

