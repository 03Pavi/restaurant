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
  Loader2,
  Compass,
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
  const [modalCoords, setModalCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationStatusMsg, setLocationStatusMsg] = useState("");
  const [isSavingAddress, setIsSavingAddress] = useState(false);
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

    const fetchUserProfile = async () => {
      // 1. Fast Supabase profile fetch
      try {
        const res = await fetch(`/api/user/profile?userId=${encodeURIComponent(user.id)}`);
        if (res.ok) {
          const json = await res.json();
          if (json?.user) {
            if (json.user.name) setName(json.user.name);
            if (json.user.phone) setPhone(json.user.phone);
            return;
          }
        }
      } catch (err) {
        console.warn("Supabase profile read notice:", err);
      }

      // 2. Fallback to Firestore with short timeout so it never hangs
      try {
        const userDocRef = doc(db, "users", user.id);
        const snap = await Promise.race([
          getDoc(userDocRef),
          new Promise<null>((_, reject) => setTimeout(() => reject(new Error("Firestore timeout")), 1200)),
        ]);
        if (snap && snap.exists()) {
          const data = snap.data();
          if (data.phone) setPhone(data.phone);
          if (data.name) setName(data.name);
        }
      } catch {
        // Non-blocking fallback
      }
    };

    fetchUserProfile();
    loadAddressesFromFirestore(user.id);
  }, [user?.id, user?.name, loadAddressesFromFirestore]);

  // Handle saving profile info
  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsSavingProfile(true);
    setProfileSuccessMsg("");

    try {
      // 1. Update in Supabase
      await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          name,
          phone,
          email: user.email,
          role: user.role,
        }),
      });

      // 2. Update in Firestore
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
      } catch (fbErr) {
        console.warn("Firestore profile sync skipped:", fbErr);
      }

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
    setModalCoords(null);
    setIsDetectingLocation(false);
    setLocationStatusMsg("");
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
    setModalCoords(
      addr.latitude && addr.longitude
        ? { lat: addr.latitude, lng: addr.longitude }
        : null
    );
    setIsDetectingLocation(false);
    setLocationStatusMsg("");
    setModalIsDefault(addr.isDefault);
    setModalError("");
    setIsModalOpen(true);
  };

  // Auto-detect location & reverse geocode address
  const handleDetectLocation = async () => {
    setIsDetectingLocation(true);
    setLocationStatusMsg("Locating your device...");
    setModalError("");

    const reverseGeocode = async (lat: number, lng: number) => {
      try {
        setLocationStatusMsg("Fetching address details...");
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
          {
            headers: {
              "Accept-Language": "en",
            },
          }
        );

        if (res.ok) {
          const data = await res.json();
          const addr = data.address || {};

          const streetParts = [
            addr.road || addr.pedestrian || addr.suburb || addr.neighbourhood || "",
          ].filter(Boolean);

          const apartmentParts = [
            addr.house_number || "",
            addr.building || addr.amenity || addr.residential || "",
          ].filter(Boolean);

          const cityVal =
            addr.city ||
            addr.town ||
            addr.village ||
            addr.suburb ||
            addr.county ||
            addr.state_district ||
            "";
          const postalVal = addr.postcode || "";

          if (streetParts.length > 0 && !modalStreet) {
            setModalStreet(streetParts.join(", "));
          } else if (data.display_name && !modalStreet) {
            const split = data.display_name.split(",");
            setModalStreet(split.slice(0, 2).join(",").trim());
          }

          if (apartmentParts.length > 0 && !modalApartment) {
            setModalApartment(apartmentParts.join(" "));
          }

          if (cityVal && !modalCity) {
            setModalCity(cityVal);
          }

          if (postalVal && !modalPostalCode) {
            setModalPostalCode(postalVal);
          }
        }
      } catch (err) {
        console.warn("Reverse geocode failed:", err);
      }
    };

    const onLocationFound = async (lat: number, lng: number) => {
      setModalCoords({ lat, lng });
      await reverseGeocode(lat, lng);
      setLocationStatusMsg("Location pinned on map!");
      setTimeout(() => setLocationStatusMsg(""), 4000);
      setIsDetectingLocation(false);
    };

    const fallbackToIp = async () => {
      try {
        setLocationStatusMsg("Locating via network IP...");
        const res = await fetch("https://ipapi.co/json/");
        if (res.ok) {
          const ipData = await res.json();
          if (ipData.latitude && ipData.longitude) {
            if (ipData.city && !modalCity) setModalCity(ipData.city);
            if (ipData.postal && !modalPostalCode) setModalPostalCode(ipData.postal);
            await onLocationFound(Number(ipData.latitude), Number(ipData.longitude));
            return;
          }
        }
      } catch (ipErr) {
        console.warn("ipapi.co lookup failed:", ipErr);
      }

      try {
        const ipwhoRes = await fetch("https://ipwho.is/");
        if (ipwhoRes.ok) {
          const ipwhoData = await ipwhoRes.json();
          if (ipwhoData.latitude && ipwhoData.longitude) {
            if (ipwhoData.city && !modalCity) setModalCity(ipwhoData.city);
            if (ipwhoData.postal && !modalPostalCode) setModalPostalCode(ipwhoData.postal);
            await onLocationFound(Number(ipwhoData.latitude), Number(ipwhoData.longitude));
            return;
          }
        }
      } catch (ipwhoErr) {
        console.warn("ipwho.is lookup failed:", ipwhoErr);
      }

      setLocationStatusMsg("");
      setModalError("Could not detect location automatically. Please enter your address manually.");
      setIsDetectingLocation(false);
    };

    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          onLocationFound(latitude, longitude);
        },
        async (geoError) => {
          console.warn("Geolocation prompt declined or unavailable, falling back to IP:", geoError.message);
          await fallbackToIp();
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 60000,
        }
      );
    } else {
      await fallbackToIp();
    }
  };

  // Submit address form (create or edit)
  const handleSaveAddress = async (e: FormEvent) => {
    e.preventDefault();
    if (!modalStreet.trim() || !modalCity.trim()) {
      setModalError("Please provide street address and city.");
      return;
    }
    if (!user?.id) return;

    setIsSavingAddress(true);
    setModalError("");

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
            latitude: modalCoords?.lat ?? existing.latitude,
            longitude: modalCoords?.lng ?? existing.longitude,
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
          latitude: modalCoords?.lat,
          longitude: modalCoords?.lng,
          isDefault: modalIsDefault,
        });
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving address:", err);
      setModalError("Failed to save address. Please try again.");
    } finally {
      setIsSavingAddress(false);
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
          {signOutMutation.isPending ? (
            <Loader2 size={16} className={styles.spinIcon} />
          ) : (
            <LogOut size={16} />
          )}
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

                      {addr.latitude && addr.longitude && (
                        <span className={styles.gpsBadge}>
                          <Compass size={11} />
                          <span>GPS Pinned</span>
                        </span>
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

              {/* GPS Location Auto-Detection Banner */}
              <div className={styles.locationDetectionBanner}>
                <div className={styles.detectionInfo}>
                  <div className={styles.detectionTitleRow}>
                    <Navigation size={15} className={styles.detectIcon} />
                    <span className={styles.detectionTitle}>Pinpoint Current Location</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isDetectingLocation}
                  className={styles.detectLocationBtn}
                >
                  {isDetectingLocation ? (
                    <>
                      <Loader2 size={15} className={styles.spinIcon} />
                      <span>Detecting...</span>
                    </>
                  ) : (
                    <>
                      <Compass size={15} />
                      <span>Use Current Location</span>
                    </>
                  )}
                </button>
              </div>

              {locationStatusMsg && (
                <div className={styles.locationStatusBadge}>
                  <CheckCircle2 size={14} />
                  <span>{locationStatusMsg}</span>
                </div>
              )}

              {/* Map Preview with Pin Marker */}
              {modalCoords && (
                <div className={styles.mapContainer}>
                  <div className={styles.mapHeader}>
                    <div className={styles.mapTitle}>
                      <MapPin size={15} className={styles.mapPinPulse} />
                      <span>Delivery Location Marker</span>
                    </div>
                    <span className={styles.coordsBadge}>
                      {modalCoords.lat.toFixed(5)}°, {modalCoords.lng.toFixed(5)}°
                    </span>
                  </div>
                  <div className={styles.mapFrameWrapper}>
                    <iframe
                      title="Delivery Location Pin"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${(
                        modalCoords.lng - 0.005
                      ).toFixed(6)}%2C${(modalCoords.lat - 0.005).toFixed(6)}%2C${(
                        modalCoords.lng + 0.005
                      ).toFixed(6)}%2C${(modalCoords.lat + 0.005).toFixed(
                        6
                      )}&layer=mapnik&marker=${modalCoords.lat.toFixed(
                        6
                      )}%2C${modalCoords.lng.toFixed(6)}`}
                      className={styles.mapIframe}
                      loading="lazy"
                    />
                  </div>
                  <p className={styles.mapCaption}>
                    Coordinates captured. You can adjust your house/flat or street details below.
                  </p>
                </div>
              )}

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
                  disabled={isSavingAddress}
                  onClick={() => setIsModalOpen(false)}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingAddress}
                  className={styles.submitModalBtn}
                >
                  {isSavingAddress ? (
                    <>
                      <Loader2 size={15} className={styles.spinIcon} />
                      <span>{editingAddressId ? "Saving Changes..." : "Adding Address..."}</span>
                    </>
                  ) : (
                    <span>{editingAddressId ? "Save Changes" : "Add Address"}</span>
                  )}
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
