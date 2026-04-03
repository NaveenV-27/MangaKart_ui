"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { ShoppingBag, ArrowRight, Trash2, Loader2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store/store';
import { 
  fetchCart,
  updateCartItemDb,
  removeFromCartDb,
  clearCartDb,
} from '../redux/slices/cartSlice';

const CartPage = () => {
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const cartState = useSelector((state: RootState) => state.cart);
  const cartItems = cartState?.cartItems || [];
  // console.log("Cart State:", cartItems); // Debugging log
  const subtotal = cartState?.totalAmount || 0;
  const loading = cartState?.loading;
  const error = cartState?.error;

  useEffect(() => {
    const loadCart = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (dispatch as any)(fetchCart());
      setInitialFetchDone(true);
    };
    loadCart();
  }, [dispatch]);

  const handleIncrement = (item: typeof cartItems[0]) => {
    const newQty = (item.quantity || 1) + 1;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (dispatch as any)(updateCartItemDb({ 
      volume_id: item.volume_id, 
      type: item.type,
      quantity: newQty 
    }));
  };

  const handleDecrement = (item: typeof cartItems[0]) => {
    const nextQty = (item.quantity || 1) - 1;
    if (nextQty <= 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (dispatch as any)(removeFromCartDb({ volume_id: item.volume_id, type: item.type }));
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (dispatch as any)(updateCartItemDb({ 
        volume_id: item.volume_id, 
        type: item.type,
        quantity: nextQty 
      }));
    }
  };

  const handleRemoveItem = (item: typeof cartItems[0]) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (dispatch as any)(removeFromCartDb({ volume_id: item.volume_id, type: item.type }));
  };

  const handleClearCart = () => {
    if (confirm("Are you sure you want to clear your entire cart?")) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (dispatch as any)(clearCartDb());
    }
  };

  const shipping = subtotal > 0 ? 40.00 : 0;
  const total = subtotal + shipping;

  if (!initialFetchDone && loading) {
    return (
      <div className='container mx-auto p-8 min-h-[80vh] flex flex-col items-center justify-center gap-4 text-slate-400'>
        <Loader2 className="animate-spin text-indigo-500" size={40} />
        <p className="font-mono text-sm tracking-widest uppercase animate-pulse">Syncing Cart...</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-slate-950 text-slate-200 pb-20'>
      <div className='max-w-7xl mx-auto px-4 md:px-8 pt-10'>
        
        <header className='flex items-center justify-between mb-10'>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600/10 rounded-2xl">
               <ShoppingBag className="text-indigo-500" size={32} />
            </div>
            <h1 className='text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter'>Your Cart</h1>
          </div>
          {cartItems.length > 0 && (
            <button 
              onClick={handleClearCart}
              className="text-slate-500 hover:text-rose-400 flex items-center gap-2 text-sm font-bold uppercase transition-colors cursor-pointer"
            >
              <Trash2 size={16} /> Clear
            </button>
          )}
        </header>

        {error && (
          <div className='mb-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl flex items-center gap-3'>
            <span className="font-bold">Error:</span> {error}
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-32 bg-slate-900/30 rounded-3xl border border-slate-800 border-dashed text-center'>
            <ShoppingBag className='text-slate-700 mb-6' size={80} />
            <p className='text-2xl font-bold text-white mb-2'>Your cart is empty</p>
            <p className='text-slate-500 mb-8 max-w-sm'>Looks like you havent added any manga to your collection yet.</p>
            <Link href="/manga" className='px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20'>
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className='flex flex-col lg:flex-row gap-10 items-start'>
            
            {/* Items List */}
            <div className='flex-1 space-y-4 w-full'>
              {cartItems.map(item => (
                <div
                  key={`${item.volume_id}-${item.type}`}
                  className='group relative flex flex-col sm:flex-row items-center bg-slate-900 border border-slate-800 rounded-3xl p-4 gap-6 transition-all hover:border-indigo-500/30'
                >
                  <Link href={`/volume/${item.volume_id}`} className='shrink-0 w-28 h-40 relative rounded-xl overflow-hidden shadow-xl'>
                    <Image
                      src={item.cover_image || '/placeholder.png'}
                      alt={item.volume_title}
                      fill
                      className='object-cover transition-transform duration-500 group-hover:scale-110'
                    />
                  </Link>

                  <div className='flex-1 flex flex-col sm:flex-row justify-between items-center w-full gap-4'>
                    <div className='text-center sm:text-left min-w-0'>
                      <h2 className='text-xl font-black text-white uppercase tracking-tight truncate leading-tight'>{item.volume_title}</h2>
                      <p className='text-slate-500 font-bold text-sm mb-2'>{item.manga_title}</p>
                      <p className='text-indigo-400 font-mono font-bold text-lg'>₹{item.price?.toFixed(2)}</p>
                    </div>

                    <div className='flex flex-col items-center sm:items-end gap-4'>
                      <div className='flex items-center bg-slate-950 border border-slate-800 rounded-2xl p-1 shadow-inner'>
                        <button
                          onClick={() => handleDecrement(item)}
                          className='p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer'
                          aria-label="Decrease quantity"
                        >
                          {item.quantity <= 1 ? <Trash2 size={16} /> : <FaMinus size={14} />}
                        </button>
                        <span className='w-10 text-center font-black text-white text-lg'>{item.quantity}</span>
                        <button
                          onClick={() => handleIncrement(item)}
                          className='p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer'
                          aria-label="Increase quantity"
                        >
                          <FaPlus size={14} />
                        </button>
                      </div>
                      
                      <p className='text-2xl font-black text-white font-mono'>₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Absolute remove button for desktop hover */}
                  <button 
                    onClick={() => handleRemoveItem(item)}
                    className="absolute -top-2 -right-2 p-2 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-rose-600 cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Summary Card */}
            <div className='w-full lg:w-[400px] lg:sticky lg:top-28'>
              <div className='border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-md bg-slate-900/50'>
                <h2 className='text-2xl font-black text-white uppercase italic tracking-tighter mb-8'>Summary</h2>
                
                <div className='space-y-4 mb-8'>
                  <div className='flex justify-between text-slate-400 font-bold uppercase text-xs tracking-widest'>
                    <span>Subtotal</span>
                    <span className="text-white">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className='flex justify-between text-slate-400 font-bold uppercase text-xs tracking-widest'>
                    <span>Shipping</span>
                    <span className="text-emerald-400 font-black">{shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className='border-t border-slate-800 my-6 pt-6 flex justify-between items-end'>
                    <span className='text-white font-black uppercase text-sm'>Total Order</span>
                    <span className='text-4xl font-black text-indigo-400 font-mono'>₹{total.toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  onClick={() => router.push('/checkout')}
                  className='w-full cursor-pointer py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 group'
                >
                  Proceed to Checkout
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                
                <div className="mt-6 flex items-center justify-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Secure Checkout Enabled
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;