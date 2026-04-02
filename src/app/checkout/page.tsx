"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { 
  MapPin, Plus, CheckCircle, Loader2, 
  Phone, ShoppingCart, ChevronLeft, Edit2,
  PartyPopper, ArrowRight
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store/store';
import { fetchCart } from '../redux/slices/cartSlice';

type Address = {
  address_id: string;
  full_name?: string;
  phone_number?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  tag?: string;
  is_default?: boolean;
};

const CheckoutPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  // --- Loading & UI States ---
  const [pageLoading, setPageLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // Success Dialog State
  const [orderId, setOrderId] = useState<string | null>(null);

  // --- Data States ---
  const [singleItem, setSingleItem] = useState<any | null>(null);
  const [isSingleCheckout, setIsSingleCheckout] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // --- Redux State ---
  const cartState = useSelector((state: RootState) => state.cart);
  const cartItemsFromRedux = cartState?.cartItems || [];
  const cartSubtotal = cartState?.totalAmount || 0;

  const checkoutItems = isSingleCheckout && singleItem ? [singleItem] : cartItemsFromRedux;
  const subtotal = isSingleCheckout && singleItem ? (singleItem.price * singleItem.quantity) : cartSubtotal;
  const shipping = subtotal > 0 ? 40.00 : 0;
  const total = subtotal + shipping;

  useEffect(() => {
    const initCheckout = async () => {
      setPageLoading(true);
      const type = searchParams.get('type');
      const id = searchParams.get('id');
      try {
        const promises: Promise<any>[] = [fetchAddresses()];
        if (type === 'volume' && id) {
          setIsSingleCheckout(true);
          promises.push(fetchSingleVolume(id));
        } else {
          setIsSingleCheckout(false);
          promises.push((dispatch as any)(fetchCart()));
        }
        await Promise.all(promises);
      } catch (error) {
        console.error("Initialization failed", error);
      } finally {
        setTimeout(() => setPageLoading(false), 500);
      }
    };
    initCheckout();
  }, [dispatch, searchParams]);

  const fetchSingleVolume = async (volumeId: string) => {
    try {
      const response = await axios.post(`${baseUrl}/api/volumes/get_volume_details`, {
        volume_id: volumeId,
      });
      const data = response.data.data || response.data;
      setSingleItem({
        volume_id: data.volume_id,
        volume_title: data.volume_title || `Volume ${data.volume_number}`,
        volume_number: data.volume_number,
        cover_image: data.cover_image,
        created_by: data.created_by,
        price: data.price,
        quantity: 1,
        type: 'volume'
      });
    } catch (err) {
      console.error("Single volume fetch error", err);
    }
  };

  const fetchAddresses = async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/addresses/get_addresses`, { withCredentials: true });
      if (res.data.apiSuccess === 1) {
        const list = res.data.data?.addresses || res.data.data || [];
        setAddresses(list);
        setSelectedAddress(list.find((a: any) => a.is_default) || list[0]);
      }
    } catch (err) {
      console.error("Address fetch error", err);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) return alert("Please select an address");
    setPlacingOrder(true);
    const payload = {
      items: checkoutItems.map(item => ({
        volume_id: item.volume_id,
        quantity: item.quantity,
        price: item.price,
        volume_title: item.volume_title,
        seller_id: item.created_by
      })),
      shipping_name: selectedAddress.full_name,
      shipping_phone: selectedAddress.phone_number,
      shipping_address: selectedAddress.address_line1,
      shipping_city: selectedAddress.city,
      shipping_pincode: selectedAddress.pincode,
      shipping_state: selectedAddress.state,
      total_amount: total
    }
    console.log("Placing order with payload:", payload);

    try {
      const res = await axios.post(`${baseUrl}/api/orders/create_order`, payload, { withCredentials: true });
      if (res.data.apiSuccess === 1) {
        setOrderId(res.data.order_id);
        setIsSuccess(true); // Show Success Dialog
      }
    } catch (err) {
      console.error("Order placement error", err);
    } finally {
      setPlacingOrder(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-10 md:px-8 animate-pulse">
        <div className="max-w-6xl mx-auto">
          <div className="h-10 w-48 bg-slate-800 rounded-lg mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6"><div className="h-64 bg-slate-900 border border-slate-800 rounded-2xl" /></div>
            <div className="lg:col-span-5"><div className="h-96 bg-slate-900 border border-slate-800 rounded-2xl" /></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 px-4 py-10 md:px-8 relative">
      
      {/* --- SUCCESS DIALOG OVERLAY --- */}
      {isSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl scale-in-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <PartyPopper className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Order Confirmed!</h2>
            <p className="text-slate-400 mb-8">
              Your manga is on the way. You can track your shipment in your orders.
            </p>
            <button 
              onClick={() => router.push(`/orders/${orderId}`)}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold transition flex items-center justify-center gap-2 group"
            >
              View Order Details
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="p-2 hover:bg-slate-800 rounded-full transition">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ShoppingCart className="text-indigo-500" /> Checkout
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: Address Section */}
          <div className="lg:col-span-7 space-y-6">
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <MapPin className="text-indigo-400 w-5 h-5" /> Shipping Address
                </h2>
                <button onClick={() => setShowAddForm(true)} className="text-sm text-indigo-400 border border-slate-800 px-3 py-1 rounded-lg hover:bg-slate-800 transition">
                  + Add Address
                </button>
              </div>

              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div 
                    key={addr.address_id} 
                    onClick={() => setSelectedAddress(addr)}
                    className={`p-4 border rounded-xl cursor-pointer transition-all ${
                      selectedAddress?.address_id === addr.address_id 
                      ? "border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500" 
                      : "border-slate-800 bg-slate-800/40 hover:border-slate-700"
                    }`}
                  >
                    <p className="font-bold text-white">{addr.full_name}</p>
                    <p className="text-sm text-slate-400">{addr.address_line1}, {addr.city}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT: Summary Visualization */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl sticky top-8">
              <h2 className="text-xl font-semibold text-white mb-6">Order Items</h2>
              
              <div className="space-y-4 mb-6 max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar">
                {checkoutItems.map((item) => (
                  <div key={item.volume_id} className="flex gap-4 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                    <div className="relative w-16 h-20 flex-shrink-0">
                      <Image src={item.cover_image || '/placeholder.png'} alt={item.volume_title} fill className="object-cover rounded-md" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-white truncate">{item.volume_title}</h3>
                      <p className="text-xs text-slate-500">Vol. {item.volume_number}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-300">Qty: {item.quantity}</span>
                        <span className="text-sm font-bold text-indigo-300 font-mono">₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex justify-between text-sm text-slate-400"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm text-slate-400"><span>Shipping</span><span className="text-green-400 font-medium">₹{shipping.toFixed(2)}</span></div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-800/50">
                  <span className="text-lg font-bold text-white">Total</span>
                  <span className="text-2xl font-bold text-indigo-400 font-mono">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={placingOrder || !selectedAddress || checkoutItems.length === 0}
                className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white py-4 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                {placingOrder ? <Loader2 className="animate-spin" /> : `Place Order • ₹${total.toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;