"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Package, 
  ChevronRight, 
  Calendar, 
  MapPin
} from "lucide-react";
// import { useRouter } from "next/navigation";
import Link from "next/link";

interface OrderItem {
  volume_title: string;
  quantity: number;
  price_at_purchase: string;
}

interface Order {
  order_id: string;
  total_amount: string;
  order_status: string;
  payment_status: string;
  created_at: string;
  shipping_city: string;
  orderItems: OrderItem[];
}

const OrdersPage = () => {
  // const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${baseUrl}/api/orders/get_orders`, { 
          withCredentials: true 
        });
        if (res.data.apiSuccess === 1) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setTimeout(() => setLoading(false), 600); // Smooth transition
      }
    };
    fetchOrders();
  }, [baseUrl]);

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PLACED': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'SHIPPED': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'DELIVERED': return 'bg-green-500/10 text-green-400 border-green-500/20';
      default: return 'bg-slate-700/50 text-slate-400 border-slate-600';
    }
  };

  if (loading) {
    return <OrdersSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 px-4 py-10 md:px-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Package className="text-indigo-500" /> My Orders
          </h1>
          <p className="text-slate-400 mt-2">Check the status of your recent manga hauls.</p>
        </header>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800">
            <Package className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white">No orders found</h3>
            <p className="text-slate-500 mt-2">Looks like you havent started your collection yet.</p>
            <Link href="/" className="inline-block mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition">
              Browse Manga
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <Link 
                key={order.order_id} 
                href={`/orders/${order.order_id}`}
                className="group block bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all hover:shadow-2xl hover:shadow-indigo-500/5"
              >
                <div className="p-6">
                  {/* Top Row: Order ID and Status */}
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                    <div>
                      <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">Order ID</span>
                      <h2 className="text-lg font-bold text-white tracking-tight">{order.order_id}</h2>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.order_status)}`}>
                        {order.order_status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${order.payment_status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                        {order.payment_status}
                      </span>
                    </div>
                  </div>

                  {/* Middle Row: Items Preview */}
                  <div className="space-y-3 mb-6">
                    {order.orderItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                          <span className="text-slate-300 font-medium">{item.volume_title}</span>
                          <span className="text-slate-500 text-xs">x{item.quantity}</span>
                        </div>
                        <span className="text-slate-400 font-mono">₹{parseFloat(item.price_at_purchase).toFixed(0)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Row: Metadata */}
                  <div className="pt-6 border-t border-slate-800/50 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-6 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} />
                        {order.shipping_city}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                       <div className="text-right">
                          <p className="text-[10px] text-slate-500 uppercase font-bold">Total Amount</p>
                          <p className="text-xl font-bold text-white">₹{parseFloat(order.total_amount).toLocaleString('en-IN')}</p>
                       </div>
                       <ChevronRight className="text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- SKELETON COMPONENT ---
const OrdersSkeleton = () => (
  <div className="min-h-screen bg-slate-950 px-4 py-10 md:px-8 animate-pulse">
    <div className="max-w-5xl mx-auto">
      <div className="h-10 w-64 bg-slate-800 rounded-lg mb-4" />
      <div className="h-4 w-96 bg-slate-900 rounded-lg mb-12" />
      
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-slate-900 border border-slate-800 rounded-2xl" />
        ))}
      </div>
    </div>
  </div>
);

export default OrdersPage;