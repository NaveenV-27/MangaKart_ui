import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

// 1. Define the CartItem and CartState interfaces
// Match backend CartItemInput structure
export interface CartItem {
    volume_id: string;
    manga_title: string;
    volume_title: string;
    type: "volume" | "chapter";
    cover_image: string;
    price: number;
    quantity: number;
}

export interface CartState {
    cartItems: CartItem[];
    totalAmount: number;
    totalCount: number;
    loading?: boolean;
    error?: string;
    message?: string;
}

type ApiResponse<T = any> = {
    apiSuccess: number;
    message: string;
    data: T;
};

// 2. Define the initial state using the CartState interface
const initialState: CartState = {
    cartItems: [],
    totalAmount: 0,
    totalCount: 0,
    loading: false,
    error: "",
    message: "",
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

// --- Backend helpers ---
const normalizeBackendCart = (data: any): CartItem[] => {
    // Backend returns { items: [...] } structure
    const doc = Array.isArray(data) ? data[0] : data;
    const items = doc?.items || [];
    if (!Array.isArray(items)) return [];

    return items.map((it: any) => ({
        volume_id: String(it?.volume_id || ""),
        manga_title: it?.manga_title || "",
        volume_title: it?.volume_title || "",
        type: it?.type || "volume",
        cover_image: it?.cover_image || "",
        price: Number(it?.price ?? 0),
        quantity: Number(it?.quantity ?? 1),
    } as CartItem));
};

const getApiErrorMessage = (err: any, fallback = "Server error") =>
    err?.response?.data?.message || err?.message || fallback;

// --- Thunks (cookie-auth via withCredentials) ---
export const fetchCart = createAsyncThunk<CartItem[], void, { rejectValue: string }>(
    "cart/fetchCart",
    async (_arg, thunkApi) => {
        try {
            const res = await axios.post<ApiResponse>(
                `${process.env.NEXT_PUBLIC_BASE_URL}/api/cart/get_cart`,
                {},
                { withCredentials: true }
            );
            if (res.data.apiSuccess !== 1) {
                return thunkApi.rejectWithValue(res.data.message || "Failed to load cart");
            }
            return normalizeBackendCart(res.data.data);
        } catch (err: any) {
            return thunkApi.rejectWithValue(getApiErrorMessage(err, "Failed to load cart"));
        }
    }
);

export const addToCartDb = createAsyncThunk<CartItem[], Record<string, any>, { rejectValue: string }>(
    "cart/addToCartDb",
    async (payload, thunkApi) => {
        try {
            // Backend endpoint: /api/cart/add_item
            // Send the entire payload as req.body - backend handles it
            const res = await axios.post<ApiResponse>(
                `${process.env.NEXT_PUBLIC_BASE_URL}/api/cart/add_item`,
                payload,
                { withCredentials: true }
            );
            if (res.data.apiSuccess !== 1) {
                return thunkApi.rejectWithValue(res.data.message || "Failed to add to cart");
            }
            return normalizeBackendCart(res.data.data);
        } catch (err: any) {
            return thunkApi.rejectWithValue(getApiErrorMessage(err, "Failed to add to cart"));
        }
    }
);

export const updateCartItemDb = createAsyncThunk<CartItem[], Record<string, any>, { rejectValue: string }>(
    "cart/updateCartItemDb",
    async (payload, thunkApi) => {
        try {
            // Backend endpoint: /api/cart/update_quantity
            // Send the entire payload as req.body - backend handles it
            const res = await axios.post<ApiResponse>(
                `${process.env.NEXT_PUBLIC_BASE_URL}/api/cart/update_quantity`,
                payload,
                { withCredentials: true }
            );
            if (res.data.apiSuccess !== 1) {
                return thunkApi.rejectWithValue(res.data.message || "Failed to update cart");
            }
            return normalizeBackendCart(res.data.data);
        } catch (err: any) {
            return thunkApi.rejectWithValue(getApiErrorMessage(err, "Failed to update cart"));
        }
    }
);

export const removeFromCartDb = createAsyncThunk<CartItem[], Record<string, any>, { rejectValue: string }>(
    "cart/removeFromCartDb",
    async (payload, thunkApi) => {
        try {
            // Backend endpoint: /api/cart/remove_item
            // Send the entire payload as req.body - backend handles it
            const res = await axios.post<ApiResponse>(
                `${process.env.NEXT_PUBLIC_BASE_URL}/api/cart/remove_item`,
                payload,
                { withCredentials: true }
            );
            if (res.data.apiSuccess !== 1) {
                return thunkApi.rejectWithValue(res.data.message || "Failed to remove item");
            }
            return normalizeBackendCart(res.data.data);
        } catch (err: any) {
            return thunkApi.rejectWithValue(getApiErrorMessage(err, "Failed to remove item"));
        }
    }
);

export const clearCartDb = createAsyncThunk<CartItem[], void, { rejectValue: string }>(
    "cart/clearCartDb",
    async (_arg, thunkApi) => {
        try {
            const res = await axios.post<ApiResponse>(
                `${process.env.NEXT_PUBLIC_BASE_URL}/api/cart/clear_cart`,
                {},
                { withCredentials: true }
            );
            if (res.data.apiSuccess !== 1) {
                return thunkApi.rejectWithValue(res.data.message || "Failed to clear cart");
            }
            // Backend might return empty cart; normalize anyway.
            return normalizeBackendCart(res.data.data);
        } catch (err: any) {
            return thunkApi.rejectWithValue(getApiErrorMessage(err, "Failed to clear cart"));
        }
    }
);

export const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        // Local-only clear for immediate UI feedback (optional)
        clearCartLocal: (state) => {
            state.cartItems = [];
            state.totalAmount = 0;
            state.totalCount = 0;
        },
    },
    extraReducers: (builder) => {
        const applyItems = (state: CartState, items: CartItem[]) => {
            state.cartItems = items;
            const { totalAmount, totalCount } = calculateTotals(items);
            state.totalAmount = totalAmount;
            state.totalCount = totalCount;
        };

        builder
            .addCase(fetchCart.pending, (state) => {
                state.loading = true;
                state.error = "";
                state.message = "";
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.loading = false;
                applyItems(state, action.payload);
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to load cart";
            })

            .addCase(addToCartDb.pending, (state) => {
                // Don't set loading=true to avoid UI flash; optimistic update already applied
                state.error = "";
                state.message = "";
            })
            .addCase(addToCartDb.fulfilled, (state, action) => {
                applyItems(state, action.payload);
                state.message = "Added to cart";
            })
            .addCase(addToCartDb.rejected, (state, action) => {
                state.error = action.payload || "Failed to add to cart";
            })

            .addCase(updateCartItemDb.pending, (state) => {
                // Don't set loading=true to avoid UI flash
                state.error = "";
                state.message = "";
            })
            .addCase(updateCartItemDb.fulfilled, (state, action) => {
                applyItems(state, action.payload);
                state.message = "Cart updated";
            })
            .addCase(updateCartItemDb.rejected, (state, action) => {
                state.error = action.payload || "Failed to update cart";
            })

            .addCase(removeFromCartDb.pending, (state) => {
                // Don't set loading=true to avoid UI flash
                state.error = "";
                state.message = "";
            })
            .addCase(removeFromCartDb.fulfilled, (state, action) => {
                applyItems(state, action.payload);
                state.message = "Item removed";
            })
            .addCase(removeFromCartDb.rejected, (state, action) => {
                state.error = action.payload || "Failed to remove item";
            })

            .addCase(clearCartDb.pending, (state) => {
                // Don't set loading=true to avoid UI flash
                state.error = "";
                state.message = "";
            })
            .addCase(clearCartDb.fulfilled, (state, action) => {
                applyItems(state, action.payload || []);
                state.message = "Cart cleared";
            })
            .addCase(clearCartDb.rejected, (state, action) => {
                state.error = action.payload || "Failed to clear cart";
            });
    },
});

export const {
    clearCartLocal
} = cartSlice.actions;

export default cartSlice.reducer;