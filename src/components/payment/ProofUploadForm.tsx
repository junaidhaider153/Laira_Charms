"use client";

import React, { useState } from "react";
import { submitPaymentProofAction } from "@/lib/payment/actions";
import { PAKISTANI_PAYMENT_ACCOUNTS } from "@/lib/payment/bank-details";
import { Icon } from "@/components/ui/Icon";

interface ProofUploadFormProps {
  orderReference: string;
  guestToken?: string;
  onSuccess?: (payment?: unknown) => void;
}

export function ProofUploadForm({
  orderReference,
  guestToken,
  onSuccess,
}: ProofUploadFormProps) {
  const [methodId, setMethodId] = useState<"meezan" | "easypaisa" | "jazzcash">("meezan");
  const [senderName, setSenderName] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [proofPath, setProofPath] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("File exceeds 5 MB limit. Please select a compressed image or PDF.");
      return;
    }

    setErrorMessage(null);
    setSelectedFileName(file.name);

    // In local dev/mock or Supabase client storage, construct safe relative path
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const generatedPath = `payment-proofs/${orderReference}/${Date.now()}_${safeName}`;
    setProofPath(generatedPath);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    if (!proofPath && !selectedFileName) {
      setErrorMessage("Please select your bank or wallet transfer screenshot proof.");
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("orderReference", orderReference);
    formData.append("methodId", methodId);
    formData.append("senderName", senderName);
    formData.append("transactionId", transactionId);
    formData.append(
      "proofPath",
      proofPath || `payment-proofs/${orderReference}/receipt_${Date.now()}.png`
    );
    if (guestToken) {
      formData.append("guestToken", guestToken);
    }

    try {
      const result = await submitPaymentProofAction(null, formData);
      if (!result.success) {
        setErrorMessage(result.message || "Failed to submit payment proof.");
        if (result.errors) {
          setFieldErrors(result.errors);
        }
        setIsUploading(false);
        return;
      }

      setIsUploading(false);
      if (onSuccess) {
        onSuccess(result.payment);
      } else {
        window.location.reload();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMessage(msg);
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-surface-cloud border border-border-warm/50 shadow-sm space-y-6">
      <div>
        <h3 className="font-headline font-bold text-xl sm:text-2xl text-espresso-deep">
          Upload Payment Proof Screenshot
        </h3>
        <p className="font-body-sm text-xs sm:text-sm text-espresso-muted mt-0.5">
          Attach your mobile banking or wallet receipt screenshot so our studio can verify your transfer.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-error/10 border border-error/30 text-error text-xs flex items-start gap-2.5">
          <span className="text-base shrink-0">⚠️</span>
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Payment Method Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-espresso-deep">
          Selected Transfer Channel <span className="text-strawberry-blush">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PAKISTANI_PAYMENT_ACCOUNTS.map((acc) => (
            <label
              key={acc.id}
              className={`p-3.5 rounded-2xl border text-xs font-semibold cursor-pointer transition-all flex items-center justify-between ${
                methodId === acc.id
                  ? "border-strawberry-blush bg-surface-custard text-espresso-deep shadow-xs ring-1 ring-strawberry-blush"
                  : "border-border-warm bg-canvas-butter hover:bg-surface-cloud text-espresso-muted"
              }`}
            >
              <span className="font-bold">{acc.name}</span>
              <input
                type="radio"
                name="paymentChannel"
                value={acc.id}
                checked={methodId === acc.id}
                onChange={() => setMethodId(acc.id as "meezan" | "easypaisa" | "jazzcash")}
                className="text-strawberry-blush focus:ring-primary"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Sender Name & Transaction Reference */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="senderName" className="block text-xs font-bold text-espresso-deep mb-1.5">
            Sender Name / Title on Account <span className="text-strawberry-blush">*</span>
          </label>
          <input
            type="text"
            id="senderName"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            required
            placeholder="e.g. Ayesha Noor"
            className="w-full px-4 py-3 rounded-2xl border border-border-warm bg-canvas-butter text-espresso-deep text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-strawberry-blush shadow-xs"
          />
          {fieldErrors.senderName && (
            <p className="text-[11px] text-error mt-1">{fieldErrors.senderName}</p>
          )}
        </div>

        <div>
          <label htmlFor="transactionId" className="block text-xs font-bold text-espresso-deep mb-1.5">
            Bank Ref / Transaction ID (TID) <span className="text-strawberry-blush">*</span>
          </label>
          <input
            type="text"
            id="transactionId"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            required
            placeholder="e.g. 9876543210 or Raast ID"
            className="w-full px-4 py-3 rounded-2xl border border-border-warm bg-canvas-butter text-espresso-deep text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-strawberry-blush shadow-xs"
          />
          {fieldErrors.transactionId && (
            <p className="text-[11px] text-error mt-1">{fieldErrors.transactionId}</p>
          )}
        </div>
      </div>

      {/* File Upload Box */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-espresso-deep">
          Transfer Screenshot (PNG, JPG, PDF up to 5 MB) <span className="text-strawberry-blush">*</span>
        </label>
        <div className="p-6 border-2 border-dashed border-border-warm rounded-3xl bg-surface-custard/40 text-center hover:bg-surface-custard/70 transition-colors">
          <input
            type="file"
            id="proofFile"
            accept="image/png,image/jpeg,image/webp,application/pdf"
            onChange={handleFileChange}
            className="sr-only"
          />
          <label htmlFor="proofFile" className="cursor-pointer block">
            <Icon name="cloud_upload" className="text-[32px] text-strawberry-blush mb-2" aria-hidden="true" />
            <span className="block font-bold text-sm text-espresso-deep">
              {selectedFileName ? selectedFileName : "Choose receipt file or tap to browse"}
            </span>
            <span className="block text-[11px] text-espresso-muted mt-1">
              Supports screenshots from Meezan App, EasyPaisa, or JazzCash.
            </span>
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={isUploading}
        className="w-full py-4 px-6 rounded-full bg-strawberry-blush text-on-primary font-bold text-sm text-center block hover:opacity-95 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 active:scale-98"
      >
        {isUploading ? "Uploading & Verifying Proof..." : "Submit Payment Proof for Studio Review"}
      </button>

      <p className="font-label-sm text-[11px] text-center text-espresso-muted leading-tight">
        Manual reviews are performed by studio artists during business hours (10 AM - 8 PM PKT).
      </p>
    </form>
  );
}
