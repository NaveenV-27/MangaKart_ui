"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store/store';
import { 
  fetchCart,
  updateCartItemDb,
  removeFromCartDb,
  clearCartDb,
} from '../redux/slices/cartSlice';


const CartPage = () => {
  // Track if initial fetch is done to avoid "flash"
  const [initialFetchDone, setInitialFetchDone] = useState(false);

  // Read data from Redux store
  const cartState = useSelector((state: RootState) => state.cart);
  const cartItems = cartState?.cartItems || [];
  const subtotal = cartState?.totalAmount || 0;
  const loading = cartState?.loading;
  const error = cartState?.error;
  const dispatch = useDispatch();

  useEffect(() => {
    // Load cart from backend on mount
    const loadCart = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (dispatch as any)(fetchCart());
      setInitialFetchDone(true);
    };
    loadCart();
  }, [dispatch]);

  const handleIncrement = (item: typeof cartItems[0]) => {
    // Backend expects: { volume_id, type, quantity }
    const newQty = (item.quantity || 1) + 1;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (dispatch as any)(updateCartItemDb({ 
      volume_id: item.volume_id, 
      type: item.type,
      quantity: newQty 
    }));
  };

  const handleDecrement = (item: typeof cartItems[0]) => {
    // Backend expects: { volume_id, type, quantity } for update
    // Backend expects: { volume_id, type } for remove
    const nextQty = (item.quantity || 1) - 1;
    
    if (nextQty <= 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (dispatch as any)(removeFromCartDb({ 
        volume_id: item.volume_id, 
        type: item.type 
      }));
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
    // Backend expects: { volume_id, type }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (dispatch as any)(removeFromCartDb({ 
      volume_id: item.volume_id, 
      type: item.type 
    }));
  };

  const handleClearCart = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (dispatch as any)(clearCartDb());
  };

  const shipping = subtotal > 0 ? 5.00 : 0;
  const total = subtotal + shipping;

  // Show loading only during initial fetch
  if (!initialFetchDone && loading) {
    return (
      <div className='container mx-auto p-4 md:p-8 min-h-[79vh] text-gray-300 flex items-center justify-center'>
        <p className='text-xl text-gray-400'>Loading cart...</p>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-4 md:p-8 min-h-[79vh] text-gray-300'>
      <h1 className='text-3xl md:text-4xl font-bold text-center mb-8 text-white'>Your Cart</h1>

      {error ? (
        <div className='mb-4 bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded'>
          {error}
        </div>
      ) : null}

      {cartItems?.length === 0 ? (
        <div className='flex flex-col items-center justify-center h-64 text-center'>
          <p className='text-xl text-gray-400'>Your cart is empty.</p>
          <Link href="/genres" className='mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
            Browse Manga
          </Link>
        </div>
      ) : (
        <div className='flex flex-col lg:flex-row lg:space-x-8'>
          {/* Cart Items List */}
          <div className='flex-1 lg:w-2/3 space-y-4'>
            {cartItems?.map(item => (
              <div
                key={`${item.volume_id}-${item.type}`}
                className='flex flex-col sm:flex-row items-center bg-[#1b2531] rounded-lg shadow-lg p-4 space-y-4 sm:space-y-0 sm:space-x-4 transition-transform duration-300 hover:scale-[1.01]'
              >
                <Link href={`/volume/${item.volume_id}`} className='flex-shrink-0 w-24 h-24 relative rounded-md overflow-hidden'>
                  <Image
                    src={item.cover_image || '/placeholder.png'}
                    alt={item.volume_title}
                    fill
                    style={{ objectFit: 'cover' }}
                    className='rounded-md'
                  />
                </Link>
                <div className='flex-1 flex flex-col sm:flex-row justify-between items-center w-full space-y-2 sm:space-y-0'>
                  <div className='flex-1 text-center sm:text-left'>
                    <h2 className='text-lg font-semibold text-white'>{item.volume_title}</h2>
                    <p className='text-sm text-gray-500'>{item.manga_title}</p>
                    <p className='text-gray-400'>₹{item.price?.toFixed(2)}</p>
                  </div>
                  <div className='flex items-center space-x-4'>
                    <div className='flex items-center space-x-2 bg-gray-700 rounded-full px-2 py-1'>
                      <button
                        onClick={() => handleDecrement(item)}
                        className='text-gray-300 hover:text-white transition-colors'
                        aria-label="Decrease quantity"
                      >
                        {item.quantity <= 1 ? <FaTrash size={12} /> : <FaMinus size={12} />}
                      </button>
                      <span className='font-bold text-white'>{item.quantity}</span>
                      <button
                        onClick={() => handleIncrement(item)}
                        className='text-gray-300 hover:text-white transition-colors'
                        aria-label="Increase quantity"
                      >
                        <FaPlus size={12} />
                      </button>
                    </div>
                    {item.quantity > 1 && (
                      <button
                        onClick={() => handleRemoveItem(item)}
                        className='text-red-400 hover:text-red-500 transition-colors cursor-pointer'
                        aria-label="Remove item"
                      >
                        <FaTrash size={20} />
                      </button>
                    )}
                  </div>
                  <div className='sm:ml-4 text-center sm:text-right w-full sm:w-auto mt-2 sm:mt-0'>
                    <p className='text-lg font-bold text-white'>₹{(item.price * item.quantity)?.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className='lg:w-1/3 mt-8 lg:mt-0'>
            <div className='bg-[#1b2531] rounded-lg shadow-lg p-6 space-y-4'>
              <h2 className='text-2xl font-bold text-white'>Order Summary</h2>
              <div className='flex justify-between text-gray-400'>
                <span>Subtotal:</span>
                <span>₹{subtotal?.toFixed(2)}</span>
              </div>
              <div className='flex justify-between text-gray-400'>
                <span>Shipping:</span>
                <span>₹{shipping?.toFixed(2)}</span>
              </div>
              <div className='border-t border-gray-600 my-4'></div>
              <div className='flex justify-between text-xl font-bold text-white'>
                <span>Total:</span>
                <span>₹{total?.toFixed(2)}</span>
              </div>
              <button
                onClick={handleClearCart}
                className='w-full py-3 bg-red-900/30 text-red-200 rounded-lg hover:bg-red-900/50 transition-colors font-semibold border border-red-800'
              >
                Clear Cart
              </button>
              <button className='w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold'>
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;