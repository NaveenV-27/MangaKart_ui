"use client";

import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { 
  MapPin, Plus, CheckCircle, Loader2, 
  ShoppingCart, ChevronLeft,
  PartyPopper, ArrowRight, X
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

  // --- UI States ---
  const [pageLoading, setPageLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // --- Data States ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [singleItem, setSingleItem] = useState<any | null>(null);
  const [isSingleCheckout, setIsSingleCheckout] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  // --- New Address Form State ---
  const [newAddr, setNewAddr] = useState({
    full_name: '',
    phone_number: '',
    address_line1: '',
    city: '',
    state: '',
    pincode: '',
    tag: 'Home'
  });

  const cartState = useSelector((state: RootState) => state.cart);
  const cartItemsFromRedux = cartState?.cartItems || [];
  const cartSubtotal = cartState?.totalAmount || 0;

  const checkoutItems = isSingleCheckout && singleItem ? [singleItem] : cartItemsFromRedux;
  const subtotal = isSingleCheckout && singleItem ? (singleItem.price * singleItem.quantity) : cartSubtotal;
  const shipping = subtotal > 0 ? 40.00 : 0;
  const total = subtotal + shipping;
  
  const fetchAddresses = useCallback(async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/addresses/get_addresses`, { withCredentials: true });
      if (res.data.apiSuccess === 1) {
        const list = res.data.data?.addresses || res.data.data || [];
        setAddresses(list);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!selectedAddress) setSelectedAddress(list.find((a: any) => a.is_default) || list[0]);
      }
    } catch (err) { console.error(err); }
  }, []);

  const fetchSingleVolume = useCallback(async (volumeId: string) => {
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
  }, []);

  useEffect(() => {
    const initCheckout = async () => {
      setPageLoading(true);
      const type = searchParams.get('type');
      const id = searchParams.get('id');
      try {
        await fetchAddresses();
        if (type === 'volume' && id) {
          setIsSingleCheckout(true);
          await fetchSingleVolume(id);
        } else {
          setIsSingleCheckout(false);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (dispatch as any)(fetchCart());
        }
      } finally {
        setTimeout(() => setPageLoading(false), 500);
      }
    };
    initCheckout();
  }, [dispatch, searchParams, fetchAddresses, fetchSingleVolume]);


  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Map UI names to your API required names
      const payload = {
        full_name: newAddr.full_name,
        phone_number: newAddr.phone_number,
        address_line1: newAddr.address_line1,
        city: newAddr.city,
        state: newAddr.state,
        pincode: newAddr.pincode,
        country: "India",
        tag: newAddr.tag
      };
      console.log("Adding new address:", payload)
      const res = await axios.post(`${baseUrl}/api/addresses/add_address`, payload, { withCredentials: true });
      if (res.data.apiSuccess === 1) {
        await fetchAddresses();
        setShowAddForm(false);
        setNewAddr({ full_name: '', phone_number: '', address_line1: '', city: '', state: '', pincode: '', tag: 'Home' });
      }
    } catch (err) { 
      console.error(err)
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
    };

    try {
      const res = await axios.post(`${baseUrl}/api/orders/create_order`, payload, { withCredentials: true });
      if (res.data.apiSuccess === 1) {
        setOrderId(res.data.order_id);
        setIsSuccess(true);
      }
    } finally { setPlacingOrder(false); }
  };

  if (pageLoading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 px-4 py-10 md:px-8 relative">
      
      {/* --- ADD ADDRESS MODAL --- */}
      {showAddForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
               <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">New Delivery HQ</h2>
               <button onClick={() => setShowAddForm(false)} className="text-slate-500 hover:text-white transition-colors"><X /></button>
            </div>
            
            <form onSubmit={handleAddAddress} className="space-y-4">
               <input 
                className="checkout-input" 
                placeholder="Full Name" 
                required 
                value={newAddr.full_name} 
                onChange={e => setNewAddr({...newAddr, full_name: e.target.value})} 
               />
               <input 
                className="checkout-input" 
                placeholder="Phone Number" 
                required 
                value={newAddr.phone_number} 
                onChange={e => setNewAddr({...newAddr, phone_number: e.target.value})} 
               />
               <input 
                className="checkout-input" 
                placeholder="Street Address / Area" 
                required 
                value={newAddr.address_line1} 
                onChange={e => setNewAddr({...newAddr, address_line1: e.target.value})} 
               />
               <div className="grid grid-cols-2 gap-4">
                  <input className="checkout-input" placeholder="City" required value={newAddr.city} onChange={e => setNewAddr({...newAddr, city: e.target.value})} />
                  <input className="checkout-input" placeholder="Pincode" required value={newAddr.pincode} onChange={e => setNewAddr({...newAddr, pincode: e.target.value})} />
               </div>
               <input className="checkout-input" placeholder="State" required value={newAddr.state} onChange={e => setNewAddr({...newAddr, state: e.target.value})} />
               
               <div className="flex gap-3 pt-2">
                  {['Home', 'Work', 'Other'].map(t => (
                    <button 
                      key={t}
                      type="button"
                      onClick={() => setNewAddr({...newAddr, tag: t})}
                      className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${newAddr.tag === t ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                    >
                      {t}
                    </button>
                  ))}
               </div>

               <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest mt-6 shadow-lg shadow-indigo-600/20 transition-all">
                  Initialize Address
               </button>
            </form>
          </div>
        </div>
      )}

      {/* --- SUCCESS OVERLAY --- */}
      {isSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] max-w-sm w-full text-center shadow-2xl scale-in-center">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <PartyPopper className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">Deployed!</h2>
            <p className="text-slate-400 text-sm font-medium mb-8">Intelligence suggests your manga is being prepared for transit.</p>
            <button onClick={() => router.push(`/orders/${orderId}`)} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest transition flex items-center justify-center gap-2 group">
              Track Order <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <header className="flex items-center gap-4 mb-12">
          <button onClick={() => router.back()} className="p-3 bg-slate-900 border border-slate-800 rounded-2xl hover:text-indigo-400 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter flex items-center gap-4">
            <ShoppingCart className="text-indigo-500" size={32} /> Checkout
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* LEFT: ADDRESSES */}
          <div className="lg:col-span-7 space-y-8">
            <section className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <MapPin size={120} />
              </div>

              <div className="flex items-center justify-between mb-8 relative z-10">
                <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Delivery Intel</h2>
                <button 
                  onClick={() => setShowAddForm(true)} 
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <Plus size={14} /> Add Station
                </button>
              </div>

              <div className="space-y-4 relative z-10">
                {addresses.map((addr) => (
                  <div 
                    key={addr.address_id} 
                    onClick={() => setSelectedAddress(addr)}
                    className={`group p-5 rounded-2xl border cursor-pointer transition-all ${
                      selectedAddress?.address_id === addr.address_id 
                      ? "border-indigo-500 bg-indigo-500/5 ring-1 ring-indigo-500" 
                      : "border-slate-800 bg-slate-950/40 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-black uppercase text-sm text-white tracking-tight">{addr.full_name}</p>
                          <span className="text-[9px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-black uppercase tracking-tighter">{addr.tag}</span>
                        </div>
                        <p className="text-sm text-slate-500 font-medium">{addr.address_line1}, {addr.city}</p>
                        <p className="text-[11px] text-slate-600 font-bold mt-2">{addr.phone_number}</p>
                      </div>
                      <div className={`p-1 rounded-full border-2 transition-colors ${selectedAddress?.address_id === addr.address_id ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-800'}`}>
                        <CheckCircle size={14} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT: ORDER SUMMARY */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 shadow-2xl sticky top-8">
              <h2 className="text-xl font-black text-white uppercase italic tracking-tight mb-8">Order Manifest</h2>
              
              <div className="space-y-4 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {checkoutItems.map((item) => (
                  <div key={item.volume_id} className="flex gap-4 bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                    <div className="relative w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden shadow-lg">
                      <Image src={item.cover_image || '/placeholder.png'} alt={item.volume_title} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                      <div>
                        <h3 className="text-sm font-black text-white uppercase truncate tracking-tight">{item.volume_title}</h3>
                        <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Release #{item.volume_number}</p>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] bg-slate-800 px-2 py-1 rounded font-black text-slate-400 uppercase">QTY: {item.quantity}</span>
                        <span className="text-base font-black text-white font-mono">₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-800">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <span>Subtotal</span>
                  <span className="text-white">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <span>Logistics</span>
                  <span className="text-emerald-400">₹{shipping.toFixed(2)}</span>
                </div>
                <div className="pt-6 border-t border-slate-800 flex justify-between items-end">
                  <span className="text-sm font-black text-white uppercase italic tracking-widest">Total Order</span>
                  <span className="text-3xl font-black text-indigo-400 font-mono">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={placingOrder || !selectedAddress || checkoutItems.length === 0}
                className="w-full mt-8 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 group"
              >
                {placingOrder ? <Loader2 className="animate-spin" /> : <>Finalize Order <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .checkout-input {
          width: 100%;
          padding: 0.875rem 1.25rem;
          border-radius: 1.25rem;
          background-color: #020617;
          border: 1px solid #1e293b;
          color: white;
          font-size: 0.875rem;
          font-weight: 500;
          outline: none;
          transition: all 0.2s;
        }
        .checkout-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 1px #6366f1;
        }
      `}</style>
    </div>
  );
};

export default CheckoutPage;