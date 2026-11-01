import { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Shopping Bag | Laira Charms",
  description: "Review your selected handcrafted keepsake charms and proceed to checkout.",
};

export default function CartPage() {
  return (
    <main className="min-h-screen bg-canvas-butter py-6">
      <CartView />
    </main>
  );
}

