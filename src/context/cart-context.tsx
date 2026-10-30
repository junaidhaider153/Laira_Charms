"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string; // Composite unique key: productId + options signature
  productId: string;
  slug: string;
  title: string;
  basePriceMinor: number;
  unitPriceMinor: number; // Includes option deltas
  quantity: number;
  imageUrl: string;
  customization?: Record<string, string>;
  customText?: string;
  leadTimeDays: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotalMinor: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "laira_charms_cart_v1";

function generateItemId(productId: string, customization?: Record<string, string>, customText?: string): string {
  const customKey = customization ? JSON.stringify(customization) : "";
  const textKey = customText ? customText.trim().toLowerCase() : "";
  return `${productId}::${customKey}::${textKey}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      // Safe fallback on storage read errors
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Sync cart to localStorage whenever items change
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Safe fallback on quota/storage write errors
    }
  }, [items, isInitialized]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalMinor = items.reduce((sum, item) => sum + item.unitPriceMinor * item.quantity, 0);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);
  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);

  const addItem = (item: Omit<CartItem, "id">) => {
    const id = generateItemId(item.productId, item.customization, item.customText);

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((i) => i.id === id);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + (item.quantity || 1),
        };
        return updated;
      } else {
        return [...prevItems, { ...item, id }];
      }
    });

    // Auto-open drawer when an item is added for clear feedback
    setIsDrawerOpen(true);
  };

  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotalMinor,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        toggleDrawer,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
