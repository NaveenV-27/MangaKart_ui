"use client";
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import { ShoppingCart, Package, Minus, Plus, Loader2, ArrowLeft, ShieldCheck, Zap } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store/store';
import { addToCartDb, updateCartItemDb, removeFromCartDb, fetchCart } from '../../redux/slices/cartSlice';

interface VolumeData {
  _id: string;
  manga_id: string;
  manga_title?: string;
  volume_id: string;
  volume_title: string;
  volume_number: number;
  description: string;
  cover_image: string;
  price: number;
  stock: number;
  created_by: string;
}

const VolumeDetailsPage = () => {
  const router = useRouter();
  const params = useParams();
  const volumeId = params.vol as string;

  const [volumeData, setVolumeData] = useState<VolumeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(0);
  
  const dispatch = useDispatch();
  const cartState = useSelector((state: RootState) => state.cart);
  const currentCartItems = cartState?.cartItems || [];
  const cartFetched = useRef(false);

  // Initial Cart Fetch
  useEffect(() => {
    if (!cartFetched.current) {
      cartFetched.current = true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (dispatch as any)(fetchCart());
    }
  }, [dispatch]);

  const getQuantityFromCart = useCallback((id: string) => {
    const existingItem = currentCartItems.find(item => item.volume_id === id);
    return existingItem ? existingItem.quantity : 0;
  }, [currentCartItems]);

  // Sync initial local quantity from Redux cart
  useEffect(() => {
    if (volumeData?.volume_id) {
      const cartQty = getQuantityFromCart(volumeData.volume_id);
      if (cartQty > 0) setQuantity(cartQty);
    }
  }, [volumeData?.volume_id, getQuantityFromCart]);

  useEffect(() => {
    const fetchVolumeDetails = async () => {
      setIsLoading(true);
      try {
        if (volumeId) {
          const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/volumes/get_volume_details`, {
            volume_id: volumeId,
          });
          const data = response.data.data || response.data;
          console.log("Fetched Volume Data:", data); // Debug log
          setVolumeData(data);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load volume details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchVolumeDetails();
  }, [volumeId]);

  // Real-time Database Sync for Quantity
  const syncQuantityToDb = async (newQty: number) => {
    if (!volumeData) return;
    
    const currentQtyInCart = getQuantityFromCart(volumeData.volume_id);
    console.log("Volume Data:", volumeData);

    try {
      if (newQty === 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (dispatch as any)(removeFromCartDb({ 
          volume_id: volumeData.volume_id, 
          type: "volume" 
        }));
      } else if (currentQtyInCart === 0) {
        // Add to cart if it wasn't there
        const payload = {
          volume_id: volumeData.volume_id,
          manga_title: volumeData.manga_title || volumeData.manga_id,
          volume_title: volumeData.volume_title,
          type: "volume",
          cover_image: volumeData.cover_image,
          price: volumeData.price,
          quantity: newQty,
          seller_id: volumeData.created_by
        }
        console.log("payload:", payload);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (dispatch as any)(addToCartDb({
          volume_id: volumeData.volume_id,
          manga_title: volumeData.manga_title || volumeData.manga_id,
          volume_title: volumeData.volume_title,
          type: "volume",
          cover_image: volumeData.cover_image,
          price: volumeData.price,
          quantity: newQty,
          seller_id: volumeData.created_by
        }));
      } else {
        // Update existing item
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (dispatch as any)(updateCartItemDb({
          volume_id: volumeData.volume_id,
          type: "volume",
          quantity: newQty
        }));
      }
    } catch (err) {
      console.error("Failed to sync cart quantity:", err);
    }
  };

  const handleUpdateQuantity = (change: number) => {
    if (!volumeData) return;
    const newQty = quantity + change;
    
    // Limits: Min 1 (to keep it in cart for buy now), Max Stock
    if (newQty >= 0 && newQty <= volumeData.stock) {
      setQuantity(newQty);
      syncQuantityToDb(newQty);
    }
  };

  const handleBuyNow = () => {
    if (!volumeData) return;
    // Redirect to checkout with search params
    router.push(`/checkout?type=volume&id=${volumeData.volume_id}`);
  };
  const handleViewCart = () => {
    if (!volumeData) return;
    // Redirect to cart page
    router.push(`/cart`);
  };

  if (isLoading) return (
    <div className="flex flex-col justify-center items-center h-[80vh] bg-slate-950 text-slate-400">
      <Loader2 className="animate-spin mb-4 text-indigo-500" size={40} />
      <p className="animate-pulse font-mono tracking-widest uppercase">Fetching Volume Intel...</p>
    </div>
  );

  if (error || !volumeData) return (
    <div className="h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6">
      <p className="text-xl mb-4">{error || "Volume not found."}</p>
      <button onClick={() => router.back()} className="text-indigo-400 underline">Go Back</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-8 group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Collection
        </button>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* LEFT: Cover Art */}
          <div className="w-full lg:w-[400px] shrink-0">
            <div className="sticky top-28">
              <div className="relative aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/20 border border-slate-800">
                <Image
                  src={volumeData.cover_image}
                  alt={volumeData.volume_title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="mt-6 flex items-center justify-center gap-6 text-slate-500 text-sm">
                <span className="flex items-center gap-1"><ShieldCheck size={16} className="text-indigo-400" /> Official Edition</span>
                <span className="flex items-center gap-1"><Zap size={16} className="text-amber-400" /> Express Delivery</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Content */}
          <div className="flex-1">
            <div className="mb-6">
              <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-2 uppercase italic tracking-tighter">
                {volumeData.volume_title}
              </h1>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-indigo-600/20 text-indigo-400 rounded-full text-xs font-bold border border-indigo-500/30">
                  VOL. {volumeData.volume_number}
                </span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-400 font-medium">{volumeData.manga_title || "Premium Series"}</span>
              </div>
            </div>

            <div className="mb-10">
               <p className="text-slate-500 uppercase text-xs font-bold tracking-widest mb-1">Price Per Unit</p>
               <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-white">₹{volumeData.price}</span>
                  <span className="text-slate-500 line-through text-xl">₹{volumeData.price + 100}</span>
               </div>
            </div>

            {/* Action Card */}
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl backdrop-blur-md mb-10 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
                <div>
                  <p className="text-slate-400 text-sm font-bold mb-3 uppercase tracking-tighter">Quantity</p>
                  <div className="flex items-center bg-slate-950 border border-slate-800 rounded-2xl p-1 w-fit shadow-inner">
                    <button 
                      onClick={() => handleUpdateQuantity(-1)}
                      disabled={quantity < 1}
                      className="p-3 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="w-12 text-center text-xl font-black text-white">{quantity}</span>
                    <button 
                      onClick={() => handleUpdateQuantity(1)}
                      disabled={quantity >= volumeData.stock}
                      className="p-3 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-slate-500 text-xs font-bold uppercase mb-1">Subtotal</p>
                  <p className="text-3xl font-black text-indigo-400">₹{(quantity * volumeData.price).toLocaleString()}</p>
                </div>
              </div>

              {/* Both buttons now trigger Buy Now redirect */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleBuyNow}
                  disabled={volumeData.stock === 0}
                  className="flex items-center justify-center gap-3 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl border border-slate-700 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Package size={20} />
                  Purchase Now
                </button>
                <button
                  onClick={handleViewCart}
                  disabled={volumeData.stock === 0}
                  className="flex items-center justify-center gap-3 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 cursor-pointer"
                >
                  <ShoppingCart size={20} />
                  view Cart
                </button>
              </div>

              {volumeData.stock < 10 && volumeData.stock > 0 && (
                <p className="text-center text-amber-500 text-xs font-bold mt-4 animate-pulse">
                  Limited Supply: Only {volumeData.stock} left in stock.
                </p>
              )}
            </div>

            {/* Description Area */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white border-l-4 border-indigo-500 pl-4 uppercase tracking-tighter">Volume Summary</h3>
              <p className="text-slate-400 leading-relaxed text-lg font-medium whitespace-pre-wrap italic">
                {volumeData.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolumeDetailsPage;