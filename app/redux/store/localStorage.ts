import { RootState } from './store'; // Assuming you have a RootState import

// Define this function in your store utility file (e.g., redux/store/localStorage.ts)

interface CartItem {
  _id: string;
  type?: string;
  title: string;
  cover_image: string;
  price: number;
  quantity: number;
}

interface CartState {
  cartItems: CartItem[];
  totalAmount: number;
  totalCount: number;
}

const calculateTotalsOnLoad = (items: CartItem[]): { totalAmount: number, totalCount: number } => {
  let totalAmount = 0;
  let totalCount = 0;

  items.forEach(item => {
    totalAmount += item.price * item.quantity;
    totalCount += item.quantity;
  });

  return { totalAmount, totalCount };
};

export const loadState = (): CartState => {
  try {
    const serializedState = localStorage.getItem('cart');
    if (serializedState === null) {
      return {
        cartItems: [],
        totalAmount: 0,
        totalCount: 0,
      }; // Let the reducers initialize the state
    }

    // The data loaded is the RAW array of items (your provided JSON)
    const cartItems: CartItem[] = JSON.parse(serializedState);

    if (cartItems.length === 0) {
      // Return base state if cart is empty
      return { cartItems: [], totalAmount: 0, totalCount: 0 };
    }

    // Calculate totals based on the loaded array
    const { totalAmount, totalCount } = calculateTotalsOnLoad(cartItems);

    // Return the full CartState structure for preloading
    const cartState: CartState = {
      cartItems: cartItems,
      totalAmount: totalAmount,
      totalCount: totalCount,
    };

    return cartState;

  } catch (err) {
    console.error("Error loading state from localStorage:", err);
    return {
      cartItems: [],
      totalAmount: 0,
      totalCount: 0,
    };
  }
};

export const saveState = (state: RootState) => {
  try {
    // Only serialize the cartItems array
    const serializedItems = JSON.stringify(state.cart.cartItems);
    localStorage.setItem('cart', serializedItems);
  } catch (err) {
    console.error("Error saving state to localStorage:", err);
  }
};

