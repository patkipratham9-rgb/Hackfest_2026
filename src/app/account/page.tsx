"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  MapPin,
  Shield,
  ShoppingBag,
  ArrowLeft,
  Mail,
  Smartphone,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Store,
  LogOut,
  AlertCircle,
  Home,
  Briefcase,
  Building,
  Tag,
  ShieldCheck,
  Package,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { UserAddress, AddressType, NeighborhoodArea } from "@/types";
import { Map4MePicker } from "@/components/Map4MePicker";

const HUBBALLI_LOCALITIES: NeighborhoodArea[] = [
  "Vidyanagar",
  "Gokul Road",
  "CBT",
  "Station Road",
  "Unkal Lake",
];

export default function AccountPage() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    updateProfile,
    deleteAccount,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    logout,
    activeAppMode,
    setActiveAppMode,
  } = useAuth();
  const { orders } = useCart();

  // Profile Edit Modal State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profileNumber, setProfileNumber] = useState(user?.number || "");
  const [profileEmail, setProfileEmail] = useState(user?.email || "");
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  // Account Removal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressLabel, setAddressLabel] = useState<AddressType>("Primary");
  const [addressStreet, setAddressStreet] = useState("");
  const [addressLandmark, setAddressLandmark] = useState("");
  const [addressLocality, setAddressLocality] = useState<string>("Vidyanagar");
  const [addressPincode, setAddressPincode] = useState("580021");
  const [addressIsDefault, setAddressIsDefault] = useState(false);
  const [addressError, setAddressError] = useState("");

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-forest-900 text-cream-100 flex items-center justify-center mx-auto text-2xl font-serif">
          LL
        </div>
        <h1 className="font-serif font-extrabold text-2xl text-forest-950">
          Account Not Signed In
        </h1>
        <p className="text-xs text-forest-600">
          Sign in with your phone or email to view saved addresses and order history.
        </p>
        <Link
          href="/login"
          className="inline-block px-6 py-3 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 text-cream-50 font-bold text-sm shadow-sm"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddressLabel("Home");
    setAddressStreet("");
    setAddressLandmark("");
    setAddressLocality("Vidyanagar");
    setAddressPincode("580021");
    setAddressIsDefault(user.addresses.length === 0);
    setAddressError("");
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: UserAddress) => {
    setEditingAddressId(addr.id);
    setAddressLabel(addr.label);
    setAddressStreet(addr.street);
    setAddressLandmark(addr.landmark || "");
    setAddressLocality(addr.locality);
    setAddressPincode(addr.pincode);
    setAddressIsDefault(addr.isDefault);
    setAddressError("");
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError("");

    if (editingAddressId) {
      const res = updateAddress(editingAddressId, {
        label: addressLabel,
        street: addressStreet,
        landmark: addressLandmark,
        locality: addressLocality,
        pincode: addressPincode,
        isDefault: addressIsDefault,
      });
      if (!res.success) {
        setAddressError(res.error || "Failed to update address");
        return;
      }
    } else {
      const res = addAddress({
        label: addressLabel,
        street: addressStreet,
        landmark: addressLandmark,
        locality: addressLocality,
        city: "Hubballi-Dharwad",
        pincode: addressPincode,
        isDefault: addressIsDefault,
      });
      if (!res.success) {
        setAddressError(res.error || "Failed to add address");
        return;
      }
    }

    setIsAddressModalOpen(false);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    const res = updateProfile({
      name: profileName,
      number: profileNumber,
      email: profileEmail,
    });

    if (!res.success) {
      setProfileError(res.error || "Failed to update profile");
      return;
    }

    setProfileSuccess("Profile updated successfully in database!");
    setTimeout(() => {
      setIsEditingProfile(false);
      setProfileSuccess("");
    }, 1000);
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    await deleteAccount();
    setIsDeleting(false);
    router.push("/login");
  };

  const getLabelIcon = (label: AddressType) => {
    switch (label) {
      case "Home":
        return <Home className="w-3.5 h-3.5 text-blue-600" />;
      case "Office":
        return <Briefcase className="w-3.5 h-3.5 text-forest-700" />;
      case "Primary":
        return <StarIcon className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <Building className="w-3.5 h-3.5 text-forest-600" />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <title>Buyer Profile &amp; Address Book • LocalLoop Hubballi</title>
      <meta
        name="description"
        content="Manage your full name, phone number, and address book with Primary, Home, Office, and Other tags."
      />

      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <h1 className="font-serif font-extrabold text-2xl text-forest-950">
          User Account &amp; Profiles
        </h1>
        <Link
          href="/"
          className="text-xs font-bold text-forest-700 hover:text-terracotta-600 flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Storefront</span>
        </Link>
      </div>

      {/* App Separation Banner (Shopper vs Merchant Application) */}
      <div className="p-4 rounded-3xl bg-cream-50 border border-cream-300 shadow-warm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              activeAppMode === "merchant"
                ? "bg-terracotta-600 text-cream-50"
                : "bg-forest-900 text-cream-50"
            }`}
          >
            {activeAppMode === "merchant" ? (
              <Store className="w-5 h-5" />
            ) : (
              <ShoppingBag className="w-5 h-5" />
            )}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-forest-500 block">
              Active Application Mode
            </span>
            <span className="font-bold text-sm text-forest-950 block">
              {activeAppMode === "merchant"
                ? "LocalLoop Partner (Merchant Application)"
                : "LocalLoop Shopper (Consumer Application)"}
            </span>
          </div>
        </div>

        {/* Switch to Merchant App and Switch to Shopper App buttons removed per strict app separation */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-forest-700 bg-cream-200 px-3 py-1.5 rounded-full border border-cream-300">
            {activeAppMode === "merchant" ? "Merchant Environment" : "Shopper Environment"}
          </span>
        </div>
      </div>

      {/* User Information Card */}
      <div className="p-6 rounded-3xl bg-cream-50 border border-cream-300 shadow-warm space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-forest-800 text-cream-100 flex items-center justify-center text-xl font-bold font-serif shadow-xs">
              {user.name.slice(0, 2).toUpperCase() || "LL"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-xl text-forest-950">
                  {user.name}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-forest-100 text-forest-800 border border-forest-200 text-[10px] font-bold capitalize">
                  {user.role}
                </span>
              </div>
              <div className="text-xs text-forest-600 mt-0.5 flex items-center gap-1">
                <Smartphone className="w-3 h-3 text-forest-500" />
                <a
                  href={`tel:+91${user.number}`}
                  className="hover:text-terracotta-600 hover:underline font-semibold"
                  title="Call user number"
                >
                  +91 {user.number}
                </a>
              </div>
              {user.email ? (
                <div className="text-xs text-forest-600 mt-0.5 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-forest-500" />
                  <a
                    href={`mailto:${user.email}`}
                    className="hover:text-terracotta-600 hover:underline font-semibold"
                    title="Send email"
                  >
                    {user.email}
                  </a>
                </div>
              ) : (
                <p className="text-xs text-amber-700 mt-0.5 italic">
                  Email not set (Optional)
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setProfileName(user.name);
              setProfileNumber(user.number);
              setProfileEmail(user.email || "");
              setIsEditingProfile(true);
            }}
            className="p-2 rounded-xl bg-cream-100 hover:bg-cream-200 text-forest-700 border border-cream-300 text-xs font-bold flex items-center gap-1"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Info</span>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-cream-200">
          <div className="p-3 rounded-2xl bg-cream-100/70 border border-cream-200 text-center">
            <span className="text-[10px] text-forest-500 font-semibold uppercase tracking-wider block">
              Saved Addresses
            </span>
            <span className="font-serif font-extrabold text-xl text-forest-950 block mt-0.5">
              {user.addresses.length}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-cream-100/70 border border-cream-200 text-center">
            <span className="text-[10px] text-forest-500 font-semibold uppercase tracking-wider block">
              Past Orders
            </span>
            <span className="font-serif font-extrabold text-xl text-forest-950 block mt-0.5">
              {orders.length}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-cream-100/70 border border-cream-200 text-center">
            <span className="text-[10px] text-forest-500 font-semibold uppercase tracking-wider block">
              Security Status
            </span>
            <span className="font-bold text-xs text-forest-700 block mt-1.5 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-forest-600" />
              <span>Verified</span>
            </span>
          </div>
        </div>
      </div>

      {/* Address Book Section (Primary, Home, Office, Others) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif font-bold text-lg text-forest-950">
              Address Book
            </h2>
            <p className="text-xs text-forest-600">
              Manage your Primary, Home, Office, and other pickup/delivery locations
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAddAddress}
            className="px-3.5 py-2 rounded-xl bg-forest-900 hover:bg-forest-950 text-cream-50 text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Address</span>
          </button>
        </div>

        {user.addresses.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-cream-50 border border-dashed border-cream-300 space-y-2">
            <MapPin className="w-8 h-8 text-forest-300 mx-auto" />
            <p className="font-bold text-sm text-forest-900">No addresses saved yet</p>
            <p className="text-xs text-forest-500">
              Add your Home, Office or Primary address for 1-tap checkout.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {user.addresses.map((addr, idx) => (
              <div
                key={addr.id || `account-addr-${idx}`}
                className={`p-4 rounded-2xl bg-cream-50 border transition-all space-y-2.5 relative ${
                  addr.isDefault
                    ? "border-terracotta-500 ring-2 ring-terracotta-200 shadow-sm"
                    : "border-cream-300 hover:border-forest-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {getLabelIcon(addr.label)}
                    <span className="font-bold text-xs text-forest-900">
                      {addr.label}
                    </span>
                    {addr.isDefault && (
                      <span className="px-2 py-0.5 rounded-full bg-terracotta-100 text-terracotta-800 text-[10px] font-bold">
                        Default
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditAddress(addr)}
                      className="p-1.5 text-forest-500 hover:text-forest-900 rounded-lg hover:bg-cream-100"
                      aria-label="Edit address"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteAddress(addr.id)}
                      className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50"
                      aria-label="Delete address"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-forest-800 space-y-0.5">
                  <p className="font-medium text-forest-950">{addr.street}</p>
                  {addr.landmark && (
                    <p className="text-forest-600 text-[11px]">
                      Landmark: {addr.landmark}
                    </p>
                  )}
                  <p className="text-forest-600 text-[11px]">
                    {addr.locality}, {addr.city} - {addr.pincode}
                  </p>
                </div>

                {!addr.isDefault && (
                  <button
                    type="button"
                    onClick={() => setDefaultAddress(addr.id)}
                    className="text-[11px] font-bold text-terracotta-700 hover:underline pt-1 block"
                  >
                    Set as Default
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Account Order History Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif font-bold text-lg text-forest-950 flex items-center gap-2">
              <Package className="w-5 h-5 text-terracotta-600" />
              <span>Your Account Orders</span>
            </h2>
            <p className="text-xs text-forest-600">
              Private order history for {user.name} ({user.number})
            </p>
          </div>
          <Link
            href="/orders-again"
            className="text-xs font-bold text-terracotta-700 hover:text-terracotta-800 hover:underline flex items-center gap-1"
          >
            <span>View All &amp; Reorder</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-cream-50 border border-dashed border-cream-300 space-y-2">
            <Package className="w-8 h-8 text-forest-300 mx-auto" />
            <p className="font-bold text-sm text-forest-900">No orders placed yet for this account</p>
            <p className="text-xs text-forest-500">
              Orders placed under {user.number} will be securely recorded here.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {orders.slice(0, 3).map((order) => (
              <div
                key={`account-order-${order.id}`}
                className="p-3.5 rounded-2xl bg-cream-50 border border-cream-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-xs text-forest-950">
                      {order.storeName}
                    </span>
                    <span className="text-[10px] text-forest-500 font-mono">
                      #{order.id}
                    </span>
                  </div>
                  <p suppressHydrationWarning className="text-[11px] text-forest-600">
                    {order.items.length} item{order.items.length > 1 ? "s" : ""} • ₹{order.total} • {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      order.status === "completed"
                        ? "bg-forest-100 text-forest-800 border border-forest-300"
                        : order.status === "ready"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-terracotta-100 text-terracotta-800 border border-terracotta-300"
                    }`}
                  >
                    {order.status}
                  </span>
                  <Link
                    href={`/orders/${order.id}`}
                    className="px-3 py-1.5 rounded-xl bg-forest-900 hover:bg-forest-950 text-cream-100 text-[11px] font-bold transition-colors"
                  >
                    Track
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Safety & Logout */}
      <div className="pt-4 flex items-center justify-between border-t border-cream-200">
        <div className="flex items-center gap-2 text-xs text-forest-600">
          <Shield className="w-4 h-4 text-forest-700" />
          <span>LocalLoop Auth v1.0 • Hubballi Certified</span>
        </div>
        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="px-4 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-bold flex items-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Danger Zone: Remove Account */}
      <div className="p-5 rounded-3xl bg-red-50/60 border border-red-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif font-bold text-red-950 text-sm">
              Danger Zone: Remove Account
            </h3>
            <p className="text-xs text-red-700 mt-0.5">
              Permanently delete your user profile and address book from our database.
            </p>
          </div>
          <button
            type="button"
            data-testid="btn-remove-account"
            onClick={() => setIsDeleteModalOpen(true)}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove Account</span>
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-cream-50 rounded-3xl p-6 border border-cream-300 shadow-2xl space-y-4">
            <h3 className="font-serif font-bold text-lg text-forest-950">
              Edit User Information
            </h3>

            {profileError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            {profileSuccess && (
              <div className="p-3 rounded-xl bg-forest-50 border border-forest-200 text-forest-800 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-forest-600 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-forest-900 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-cream-300 bg-white focus:ring-2 focus:ring-terracotta-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-forest-900 mb-1">
                  Mobile Number (10 digits)
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  required
                  value={profileNumber}
                  onChange={(e) => setProfileNumber(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-cream-300 bg-white focus:ring-2 focus:ring-terracotta-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-forest-900 mb-1">
                  Email Address <span className="text-forest-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  placeholder="Optional email"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-cream-300 bg-white focus:ring-2 focus:ring-terracotta-500 focus:outline-hidden"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="flex-1 py-2.5 rounded-xl border border-cream-300 text-forest-700 font-bold hover:bg-cream-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 text-cream-50 font-bold shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Map4Me Pinpoint Delivery Address Modal */}
      {isAddressModalOpen && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[999999] flex items-center justify-center p-4 overflow-y-auto"
          style={{ zIndex: 999999 }}
        >
          <div
            onClick={() => setIsAddressModalOpen(false)}
            className="fixed inset-0 bg-forest-950/80 backdrop-blur-md cursor-pointer"
            style={{ zIndex: 999999 }}
          />
          <div className="w-full max-w-xl my-8 relative z-[1000000]" style={{ zIndex: 1000000 }}>
            <Map4MePicker
              title={
                editingAddressId
                  ? "Map4Me: Edit Pinpoint Delivery Location"
                  : "Map4Me: Pinpoint Accurate Delivery Address"
              }
              initialAddress={
                editingAddressId
                  ? {
                      label: addressLabel,
                      street: addressStreet,
                      landmark: addressLandmark,
                      locality: addressLocality,
                      pincode: addressPincode,
                      isDefault: addressIsDefault,
                    }
                  : undefined
              }
              onSaveAddress={(saved) => {
                if (editingAddressId) {
                  updateAddress(editingAddressId, saved);
                } else {
                  addAddress(saved);
                }
                setIsAddressModalOpen(false);
              }}
              onCancel={() => setIsAddressModalOpen(false)}
            />
          </div>
        </div>,
        document.body
      )}

      {/* Remove Account Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/60 backdrop-blur-xs">
          <div
            data-testid="modal-confirm-delete-account"
            className="w-full max-w-md bg-white rounded-3xl p-6 border border-red-200 shadow-2xl space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-serif font-bold text-lg text-forest-950">
                Permanently Remove Account?
              </h3>
              <p className="text-xs text-forest-600 leading-relaxed">
                This will delete your user profile, saved addresses, and active session from the LocalLoop database. This action cannot be reversed.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-cream-300 text-forest-700 font-bold text-xs hover:bg-cream-100"
              >
                Keep Account
              </button>
              <button
                type="button"
                data-testid="btn-confirm-delete-account"
                disabled={isDeleting}
                onClick={handleDeleteAccount}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
