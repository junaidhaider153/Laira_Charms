"use client";

import React, { useState } from "react";
import Link from "next/link";
import { submitCustomRequestAction } from "@/lib/custom-order/actions";
import { Icon } from "@/components/ui/Icon";

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
      <div className="bg-surface-cloud p-8 sm:p-12 rounded-3xl border border-border-warm/50 shadow-sm text-center max-w-2xl mx-auto space-y-6">
        <div className="w-16 h-16 rounded-full bg-strawberry-subtle text-strawberry-blush flex items-center justify-center text-3xl mx-auto shadow-xs">
          🎨
        </div>

        <div className="space-y-2">
          <span className="font-label-sm text-xs uppercase font-bold tracking-widest text-primary block">
            Bespoke Inquiry Received
          </span>
          <h2 className="font-headline text-2xl sm:text-3xl font-bold text-espresso-deep">
            Your Bespoke Concept is in Studio Review!
          </h2>
          <p className="font-body-sm text-sm text-espresso-muted max-w-md mx-auto leading-relaxed">
            Our atelier sculptor will review your inspiration photos and issue an official quotation with guaranteed delivery timing within 24 business hours.
          </p>
          <div className="font-mono text-xs font-bold text-espresso-deep mt-2">
            Inquiry Reference Code: <span className="text-strawberry-blush">{submissionResult.requestId}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-custard border border-border-warm text-xs text-espresso-deep space-y-2">
          <p className="font-bold text-sm">Save Your Direct Tracking Link:</p>
          <div className="p-2.5 bg-surface-cloud rounded-xl border border-border-warm/60 font-mono text-[11px] break-all select-all text-strawberry-blush">
            {typeof window !== "undefined" ? window.location.origin : ""}{submissionResult.trackingUrl}
          </div>
          <p className="text-[11px] text-espresso-muted">
            We also emailed you a secure access link to follow your quotation and chat directly with our studio artists.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={submissionResult.trackingUrl}
            className="px-8 py-3.5 rounded-full bg-strawberry-blush text-on-primary font-bold text-xs hover:opacity-95 shadow-md transition-all active:scale-95 text-center"
          >
            Track Commission Status
          </Link>
          <Link
            href="/shop"
            className="px-8 py-3.5 rounded-full bg-surface-custard text-espresso-deep font-semibold text-xs hover:bg-surface-container transition-all border border-border-warm text-center shadow-xs"
          >
            Explore Ready-Made Charms
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface-cloud p-6 sm:p-10 rounded-3xl border border-border-warm/50 shadow-sm space-y-8 max-w-3xl mx-auto"
    >
      {/* Honeypot field for bot spam prevention */}
      <div className="hidden" aria-hidden="true" style={{ display: "none" }}>
        <label htmlFor="studio_inquiry_hp">Leave empty</label>
        <input
          id="studio_inquiry_hp"
          type="text"
          name="studio_inquiry_hp"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="border-b border-border-warm/50 pb-5">
        <span className="font-label-sm text-xs uppercase font-bold tracking-widest text-primary block mb-1">
          Custom Commission Atelier
        </span>
        <h2 className="font-headline text-2xl sm:text-3xl font-bold text-espresso-deep">
          Design Your 1-of-1 Keepsake
        </h2>
        <p className="font-body-sm text-sm text-espresso-muted mt-1 leading-relaxed">
          From miniature pet portraits to anime sprites and bespoke bag charms, tell us your concept and our studio will sculpt your dream charm.
        </p>
      </div>

      {formErrors.general && (
        <div className="p-4 rounded-2xl bg-red-50 border border-error/30 text-error text-xs font-semibold" role="alert">
          ⚠️ {formErrors.general}
        </div>
      )}

      {/* Concept Title */}
      <div className="space-y-1.5">
        <label htmlFor="custom-title" className="font-headline font-bold text-xs uppercase tracking-wider text-espresso-deep block">
          Keepsake Concept Title <span className="text-strawberry-blush">*</span>
        </label>
        <input
          id="custom-title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Miniature Calico Cat with Gold Star Clasp"
          className="w-full px-4 py-3 rounded-2xl border border-border-warm bg-canvas-butter text-sm text-espresso-deep focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-strawberry-blush shadow-xs"
        />
        {formErrors.title && (
          <p className="text-xs text-error font-medium">{formErrors.title}</p>
        )}
      </div>

      {/* Detailed Brief */}
      <div className="space-y-1.5">
        <label htmlFor="custom-brief" className="font-headline font-bold text-xs uppercase tracking-wider text-espresso-deep block">
          Detailed Sculpture Brief <span className="text-strawberry-blush">*</span>
        </label>
        <textarea
          id="custom-brief"
          required
          rows={5}
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder="Describe your vision: pose, facial expression, colors, size (~3-5cm), hardware clip style, and any specific markings."
          className="w-full px-4 py-3 rounded-2xl border border-border-warm bg-canvas-butter text-sm text-espresso-deep focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-strawberry-blush shadow-xs"
        />
        <p className="font-label-sm text-[11px] text-espresso-muted">
          Minimum 20 characters. The more details you share, the closer the sculpture matches your dream!
        </p>
        {formErrors.brief && (
          <p className="text-xs text-error font-medium">{formErrors.brief}</p>
        )}
      </div>

      {/* Target Delivery Date (Optional) */}
      <div className="space-y-1.5">
        <label htmlFor="custom-date" className="font-headline font-bold text-xs uppercase tracking-wider text-espresso-deep block">
          Desired Delivery Date (Optional)
        </label>
        <input
          id="custom-date"
          type="date"
          min={minDateStr}
          value={desiredDeliveryDate}
          onChange={(e) => setDesiredDeliveryDate(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl border border-border-warm bg-canvas-butter text-sm text-espresso-deep focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-strawberry-blush shadow-xs"
        />
        <p className="font-label-sm text-[11px] text-espresso-muted">
          Handmade bespoke sculptures require at least 7-10 business days for sculpting, curing, and triple UV glaze.
        </p>
      </div>

      {/* Photo Reference Uploads */}
      <div className="space-y-3">
        <label className="font-headline font-bold text-xs uppercase tracking-wider text-espresso-deep block">
          Reference Photos / Sketches (Up to 5 images, max 5MB each)
        </label>

        <div className="border-2 border-dashed border-border-warm rounded-3xl p-6 bg-surface-custard/40 text-center hover:bg-surface-custard/70 transition-colors">
          <input
            type="file"
            id="referenceFiles"
            multiple
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileSelect}
            className="sr-only"
            disabled={referenceFiles.length >= 5}
          />
          <label htmlFor="referenceFiles" className="cursor-pointer block space-y-1">
            <Icon name="add_photo_alternate" className="text-[32px] text-strawberry-blush" aria-hidden="true" />
            <span className="block font-bold text-sm text-espresso-deep">
              Click to choose reference images
            </span>
            <span className="block text-[11px] text-espresso-muted">
              Pet photos from multiple angles, anime art, or color palettes.
            </span>
          </label>
        </div>

        {referenceFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {referenceFiles.map((file, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-custard border border-border-warm text-xs text-espresso-deep font-medium shadow-xs"
              >
                <span className="truncate max-w-[150px]">{file.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(idx)}
                  className="text-error hover:text-red-700 font-bold"
                  aria-label={`Remove ${file.name}`}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Customer Contact Information */}
      <div className="pt-4 border-t border-border-warm/50 space-y-4">
        <h3 className="font-headline font-bold text-lg text-espresso-deep">
          Your Contact Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label htmlFor="customer-name" className="text-xs font-bold text-espresso-deep block">
              Your Name <span className="text-strawberry-blush">*</span>
            </label>
            <input
              id="customer-name"
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Fatima Ali"
              className="w-full px-4 py-3 rounded-2xl border border-border-warm bg-canvas-butter text-sm text-espresso-deep focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-strawberry-blush shadow-xs"
            />
            {formErrors.customerName && (
              <p className="text-xs text-error font-medium">{formErrors.customerName}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="customer-email" className="text-xs font-bold text-espresso-deep block">
              Email Address <span className="text-strawberry-blush">*</span>
            </label>
            <input
              id="customer-email"
              type="email"
              required
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="fatima@example.com"
              className="w-full px-4 py-3 rounded-2xl border border-border-warm bg-canvas-butter text-sm text-espresso-deep focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-strawberry-blush shadow-xs"
            />
            {formErrors.customerEmail && (
              <p className="text-xs text-error font-medium">{formErrors.customerEmail}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="customer-phone" className="text-xs font-bold text-espresso-deep block">
              Pakistani Mobile Number <span className="text-strawberry-blush">*</span>
            </label>
            <input
              id="customer-phone"
              type="tel"
              required
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="03001234567"
              className="w-full px-4 py-3 rounded-2xl border border-border-warm bg-canvas-butter text-sm text-espresso-deep focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-strawberry-blush shadow-xs"
            />
            {formErrors.customerPhone && (
              <p className="text-xs text-error font-medium">{formErrors.customerPhone}</p>
            )}
          </div>
        </div>
      </div>

      {/* Submit Action */}
      <div className="pt-4 border-t border-border-warm/50">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 px-8 rounded-full bg-strawberry-blush text-on-primary font-bold text-sm transition-all shadow-md hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:scale-98"
        >
          {isSubmitting ? (
            <span>Sending to Atelier...</span>
          ) : (
            <>
              <Icon name="auto_awesome" className="text-[20px]" aria-hidden="true" />
              <span>Submit Bespoke Inquiry</span>
            </>
          )}
        </button>
        <p className="font-label-sm text-[11px] text-center text-espresso-muted mt-2">
          No advance payment required until you approve our official studio quotation.
        </p>
      </div>
    </form>
  );
}
