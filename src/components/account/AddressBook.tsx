"use client";

import React, { useState } from "react";
import type { CustomerAddress, SaveAddressInput } from "@/lib/account/types";
import { PAKISTANI_PROVINCES, type PakistaniProvince } from "@/lib/checkout/types";
import {
  saveAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
} from "@/lib/account/actions";

interface AddressBookProps {
  initialAddresses: CustomerAddress[];
}

export function AddressBook({ initialAddresses }: AddressBookProps) {
  const [addresses, setAddresses] = useState<CustomerAddress[]>(initialAddresses);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);

  // Form fields
  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState<PakistaniProvince>("Punjab");
  const [postalCode, setPostalCode] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  const openCreateForm = () => {
    setEditingAddress(null);
    setRecipientName("");
    setPhone("");
    setAddressLine1("");
    setAddressLine2("");
    setCity("");
    setProvince("Punjab");
    setPostalCode("");
    setDeliveryNotes("");
    setIsDefault(addresses.length === 0);
    setIsFormOpen(true);
    setFeedback(null);
  };

  const openEditForm = (addr: CustomerAddress) => {
    setEditingAddress(addr);
    setRecipientName(addr.recipientName);
    setPhone(addr.phone);
    setAddressLine1(addr.addressLine1);
    setAddressLine2(addr.addressLine2 || "");
    setCity(addr.city);
    setProvince(addr.province);
    setPostalCode(addr.postalCode || "");
    setDeliveryNotes(addr.deliveryNotes || "");
    setIsDefault(addr.isDefault);
    setIsFormOpen(true);
    setFeedback(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const input: SaveAddressInput = {
      id: editingAddress?.id,
      recipientName,
      phone,
      addressLine1,
      addressLine2: addressLine2 || null,
      city,
      province,
      postalCode: postalCode || null,
      deliveryNotes: deliveryNotes || null,
      isDefault,
    };

    const result = await saveAddressAction(input);
    if (!result.success || !result.address) {
      setFeedback({ type: "error", message: result.message });
      setIsSubmitting(false);
      return;
    }

    setFeedback({ type: "success", message: result.message });

    if (editingAddress) {
      setAddresses((prev) =>
        prev.map((a) => (a.id === result.address!.id ? result.address! : isDefault ? { ...a, isDefault: false } : a))
      );
    } else {
      setAddresses((prev) => {
        const next = isDefault ? prev.map((a) => ({ ...a, isDefault: false })) : [...prev];
        return [result.address!, ...next];
      });
    }

    setIsFormOpen(false);
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;

    const result = await deleteAddressAction(id);
    if (!result.success) {
      setFeedback({ type: "error", message: result.message });
      return;
    }

    setAddresses((prev) => {
      const remaining = prev.filter((a) => a.id !== id);
      if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
        remaining[0].isDefault = true;
      }
      return remaining;
    });
  };

  const handleSetDefault = async (id: string) => {
    const result = await setDefaultAddressAction(id);
    if (!result.success) {
      setFeedback({ type: "error", message: result.message });
      return;
    }

    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline font-bold text-xl text-espresso-deep">
            Saved Delivery Addresses
          </h2>
          <p className="text-xs text-espresso-muted mt-0.5">
            Manage your verified shipping addresses across Pakistan for fast one-click checkout.
          </p>
        </div>

        <button
          onClick={openCreateForm}
          className="px-5 py-2.5 rounded-full bg-strawberry-blush text-on-primary font-bold text-xs hover:opacity-95 shadow-xs transition-all active:scale-95"
        >
          + Add New Address
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold ${
            feedback.type === "success"
              ? "bg-secondary/15 text-secondary border border-secondary/30"
              : "bg-error/10 text-error border border-error/30"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Address Form Dialog / Expandable */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="p-6 rounded-3xl bg-surface-cloud border-2 border-strawberry-blush/30 shadow-md space-y-4"
        >
          <div className="flex items-center justify-between border-b border-border-warm pb-3">
            <h3 className="font-headline font-bold text-base text-espresso-deep">
              {editingAddress ? "Edit Delivery Address" : "New Delivery Address"}
            </h3>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-xs font-bold text-espresso-muted hover:text-espresso-deep"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="recipientName" className="block text-xs font-bold text-espresso-deep mb-1">
                Recipient Full Name <span className="text-strawberry-blush-dark">*</span>
              </label>
              <input
                id="recipientName"
                type="text"
                required
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Ayesha Noor"
                className="w-full px-4 py-2.5 rounded-2xl border border-border-warm bg-canvas-butter text-xs focus:ring-2 focus:ring-strawberry-blush focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-bold text-espresso-deep mb-1">
                Mobile Number (03xx) <span className="text-strawberry-blush-dark">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="03001234567"
                className="w-full px-4 py-2.5 rounded-2xl border border-border-warm bg-canvas-butter text-xs font-mono focus:ring-2 focus:ring-strawberry-blush focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="addressLine1" className="block text-xs font-bold text-espresso-deep mb-1">
              Street Address &amp; House/Apartment # <span className="text-strawberry-blush-dark">*</span>
            </label>
            <input
              id="addressLine1"
              type="text"
              required
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              placeholder="e.g. House 14-B, Street 3, Sector F-7/1"
              className="w-full px-4 py-2.5 rounded-2xl border border-border-warm bg-canvas-butter text-xs focus:ring-2 focus:ring-strawberry-blush focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="city" className="block text-xs font-bold text-espresso-deep mb-1">
                City <span className="text-strawberry-blush-dark">*</span>
              </label>
              <input
                id="city"
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Islamabad"
                className="w-full px-4 py-2.5 rounded-2xl border border-border-warm bg-canvas-butter text-xs focus:ring-2 focus:ring-strawberry-blush focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label htmlFor="province" className="block text-xs font-bold text-espresso-deep mb-1">
                Province / Territory <span className="text-strawberry-blush-dark">*</span>
              </label>
              <select
                id="province"
                value={province}
                onChange={(e) => setProvince(e.target.value as PakistaniProvince)}
                className="w-full px-4 py-2.5 rounded-2xl border border-border-warm bg-canvas-butter text-xs focus:ring-2 focus:ring-strawberry-blush focus:border-transparent outline-none transition-all"
              >
                {PAKISTANI_PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="postalCode" className="block text-xs font-bold text-espresso-deep mb-1">
                Postal Code (5 digits)
              </label>
              <input
                id="postalCode"
                type="text"
                maxLength={5}
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="44000"
                className="w-full px-4 py-2.5 rounded-2xl border border-border-warm bg-canvas-butter text-xs font-mono focus:ring-2 focus:ring-strawberry-blush focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="deliveryNotes" className="block text-xs font-bold text-espresso-deep mb-1">
              Delivery Notes (Optional)
            </label>
            <input
              id="deliveryNotes"
              type="text"
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="e.g. Near commercial market, ring gate bell twice"
              className="w-full px-4 py-2.5 rounded-2xl border border-border-warm bg-canvas-butter text-xs focus:ring-2 focus:ring-strawberry-blush focus:border-transparent outline-none transition-all"
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-bold text-espresso-deep cursor-pointer">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="rounded text-strawberry-blush focus:ring-strawberry-blush"
            />
            <span>Set as default shipping destination</span>
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-5 py-2.5 rounded-full border border-border-warm text-xs font-semibold text-espresso-muted hover:text-espresso-deep hover:bg-canvas-butter transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-full bg-strawberry-blush text-on-primary text-xs font-bold shadow-xs hover:opacity-95 disabled:opacity-50 transition-all active:scale-95"
            >
              {isSubmitting ? "Saving..." : editingAddress ? "Update Address" : "Save Address"}
            </button>
          </div>
        </form>
      )}

      {/* Address Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.length === 0 ? (
          <div className="md:col-span-2 text-center py-10 p-6 rounded-3xl bg-surface-custard border border-border-warm text-espresso-muted">
            <span className="text-3xl mb-2 block">🏡</span>
            <p className="font-bold text-sm text-espresso-deep">No Saved Addresses</p>
            <p className="text-xs mt-1">Add your Pakistani home or work address for seamless checkout.</p>
          </div>
        ) : (
          addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-6 rounded-3xl bg-surface-cloud border transition-all space-y-3 relative shadow-xs ${
                addr.isDefault
                  ? "border-strawberry-blush shadow-sm ring-1 ring-strawberry-blush/20"
                  : "border-border-warm/60 hover:border-border-warm"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-espresso-deep font-headline">
                      {addr.recipientName}
                    </span>
                    {addr.isDefault && (
                      <span className="px-2.5 py-0.5 rounded-full bg-strawberry-blush text-on-primary text-[10px] font-bold uppercase tracking-wider">
                        Default
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-espresso-muted font-mono">{addr.phone}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditForm(addr)}
                    className="p-2 rounded-xl text-xs text-espresso-muted hover:text-espresso-deep hover:bg-surface-custard transition-colors"
                    title="Edit Address"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="p-2 rounded-xl text-xs text-error hover:bg-error/10 transition-colors"
                    title="Delete Address"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="text-xs text-espresso-deep leading-relaxed">
                <p>{addr.addressLine1}</p>
                {addr.addressLine2 && <p className="text-espresso-muted">{addr.addressLine2}</p>}
                <p>
                  {addr.city}, {addr.province} {addr.postalCode ? `- ${addr.postalCode}` : ""}
                </p>
                {addr.deliveryNotes && (
                  <p className="text-[11px] text-espresso-muted italic mt-1">
                    Note: &ldquo;{addr.deliveryNotes}&rdquo;
                  </p>
                )}
              </div>

              {!addr.isDefault && (
                <div className="pt-2 border-t border-border-warm/50">
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-xs font-bold text-strawberry-blush-dark hover:underline"
                  >
                    Set as Default Address
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

