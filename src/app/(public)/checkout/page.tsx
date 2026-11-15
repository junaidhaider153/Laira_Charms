import { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { getShippingPolicySettings } from "@/lib/settings/settings-service";

export const metadata: Metadata = {
  title: "Checkout | Laira Charms",
  description: "Secure handcrafted checkout with nationwide Pakistan delivery and manual bank/wallet transfer.",
};

export default async function CheckoutPage() {
  const shippingPolicy = await getShippingPolicySettings();
  return (
    <div className="min-h-screen bg-canvas-butter py-6">
      <CheckoutForm shippingPolicy={shippingPolicy} />
    </div>
  );
}

