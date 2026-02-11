"use client";
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Added useRouter for navigation
import axios from 'axios';
import Image from 'next/image';
// import Link from 'next/link';
import { ShoppingCart, Package, Trash, Minus, Plus, Loader2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store/store';
import { addToCartDb, updateCartItemDb, removeFromCartDb } from '../../redux/slices/cartSlice';

// --- Interfaces (Kept as is) ---
interface VolumeData {
  _id: string;
  manga_id: string;
  manga_title?: string; // Optional - backend may or may not return this
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

  const cartState = useSelector((state: RootState) => state.cart);
  
  // 🎯 FIX: Check if cartState is defined (not undefined)
  const currentCartItems = cartState?.cartItems || [];
  console.log("Curr quantity:", currentCartItems);

  // const currentCartItems = useSelector((state: RootState) => state.cart.cartItems);

  const getInitialQuantity = useCallback((id: string) => {
    // Use the Redux cart state to find the item by volume_id
    const existingItem = currentCartItems.find(item => item.volume_id === id);
    // Returns the existing quantity, or 0 if not found
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
  }, [volumeId, getInitialQuantity]);

  // --- Cart and Order Handlers ---

  // Helper to build the add_item payload
  const buildAddPayload = (qty: number) => {
    if (!volumeData) return null;
    return {
      volume_id: volumeData.volume_id,
      manga_title: volumeData.manga_title || volumeData.manga_id, // Use manga_title if available, fallback to manga_id
      volume_title: volumeData.volume_title,
      type: "volume" as const,
      cover_image: volumeData.cover_image,
      price: volumeData.price,
      quantity: qty,
    };
  };

  // Update quantity in cart via API
  const handleUpdateQuantity = async (change: number) => {
    if (!volumeData || !volumeData.volume_id) return;

    const itemId = volumeData.volume_id;
    const maxStock = volumeData.stock;

    const currentQuantityInCart = getInitialQuantity(itemId);
    const newQuantity = currentQuantityInCart + change;

    if (change > 0) {
      // Handling Increment (Plus Button)
      if (newQuantity <= maxStock) {
        if (currentQuantityInCart === 0) {
          // Item not in cart yet, add it
          const payload = buildAddPayload(1);
          if (payload) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (dispatch as any)(addToCartDb(payload));
          }
        } else {
          // Item exists, update quantity
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (dispatch as any)(updateCartItemDb({ 
            volume_id: itemId, 
            type: "volume",
            quantity: newQuantity 
          }));
        }
        setQuantity(newQuantity);
      } else {
        setMessage({ text: `Maximum stock available is ${maxStock}.`, type: 'error' });
        setTimeout(() => setMessage(null), 3000);
      }
    } else if (change < 0) {
      // Handling Decrement (Minus Button / Trash)
      if (currentQuantityInCart > 0) {
        if (newQuantity <= 0) {
          // Remove from cart
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (dispatch as any)(removeFromCartDb({ 
            volume_id: itemId, 
            type: "volume" 
          }));
          setQuantity(0);
          setMessage({ text: `Item removed from cart.`, type: 'success' });
          setTimeout(() => setMessage(null), 3000);
        } else {
          // Decrement quantity
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (dispatch as any)(updateCartItemDb({ 
            volume_id: itemId, 
            type: "volume",
            quantity: newQuantity 
          }));
          setQuantity(newQuantity);
        }
      }
    }
  };


  // Remove item from cart completely via API
  const handleRemoveFromCart = async () => {
    if (!volumeData || !volumeData.volume_id) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (dispatch as any)(removeFromCartDb({ 
      volume_id: volumeData.volume_id, 
      type: "volume" 
    }));

    setQuantity(0);
    setMessage({ text: `Item removed from cart.`, type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  }


  // Add to cart via API
  const handleAddToCart = async () => {
    if (!volumeData || volumeData.stock === 0) return;

    const itemId = volumeData.volume_id;
    const currentQuantityInCart = getInitialQuantity(itemId);

    // Calculate the difference between the local 'quantity' state (the desired quantity) and the cart state
    const quantityChange = quantity - currentQuantityInCart;

    if (quantityChange > 0) {
      if (currentQuantityInCart === 0) {
        // Add new item to cart
        const payload = buildAddPayload(quantity);
        if (payload) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (dispatch as any)(addToCartDb(payload));
        }
      } else {
        // Update existing item quantity
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (dispatch as any)(updateCartItemDb({ 
          volume_id: itemId, 
          type: "volume",
          quantity: quantity 
        }));
      }
      setMessage({ text: `Cart updated: Quantity set to ${quantity}.`, type: 'success' });
    } else if (quantityChange < 0) {
      if (quantity === 0) {
        // Remove from cart
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (dispatch as any)(removeFromCartDb({ 
          volume_id: itemId, 
          type: "volume" 
        }));
        setMessage({ text: `Item removed from cart.`, type: 'success' });
      } else {
        // Update to lower quantity
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (dispatch as any)(updateCartItemDb({ 
          volume_id: itemId, 
          type: "volume",
          quantity: quantity 
        }));
        setMessage({ text: `Cart updated: Quantity set to ${quantity}.`, type: 'success' });
      }
    } else if (quantityChange === 0 && quantity === 0 && currentQuantityInCart > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (dispatch as any)(removeFromCartDb({ 
        volume_id: itemId, 
        type: "volume" 
      }));
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