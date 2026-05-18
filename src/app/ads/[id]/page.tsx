"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

// Fallback Premium Ads jika database masih kosong
const DUMMY_ADS = [
  {
    id: "dummy-1",
    title: "Kucing British Shorthair (BSH) Oyen Pure Breed",
    price: 1200.00,
    description: "Kucing British Shorthair (BSH) berbulu oren lebat tebal gred premium. Sangat manja, aktif, dan sudah pandai guna litter box. Dibela dalam kawasan bersih bebas kurap. Ibu bapa baka pure breed. Sesuai dijadikan peneman harian atau breeder.",
    category: "Kucing",
    breed: "BSH",
    age_months: 4,
    is_vaccinated: true,
    is_neutered: true,
    images: [
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&q=80&w=800"
    ],
    state: "Selangor",
    city: "Shah Alam",
    latitude: 3.0738,
    longitude: 101.5183,
    is_featured: true,
    is_urgent: true,
    created_at: new Date().toISOString(),
    seller: {
      id: "seller-1",
      store_name: "Oyen Cattery",
      store_bio: "Penggemar & pembiak baka kucing British Shorthair import berkualiti tinggi sejak 2020.",
      avatar_url: null,
      is_verified_breeder: true,
      whatsapp_number: "60123456789"
    }
  },
  {
    id: "dummy-2",
    title: "Makanan Kucing Premium Royal Canin Fit 32 - 10kg",
    price: 185.00,
    description: "Makanan kucing Royal Canin Fit 32 pek jimat 10kg asal. Sesuai untuk kucing dewasa yang aktif berumur 1 hingga 7 tahun. Membekalkan nutrisi optimum dan mengelakkan pembentukan hairball dalam perut si comel anda. Tarikh luput lambat lagi (2027).",
    category: "Makanan",
    breed: null,
    age_months: null,
    is_vaccinated: false,
    is_neutered: false,
    images: ["https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800"],
    state: "Kuala Lumpur",
    city: "Cheras",
    latitude: 3.1072,
    longitude: 101.7634,
    is_featured: true,
    is_urgent: false,
    created_at: new Date().toISOString(),
    seller: {
      id: "seller-2",
      store_name: "Meow Pet Shop",
      store_bio: "Kedai sehenti untuk segala keperluan makanan, vitamin, dan ubatan kucing anda dengan harga berpatutan.",
      avatar_url: null,
      is_verified_breeder: false,
      whatsapp_number: "60198765432"
    }
  },
  {
    id: "dummy-3",
    title: "Sangkar Kucing 3 Tingkat Besi Tebal XXL",
    price: 250.00,
    description: "Sangkar lipat 3 tingkat bersaiz XXL tahan karat. Menggunakan besi tebal gred industri. Dilengkapi dengan 4 roda premium (2 roda ada kunci keselamatan) dan talam plastik hitam tebal di bawah untuk takungan najis yang mudah dibersihkan.",
    category: "Aksesori",
    breed: null,
    age_months: null,
    is_vaccinated: false,
    is_neutered: false,
    images: ["https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&q=80&w=800"],
    state: "Johor",
    city: "Johor Bahru",
    latitude: 1.4927,
    longitude: 103.7414,
    is_featured: false,
    is_urgent: true,
    created_at: new Date().toISOString(),
    seller: {
      id: "seller-3",
      store_name: "JB Pet Trading",
      store_bio: "Pengedar sah sangkar besi, kelengkapan kucing, dan permainan si bulus harga borong.",
      avatar_url: null,
      is_verified_breeder: false,
      whatsapp_number: "60111234567"
    }
  },
  {
    id: "dummy-4",
    title: "Servis Grooming Kucing & Mandian Kutu Semulajadi",
    price: 45.00,
    description: "Servis mandian lengkap termasuk potong kuku, cuci telinga, cuci kelenjar, potong bulu tapak kaki, & blow dry. Menggunakan syampu herba anti-kutu organik berkualiti tinggi yang wangi dan selamat untuk kulit kucing sensitif. COD Shah Alam & Subang.",
    category: "Servis",
    breed: null,
    age_months: null,
    is_vaccinated: false,
    is_neutered: false,
    images: ["https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=800"],
    state: "Penang",
    city: "Georgetown",
    latitude: 5.4164,
    longitude: 100.3301,
    is_featured: false,
    is_urgent: false,
    created_at: new Date().toISOString(),
    seller: {
      id: "seller-4",
      store_name: "Mutiara Cat Spa",
      store_bio: "Pusat rawatan kecantikan dan spa khusus si comel bulus di utara tanah air. Bersih & mesra kucing.",
      avatar_url: null,
      is_verified_breeder: true,
      whatsapp_number: "60133334444"
    }
  }
];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdDetailsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [ad, setAd] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Load Ad Details & Auth User Info
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // 1. Get current logged in user (to compare with seller_id)
        const { data: authData } = await supabase.auth.getUser();
        setCurrentUser(authData?.user || null);

        // 2. Fetch specific ad joined with seller profile
        const { data, error } = await supabase
          .from("ads")
          .select("*, seller:profiles(id, store_name, store_bio, avatar_url, is_verified_breeder, whatsapp_number)")
          .eq("id", resolvedParams.id)
          .single();

        if (error || !data) {
          // Guna data dummy jika carian id adalah dummy-id atau database tiada rekod tersebut
          const fallbackAd = DUMMY_ADS.find((x) => x.id === resolvedParams.id);
          if (fallbackAd) {
            setAd(fallbackAd);
          } else {
            // Lalai fallback ke data pertama jika id tidak sepadan langsung
            setAd(DUMMY_ADS[0]);
          }
        } else {
          setAd(data);
        }
      } catch (err) {
        console.error("Gagal mendapatkan perincian iklan:", err);
        setAd(DUMMY_ADS[0]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: "16px" }}>
        <span style={{ fontSize: "2.5rem" }} className="animate-spin">🔄</span>
        <p style={{ color: "var(--color-text-muted)" }}>Memuatkan maklumat si bulus...</p>
      </div>
    );
  }

  if (!ad) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center", minHeight: "100vh" }}>
        <h2>😿 Ralat Memuatkan Iklan</h2>
        <p style={{ color: "var(--color-text-muted)", marginTop: "10px" }}>Iklan tidak ditemui atau telah dipadam oleh pemilik.</p>
        <Link href="/" className="btn btn-primary" style={{ marginTop: "20px" }}>Kembali Laman Utama</Link>
      </div>
    );
  }

  // Tentukan gambar ad
  const imagesList = ad.images && ad.images.length > 0 ? ad.images : ["https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800"];
  const isOwner = currentUser?.id === ad.seller?.id;
  const whatsappUrl = `https://wa.me/${ad.seller?.whatsapp_number || "60123456789"}?text=Salam,%20saya%20berminat%20dengan%20iklan%20kucing%20anda%20"${encodeURIComponent(ad.title)}"%20di%20Meowdah.my.`;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--color-bg)", paddingBottom: "100px" }}>
      
      {/* Top Navbar */}
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
          style={{ background: "none", border: "none", fontSize: "1.4rem", color: "var(--color-text-main)", cursor: "pointer", display: "flex", alignItems: "center" }}
        >
          ←
        </button>
        <h2 style={{ fontSize: "1rem", color: "var(--color-text-main)", fontWeight: "800", margin: 0 }}>
          Perincian Iklan
        </h2>
        <button 
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert("🔗 Pautan iklan disalin ke papan klip peranti anda!");
          }}
          style={{ background: "none", border: "none", fontSize: "1.1rem", color: "var(--color-text-main)", cursor: "pointer" }}
          title="Kongsi Iklan"
        >
          🔗
        </button>
      </header>

      {/* 1. IMAGE CAROUSEL GALLERY */}
      <section style={{ position: "relative", height: "300px", backgroundColor: "#000", overflow: "hidden" }}>
        <img 
          src={imagesList[activeImageIdx]} 
          alt={ad.title} 
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "opacity 0.4s ease" }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800";
          }}
        />

        {/* Indicator Dots overlay */}
        {imagesList.length > 1 && (
          <div style={{
            position: "absolute",
            bottom: "16px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: "8px",
            backgroundColor: "rgba(0,0,0,0.4)",
            padding: "6px 12px",
            borderRadius: "var(--radius-full)",
            zIndex: 2
          }}>
            {imagesList.map((_: string, idx: number) => (
              <button 
                key={idx}
                onClick={() => setActiveImageIdx(idx)}
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: activeImageIdx === idx ? "var(--color-primary)" : "rgba(255,255,255,0.6)",
                  border: "none",
                  cursor: "pointer",
                  padding: 0
                }}
              />
            ))}
          </div>
        )}

        {/* Carousel buttons */}
        {imagesList.length > 1 && (
          <>
            <button 
              onClick={() => setActiveImageIdx(activeImageIdx === 0 ? imagesList.length - 1 : activeImageIdx - 1)}
              style={{
                position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)",
                backgroundColor: "rgba(0,0,0,0.5)", color: "white", border: "none", borderRadius: "50%",
                width: "36px", height: "36px", cursor: "pointer", fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center"
              }}
            >
              ‹
            </button>
            <button 
              onClick={() => setActiveImageIdx(activeImageIdx === imagesList.length - 1 ? 0 : activeImageIdx + 1)}
              style={{
                position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                backgroundColor: "rgba(0,0,0,0.5)", color: "white", border: "none", borderRadius: "50%",
                width: "36px", height: "36px", cursor: "pointer", fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center"
              }}
            >
              ›
            </button>
          </>
        )}
      </section>

      {/* 2. AD INFORMATION BLOCK */}
      <main style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
        
        {/* Price & Labels */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "1.8rem", fontWeight: "900", color: "var(--color-primary)" }}>
              RM {ad.price.toLocaleString("ms-MY")}
            </span>
            
            {/* Featured or Urgent Status Badges */}
            <div style={{ display: "flex", gap: "6px" }}>
              {ad.is_featured && (
                <span style={{ backgroundColor: "#FFEAD7", color: "var(--color-primary)", fontSize: "0.68rem", fontWeight: "800", padding: "4px 8px", borderRadius: "4px", border: "1px solid var(--color-primary)" }}>
                  🔥 FEATURED
                </span>
              )}
              {ad.is_urgent && (
                <span style={{ backgroundColor: "#FCE4D6", color: "var(--color-error)", fontSize: "0.68rem", fontWeight: "800", padding: "4px 8px", borderRadius: "4px", border: "1px solid var(--color-error)" }}>
                  🚨 URGENT
                </span>
              )}
            </div>
          </div>

          <h1 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--color-text-main)", lineHeight: "1.35" }}>
            {ad.title}
          </h1>

          {/* Location state and date */}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "4px" }}>
            <span>📍 {ad.city}, {ad.state}</span>
            <span>Diiklan: {new Date(ad.created_at).toLocaleDateString("ms-MY", { day: "numeric", month: "short", year: "numeric" })}</span>
          </div>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid var(--color-border)" }} />

        {/* 3. PREMIUM HEALTH & INFO BADGES */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          
          <div style={{ 
            backgroundColor: ad.is_vaccinated ? "#EAFAF1" : "#FDF2F0", 
            border: `1.5px solid ${ad.is_vaccinated ? "var(--color-accent)" : "#E74C3C"}`, 
            borderRadius: "12px", 
            padding: "12px", 
            display: "flex", 
            alignItems: "center", 
            gap: "10px" 
          }}>
            <span style={{ fontSize: "1.5rem" }}>🛡️</span>
            <div>
              <p style={{ fontSize: "0.65rem", color: "var(--color-text-muted)", fontWeight: "600", textTransform: "uppercase" }}>Vaksinasi</p>
              <p style={{ fontSize: "0.85rem", fontWeight: "800", color: ad.is_vaccinated ? "var(--color-accent)" : "#E74C3C" }}>
                {ad.is_vaccinated ? "Telah Divaksin" : "Belum Divaksin"}
              </p>
            </div>
          </div>

          <div style={{ 
            backgroundColor: ad.is_neutered ? "#EAFAF1" : "#FDF2F0", 
            border: `1.5px solid ${ad.is_neutered ? "var(--color-accent)" : "#E74C3C"}`, 
            borderRadius: "12px", 
            padding: "12px", 
            display: "flex", 
            alignItems: "center", 
            gap: "10px" 
          }}>
            <span style={{ fontSize: "1.5rem" }}>✂️</span>
            <div>
              <p style={{ fontSize: "0.65rem", color: "var(--color-text-muted)", fontWeight: "600", textTransform: "uppercase" }}>Dimandulkan</p>
              <p style={{ fontSize: "0.85rem", fontWeight: "800", color: ad.is_neutered ? "var(--color-accent)" : "#E74C3C" }}>
                {ad.is_neutered ? "Telah Mandul" : "Belum Mandul"}
              </p>
            </div>
          </div>

        </div>

        {/* Pet details grid (breed, age, category) */}
        <div style={{ 
          backgroundColor: "var(--color-surface)", 
          border: "1px solid var(--color-border)", 
          borderRadius: "var(--radius-md)", 
          padding: "14px",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "12px",
          textAlign: "center"
        }}>
          <div>
            <p style={{ fontSize: "0.68rem", color: "var(--color-text-muted)" }}>Kategori</p>
            <p style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--color-text-main)", marginTop: "4px" }}>{ad.category}</p>
          </div>
          <div>
            <p style={{ fontSize: "0.68rem", color: "var(--color-text-muted)" }}>Baka</p>
            <p style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--color-text-main)", marginTop: "4px" }}>{ad.breed || "Bukan Kucing"}</p>
          </div>
          <div>
            <p style={{ fontSize: "0.68rem", color: "var(--color-text-muted)" }}>Umur</p>
            <p style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--color-text-main)", marginTop: "4px" }}>
              {ad.age_months !== null && ad.age_months !== undefined ? `${ad.age_months} Bulan` : "N/A"}
            </p>
          </div>
        </div>

        {/* 4. AD DESCRIPTION */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <h3 style={{ fontSize: "0.95rem", color: "var(--color-text-main)", fontWeight: "800" }}>Keterangan Iklan</h3>
          <p style={{ 
            fontSize: "0.85rem", 
            color: "var(--color-text-main)", 
            lineHeight: "1.6", 
            backgroundColor: "var(--color-surface)", 
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: "16px",
            whiteSpace: "pre-line"
          }}>
            {ad.description || "Tiada keterangan diberikan oleh pemilik iklan."}
          </p>
        </div>

        {/* 5. INTERACTIVE MAP COD LOCATION */}
        {ad.latitude && ad.longitude && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <h3 style={{ fontSize: "0.95rem", color: "var(--color-text-main)", fontWeight: "800" }}>📍 Titik COD & Lokasi Pertemuan</h3>
            <div style={{ 
              height: "200px", 
              borderRadius: "var(--radius-md)", 
              overflow: "hidden", 
              border: "1.5px solid var(--color-border)",
              boxShadow: "var(--shadow-sm)"
            }}>
              {/* Responsive Google Maps Embed frame using Coordinates points */}
              <iframe 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                scrolling="no" 
                marginHeight={0} 
                marginWidth={0} 
                src={`https://maps.google.com/maps?q=${ad.latitude},${ad.longitude}&z=14&ie=UTF8&iwloc=&output=embed`}
                style={{ filter: "contrast(1.05) saturate(1)" }}
              />
            </div>
            <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textAlign: "center" }}>
              Demi keselamatan, sila buat pertemuan COD di tempat awam & terbuka sahaja.
            </span>
          </div>
        )}

        {/* 6. VERIFIED SELLER PROFILE CARD */}
        {ad.seller && (
          <section style={{ 
            backgroundColor: "var(--color-surface)", 
            border: "1px solid var(--color-border)", 
            borderRadius: "var(--radius-md)", 
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            boxShadow: "var(--shadow-sm)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {/* Avatar picture or fallback icon */}
              <div style={{ 
                width: "48px", 
                height: "48px", 
                borderRadius: "50%", 
                backgroundColor: "#FFF2E6", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                border: "1.5px solid var(--color-border)",
                overflow: "hidden"
              }}>
                {ad.seller.avatar_url ? (
                  <img src={ad.seller.avatar_url} alt={ad.seller.store_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: "1.5rem" }}>🐱</span>
                )}
              </div>

              {/* Seller details */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <h4 style={{ fontSize: "0.95rem", color: "var(--color-text-main)", fontWeight: "800", margin: 0 }}>
                    {ad.seller.store_name || "Pemilik Meowdah"}
                  </h4>
                  {ad.seller.is_verified_breeder && (
                    <span 
                      style={{ backgroundColor: "#EBF5FB", color: "#2980B9", fontSize: "0.58rem", fontWeight: "900", padding: "2px 6px", borderRadius: "4px" }}
                      title="Verified Breeder"
                    >
                      💎 VERIFIED BREEDER
                    </span>
                  )}
                </div>
                <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>Negeri: {ad.state}</span>
              </div>
            </div>

            <p style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", lineHeight: "1.4", margin: 0 }}>
              {ad.seller.store_bio || "Selamat datang ke storefront saya. Hubungi saya untuk maklumat lanjut tentang si comel."}
            </p>

            <Link 
              href={`/seller/${ad.seller.id}`}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "10px",
                backgroundColor: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                color: "var(--color-primary)",
                fontSize: "0.78rem",
                fontWeight: "700",
                textAlign: "center",
                textDecoration: "none",
                display: "block",
                transition: "var(--transition)"
              }}
            >
              Lihat Kedai Niaga ➔
            </Link>
          </section>
        )}

      </main>

      {/* 7. STICKY FLOATING BOTTOM CTA ACTION BAR */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: "480px",
        backgroundColor: "var(--color-surface)",
        borderTop: "1.5px solid var(--color-border)",
        padding: "12px 16px",
        boxShadow: "0 -8px 24px rgba(0, 0, 0, 0.08)",
        display: "flex",
        gap: "12px",
        zIndex: 100
      }}>
        {isOwner ? (
          /* Jika pemilik, boleh urus iklan */
          <Link 
            href="/dashboard" 
            className="btn btn-primary" 
            style={{ width: "100%", padding: "12px", fontSize: "0.9rem" }}
          >
            ⚙️ Urus Iklan di Dashboard Anda
          </Link>
        ) : (
          /* Jika pembeli, tunjuk WhatsApp dan Chat Sembang */
          <>
            <Link 
              href={`/dashboard/chat?adId=${ad.id}&sellerId=${ad.seller?.id || ""}`}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "var(--radius-md)",
                border: "2px solid var(--color-primary)",
                color: "var(--color-primary)",
                backgroundColor: "var(--color-surface)",
                fontWeight: "bold",
                fontSize: "0.85rem",
                textAlign: "center",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px"
              }}
            >
              💬 Chat Sembang
            </Link>

            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1.3,
                padding: "12px",
                borderRadius: "var(--radius-md)",
                border: "none",
                color: "white",
                backgroundColor: "var(--color-primary)",
                fontWeight: "bold",
                fontSize: "0.85rem",
                textAlign: "center",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                boxShadow: "0 4px 12px rgba(255, 140, 50, 0.25)"
              }}
            >
              📞 Hubungi WhatsApp
            </a>
          </>
        )}
      </div>

    </div>
  );
}
