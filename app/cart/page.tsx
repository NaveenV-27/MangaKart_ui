"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store/store';
import { 
    addToCart, 
    decrementQuantity, 
    removeItem,
    // clearCart 
} from '../redux/slices/cartSlice';


const CartPage = () => {
  // 1. Read data from Redux store
  const cartItems = useSelector((state: RootState) => state.cart.cartItems);
  // const totalCount = useSelector((state: RootState) => state.cart.totalCount);
  const dispatch = useDispatch();

  const handleIncrement = (item: typeof cartItems[0]) => {
    const itemData = {
        _id: item._id,
        title: item.title,
        cover_image: item.cover_image,
        price: item.price,
        type: item.type,
    };
    dispatch(addToCart(itemData));
  };

  const handleDecrement = (id: string) => {
    dispatch(decrementQuantity(id));
  };

  const handleRemoveItem = (id: string) => {
    dispatch(removeItem(id));
  };

  // const subtotal = cartItems.reduce(
  //   (acc, item) => acc + item.price * item.quantity,
  //   0
  // );
  
  // You can also get subtotal directly from the store if you want:
  const subtotal = useSelector((state: RootState) => state.cart.totalAmount);

  const shipping = subtotal > 0 ? 5.00 : 0;
  const total = subtotal + shipping;

  return (
    <div className='container mx-auto p-4 md:p-8 min-h-[79vh] text-gray-300'>
      <h1 className='text-3xl md:text-4xl font-bold text-center mb-8 text-white'>Your Cart</h1>

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
                key={item._id}
                className='flex flex-col sm:flex-row items-center bg-[#1b2531] rounded-lg shadow-lg p-4 space-y-4 sm:space-y-0 sm:space-x-4 transition-transform duration-300 hover:scale-[1.01]'
              >
                <Link href={`/manga/${item._id}`} className='flex-shrink-0 w-24 h-24 relative rounded-md overflow-hidden'>
                  <Image
                    src={item.cover_image}
                    alt={item.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    className='rounded-md'
                  />
                </Link>
                <div className='flex-1 flex flex-col sm:flex-row justify-between items-center w-full space-y-2 sm:space-y-0'>
                  <div className='flex-1 text-center sm:text-left'>
                    <h2 className='text-lg font-semibold text-white'>{item.title}</h2>
                    <p className='text-gray-400'>₹{item.price?.toFixed(2)}</p>
                  </div>
                  <div className='flex items-center space-x-4'>
                    <div className='flex items-center space-x-2 bg-gray-700 rounded-full px-2 py-1'>
                      <button
                        // Decrease quantity: dispatch decrementQuantity
                        onClick={() => handleDecrement(item._id)}
                        className='text-gray-300 hover:text-white transition-colors'
                        aria-label="Decrease quantity"
                      >
                        {/* If quantity is 1, show trash icon */}
                        {item.quantity <= 1 ? <FaTrash size={12} /> : <FaMinus size={12} />}
                      </button>
                      <span className='font-bold text-white'>{item.quantity}</span>
                      <button
                        // Increase quantity: dispatch handleIncrement (which uses addToCart)
                        onClick={() => handleIncrement(item)}
                        className='text-gray-300 hover:text-white transition-colors'
                        aria-label="Increase quantity"
                      >
                        <FaPlus size={12} />
                      </button>
                    </div>
                    {/* Explicit Remove Button (Optional, but good UX) */}
                    {item.quantity > 1 && (
                      <button
                        onClick={() => handleRemoveItem(item._id)}
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