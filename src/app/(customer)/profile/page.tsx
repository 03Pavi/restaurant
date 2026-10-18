"use client";

import { useState, useEffect, FC, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  MapPin,
  Home,
  Briefcase,
  Plus,
  CheckCircle2,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Shield,
  LogOut,
  Navigation,
  X,
  Building,
} from "lucide-react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useSessionQuery } from "@/lib/auth/use-session-query";
import { useSignOutMutation } from "@/lib/auth/use-sign-out-mutation";
import {
  useDeliveryAddressStore,
  UserAddress,
} from "@/lib/customer/use-delivery-address";
import styles from "./page.module.scss";

const ProfilePage: FC = () => {
  const router = useRouter();
  const { data: sessionData, isPending: isSessionLoading } = useSessionQuery();
  const signOutMutation = useSignOutMutation();

  const {
    addresses,
    selectedAddressId,
    setSelectedAddressId,
    loadAddressesFromFirestore,
    addAddressToFirestore,
    updateAddressInFirestore,
    deleteAddressFromFirestore,
  } = useDeliveryAddressStore();

  const user = sessionData?.user;
  const isAuthenticated = Boolean(sessionData?.isAuthenticated && user);

  // Profile editable state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");

  // Address modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [modalLabel, setModalLabel] = useState<"Home" | "Work" | "Other">("Home");
  const [modalReceiverName, setModalReceiverName] = useState("");
  const [modalPhone, setModalPhone] = useState("");
  const [modalStreet, setModalStreet] = useState("");
  const [modalApartment, setModalApartment] = useState("");
  const [modalCity, setModalCity] = useState("");
  const [modalPostalCode, setModalPostalCode] = useState("");
  const [modalDeliveryNotes, setModalDeliveryNotes] = useState("");
  const [modalIsDefault, setModalIsDefault] = useState(false);
  const [modalError, setModalError] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isSessionLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isSessionLoading, isAuthenticated, router]);

  // Load user profile & addresses from Firestore
  useEffect(() => {
    if (!user?.id) return;

    setName(user.name || "");

    const fetchFirestoreProfile = async () => {
      try {
        const userDocRef = doc(db, "users", user.id);
        const snap = await getDoc(userDocRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.phone) setPhone(data.phone);
          if (data.name) setName(data.name);
        }
      } catch (err) {
        console.error("Error reading profile from Firestore:", err);
      }
    };

    fetchFirestoreProfile();
    loadAddressesFromFirestore(user.id);
  }, [user?.id, user?.name, loadAddressesFromFirestore]);

  // Handle saving profile info
  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsSavingProfile(true);
    setProfileSuccessMsg("");

    try {
      const userDocRef = doc(db, "users", user.id);
      await setDoc(
        userDocRef,
        {
          name,
          phone,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setProfileSuccessMsg("Profile updated successfully!");
      setTimeout(() => setProfileSuccessMsg(""), 3500);
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Open modal for new address
  const handleOpenAddModal = () => {
    setEditingAddressId(null);
    setModalLabel("Home");
    setModalReceiverName(name || user?.name || "");
    setModalPhone(phone || "");
    setModalStreet("");
    setModalApartment("");
    setModalCity("");
    setModalPostalCode("");
    setModalDeliveryNotes("");
    setModalIsDefault(addresses.length === 0);
    setModalError("");
    setIsModalOpen(true);
  };

  // Open modal for editing existing address
  const handleOpenEditModal = (addr: UserAddress) => {
    setEditingAddressId(addr.id);
    setModalLabel((addr.label as "Home" | "Work" | "Other") || "Home");
    setModalReceiverName(addr.receiverName);
    setModalPhone(addr.phone);
    setModalStreet(addr.street);
    setModalApartment(addr.apartment || "");
    setModalCity(addr.city);
    setModalPostalCode(addr.postalCode);
    setModalDeliveryNotes(addr.deliveryNotes || "");
    setModalIsDefault(addr.isDefault);
    setModalError("");
    setIsModalOpen(true);
  };

  // Submit address form (create or edit)
  const handleSaveAddress = async (e: FormEvent) => {
    e.preventDefault();
    if (!modalStreet.trim() || !modalCity.trim()) {
      setModalError("Please provide street address and city.");
      return;
    }
    if (!user?.id) return;

    try {
      if (editingAddressId) {
        const existing = addresses.find((a) => a.id === editingAddressId);
        if (existing) {
          await updateAddressInFirestore(user.id, {
            ...existing,
            label: modalLabel,
            receiverName: modalReceiverName,
            phone: modalPhone,
            street: modalStreet,
            apartment: modalApartment,
            city: modalCity,
            postalCode: modalPostalCode,
            deliveryNotes: modalDeliveryNotes,
            isDefault: modalIsDefault,
          });
        }
      } else {
        await addAddressToFirestore(user.id, {
          label: modalLabel,
          receiverName: modalReceiverName,
          phone: modalPhone,
          street: modalStreet,
          apartment: modalApartment,
          city: modalCity,
          postalCode: modalPostalCode,
          deliveryNotes: modalDeliveryNotes,
          isDefault: modalIsDefault,
        });
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving address:", err);
      setModalError("Failed to save address. Please try again.");
    }
  };

  // Set an address as active delivery location
  const handleSelectDeliveryAddress = (addrId: string) => {
    setSelectedAddressId(addrId);
  };

  if (isSessionLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const userInitial = (user?.name || user?.email || "U").charAt(0).toUpperCase();

  return (
    <div className={styles.page}>
      {/* 1. Profile Hero & User Identification */}
      <section className={styles.profileHeaderCard}>
        <div className={styles.userBanner}>
          <div className={styles.avatar}>{userInitial}</div>
          <div className={styles.userMeta}>
            <div className={styles.nameRow}>
              <h1 className={styles.userName}>{name || user?.name || "Customer"}</h1>
              <span className={styles.roleBadge}>
                <Shield size={12} />
                <span>{user?.role === "RESTAURANT_OWNER" ? "Restaurant Owner" : "Customer"}</span>
              </span>
            </div>
            <div className={styles.contactRow}>
              <span className={styles.metaItem}>
                <Mail size={14} />
                <span>{user?.email}</span>
              </span>
              {phone && (
                <span className={styles.metaItem}>
                  <Phone size={14} />
                  <span>{phone}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => signOutMutation.mutate()}
          disabled={signOutMutation.isPending}
          className={styles.signOutBtn}
          title="Sign out of your account"
        >
          <LogOut size={16} />
          <span>{signOutMutation.isPending ? "Signing out..." : "Sign Out"}</span>
        </button>
      </section>

      {/* 2. Addresses Management: Choose Where to Deliver */}
      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleArea}>
            <div className={styles.sectionIconBadge}>
              <Navigation size={18} />
            </div>
            <div>
              <h2 className={styles.sectionTitle}>Where to Deliver</h2>
              <p className={styles.sectionSubtitle}>
                Choose your active delivery address or save multiple addresses for home, work, and family.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className={styles.addAddressBtn}
          >
            <Plus size={16} />
            <span>Add New Address</span>
          </button>
        </div>

        {/* Address Cards Grid */}
        <div className={styles.addressesGrid}>
          {addresses.length === 0 ? (
            <div className={styles.emptyAddressState}>
              <MapPin size={40} className={styles.emptyPinIcon} />
              <h3 className={styles.emptyTitle}>No saved delivery addresses</h3>
              <p className={styles.emptyDesc}>
                Add your home or office address so we can deliver your piping-hot dishes straight to your doorstep.
              </p>
              <button
                type="button"
                onClick={handleOpenAddModal}
                className={styles.primaryAddBtn}
              >
                <Plus size={16} />
                <span>Add Your First Address</span>
              </button>
            </div>
          ) : (
            addresses.map((addr) => {
              const isSelected = selectedAddressId === addr.id;

              return (
                <div
                  key={addr.id}
                  className={`${styles.addressCard} ${
                    isSelected ? styles.addressCardSelected : ""
                  }`}
                  onClick={() => handleSelectDeliveryAddress(addr.id)}
                >
                  <div className={styles.addressCardHeader}>
                    <div className={styles.addressTagRow}>
                      <span className={styles.labelBadge}>
                        {addr.label === "Home" && <Home size={13} />}
                        {addr.label === "Work" && <Briefcase size={13} />}
                        {addr.label !== "Home" && addr.label !== "Work" && (
                          <Building size={13} />
                        )}
                        <span>{addr.label}</span>
                      </span>

                      {addr.isDefault && (
                        <span className={styles.defaultBadge}>Default</span>
                      )}
                    </div>

                    <div
                      className={styles.cardActions}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(addr)}
                        className={styles.iconActionBtn}
                        title="Edit address"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => user?.id && deleteAddressFromFirestore(user.id, addr.id)}
                        className={`${styles.iconActionBtn} ${styles.deleteActionBtn}`}
                        title="Delete address"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div className={styles.addressBody}>
                    <div className={styles.receiverInfo}>
                      <span className={styles.receiverName}>{addr.receiverName}</span>
                      {addr.phone && (
                        <span className={styles.receiverPhone}>• {addr.phone}</span>
                      )}
                    </div>

                    <p className={styles.streetLine}>
                      {addr.apartment ? `${addr.apartment}, ` : ""}
                      {addr.street}
                    </p>
                    <p className={styles.cityLine}>
                      {addr.city} {addr.postalCode ? `- ${addr.postalCode}` : ""}
                    </p>

                    {addr.deliveryNotes && (
                      <p className={styles.notesLine}>
                        Note: &ldquo;{addr.deliveryNotes}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Active Selection Indicator */}
                  <div className={styles.addressCardFooter}>
                    {isSelected ? (
                      <div className={styles.selectedStatus}>
                        <CheckCircle2 size={16} />
                        <span>Deliver Here (Active)</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className={styles.selectBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectDeliveryAddress(addr.id);
                        }}
                      >
                        Select for Delivery
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* 3. Personal Profile Information (Edit Name & Phone) */}
      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleArea}>
            <div className={styles.sectionIconBadge}>
              <User size={18} />
            </div>
            <div>
              <h2 className={styles.sectionTitle}>Personal Information</h2>
              <p className={styles.sectionSubtitle}>
                Update your contact details for delivery alerts and order updates.
              </p>
            </div>
          </div>
        </div>

        {profileSuccessMsg && (
          <div className={styles.successBanner} role="status">
            <CheckCircle2 size={16} />
            <span>{profileSuccessMsg}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className={styles.profileForm}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="profileName" className={styles.fieldLabel}>
                Full Name
              </label>
              <input
                id="profileName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className={styles.fieldInput}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="profilePhone" className={styles.fieldLabel}>
                Phone Number
              </label>
              <input
                id="profilePhone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className={styles.fieldInput}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="profileEmail" className={styles.fieldLabel}>
              Email Address
            </label>
            <input
              id="profileEmail"
              type="email"
              value={user?.email || ""}
              disabled
              className={`${styles.fieldInput} ${styles.disabledInput}`}
            />
            <span className={styles.fieldHelp}>Email is managed via your sign-in provider.</span>
          </div>

          <button
            type="submit"
            disabled={isSavingProfile}
            className={styles.saveProfileBtn}
          >
            {isSavingProfile ? "Saving changes..." : "Save Profile Details"}
          </button>
        </form>
      </section>

      {/* 4. Add / Edit Address Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {editingAddressId ? "Edit Delivery Address" : "Add New Delivery Address"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className={styles.closeBtn}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div className={styles.modalErrorBanner}>{modalError}</div>
            )}

            <form onSubmit={handleSaveAddress} className={styles.modalForm}>
              {/* Address Label Chips */}
              <div className={styles.formGroup}>
                <label className={styles.fieldLabel}>Address Label</label>
                <div className={styles.labelChips}>
                  {(["Home", "Work", "Other"] as const).map((lbl) => (
                    <button
                      key={lbl}
                      type="button"
                      className={`${styles.chipBtn} ${
                        modalLabel === lbl ? styles.chipBtnActive : ""
                      }`}
                      onClick={() => setModalLabel(lbl)}
                    >
                      {lbl === "Home" && <Home size={14} />}
                      {lbl === "Work" && <Briefcase size={14} />}
                      {lbl === "Other" && <Building size={14} />}
                      <span>{lbl}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Receiver Info */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.fieldLabel}>Receiver Name</label>
                  <input
                    type="text"
                    value={modalReceiverName}
                    onChange={(e) => setModalReceiverName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className={styles.fieldInput}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.fieldLabel}>Contact Phone</label>
                  <input
                    type="tel"
                    value={modalPhone}
                    onChange={(e) => setModalPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className={styles.fieldInput}
                    required
                  />
                </div>
              </div>

              {/* Street & Apartment */}
              <div className={styles.formGroup}>
                <label className={styles.fieldLabel}>House / Flat / Floor / Landmark</label>
                <input
                  type="text"
                  value={modalApartment}
                  onChange={(e) => setModalApartment(e.target.value)}
                  placeholder="e.g. Apt 4B, 3rd Floor"
                  className={styles.fieldInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.fieldLabel}>Street Address</label>
                <input
                  type="text"
                  value={modalStreet}
                  onChange={(e) => setModalStreet(e.target.value)}
                  placeholder="e.g. 124 Park Avenue, Sector 5"
                  className={styles.fieldInput}
                  required
                />
              </div>

              {/* City & Postal Code */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.fieldLabel}>City</label>
                  <input
                    type="text"
                    value={modalCity}
                    onChange={(e) => setModalCity(e.target.value)}
                    placeholder="e.g. New Delhi"
                    className={styles.fieldInput}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.fieldLabel}>Postal Code (PIN)</label>
                  <input
                    type="text"
                    value={modalPostalCode}
                    onChange={(e) => setModalPostalCode(e.target.value)}
                    placeholder="e.g. 110001"
                    className={styles.fieldInput}
                  />
                </div>
              </div>

              {/* Delivery Notes */}
              <div className={styles.formGroup}>
                <label className={styles.fieldLabel}>Delivery Instructions (Optional)</label>
                <input
                  type="text"
                  value={modalDeliveryNotes}
                  onChange={(e) => setModalDeliveryNotes(e.target.value)}
                  placeholder="e.g. Ring doorbell, leave with security"
                  className={styles.fieldInput}
                />
              </div>

              {/* Default Address Checkbox */}
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={modalIsDefault}
                  onChange={(e) => setModalIsDefault(e.target.checked)}
                />
                <span>Set as default delivery address</span>
              </label>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitModalBtn}>
                  {editingAddressId ? "Save Changes" : "Add Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
