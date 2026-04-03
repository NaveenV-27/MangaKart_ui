"use client";

import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, Activity, 
  ShieldCheck, Edit3, LogOut, Loader2,
  UserCircle2, Plus, Trash2, RefreshCw
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

type Address = {
  address_id: string;
  full_name?: string;
  phone?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  tag?: string;
  is_default?: boolean;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiResponse<T = any> = {
  apiSuccess: number;
  message: string;
  data: T;
};

const ProfilePage = () => {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addrLoading, setAddrLoading] = useState(false);
  const [addrError, setAddrError] = useState<string>('');
  const [addrMessage, setAddrMessage] = useState<string>('');

  const emptyAddress: Omit<Address, 'address_id'> = {
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    tag: 'Home',
    is_default: false,
  };

  const [isAddrFormOpen, setIsAddrFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<Omit<Address, 'address_id'>>(emptyAddress);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/get_user_profile`, {}, {
          withCredentials: true,
        });
        setProfile(response.data.data[0]);
      } catch(error) {
        console.error("Error fetching profile data:", error);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const fetchAddresses = async () => {
    setAddrLoading(true);
    setAddrError('');
    setAddrMessage('');
    try {
      const res = await axios.get<ApiResponse>(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/addresses/get_addresses`,
        { withCredentials: true }
      );

      if (res.data.apiSuccess === 1) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const doc = (res.data.data as any) || {};
        const list: Address[] = Array.isArray(doc.addresses)
          ? doc.addresses
          : Array.isArray(res.data.data)
            ? (res.data.data[0]?.addresses || [])
            : [];
        setAddresses(list);
      } else {
        setAddrError(res.data.message || 'Failed to load addresses');
        setAddresses([]);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setAddrError(err?.response?.data?.message || 'Failed to load addresses');
      setAddresses([]);
    } finally {
      setAddrLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const openAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm(emptyAddress);
    setIsAddrFormOpen(true);
    setAddrError('');
    setAddrMessage('');
  };

  const openEditAddress = (addr: Address) => {
    setEditingAddressId(addr.address_id);
    const { address_id, ...rest } = addr;
    setAddressForm({ ...emptyAddress, ...rest });
    setIsAddrFormOpen(true);
    setAddrError('');
    setAddrMessage('');
  };

  const closeAddressForm = () => {
    setIsAddrFormOpen(false);
    setEditingAddressId(null);
    setAddressForm(emptyAddress);
  };

  const onAddressFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const submitAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddrLoading(true);
    setAddrError('');
    setAddrMessage('');

    try {
      if (!addressForm.address_line1 || !addressForm.city || !addressForm.state || !addressForm.pincode) {
        setAddrError('Please fill Address line 1, City, State, and Pincode.');
        setAddrLoading(false);
        return;
      }

      const payload = {
        full_name: addressForm.full_name || "",
        phone_number: addressForm.phone || "",
        address_line1: addressForm.address_line1 || "",
        address_line2: addressForm.address_line2 || "",
        city: addressForm.city || "",
        state: addressForm.state || "",
        postal_code: addressForm.pincode || "",
        country: addressForm.country || "",
        tag: addressForm.tag || "Home",
        is_default: addressForm.is_default || false
      };

      if (editingAddressId) {
        const res = await axios.post<ApiResponse>(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/addresses/update_address`,
          { address_id: editingAddressId, ...payload },
          { withCredentials: true }
        );
        if (res.data.apiSuccess === 1) {
          setAddrMessage(res.data.message || 'Address updated');
          closeAddressForm();
          await fetchAddresses();
        } else {
          setAddrError(res.data.message || 'Failed to update address');
        }
      } else {
        const res = await axios.post<ApiResponse>(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/addresses/add_address`,
          payload,
          { withCredentials: true }
        );
        if (res.data.apiSuccess === 1) {
          setAddrMessage(res.data.message || 'Address added');
          closeAddressForm();
          await fetchAddresses();
        } else {
          setAddrError(res.data.message || 'Failed to add address');
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setAddrError(err?.response?.data?.message || 'Address save failed');
    } finally {
      setAddrLoading(false);
    }
  };

  const deleteAddress = async (address_id: string) => {
    if(!confirm("Remove this address?")) return;
    setAddrLoading(true);
    try {
      const res = await axios.post<ApiResponse>(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/addresses/remove_address`,
        { address_id },
        { withCredentials: true }
      );
      if (res.data.apiSuccess === 1) {
        setAddrMessage(res.data.message || 'Address removed');
        await fetchAddresses();
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      setAddrError('Failed to remove address');
    } finally {
      setAddrLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/logout`, {}, {
        withCredentials: true,
      });
      router.push('/login');
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mb-4" />
        <p className="text-slate-500 font-mono uppercase tracking-[0.2em] animate-pulse text-xs">Syncing Profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 flex justify-center items-start">
      <div className="max-w-3xl w-full bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden border border-slate-800">
        
        {/* --- Top Banner --- */}
        <div className="h-40 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 relative">
          <div className="absolute -bottom-14 left-8">
            <div className="h-28 w-28 rounded-3xl bg-slate-800 border-4 border-slate-900 flex items-center justify-center shadow-2xl">
              <UserCircle2 className="h-16 w-16 text-indigo-400" />
            </div>
          </div>
        </div>

        {/* --- Header Actions --- */}
        <div className="pt-16 px-8 pb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">{profile.full_name}</h1>
            <p className="text-indigo-400 flex items-center gap-1.5 mt-1 font-bold text-xs uppercase tracking-widest">
              <ShieldCheck className="h-4 w-4" /> Verified Citizen
            </p>
          </div>
          <div className="flex gap-2">
            <button className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-white transition border border-slate-700">
              <Edit3 size={18} />
            </button>
            <button 
              onClick={logout}
              className="p-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition border border-rose-500/20"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        <div className="px-8 pb-10 space-y-8">
          {/* --- Profile Data Grid --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Username</p>
              <div className="flex items-center gap-2 text-white font-bold">
                <User size={14} className="text-indigo-500" /> @{profile.username}
              </div>
            </div>
            <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Email</p>
              <div className="flex items-center gap-2 text-white font-bold truncate">
                <Mail size={14} className="text-indigo-500" /> {profile.email}
              </div>
            </div>
            <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Phone</p>
              <div className="flex items-center gap-2 text-white font-bold">
                <Phone size={14} className="text-indigo-500" /> {profile.phone_number || "Not Linked"}
              </div>
            </div>
            <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Demographics</p>
              <div className="flex items-center gap-2 text-white font-bold">
                <Activity size={14} className="text-indigo-500" /> 
                <span className="capitalize">{profile.gender} • {profile.age} Yrs</span>
              </div>
            </div>
          </div>

          {/* --- Addresses --- */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Delivery Intel</h2>
              <div className="flex gap-2">
                <button
                  onClick={fetchAddresses}
                  disabled={addrLoading}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl transition border border-slate-700"
                >
                  <RefreshCw size={16} className={addrLoading ? "animate-spin" : ""} />
                </button>
                <button
                  onClick={openAddAddress}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition flex items-center gap-2"
                >
                  <Plus size={14} /> New
                </button>
              </div>
            </div>

            {addrError && <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-bold">{addrError}</div>}
            {addrMessage && <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold">{addrMessage}</div>}

            <div className="grid grid-cols-1 gap-3">
              {addresses.map((a) => (
                <div key={a.address_id} className="p-5 rounded-3xl border border-slate-800 bg-slate-950/30 group transition-all hover:border-indigo-500/30">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-black uppercase text-sm">{a.full_name || profile.full_name}</p>
                        {a.tag && <span className="text-[9px] px-2 py-0.5 rounded-md bg-indigo-600 text-white font-black uppercase tracking-tighter">{a.tag}</span>}
                        {a.is_default && <span className="text-[9px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-black uppercase tracking-tighter border border-slate-700">Default</span>}
                      </div>
                      <p className="text-slate-400 text-sm">{a.address_line1}, {a.city}, {a.state} - {a.pincode}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEditAddress(a)} className="p-2 text-slate-500 hover:text-white transition"><Edit3 size={16}/></button>
                      <button onClick={() => deleteAddress(a.address_id)} className="p-2 text-slate-500 hover:text-rose-500 transition"><Trash2 size={16}/></button>
                    </div>
                  </div>
                </div>
              ))}
              {addresses.length === 0 && !addrLoading && <p className="text-center py-10 text-slate-600 text-sm font-medium italic border border-dashed border-slate-800 rounded-3xl">No field data found...</p>}
            </div>

            {/* --- Address Form --- */}
            {isAddrFormOpen && (
              <div className="mt-4 p-6 rounded-3xl border border-indigo-500/30 bg-indigo-500/5 animate-in fade-in slide-in-from-top-2">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-black uppercase text-sm tracking-widest">{editingAddressId ? 'Edit Record' : 'Create Record'}</h3>
                  <button onClick={closeAddressForm} className="text-slate-500 hover:text-white transition"><XIcon size={18}/></button>
                </div>
                <form onSubmit={submitAddress} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input className="input-field" name="full_name" placeholder="Contact Person" value={addressForm.full_name} onChange={onAddressFormChange} />
                  <input className="input-field" name="phone" placeholder="Phone Number" value={addressForm.phone} onChange={onAddressFormChange} />
                  <input className="input-field md:col-span-2" name="address_line1" placeholder="Address Line 1" value={addressForm.address_line1} onChange={onAddressFormChange} />
                  <input className="input-field" name="city" placeholder="City" value={addressForm.city} onChange={onAddressFormChange} />
                  <input className="input-field" name="state" placeholder="State" value={addressForm.state} onChange={onAddressFormChange} />
                  <input className="input-field" name="pincode" placeholder="Postal Code" value={addressForm.pincode} onChange={onAddressFormChange} />
                  <select className="input-field" name="tag" value={addressForm.tag} onChange={onAddressFormChange}>
                    <option value="Home">Home Base</option>
                    <option value="Work">Office</option>
                    <option value="Other">External</option>
                  </select>
                  <label className="md:col-span-2 flex items-center gap-2 text-xs font-bold text-slate-400 cursor-pointer">
                    <input type="checkbox" name="is_default" checked={addressForm.is_default} onChange={onAddressFormChange} className="accent-indigo-500" />
                    Set as Primary Destination
                  </label>
                  <div className="md:col-span-2 flex gap-3 pt-4">
                    <button type="submit" disabled={addrLoading} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-2xl font-black uppercase tracking-widest transition shadow-lg shadow-indigo-600/20">
                      {addrLoading ? 'Processing...' : 'Save Data'}
                    </button>
                    <button type="button" onClick={closeAddressForm} className="px-6 py-3 bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest border border-slate-700">Cancel</button>
                  </div>
                </form>
              </div>
            )}
          </div>

          <button 
            onClick={() => router.push('/')}
            className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-[0.3em] rounded-3xl transition-all border border-slate-700 shadow-xl"
          >
            Return to HQ
          </button>
        </div>
      </div>
      
      {/* Internal Style for inputs */}
      <style jsx>{`
        .input-field {
          background: #020617;
          border: 1px solid #1e293b;
          border-radius: 1rem;
          padding: 0.75rem 1rem;
          color: white;
          font-size: 0.875rem;
          outline: none;
          transition: all 0.2s;
        }
        .input-field:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 1px #6366f1;
        }
      `}</style>
    </div>
  );
};

// Helper for close icon
const XIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

export default ProfilePage;