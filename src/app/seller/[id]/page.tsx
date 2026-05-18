"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

// Fallback Catteries & Ads untuk testing offline/sandboxing
const DUMMY_SELLERS: Record<string, any> = {
  "seller-1": {
    id: "seller-1",
    store_name: "Oyen Cattery",
    store_bio: "Pembiak baka kucing British Shorthair (BSH) import berkualiti tinggi sejak 2020. Semua kucing di bawah penjagaan kami dipantau veterinar, diberi makanan premium, divaksinasi lengkap, dan disayangi sepenuhnya sebelum sedia ke rumah baru.",
    avatar_url: null,
    store_banner: "linear-gradient(135deg, #FF8C32 0%, #FFD1A9 100%)",
    is_verified_breeder: true,
    whatsapp_number: "60123456789",
    state: "Selangor",
    city: "Shah Alam",
    joined_date: "Mei 2024",
    ads: [
      {
        id: "dummy-1",
        title: "Kucing British Shorthair (BSH) Oyen Pure Breed",
        price: 1200.00,
        category: "Kucing",
        breed: "BSH",
        is_vaccinated: true,
        is_neutered: true,
        images: ["https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600"],
        state: "Selangor",
        city: "Shah Alam",
        is_featured: true,
        is_urgent: true
      }
    ]
  },
  "seller-2": {
    id: "seller-2",
    store_name: "Meow Pet Shop",
    store_bio: "Membekalkan pelbagai jenama makanan kucing berkualiti tinggi, vitamin pembesar bulu comel, & ubat-ubatan veterinar yang diiktiraf dengan harga terendah di pasaran.",
    avatar_url: null,
    store_banner: "linear-gradient(135deg, #2ECC71 0%, #A9DFBF 100%)",
    is_verified_breeder: false,
    whatsapp_number: "60198765432",
    state: "Kuala Lumpur",
    city: "Cheras",
    joined_date: "Januari 2025",
    ads: [
      {
        id: "dummy-2",
        title: "Makanan Kucing Premium Royal Canin Fit 32 - 10kg",
        price: 185.00,
        category: "Makanan",
        breed: null,
        is_vaccinated: false,
        is_neutered: false,
        images: ["https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=600"],
        state: "Kuala Lumpur",
        city: "Cheras",
        is_featured: true,
        is_urgent: false
      }
    ]
  },
  "seller-3": {
    id: "seller-3",
    store_name: "JB Pet Trading",
    store_bio: "Pusat kelengkapan barangan kucing borong terbesar di Johor. Membekal sangkar besi lipat, kolar leher, cat tree custom, cat litter berkualiti tinggi pasir wangi.",
    avatar_url: null,
    store_banner: "linear-gradient(135deg, #3498DB 0%, #AED6F1 100%)",
    is_verified_breeder: false,
    whatsapp_number: "60111234567",
    state: "Johor",
    city: "Johor Bahru",
    joined_date: "Ogos 2024",
    ads: [
      {
        id: "dummy-3",
        title: "Sangkar Kucing 3 Tingkat Besi Tebal XXL",
        price: 250.00,
        category: "Aksesori",
        breed: null,
        is_vaccinated: false,
        is_neutered: false,
        images: ["https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&q=80&w=600"],
        state: "Johor",
        city: "Johor Bahru",
        is_featured: false,
        is_urgent: true
      }
    ]
  },
  "seller-4": {
    id: "seller-4",
    store_name: "Mutiara Cat Spa",
    store_bio: "Pusat rawatan dandanan, mandi kutu, potong bulu kusut, cukur lion-cut, & spa urutan relaksasi si bulus kucing kesayangan anda di wilayah Pulau Pinang.",
    avatar_url: null,
    store_banner: "linear-gradient(135deg, #9B59B6 0%, #D7BDE2 100%)",
    is_verified_breeder: true,
    whatsapp_number: "60133334444",
    state: "Penang",
    city: "Georgetown",
    joined_date: "Mac 2023",
    ads: [
      {
        id: "dummy-4",
        title: "Servis Grooming Kucing & Mandian Kutu Semulajadi",
        price: 45.00,
        category: "Servis",
        breed: null,
        is_vaccinated: false,
        is_neutered: false,
        images: ["https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=600"],
        state: "Penang",
        city: "Georgetown",
        is_featured: false,
        is_urgent: false
      }
    ]
  }
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SellerProfilePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [seller, setSeller] = useState<any>(null);
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSellerData() {
      setLoading(true);
      try {
        // 1. Fetch profiles where id = sellerId
        const { data: profileData, error: profileErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", resolvedParams.id)
          .single();

        // 2. Fetch ads created by this seller
        const { data: adsData, error: adsErr } = await supabase
          .from("ads")
          .select("*")
          .eq("seller_id", resolvedParams.id)
          .eq("status", "active")
          .order("created_at", { ascending: false });

        if (profileErr || !profileData) {
          // Guna catteries fallback jika id matching dummy atau tiada data di DB
          const dummySeller = DUMMY_SELLERS[resolvedParams.id];
          if (dummySeller) {
            setSeller(dummySeller);
            setAds(dummySeller.ads || []);
          } else {
            // Default fallback ke seller pertama
            setSeller(DUMMY_SELLERS["seller-1"]);
            setAds(DUMMY_SELLERS["seller-1"].ads || []);
          }
        } else {
          setSeller(profileData);
          setAds(adsData || []);
        }
      } catch (err) {
        console.error("Gagal memuatkan profil penjual:", err);
        // Fallback
        setSeller(DUMMY_SELLERS["seller-1"]);
        setAds(DUMMY_SELLERS["seller-1"].ads || []);
      } finally {
        setLoading(false);
      }
    }
    loadSellerData();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: "16px" }}>
        <span style={{ fontSize: "2.5rem" }} className="animate-spin">🔄</span>
        <p style={{ color: "var(--color-text-muted)" }}>Memuatkan kedai penjual...</p>
      </div>
    );
  }

  if (!seller) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center", minHeight: "100vh" }}>
        <h2>😿 Kedai Tidak Ditemui</h2>
        <p style={{ color: "var(--color-text-muted)", marginTop: "10px" }}>Profil Pro Niaga penjual ini tidak wujud atau telah dinyahaktifkan.</p>
        <Link href="/" className="btn btn-primary" style={{ marginTop: "20px" }}>Kembali Laman Utama</Link>
      </div>
    );
  }

  const storeBanner = seller.store_banner || "linear-gradient(135deg, #FF8C32 0%, #FFD1A9 100%)";
  const whatsappUrl = `https://wa.me/${seller.whatsapp_number || "60123456789"}?text=Salam,%20saya%20melihat%20storefront%20anda%20"${encodeURIComponent(seller.store_name || "Meowdah Store")}"%20di%20Meowdah.my%20dan%20ingin%20bertanya...`;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--color-bg)", paddingBottom: "40px" }}>
      
      {/* Navbar overlay */}
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
        <button 
          onClick={() => router.back()} 
          style={{ background: "none", border: "none", fontSize: "1.4rem", color: "var(--color-text-main)", cursor: "pointer" }}
        >
          ←
        </button>
        <h2 style={{ fontSize: "0.95rem", color: "var(--color-text-main)", fontWeight: "800", margin: 0 }}>
          Profil Kedai Pro Niaga
        </h2>
        <button 
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert("🔗 Pautan kedai disalin ke papan klip peranti anda!");
          }}
          style={{ background: "none", border: "none", fontSize: "1.1rem", color: "var(--color-text-main)", cursor: "pointer" }}
        >
          🔗
        </button>
      </header>

      {/* 1. STORE DECORATIVE BANNER */}
      <div style={{ 
        height: "120px", 
        background: storeBanner,
        position: "relative"
      }} />

      {/* 2. PROFILE CONTAINER (OVERLAY) */}
      <main style={{ padding: "0 16px", marginTop: "-48px", position: "relative", zIndex: 2, display: "flex", flexDirection: "column", gap: "20px" }}>
        
        {/* Profile Card details */}
        <section style={{ 
          backgroundColor: "var(--color-surface)", 
          borderRadius: "var(--radius-lg)", 
          padding: "20px 16px 16px 16px",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-md)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "10px"
        }}>
          
          {/* Avatar Picture float */}
          <div style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            backgroundColor: "#FFF2E6",
            border: "4px solid var(--color-surface)",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            marginTop: "-55px"
          }}>
            {seller.avatar_url ? (
              <img src={seller.avatar_url} alt={seller.store_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: "2.8rem" }}>🐱</span>
            )}
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", flexWrap: "wrap" }}>
              <h1 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-text-main)" }}>
                {seller.store_name || "Kedai Niaga Meow"}
              </h1>
              {seller.is_verified_breeder && (
                <span 
                  style={{ backgroundColor: "#EBF5FB", color: "#2980B9", fontSize: "0.58rem", fontWeight: "900", padding: "2px 6px", borderRadius: "4px" }}
                  title="Verified Breeder"
                >
                  💎 VERIFIED BREEDER
                </span>
              )}
            </div>
            <p style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", marginTop: "4px" }}>
              📍 {seller.city || "Kawasan COD"}, {seller.state || "Malaysia"} • Menyertai: {seller.joined_date || "Julai 2024"}
            </p>
          </div>

          <p style={{ 
            fontSize: "0.8rem", 
            color: "var(--color-text-main)", 
            lineHeight: "1.5", 
            margin: "4px 0",
            backgroundColor: "#FFFBF8",
            border: "1px solid #FDF5F0",
            padding: "10px 14px",
            borderRadius: "var(--radius-md)",
            width: "100%"
          }}>
            {seller.store_bio || "Pemilik akaun Pro Niaga yang sah di Meowdah.my. Sila hubungi kami untuk sebarang pertanyaan tentang si bulus."}
          </p>

          {/* Quick Stats list */}
          <div style={{ display: "flex", justifyContent: "space-around", width: "100%", padding: "6px 0", borderTop: "1px solid var(--color-border)" }}>
            <div>
              <p style={{ fontSize: "0.68rem", color: "var(--color-text-muted)" }}>Iklan Aktif</p>
              <p style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--color-primary)", marginTop: "2px" }}>{ads.length}</p>
            </div>
            <div>
              <p style={{ fontSize: "0.68rem", color: "var(--color-text-muted)" }}>Reputasi Kedai</p>
              <p style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--color-accent)", marginTop: "2px" }}>Premium</p>
            </div>
          </div>

          {/* WhatsApp Direct contact button */}
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "12px",
              backgroundColor: "var(--color-primary)",
              color: "white",
              fontWeight: "bold",
              fontSize: "0.85rem",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "0 4px 12px rgba(255,140,50,0.25)"
            }}
          >
            📞 WhatsApp Penjual
          </a>

        </section>

        {/* 3. SELLER ADS LIST (GRID) */}
        <section style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "4px" }}>
          <h3 style={{ fontSize: "0.98rem", color: "var(--color-text-main)", fontWeight: "800" }}>
            Iklan Jualan Kedai ({ads.length})
          </h3>

          {ads.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {ads.map((ad, idx) => {
                const imageSrc = ad.images && ad.images.length > 0 ? ad.images[0] : "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600";
                return (
                  <Link 
                    key={ad.id || idx}
                    href={`/ads/${ad.id}`}
                    style={{
                      backgroundColor: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-md)",
                      overflow: "hidden",
                      boxShadow: "var(--shadow-sm)",
                      display: "flex",
                      flexDirection: "column",
                      textDecoration: "none",
                      position: "relative"
                    }}
                  >
                    {ad.is_urgent && (
                      <span style={{
                        position: "absolute",
                        top: "8px",
                        left: "8px",
                        backgroundColor: "var(--color-error)",
                        color: "white",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontSize: "0.6rem",
                        fontWeight: "800",
                        zIndex: 2
                      }}>URGENT</span>
                    )}

                    <div style={{ height: "110px", backgroundColor: "#FFEAD7", overflow: "hidden" }}>
                      <img 
                        src={imageSrc} 
                        alt={ad.title} 
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600";
                        }}
                      />
                    </div>

                    <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: "4px", flexGrow: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.62rem" }}>
                        <span style={{ color: "var(--color-text-muted)" }}>📍 {ad.city || "Local"}</span>
                        {ad.is_vaccinated && <span style={{ color: "var(--color-accent)", fontWeight: "bold" }}>🛡️ Vaksin</span>}
                      </div>

                      <h4 style={{
                        fontSize: "0.8rem",
                        fontWeight: "700",
                        color: "var(--color-text-main)",
                        lineHeight: "1.3",
                        height: "32px",
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        margin: 0
                      }}>
                        {ad.title}
                      </h4>

                      <span style={{ color: "var(--color-primary)", fontSize: "0.9rem", fontWeight: "800", marginTop: "auto" }}>
                        RM {ad.price.toLocaleString("ms-MY")}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div style={{ 
              textAlign: "center", 
              padding: "36px 16px", 
              backgroundColor: "var(--color-surface)", 
              borderRadius: "var(--radius-lg)", 
              border: "1px dashed var(--color-border)"
            }}>
              <span style={{ fontSize: "2.5rem" }}>😿</span>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", marginTop: "8px" }}>
                Kedai ini tiada iklan aktif dijual buat masa ini.
              </p>
            </div>
          )}
        </section>

      </main>

    </div>
  );
}
