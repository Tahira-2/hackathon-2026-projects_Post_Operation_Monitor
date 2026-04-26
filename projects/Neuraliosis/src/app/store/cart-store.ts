import { create } from 'zustand';
import type { Medicine } from '../api/models';

export interface CartItem {
  medicine: Medicine;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  addItem: (medicine: Medicine) => void;
  removeItem: (medicineId: number) => void;
  updateQuantity: (medicineId: number, quantity: number) => void;
  clearCart: () => void;
  totalPrice: () => number;
  totalItems: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (medicine) => {
    const existing = get().items.find((i) => i.medicine.id === medicine.id);
    if (existing) {
      set({
        items: get().items.map((i) =>
          i.medicine.id === medicine.id ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      });
    } else {
      set({ items: [...get().items, { medicine, quantity: 1 }] });
    }
  },

  removeItem: (medicineId) => {
    set({ items: get().items.filter((i) => i.medicine.id !== medicineId) });
  },

  updateQuantity: (medicineId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(medicineId);
      return;
    }
    set({
      items: get().items.map((i) =>
        i.medicine.id === medicineId ? { ...i, quantity } : i,
      ),
    });
  },

  clearCart: () => set({ items: [] }),

  totalPrice: () =>
    get().items.reduce((sum, i) => sum + parseFloat(i.medicine.price) * i.quantity, 0),

  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));
