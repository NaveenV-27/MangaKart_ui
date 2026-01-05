import { configureStore, Reducer } from '@reduxjs/toolkit';
import cartReducer from '../slices/cartSlice';
import { loadState, saveState } from './localStorage';
import debounce from './debounce'; // Assuming debounce utility is defined elsewhere

type CartStateType = ReturnType<typeof cartReducer>; 

// 2. Create a modified type for your cartReducer that explicitly
// includes 'undefined' as a possible state, thus resolving the error.
// This is the cleanest way to fix the Reducer assignability issue.
const typedCartReducer = cartReducer as Reducer<CartStateType | undefined>;

// Define the expected structure for the preloaded state
interface RootPreloadedState {
    cart?: CartStateType;
}

const loadedCartState = loadState(); 

export const store = configureStore({
    reducer: {
        // 🎯 FIX: Use the type-asserted reducer here
        cart: typedCartReducer 
    },
    // The preloadedState logic remains the same
    preloadedState: (loadedCartState ? { cart: loadedCartState } : {}) as RootPreloadedState,
});


// 4. Setup state persistence (no change needed here, provided for completeness)
const saveStateDebounced = debounce(() => {
    saveState(store.getState());
    console.log("Saved");
}, 1000); 

store.subscribe(saveStateDebounced);

// 5. Export root types for use in hooks and other files
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch