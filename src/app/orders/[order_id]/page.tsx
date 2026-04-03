"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  useParams, 
  useRouter 
} from "next/navigation";
import { 
  ChevronLeft, 
  Package, 
  Truck, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Calendar, 
  CreditCard,
  ExternalLink
} from "lucide-react";
import Link from "next/link";

interface OrderItem {
  id: number;
  volume_id: string;
  volume_title: string;
  price_at_purchase: string;
  quantity: number;
}

interface OrderData {
  order_id: string;
  total_amount: string;
  order_status: string;
  payment_status: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_pincode: string;
  created_at: string;
  orderItems: OrderItem[];
}

const OrderDetailsPage = () => {
  const { order_id } = useParams();
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // Updated to use the correct path format as per your requirement
        const res = await axios.get(`${baseUrl}/api/orders/get_order/${order_id}`, {
          withCredentials: true
        });
        if (res.data.apiSuccess === 1) {
          setOrder(res.data.order);
        }
      } catch (err) {
        console.error("Error fetching order details:", err);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };

    if (order_id) fetchOrderDetails();
  }, [order_id, baseUrl]);

  if (loading) return <OrderDetailsSkeleton />;
  if (!order) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Order not found.</div>;

  const steps = ["PLACED", "SHIPPED", "DELIVERED"];
  const currentStep = steps.indexOf(order.order_status.toUpperCase());

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 px-4 py-10 md:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation */}
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-8 group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Orders
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Order Status Tracker */}
            <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-white">Order Details</h1>
                  <p className="text-slate-500 font-mono text-sm mt-1">{order.order_id}</p>
                </div>
                <div className="text-right">
                   <span className="text-xs text-slate-500 uppercase font-bold block mb-1">Placed On</span>
                   <div className="flex items-center gap-2 text-slate-300">
                      <Calendar size={14} />
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                   </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative flex justify-between items-center mb-4">
                {steps.map((step, index) => (
                  <div key={step} className="flex flex-col items-center z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${
                      index <= currentStep 
                      ? "bg-indigo-600 border-indigo-500/30 text-white" 
                      : "bg-slate-800 border-slate-900 text-slate-500"
                    }`}>
                      {index === 0 && <Package size={18} />}
                      {index === 1 && <Truck size={18} />}
                      {index === 2 && <CheckCircle2 size={18} />}
                    </div>
                    <span className={`text-[10px] font-bold mt-2 tracking-widest uppercase ${
                      index <= currentStep ? "text-indigo-400" : "text-slate-600"
                    }`}>
                      {step}
                    </span>
                  </div>
                ))}
                {/* Connector Line */}
                <div className="absolute top-5 left-0 w-full h-1 bg-slate-800 -z-0" />
                <div 
                  className="absolute top-5 left-0 h-1 bg-indigo-600 transition-all duration-500 -z-0" 
                  style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                />
              </div>
            </section>

            {/* Items List */}
            <section className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/30">
                <h2 className="font-bold text-white">Order Items</h2>
              </div>
              <div className="divide-y divide-slate-800">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="p-6 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-16 bg-slate-800 rounded flex items-center justify-center text-slate-600">
                          <Package size={20} />
                       </div>
                       <div>
                          <Link href={`/volume/${item.volume_id}`} className="text-white font-bold hover:text-indigo-400 flex items-center gap-1 transition">
                            {item.volume_title} <ExternalLink size={12} className="opacity-0 group-hover:opacity-100" />
                          </Link>
                          <p className="text-sm text-slate-500 mt-1">Quantity: {item.quantity}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-white font-mono font-bold">₹{parseFloat(item.price_at_purchase).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Delivery Information */}
            <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <MapPin className="text-indigo-500" size={18} /> Shipping Info
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-white font-bold">{order.shipping_name}</p>
                  <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                    {order.shipping_address}<br />
                    {order.shipping_city}, {order.shipping_pincode}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400 pt-4 border-t border-slate-800/50 font-mono">
                  <Phone size={14} /> {order.shipping_phone}
                </div>
              </div>
            </section>

            {/* Payment Summary */}
            <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <CreditCard className="text-indigo-500" size={18} /> Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Payment Status</span>
                  <span className={`font-bold ${order.payment_status === 'PAID' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {order.payment_status}
                  </span>
                </div>
                <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                   <span className="text-white font-bold">Total Paid</span>
                   <span className="text-2xl font-bold text-indigo-400 font-mono">₹{parseFloat(order.total_amount).toFixed(2)}</span>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

// --- SKELETON LOADER ---
const OrderDetailsSkeleton = () => (
  <div className="min-h-screen bg-slate-950 px-4 py-10 md:px-8 animate-pulse">
    <div className="max-w-4xl mx-auto">
      <div className="h-6 w-32 bg-slate-800 rounded mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="h-48 bg-slate-900 border border-slate-800 rounded-3xl" />
          <div className="h-64 bg-slate-900 border border-slate-800 rounded-3xl" />
        </div>
        <div className="lg:col-span-4 space-y-6">
          <div className="h-40 bg-slate-900 border border-slate-800 rounded-3xl" />
          <div className="h-32 bg-slate-900 border border-slate-800 rounded-3xl" />
        </div>
      </div>
    </div>
  </div>
);

export default OrderDetailsPage;