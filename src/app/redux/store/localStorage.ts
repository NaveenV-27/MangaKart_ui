"use client";

import { RootState } from './store';
import { CartState, CartItem } from '../slices/cartSlice'; // 👈 Import required types

// Helper to recalculate totals, used when loading raw items from storage
const calculateTotalsOnLoad = (items: CartItem[]): { totalAmount: number, totalCount: number } => {
    let totalAmount = 0;
    let totalCount = 0;

    items.forEach(item => {
        totalAmount += item.price * item.quantity;
        totalCount += item.quantity;
    });

    return { totalAmount, totalCount };
};

/**
 * Loads the cart state from localStorage. Returns the CartState object or undefined.
 * @returns {CartState | undefined} The loaded state or undefined if not found/error.
 */
export const loadState = (): CartState | undefined => {
    try {
        const serializedState = localStorage.getItem('cart');
        
        // 🎯 FIX: Return undefined if nothing is found (tells Redux to use initialState)
        if (serializedState === null || serializedState === "[]") { 
            return undefined;
        }

        // The saved data is just the array of CartItems
        const cartItems: CartItem[] = JSON.parse(serializedState);
        
        // Calculate totals based on the loaded array
        const { totalAmount, totalCount } = calculateTotalsOnLoad(cartItems);

        // Return the full CartState structure
        const cartState: CartState = {
            cartItems: cartItems,
            totalAmount: totalAmount,
            totalCount: totalCount,
        };

        return cartState;

    } catch (err) {
        console.error("Error loading state from localStorage:", err);
        return undefined; // 🎯 FIX: Return undefined on error
    }
};

/**
 * Saves the current Redux state to localStorage.
 * @param {RootState} state The root state of the Redux store.
 */
export const saveState = (state: RootState) => {
    try {
        // Only serialize the cartItems array to save space
        const serializedItems = JSON.stringify(state.cart?.cartItems);
        localStorage.setItem('cart', serializedItems);
    } catch (err) {
        console.error("Error saving state to localStorage:", err);
    }
};