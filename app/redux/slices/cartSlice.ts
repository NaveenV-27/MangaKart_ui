import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  _id: string;
  type?: string;
  title: string;
  cover_image: string;
  price: number;
  quantity: number;
}

export interface CartState {
  cartItems: CartItem[];
  totalAmount: number;
  totalCount: number;
}

const initialState: CartState = {
  cartItems: [],
  totalAmount: 0,
  totalCount: 0,
};

// ⚙️ Helper function to calculate total amount and count
const calculateTotals = (items: CartItem[]) => {
  let totalAmount = 0;
  let totalCount = 0;

  items.forEach(item => {
    totalAmount += item.price * item.quantity;
    totalCount += item.quantity;
  });

  return { totalAmount, totalCount };
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {

    // ➕ Add a new item or increase quantity of an existing item
    addToCart: (state, action: PayloadAction<Omit<CartItem, 'quantity'>>) => {
      const newItem = action.payload;
      const existingItem = state.cartItems.find(cartItem => cartItem._id === newItem._id);

      if (existingItem) {
        // Increment quantity if item already exists
        existingItem.quantity += 1;
      } else {
        // Add new item with quantity of 1
        state.cartItems.push({ ...newItem, quantity: 1 });
      }

      // Recalculate totals
      const { totalAmount, totalCount } = calculateTotals(state.cartItems);
      state.totalAmount = totalAmount;
      state.totalCount = totalCount;
      // console.log("Updated state", totalCount, totalAmount, newItem)
    },

    // ➖ Decrease quantity or remove item if quantity hits zero
    decrementQuantity: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const existingItem = state.cartItems.find(cartItem => cartItem._id === id);

      if (existingItem) {
        existingItem.quantity -= 1;

        if (existingItem.quantity <= 0) {
          // Remove item from cart if quantity reaches 0
          state.cartItems = state.cartItems.filter(cartItem => cartItem._id !== id);
        }
      }

      // Recalculate totals
      const { totalAmount, totalCount } = calculateTotals(state.cartItems);
      state.totalAmount = totalAmount;
      state.totalCount = totalCount;
    },

    // 🗑️ Completely remove an item regardless of quantity
    removeItem: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.cartItems = state.cartItems.filter(cartItem => cartItem._id !== id);
      
      // Recalculate totals
      const { totalAmount, totalCount } = calculateTotals(state.cartItems);
      state.totalAmount = totalAmount;
      state.totalCount = totalCount;
    },

    // 🧹 Clear the entire cart
    clearCart: (state) => {
      state.cartItems = [];
      state.totalAmount = 0;
      state.totalCount = 0;
    },
  },
});

// 📤 Export actions and reducer
export const { 
    addToCart, 
    decrementQuantity, 
    removeItem, 
    clearCart 
} = cartSlice.actions;

export default cartSlice.reducer;