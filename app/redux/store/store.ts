import { configureStore } from '@reduxjs/toolkit';
import cartReducer from '../slices/cartSlice';
import { loadState, saveState } from './localStorage';
import debounce from './debounce';

const preloadedState = {
  cart: loadState(),
};

export const store = configureStore({
  reducer: {
    cart: cartReducer
  },
  preloadedState: preloadedState.cart ? { cart: preloadedState.cart } : {},
});

const saveStateDebounced = debounce(() => {
  saveState(store.getState());
  console.log("Saved");
}, 1000); 

store.subscribe(saveStateDebounced);

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch