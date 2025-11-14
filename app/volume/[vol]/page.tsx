"use client";
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Added useRouter for navigation
import axios from 'axios';
import Image from 'next/image';
// import Link from 'next/link';
import { ShoppingCart, Package, Trash, Minus, Plus, Loader2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store/store';
import { addToCart, decrementQuantity, removeItem, clearCart } from '../../redux/slices/cartSlice';

// --- Interfaces (Kept as is) ---
interface VolumeData {
  _id: string;
  manga_id: string;
  volume_id: string;
  volume_title: string;
  volume_number: number;
  description: string;
  cover_image: string;
  price: number;
  stock: number;
}

// --- Component Start ---
const VolumeDetailsPage = () => {
  const router = useRouter(); // Initialize router for navigation
  const params = useParams();
  const volumeId = params.vol as string;

  const [volumeData, setVolumeData] = useState<VolumeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(0);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const dispatch = useDispatch();

  const currentCartItems = useSelector((state: RootState) => state.cart.cartItems);

  const getInitialQuantity = useCallback((id: string) => {
    // Use the Redux cart state to find the item
    const existingItem = currentCartItems.find(item => item._id === id);
    // Returns the existing quantity, or 0 if not found (0 is safer than 1 here)
    return existingItem ? existingItem.quantity : 0;
  }, [currentCartItems]);

  useEffect(() => {
    const fetchVolumeDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (volumeId) {
          // You might need to adjust the API endpoint/structure
          const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/volumes/get_volume_details`, {
            volume_id: volumeId,
          });
          console.log("API called", response.data);
          const data = response.data.data || response.data;
          setVolumeData(data);

          // Set initial quantity from cart after data is fetched
          setQuantity(getInitialQuantity(data.volume_id || volumeId));
        }
      } catch (err) {
        console.error("Error fetching volume details:", err);
        setError("Failed to load volume details. The server might be unreachable or the ID is invalid.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVolumeDetails();
  }, [volumeId]);

  // --- Cart and Order Handlers ---

  // Locate handleUpdateQuantity (around line 59) and replace it:
  const handleUpdateQuantity = (change: number) => {
    if (!volumeData || !volumeData.volume_id) return;

    const itemId = volumeData.volume_id;
    const itemData = {
      _id: itemId,
      title: `${volumeData.volume_title || 'Volume'} #${volumeData.volume_number}`,
      cover_image: volumeData.cover_image,
      price: volumeData.price,
      type: "volume",
    };
    const maxStock = volumeData.stock;

    // Use the current quantity from Redux, not the local state, for checks
    const currentQuantityInCart = getInitialQuantity(itemId);
    const newQuantity = currentQuantityInCart + change;

    if (change > 0) {
      // Handling Increment (Plus Button)
      if (newQuantity <= maxStock) {
        // Dispatch the action to add 1 unit (or increment quantity)
        dispatch(addToCart(itemData)); // addToCart handles the increment logic
        setQuantity(newQuantity);
      } else {
        setMessage({ text: `Maximum stock available is ${maxStock}.`, type: 'error' });
        setTimeout(() => setMessage(null), 3000);
      }
    } else if (change < 0) {
      // Handling Decrement (Minus Button / Trash)
      if (currentQuantityInCart > 0) {
        // Dispatch the action to decrement 1 unit (or remove if quantity becomes 0)
        dispatch(decrementQuantity(itemId)); // decrementQuantity handles the decrement/removal logic
        setQuantity(Math.max(0, currentQuantityInCart - 1));

        // Optional: Show success message for removal if the quantity hits 0
        if (currentQuantityInCart === 1) {
          setMessage({ text: `Item removed from cart.`, type: 'success' });
          setTimeout(() => setMessage(null), 3000);
        }
      }
    }
  };


  // Locate handleRemoveFromCart (around line 80) and replace it:
  const handleRemoveFromCart = () => {
    if (!volumeData || !volumeData.volume_id) return;

    // Dispatch the Redux action to remove the item completely
    dispatch(removeItem(volumeData.volume_id));

    setQuantity(0);
    setMessage({ text: `Item removed from cart.`, type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  }


  // Locate handleAddToCart (around line 90) and replace it:
  const handleAddToCart = () => {
    if (!volumeData || volumeData.stock === 0) return;

    const itemId = volumeData.volume_id;
    const itemToDispatch = {
      _id: itemId,
      title: `${volumeData.volume_title || 'Volume'} #${volumeData.volume_number}`,
      cover_image: volumeData.cover_image,
      price: volumeData.price,
      type: "volume",
    };

    const currentQuantityInCart = getInitialQuantity(itemId);

    // Calculate the difference between the local 'quantity' state (the desired quantity) and the Redux state (current quantity)
    const quantityChange = quantity - currentQuantityInCart;

    if (quantityChange > 0) {
      // If desired quantity is higher, dispatch 'addToCart' multiple times or use a custom action that accepts a delta.
      // Since we rely on the `handleUpdateQuantity` loop, we'll simplify this function to dispatch the total amount needed.
      // NOTE: This assumes the Redux action signature allows adding a quantity Delta. Based on your definition:
      // addToCart: (state, action: PayloadAction<Omit<CartItem, 'quantity'>>)
      // This signature only allows adding 1 unit at a time. Let's use a temporary loop for dispatching:
      for (let i = 0; i < quantityChange; i++) {
        dispatch(addToCart(itemToDispatch));
      }
      setMessage({ text: `Cart updated: Quantity set to ${quantity}.`, type: 'success' });
    } else if (quantityChange < 0) {
      // If desired quantity is lower, dispatch 'decrementQuantity' multiple times.
      for (let i = 0; i < Math.abs(quantityChange); i++) {
        dispatch(decrementQuantity(itemId));
      }
      if (quantity === 0) {
        setMessage({ text: `Item removed from cart.`, type: 'success' });
      } else {
        setMessage({ text: `Cart updated: Quantity set to ${quantity}.`, type: 'success' });
      }
    } else if (quantityChange === 0 && quantity === 0) {
      dispatch(removeItem(itemId));
      setMessage({ text: `Item removed from cart.`, type: 'success' });
    } else {
      setMessage({ text: `Cart already up-to-date.`, type: 'success' });
    }

    setTimeout(() => setMessage(null), 3000);
  };

  const handleOrderNow = () => {
    handleAddToCart();

    router.push('/cart');
  };

  // --- UI Rendering ---

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[79vh] text-gray-400 text-xl">
        <Loader2 className="animate-spin mr-3" size={24} />
        Loading volume details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[79vh] text-red-500 text-xl">
        {error}
      </div>
    );
  }

  if (!volumeData) {
    return (
      <div className="flex justify-center items-center h-[79vh] text-gray-400 text-xl">
        Volume not found.
      </div>
    );
  }

  const inStock = volumeData.stock > 0;
  // Use the Redux state utility:
  const currentQuantityInCart = getInitialQuantity(volumeData.volume_id);
  const inCart = currentQuantityInCart > 0;

  // Primary Button Styles
  const primaryButtonClass = "flex items-center justify-center px-6 py-3 rounded-xl font-bold transition-all w-full tracking-wider shadow-lg";
  // Secondary Button Styles (for 'Order Now')
  const secondaryButtonClass = "flex items-center justify-center px-6 py-3 rounded-xl font-bold transition-all w-full tracking-wider border border-current shadow-md";

  return (
    <div className="container mx-auto p-4 md:p-8 text-gray-300 min-h-[85vh]">
      <div className="bg-[#1b2531] rounded-2xl shadow-2xl p-6 md:p-10 relative">

        {/* Success/Error Message */}
        {message && (
          <div className={`absolute top-4 right-4 z-50 p-4 rounded-lg shadow-xl text-white transition-opacity duration-300 ${message.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {message.text}
          </div>
        )}

        {/* Hero Section: Image and Info (Two-Column Layout) */}
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">

          {/* Left Column: Image (The hero component) */}
          <div className="flex-shrink-0 w-full md:w-1/3 max-w-sm mx-auto md:mx-0">
            <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              <Image
                src={volumeData.cover_image}
                alt={`${volumeData.volume_title} Cover`}
                fill
                style={{ objectFit: 'cover' }}
                priority // Preload the main image
              />
            </div>
          </div>

          {/* Right Column: Info, Price, and Actions */}
          <div className="flex-1 mt-6 md:mt-0">

            {/* Title and Metadata */}
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-1 leading-tight">
              {volumeData.volume_title || `Volume #${volumeData.volume_number}`}
            </h1>
            <p className="text-xl text-gray-400 mb-6 border-b border-gray-700 pb-4">
              Volume {volumeData.volume_number}
            </p>

            {/* Price and Stock Status */}
            <div className="my-6">
              <span className="text-4xl font-extrabold text-green-400">
                Rs. {volumeData.price?.toFixed(2)}
              </span>
              <div className={`flex items-center text-lg font-semibold mt-3 ${inStock ? 'text-green-500' : 'text-red-500'}`}>
                <Package size={18} className='mr-2' />
                {inStock ? `In Stock (${volumeData.stock} units)` : 'Out of Stock'}
              </div>
            </div>

            {/* Quantity Selector and Actions Card */}
            <div className="bg-[#243140] lg:w-3/5 p-6 rounded-xl shadow-inner border border-gray-700">
              <div className='flex items-center justify-between px-10'>
                <div>
                  <h3 className='text-lg font-semibold mb-4 text-gray-300'>Select Quantity</h3>

                  {inStock && (
                    <div className="flex items-center space-x-3 mb-8">
                      {/* Minus Button */}
                      <button
                        className={`w-10 h-10 rounded-lg text-white transition-colors duration-200 cursor-pointer ${quantity <= 1 ? 'bg-red-700/50 text-red-300 cursor-default' : 'bg-gray-700 hover:bg-gray-600 cursor-pointer'}`}
                        onClick={() => handleUpdateQuantity(-1)}
                        disabled={quantity <= 0}
                      >
                        {quantity <= 1 ? <Trash size={16} className='mx-auto' /> : <Minus size={16} className='mx-auto' />}
                      </button>

                      {/* Quantity Display/Input (Disabled to enforce button use) */}
                      <input
                        type="text"
                        value={quantity}
                        readOnly
                        className="w-16 p-2 text-center rounded-lg bg-gray-800 border border-gray-600 text-white font-mono text-xl focus:outline-none"
                      />

                      {/* Plus Button */}
                      <button
                        className={`w-10 h-10 rounded-lg text-white transition-colors duration-200 ${quantity >= volumeData.stock ? 'bg-gray-700/50 text-gray-500 cursor-default' : 'bg-gray-700 hover:bg-gray-600 cursor-pointer'}`}
                        onClick={() => handleUpdateQuantity(1)}
                        disabled={quantity >= volumeData.stock}
                      >
                        <Plus size={16} className='mx-auto' />
                      </button>
                    </div>
                  )}
                </div>

                <h2 className='text-2xl font-semibold text-white '>total : ₹{quantity * volumeData.price}</h2>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-4">
                {/* Primary Action: Add to Cart / Update Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={!inStock || quantity === 0}
                  className={`${primaryButtonClass} 
                          ${inStock && quantity > 0 ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}
                        `}
                >
                  <ShoppingCart size={20} className='mr-3' />
                  {inStock
                    ? (quantity === 0 ? 'Select Quantity' : (inCart ? 'Update Cart' : 'Add to Cart'))
                    : 'Out of Stock'
                  }
                </button>

                {/* Secondary Action: Order Now (Buy Now) */}
                {inStock && quantity > 0 && (
                  <button
                    onClick={handleOrderNow}
                    className={`${secondaryButtonClass} bg-transparent text-purple-400 hover:bg-purple-600 hover:text-white`}
                  >
                    <Package size={20} className='mr-3' />
                    Buy Now
                  </button>
                )}
              </div>
            </div> {/* End of Actions Card */}
          </div>
        </div>

        {/* Description Section (Full Width, below Hero) */}
        <div className="w-full border-t border-gray-700 mt-8 pt-8">
          <h3 className="text-3xl font-bold text-white mb-4">Volume Description</h3>
          <p className="text-gray-400 leading-relaxed text-lg whitespace-pre-wrap">
            {volumeData.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VolumeDetailsPage;