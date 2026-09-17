"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  parseWeightGrams,
  type Product,
} from "@/lib/products";

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  itemCount: number;
  totalPrice: number;
  totalWeightGrams: number;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((product: Product, quantity = 1) => {
    const safeQuantity = Math.max(1, Math.min(99, quantity));
    setItems((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: Math.min(99, item.quantity + safeQuantity),
              }
            : item,
        );
      }
      return [...current, { product, quantity: safeQuantity }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems((current) =>
      current.filter((item) => item.product.id !== productId),
    );
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    const safeQuantity = Math.min(99, Math.max(0, quantity));
    if (safeQuantity === 0) {
      setItems((current) =>
        current.filter((item) => item.product.id !== productId),
      );
      return;
    }
    setItems((current) =>
      current.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: safeQuantity }
          : item,
      ),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((open) => !open), []);

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const totalPrice = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0,
      ),
    [items],
  );

  const totalWeightGrams = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + parseWeightGrams(item.product.weight) * item.quantity,
        0,
      ),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      isOpen,
      itemCount,
      totalPrice,
      totalWeightGrams,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      openCart,
      closeCart,
      toggleCart,
    }),
    [
      items,
      isOpen,
      itemCount,
      totalPrice,
      totalWeightGrams,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      openCart,
      closeCart,
      toggleCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
