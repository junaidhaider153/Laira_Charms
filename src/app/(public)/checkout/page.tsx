import { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout | Laira Charms",
  description: "Secure handcrafted checkout with nationwide Pakistan delivery and manual bank/wallet transfer.",
};

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-canvas-butter py-6">
      <CheckoutForm />
    </main>
  );
}

