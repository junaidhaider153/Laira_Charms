"use client";

import React, { useState } from "react";
import { submitPaymentProofAction } from "@/lib/payment/actions";
import { PAKISTANI_PAYMENT_ACCOUNTS } from "@/lib/payment/bank-details";

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
    <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-surface-custard border border-border-warm shadow-xs space-y-6">
      <div>
        <h3 className="font-headline font-bold text-xl text-espresso-deep">
          Upload Payment Proof Screenshot
        </h3>
        <p className="text-xs text-espresso-muted mt-0.5">
          Submit your bank receipt or wallet transaction screenshot to initiate studio verification.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-error/10 border border-error/30 text-error text-xs flex items-start gap-2.5">
          <span className="text-base shrink-0">⚠️</span>
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Payment Method Selector */}
      <div>
        <label className="block text-xs font-bold text-espresso-deep mb-2">
          Payment Method Used <span className="text-primary">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PAKISTANI_PAYMENT_ACCOUNTS.map((acc) => (
            <label
              key={acc.id}
              className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-colors ${
                methodId === acc.id
                  ? "bg-peach-tint border-primary font-bold text-espresso-deep"
                  : "bg-surface-cloud border-border-warm text-espresso-muted hover:border-espresso-muted"
              }`}
            >
              <input
                type="radio"
                name="methodId"
                value={acc.id}
                checked={methodId === acc.id}
                onChange={() => setMethodId(acc.id as "meezan" | "easypaisa" | "jazzcash")}
                className="text-primary focus:ring-primary h-4 w-4"
              />
              <span className="text-xs">{acc.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Sender Name */}
        <div>
          <label htmlFor="senderName" className="block text-xs font-bold text-espresso-deep mb-1.5">
            Sender Account Title / Name <span className="text-primary">*</span>
          </label>
          <input
            type="text"
            id="senderName"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            required
            placeholder="e.g. Ayesha Noor"
            className={`w-full px-4 py-2.5 rounded-xl border ${
              fieldErrors.senderName ? "border-error ring-1 ring-error" : "border-border-warm"
            } bg-surface-cloud text-espresso-deep text-sm focus:outline-none focus:ring-2 focus:ring-primary`}
          />
          {fieldErrors.senderName && (
            <p className="text-[11px] text-error mt-1">{fieldErrors.senderName}</p>
          )}
        </div>

        {/* Transaction ID */}
        <div>
          <label htmlFor="transactionId" className="block text-xs font-bold text-espresso-deep mb-1.5">
            Transaction / Reference ID <span className="text-primary">*</span>
          </label>
          <input
            type="text"
            id="transactionId"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            required
            placeholder="e.g. TXN-12345678 or TID 98765"
            className={`w-full px-4 py-2.5 rounded-xl border ${
              fieldErrors.transactionId ? "border-error ring-1 ring-error" : "border-border-warm"
            } bg-surface-cloud text-espresso-deep text-sm focus:outline-none focus:ring-2 focus:ring-primary`}
          />
          {fieldErrors.transactionId && (
            <p className="text-[11px] text-error mt-1">{fieldErrors.transactionId}</p>
          )}
        </div>
      </div>

      {/* Proof File Input */}
      <div>
        <label htmlFor="proofFile" className="block text-xs font-bold text-espresso-deep mb-1.5">
          Receipt Screenshot (PNG, JPG, WEBP, or PDF &bull; Max 5 MB) <span className="text-primary">*</span>
        </label>
        <div className="p-4 rounded-2xl border-2 border-dashed border-border-warm bg-surface-cloud text-center hover:bg-surface-container/60 transition-colors">
          <input
            type="file"
            id="proofFile"
            accept="image/png,image/jpeg,image/webp,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="proofFile"
            className="cursor-pointer flex flex-col items-center justify-center space-y-1.5"
          >
            <span className="text-2xl">📸</span>
            <span className="text-xs font-bold text-primary hover:underline">
              {selectedFileName ? "Change selected screenshot" : "Select or drag receipt screenshot"}
            </span>
            <span className="text-[11px] text-espresso-muted">
              {selectedFileName ? `Selected: ${selectedFileName}` : "Supported formats: JPG, PNG, WEBP, PDF (Max 5MB)"}
            </span>
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={isUploading}
        className="w-full py-3.5 px-6 rounded-full bg-primary text-white font-bold text-sm text-center block hover:bg-opacity-95 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isUploading ? (
          <span className="inline-flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Submitting Proof...
          </span>
        ) : (
          "Submit Payment Proof for Studio Review"
        )}
      </button>

      <p className="text-[11px] text-center text-espresso-muted leading-tight">
        Note: Submitting proof submits your record for manual bank reconciliation. Our artisan reviews transfers within 2-4 business hours.
      </p>
    </form>
  );
}
