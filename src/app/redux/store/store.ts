import { configureStore, Reducer } from '@reduxjs/toolkit';
import cartReducer from '../slices/cartSlice';

type CartStateType = ReturnType<typeof cartReducer>; 

// Create a modified type for your cartReducer that explicitly
// includes 'undefined' as a possible state, thus resolving the error.
const typedCartReducer = cartReducer as Reducer<CartStateType | undefined>;

export const store = configureStore({
    reducer: {
        cart: typedCartReducer 
    },
    // No preloaded state — DB is the source of truth.
    // fetchCart() thunk will load the cart from backend on mount.
});

// Export root types for use in hooks and other files
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch