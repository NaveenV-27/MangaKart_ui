import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// 1. Define the CartItem and CartState interfaces
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

// 2. Define the initial state using the CartState interface
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
        addToCart: (state, action: PayloadAction<Omit<CartItem, 'quantity'>>) => {
            const newItem = action.payload;
            const existingItem = state.cartItems.find(cartItem => cartItem._id === newItem._id);

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                state.cartItems.push({ ...newItem, quantity: 1 });
            }

            const { totalAmount, totalCount } = calculateTotals(state.cartItems);
            state.totalAmount = totalAmount;
            state.totalCount = totalCount;
        },

        decrementQuantity: (state, action: PayloadAction<string>) => {
            const id = action.payload;
            const existingItem = state.cartItems.find(cartItem => cartItem._id === id);

            if (existingItem) {
                existingItem.quantity -= 1;

                if (existingItem.quantity <= 0) {
                    state.cartItems = state.cartItems.filter(cartItem => cartItem._id !== id);
                }
            }

            const { totalAmount, totalCount } = calculateTotals(state.cartItems);
            state.totalAmount = totalAmount;
            state.totalCount = totalCount;
        },

        removeItem: (state, action: PayloadAction<string>) => {
            const id = action.payload;
            state.cartItems = state.cartItems.filter(cartItem => cartItem._id !== id);

            const { totalAmount, totalCount } = calculateTotals(state.cartItems);
            state.totalAmount = totalAmount;
            state.totalCount = totalCount;
        },

        clearCart: (state) => {
            state.cartItems = [];
            state.totalAmount = 0;
            state.totalCount = 0;
        },
    },
});

export const {
    addToCart,
    decrementQuantity,
    removeItem,
    clearCart
} = cartSlice.actions;

export default cartSlice.reducer;