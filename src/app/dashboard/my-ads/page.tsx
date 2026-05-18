"use client";

import { useState, useEffect, use, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

function MyAdsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "ads"; // "ads" or "profile"
  const supabase = createClient();

  // State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ads, setAds] = useState<any[]>([]);
  const [activeAdTab, setActiveAdTab] = useState<"active" | "sold" | "expired">("active");
  const [activeMainTab, setActiveMainTab] = useState<"ads" | "profile">(initialTab as "ads" | "profile");
  const [errorMessage, setErrorMessage] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Profile Form States
  const [storeName, setStoreName] = useState("");
  const [storeBio, setStoreBio] = useState("");
  const [storeBanner, setStoreBanner] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [fullName, setFullName] = useState("");

  // Load User & Listings
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }
        setCurrentUser(user);

        // Fetch User Ads
        const { data: adsData, error: adsError } = await supabase
          .from("ads")
          .select("*")
          .eq("seller_id", user.id)
          .order("created_at", { ascending: false });

        if (adsData) {
          setAds(adsData);
        }

        // Fetch User Profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profile) {
          setStoreName(profile.store_name || "");
          setStoreBio(profile.store_bio || "");
          setStoreBanner(profile.store_banner || "");
          setWhatsappNumber(profile.whatsapp_number || "");
          setFullName(profile.full_name || "");
        }
      } catch (err) {
        console.error("Ralat memuatkan data dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Update Ad Status to SOLD
  const markAsSold = async (adId: string) => {
    try {
      const { error } = await supabase
        .from("ads")
        .update({ status: "sold" })
        .eq("id", adId)
        .eq("seller_id", currentUser.id);

      if (error) throw error;
      
      // Update local state
      setAds((prev) =>
        prev.map((ad) => (ad.id === adId ? { ...ad, status: "sold" } : ad))
      );
      alert("🎉 Listing ditandakan sebagai SOLD! Terima kasih kerana menggunakan Meowdah.my.");
    } catch (err) {
      console.error(err);
      alert("Gagal menukar status iklan.");
    }
  };

  // Delete Ad
  const deleteAd = async (adId: string) => {
    if (!confirm("Adakah anda pasti mahu memadam iklan ini secara kekal?")) return;
    try {
      const { error } = await supabase
        .from("ads")
        .delete()
        .eq("id", adId)
        .eq("seller_id", currentUser.id);

      if (error) throw error;

      // Update local state
      setAds((prev) => prev.filter((ad) => ad.id !== adId));
      alert("🗑️ Iklan anda telah berjaya dipadamkan secara kekal.");
    } catch (err) {
      console.error(err);
      alert("Gagal memadamkan iklan.");
    }
  };

  // Update Storefront Profile settings
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setErrorMessage("");

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          store_name: storeName,
          store_bio: storeBio,
          store_banner: storeBanner,
          whatsapp_number: whatsappNumber,
          updated_at: new Date().toISOString()
        })
        .eq("id", currentUser.id);

      if (error) throw error;
      alert("🎉 Profil kedai Pro Niaga anda berjaya dikemas kini!");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Gagal mengemas kini profil.");
    } finally {
      setSavingProfile(false);
    }
  };

  // Filter ads by tab status
  const filteredAds = ads.filter((ad) => {
    if (activeAdTab === "active") return ad.status === "active";
    if (activeAdTab === "sold") return ad.status === "sold";
    return ad.status === "expired" || ad.status === "pending";
  });

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: "16px" }}>
        <span style={{ fontSize: "2.5rem" }} className="animate-spin">🔄</span>
        <p style={{ color: "var(--color-text-muted)" }}>Memuatkan dashboard niaga...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--color-bg)", paddingBottom: "80px" }}>
      {/* Header */}
      <header style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        padding: "14px 16px",
        backgroundColor: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        position: "sticky",
        top: 0,
        zIndex: 10
      }}>
        <Link href="/dashboard" style={{ fontSize: "1.4rem", color: "var(--color-text-main)", cursor: "pointer", display: "flex", alignItems: "center" }}>
          ←
        </Link>
        <h2 style={{ fontSize: "1rem", color: "var(--color-text-main)", fontWeight: "800", margin: 0 }}>
          Dashboard Penjual
        </h2>
        <Link href="/dashboard/post" style={{
          backgroundColor: "var(--color-primary)",
          color: "white",
          padding: "6px 12px",
          borderRadius: "var(--radius-sm)",
          fontSize: "0.75rem",
          fontWeight: "bold",
          textDecoration: "none"
        }}>
          ➕ Post Ad
        </Link>
      </header>

      {/* Main Mode Tabs Selector */}
      <div style={{
        display: "flex",
        backgroundColor: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        padding: "4px 16px"
      }}>
        <button
          onClick={() => setActiveMainTab("ads")}
          style={{
            flex: 1,
            padding: "14px 0",
            border: "none",
            background: "none",
            fontSize: "0.88rem",
            fontWeight: "bold",
            color: activeMainTab === "ads" ? "var(--color-primary)" : "var(--color-text-muted)",
            borderBottom: activeMainTab === "ads" ? "3px solid var(--color-primary)" : "3px solid transparent",
            cursor: "pointer",
            transition: "var(--transition)"
          }}
        >
          📦 Iklan Kucing Saya ({ads.length})
        </button>
        <button
          onClick={() => setActiveMainTab("profile")}
          style={{
            flex: 1,
            padding: "14px 0",
            border: "none",
            background: "none",
            fontSize: "0.88rem",
            fontWeight: "bold",
            color: activeMainTab === "profile" ? "var(--color-primary)" : "var(--color-text-muted)",
            borderBottom: activeMainTab === "profile" ? "3px solid var(--color-primary)" : "3px solid transparent",
            cursor: "pointer",
            transition: "var(--transition)"
          }}
        >
          🏪 Kedai Pro Niaga
        </button>
      </div>

      <main style={{ padding: "16px" }}>
        
        {/* TABS 1: LISTING ADS MANAGER */}
        {activeMainTab === "ads" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* Status sub-tabs */}
            <div style={{
              display: "flex",
              backgroundColor: "#FFF2E6",
              borderRadius: "var(--radius-md)",
              padding: "4px",
              gap: "4px"
            }}>
              {(["active", "sold", "expired"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveAdTab(t)}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                    backgroundColor: activeAdTab === t ? "var(--color-primary)" : "transparent",
                    color: activeAdTab === t ? "white" : "var(--color-primary)",
                    cursor: "pointer"
                  }}
                >
                  {t === "active" ? "Aktif" : t === "sold" ? "SOLD" : "Expired / Draf"}
                </button>
              ))}
            </div>

            {/* Ads List Card Grid */}
            {filteredAds.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center", backgroundColor: "white", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
                <span style={{ fontSize: "2.5rem" }}>😿</span>
                <h4 style={{ marginTop: "12px", color: "var(--color-text-main)" }}>Tiada listing dijumpai</h4>
                <p style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", marginTop: "4px" }}>
                  Mula menerbitkan baka kucing anda sekarang untuk menjana pelanggan.
                </p>
                <Link href="/dashboard/post" className="btn btn-primary" style={{ marginTop: "16px", padding: "10px 18px", fontSize: "0.82rem" }}>
                  Tulis Iklan Pertama ➔
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {filteredAds.map((ad) => {
                  const imageSrc = ad.images && ad.images.length > 0 ? ad.images[0] : "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600";
                  return (
                    <div 
                      key={ad.id}
                      style={{
                        backgroundColor: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--radius-md)",
                        padding: "12px",
                        display: "flex",
                        gap: "12px",
                        boxShadow: "var(--shadow-sm)"
                      }}
                    >
                      <div style={{ width: "90px", height: "90px", borderRadius: "var(--radius-sm)", overflow: "hidden", backgroundColor: "#FFEAD7" }}>
                        <img src={imageSrc} alt={ad.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>

                      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div>
                          <h4 style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--color-text-main)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.3 }}>
                            {ad.title}
                          </h4>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "4px" }}>
                            <span style={{ color: "var(--color-primary)", fontSize: "0.95rem", fontWeight: "800" }}>
                              RM {ad.price.toLocaleString("ms-MY")}
                            </span>
                            <span style={{ fontSize: "0.65rem", color: "var(--color-text-muted)" }}>
                              📍 {ad.city}
                            </span>
                          </div>
                        </div>

                        {/* Actions Quick buttons */}
                        <div style={{ display: "flex", gap: "8px", borderTop: "1px solid var(--color-border)", paddingTop: "8px", marginTop: "6px" }}>
                          {ad.status === "active" && (
                            <button
                              onClick={() => markAsSold(ad.id)}
                              style={{
                                flex: 1.2,
                                backgroundColor: "var(--color-accent)",
                                color: "white",
                                border: "none",
                                padding: "6px",
                                borderRadius: "6px",
                                fontSize: "0.7rem",
                                fontWeight: "bold",
                                cursor: "pointer"
                              }}
                            >
                              ✓ Tanda SOLD
                            </button>
                          )}
                          {ad.status === "active" && (!ad.is_featured || !ad.is_urgent) && (
                            <Link
                              href={`/dashboard/boost?adId=${ad.id}`}
                              style={{
                                flex: 1.2,
                                backgroundColor: "var(--color-primary)",
                                color: "white",
                                border: "none",
                                padding: "6px",
                                borderRadius: "6px",
                                fontSize: "0.7rem",
                                fontWeight: "bold",
                                textAlign: "center",
                                textDecoration: "none"
                              }}
                            >
                              🚀 Boost
                            </Link>
                          )}
                          <Link
                            href={`/dashboard/post?edit=${ad.id}`}
                            style={{
                              flex: 1,
                              backgroundColor: "#FFF2E6",
                              color: "var(--color-primary)",
                              border: "1px solid rgba(255, 140, 50, 0.2)",
                              padding: "6px",
                              borderRadius: "6px",
                              fontSize: "0.7rem",
                              fontWeight: "bold",
                              textAlign: "center",
                              textDecoration: "none"
                            }}
                          >
                            ✏️ Edit
                          </Link>
                          <button
                            onClick={() => deleteAd(ad.id)}
                            style={{
                              flex: 1,
                              backgroundColor: "#FDF2F0",
                              color: "var(--color-error)",
                              border: "none",
                              padding: "6px",
                              borderRadius: "6px",
                              fontSize: "0.7rem",
                              fontWeight: "bold",
                              cursor: "pointer"
                            }}
                          >
                            🗑️ Padam
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TABS 2: STOREFRONT PRO NIAGA PROFILE SETTINGS */}
        {activeMainTab === "profile" && (
          <form onSubmit={handleProfileSubmit} style={{
            backgroundColor: "white",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: "20px 16px",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}>
            <h3 style={{ fontSize: "1rem", color: "var(--color-text-main)", fontWeight: "bold" }}>
              🏪 Urus Kedai & Jenama Pro Niaga
            </h3>
            
            {errorMessage && (
              <div style={{ backgroundColor: "#FDF2F0", border: "1px solid var(--color-error)", color: "var(--color-error)", padding: "10px", borderRadius: "6px", fontSize: "0.78rem" }}>
                ⚠️ {errorMessage}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: "bold" }}>Nama Penuh Pemilik *</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Masukkan nama sebenar anda"
                style={{
                  padding: "10px 12px",
                  borderRadius: "var(--radius-sm)",
                  border: "1.5px solid var(--color-border)",
                  fontSize: "0.85rem"
                }}
                required
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: "bold" }}>Nama Kedai / Cattery</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Contoh: Oyen Cattery Shah Alam"
                style={{
                  padding: "10px 12px",
                  borderRadius: "var(--radius-sm)",
                  border: "1.5px solid var(--color-border)",
                  fontSize: "0.85rem"
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: "bold" }}>Biografi Kedai</label>
              <textarea
                value={storeBio}
                onChange={(e) => setStoreBio(e.target.value)}
                placeholder="Terangkan tentang baka kucing pembiakan anda, pengalaman, servis, jaminan kualiti dll..."
                rows={4}
                style={{
                  padding: "10px 12px",
                  borderRadius: "var(--radius-sm)",
                  border: "1.5px solid var(--color-border)",
                  fontSize: "0.85rem",
                  resize: "none"
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: "bold" }}>Pautan Gambar Banner Kedai (URL)</label>
              <input
                type="url"
                value={storeBanner}
                onChange={(e) => setStoreBanner(e.target.value)}
                placeholder="https://images.unsplash.com/... (Resolusi Landskap)"
                style={{
                  padding: "10px 12px",
                  borderRadius: "var(--radius-sm)",
                  border: "1.5px solid var(--color-border)",
                  fontSize: "0.85rem"
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: "bold" }}>Nombor WhatsApp COD (Format: 601...)</label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="Contoh: 60123456789"
                style={{
                  padding: "10px 12px",
                  borderRadius: "var(--radius-sm)",
                  border: "1.5px solid var(--color-border)",
                  fontSize: "0.85rem"
                }}
              />
              <span style={{ fontSize: "0.68rem", color: "var(--color-text-muted)" }}>
                Penting: Mesti mulakan dengan kod negara **60** tanpa sebarang simbol (+) atau jarak demi memudahkan butang WhatsApp berfungsi.
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "10px", padding: "12px" }}
              disabled={savingProfile}
            >
              {savingProfile ? "Menyimpan Profil..." : "Simpan Profil Kedai ➔"}
            </button>
          </form>
        )}

      </main>
    </div>
  );
}

export default function MyAdsPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: "16px" }}>
        <span style={{ fontSize: "2.5rem" }}>🔄</span>
        <p style={{ color: "var(--color-text-muted)" }}>Memuatkan dashboard niaga...</p>
      </div>
    }>
      <MyAdsContent />
    </Suspense>
  );
}
