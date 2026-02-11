"use client";

import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, Activity, 
  ShieldCheck, Edit3, LogOut, Loader2,
  UserCircle2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

type Address = {
  address_id: string;
  full_name?: string;
  phone?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  tag?: string;
  is_default?: boolean;
};

type ApiResponse<T = any> = {
  apiSuccess: number;
  message: string;
  data: T;
};

const ProfilePage = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addrLoading, setAddrLoading] = useState(false);
  const [addrError, setAddrError] = useState<string>('');
  const [addrMessage, setAddrMessage] = useState<string>('');

  const emptyAddress: Omit<Address, 'address_id'> = {
    full_name: '',
    phone: '',
    line1: '',
    line2: '',
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

  // --- Mock API Call ---
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/get_user_profile`, {}, {
          withCredentials: true,
        })
        console.log("Profile data:", response.data);
        setProfile(response.data.data[0]);
      } catch(error) {
        console.error("Error fetching profile data:", error);
      }

      // setProfile(mockData);
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const fetchAddresses = async () => {
    setAddrLoading(true);
    setAddrError('');
    setAddrMessage('');
    try {
      const res = await axios.post<ApiResponse>(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/addresses/get_addresses`,
        {},
        { withCredentials: true }
      );

      if (res.data.apiSuccess === 1) {
        console.log("Fetch addresses response:", res.data);
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
    } catch (err: any) {
      setAddrError(err?.response?.data?.message || 'Failed to load addresses');
      setAddresses([]);
    } finally {
      setAddrLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setAddressForm({
      ...emptyAddress,
      ...rest,
    });
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
      if (!addressForm.line1 || !addressForm.city || !addressForm.state || !addressForm.pincode) {
        setAddrError('Please fill Line 1, City, State, and Pincode.');
        return;
      }
  // Map UI state -> backend required keys
  const payload = {
    full_name: addressForm.full_name || "",
    phone_number: (addressForm as any).phone_number || (addressForm as any).phone || "",
    address_line1: (addressForm as any).address_line1 || (addressForm as any).line1 || "",
    city: addressForm.city || "",
    state: addressForm.state || "",
    postal_code: (addressForm as any).postal_code || (addressForm as any).pincode || "",
    country: addressForm.country || "",
  };

  console.log("Payload for address submission:", payload);

  if (editingAddressId) {
        const res = await axios.post<ApiResponse>(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/addresses/update_address`,
          {
            address_id: editingAddressId,
    ...payload,
          },
          { withCredentials: true }
        );
        if (res.data.apiSuccess === 1) {
          console.log("Update address response:", res.data);
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
          console.log("Add address response:", res.data);
          setAddrMessage(res.data.message || 'Address added');
          closeAddressForm();
          await fetchAddresses();
        } else {
          setAddrError(res.data.message || 'Failed to add address');
        }
      }
    } catch (err: any) {
      setAddrError(err?.response?.data?.message || 'Address save failed');
    } finally {
      setAddrLoading(false);
    }
  };

  const deleteAddress = async (address_id: string) => {
    setAddrLoading(true);
    setAddrError('');
    setAddrMessage('');
    try {
      const res = await axios.post<ApiResponse>(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/addresses/remove_address`,
        { address_id },
        { withCredentials: true }
      );
      if (res.data.apiSuccess === 1) {
        console.log("Delete address response:", res.data);
        setAddrMessage(res.data.message || 'Address removed');
        await fetchAddresses();
      } else {
        setAddrError(res.data.message || 'Failed to remove address');
      }
    } catch (err: any) {
      setAddrError(err?.response?.data?.message || 'Failed to remove address');
    } finally {
      setAddrLoading(false);
    }
  };

  const clearAllAddresses = async () => {
    const ok = confirm('Clear all saved addresses?');
    if (!ok) return;

    setAddrLoading(true);
    setAddrError('');
    setAddrMessage('');
    try {
      const res = await axios.post<ApiResponse>(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/addresses/clear_addresses`,
        {},
        { withCredentials: true }
      );
      if (res.data.apiSuccess === 1) {
        setAddrMessage(res.data.message || 'Addresses cleared');
        await fetchAddresses();
      } else {
        setAddrError(res.data.message || 'Failed to clear addresses');
      }
    } catch (err: any) {
      setAddrError(err?.response?.data?.message || 'Failed to clear addresses');
    } finally {
      setAddrLoading(false);
    }
  };

  const logout = async () => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/logout`, {} ,{
        withCredentials: true,
      });
      console.log("Logout response:", response.data);
      router.push('/login');
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-400 animate-pulse">Loading Admin Profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8 flex justify-center items-center">
      <div className="max-w-2xl w-full bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
        
        {/* --- Top Banner & Avatar --- */}
        <div className="h-32 bg-gradient-to-r from-slate-700 to-gray-800 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="h-24 w-24 rounded-2xl bg-gray-700 border-4 border-gray-800 flex items-center justify-center shadow-lg">
              <UserCircle2 className="h-16 w-16 text-blue-400" />
            </div>
          </div>
        </div>

        {/* --- Header Actions --- */}
        <div className="pt-16 px-8 pb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-extrabold text-white">{profile.full_name}</h1>
            <p className="text-blue-400 flex items-center gap-1 mt-1 font-medium">
              <ShieldCheck className="h-4 w-4" /> Verified mangakart user
            </p>
          </div>
          <div className="flex gap-2">
            <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition border border-gray-600">
              <Edit3 className="h-5 w-5" />
            </button>
            <button 
              onClick={logout}
              title='Logout'
              className="p-2 bg-red-900/20 hover:bg-red-900/40 rounded-lg text-red-400 transition border border-red-900/50 cursor-pointer"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* --- Profile Data Grid --- */}
        <div className="px-8 pb-8 space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Username */}
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Username</p>
              <div className="flex items-center gap-2 text-white bg-gray-700/30 p-3 rounded-lg">
                <User className="h-4 w-4 text-blue-400" />
                <span>@{profile.username}</span>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Email Address</p>
              <div className="flex items-center gap-2 text-white bg-gray-700/30 p-3 rounded-lg">
                <Mail className="h-4 w-4 text-blue-400" />
                <span className="truncate">{profile.email}</span>
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Phone Number</p>
              <div className="flex items-center gap-2 text-white bg-gray-700/30 p-3 rounded-lg">
                <Phone className="h-4 w-4 text-blue-400" />
                <span>{profile.phone_number || "N/A"}</span>
              </div>
            </div>

            {/* Age & Gender */}
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Demographics</p>
              <div className="flex items-center gap-2 text-white bg-gray-700/30 p-3 rounded-lg">
                <Activity className="h-4 w-4 text-blue-400" />
                <span className="capitalize">{profile.gender} • {profile.age} yrs</span>
              </div>
            </div>
          </div>

          {/* --- Addresses --- */}
          <div className="mt-2 bg-gray-900/40 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white">Saved Addresses</h2>
                <p className="text-sm text-gray-400">Manage delivery addresses for orders.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={fetchAddresses}
                  disabled={addrLoading}
                  className="px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 disabled:bg-gray-700/60 disabled:cursor-not-allowed text-white rounded-lg border border-gray-600"
                >
                  Refresh
                </button>
                <button
                  onClick={openAddAddress}
                  disabled={addrLoading}
                  className="px-3 py-2 text-sm bg-[#566784] hover:bg-slate-700 disabled:bg-gray-700/60 disabled:cursor-not-allowed text-white rounded-lg border border-gray-600"
                >
                  Add
                </button>
              </div>
            </div>

            {addrError && (
              <div className="mt-3 bg-red-900/30 border border-red-800 text-red-200 px-3 py-2 rounded text-sm">
                {addrError}
              </div>
            )}
            {addrMessage && (
              <div className="mt-3 bg-green-900/20 border border-green-800 text-green-200 px-3 py-2 rounded text-sm">
                {addrMessage}
              </div>
            )}

            {addrLoading && (
              <div className="mt-3 text-gray-400 text-sm">Loading...</div>
            )}

            {!addrLoading && addresses.length === 0 && (
              <div className="mt-3 text-gray-400 text-sm">No addresses saved yet.</div>
            )}

            {!addrLoading && addresses.length > 0 && (
              <div className="mt-3 space-y-3">
                {addresses.map((a) => (
                  <div key={a.address_id} className="p-3 rounded-lg border border-gray-700 bg-gray-800/40">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-white font-semibold truncate">
                            {a.full_name || profile?.full_name || 'Address'}
                          </p>
                          {a.tag && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-700 text-gray-200 border border-gray-600">
                              {a.tag}
                            </span>
                          )}
                          {a.is_default && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-900/30 text-blue-200 border border-blue-800">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-gray-300 text-sm mt-1">
                          {a.line1}{a.line2 ? `, ${a.line2}` : ''}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {a.city}, {a.state} - {a.pincode}{a.country ? `, ${a.country}` : ''}
                        </p>
                        {a.phone && (
                          <p className="text-gray-400 text-sm mt-1">Phone: {a.phone}</p>
                        )}
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => openEditAddress(a)}
                          disabled={addrLoading}
                          className="px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 disabled:bg-gray-700/60 disabled:cursor-not-allowed text-white rounded-lg border border-gray-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteAddress(a.address_id)}
                          disabled={addrLoading}
                          className="px-3 py-2 text-sm bg-red-900/20 hover:bg-red-900/40 disabled:bg-gray-700/60 disabled:cursor-not-allowed text-red-300 rounded-lg border border-red-900/50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={clearAllAddresses}
                  disabled={addrLoading}
                  className="w-full mt-2 px-3 py-2 text-sm bg-red-900/20 hover:bg-red-900/40 disabled:bg-gray-700/60 disabled:cursor-not-allowed text-red-300 rounded-lg border border-red-900/50"
                >
                  Clear all addresses
                </button>
              </div>
            )}

            {isAddrFormOpen && (
              <div className="mt-4 p-4 rounded-xl border border-gray-700 bg-gray-900/40">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-bold">
                    {editingAddressId ? 'Edit Address' : 'Add Address'}
                  </h3>
                  <button
                    onClick={closeAddressForm}
                    className="text-sm text-gray-300 hover:text-white"
                    type="button"
                  >
                    Close
                  </button>
                </div>

                <form onSubmit={submitAddress} className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white"
                    name="full_name"
                    placeholder="Full name"
                    value={addressForm.full_name || ''}
                    onChange={onAddressFormChange}
                  />
                  <input
                    className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white"
                    name="phone"
                    placeholder="Phone"
                    value={addressForm.phone || ''}
                    onChange={onAddressFormChange}
                  />

                  <input
                    className="md:col-span-2 w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white"
                    name="line1"
                    placeholder="Address line 1*"
                    value={addressForm.line1}
                    onChange={onAddressFormChange}
                    required
                  />
                  <input
                    className="md:col-span-2 w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white"
                    name="line2"
                    placeholder="Address line 2"
                    value={addressForm.line2 || ''}
                    onChange={onAddressFormChange}
                  />

                  <input
                    className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white"
                    name="city"
                    placeholder="City*"
                    value={addressForm.city}
                    onChange={onAddressFormChange}
                    required
                  />
                  <input
                    className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white"
                    name="state"
                    placeholder="State*"
                    value={addressForm.state}
                    onChange={onAddressFormChange}
                    required
                  />

                  <input
                    className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white"
                    name="pincode"
                    placeholder="Pincode*"
                    value={addressForm.pincode}
                    onChange={onAddressFormChange}
                    required
                  />

                  <input
                    className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white"
                    name="country"
                    placeholder="Country"
                    value={addressForm.country || ''}
                    onChange={onAddressFormChange}
                  />

                  <select
                    className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white"
                    name="tag"
                    value={addressForm.tag || 'Home'}
                    onChange={onAddressFormChange}
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="Other">Other</option>
                  </select>

                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      name="is_default"
                      checked={!!addressForm.is_default}
                      onChange={onAddressFormChange}
                      className="accent-blue-500"
                    />
                    Set as default
                  </label>

                  <div className="md:col-span-2 flex gap-2 mt-1">
                    <button
                      type="submit"
                      disabled={addrLoading}
                      className="px-4 py-2 bg-[#566784] hover:bg-slate-700 disabled:bg-gray-700/60 disabled:cursor-not-allowed text-white rounded-lg border border-gray-600"
                    >
                      {editingAddressId ? 'Save changes' : 'Add address'}
                    </button>
                    <button
                      type="button"
                      onClick={closeAddressForm}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg border border-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          <button 
            onClick={() => router.push('/')}
            className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition duration-300"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;