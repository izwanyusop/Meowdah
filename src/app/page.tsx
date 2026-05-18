import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import SafeImage from "@/components/SafeImage";

export const revalidate = 0; // Pastikan data sentiasa dikemas kini

// Senarai Negeri untuk Dropdown Lokasi
const MALAYSIA_STATES = [
  "Selangor",
  "Kuala Lumpur",
  "Johor",
  "Penang",
  "Perak",
  "Kedah",
  "Melaka",
  "Negeri Sembilan",
  "Pahang",
  "Kelantan",
  "Terengganu",
  "Sabah",
  "Sarawak",
  "Perlis"
];

// Fallback Premium Ads jika database masih kosong
const DUMMY_ADS = [
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
    is_urgent: true,
    created_at: new Date().toISOString(),
    seller: {
      store_name: "Oyen Cattery",
      is_verified_breeder: true
    }
  },
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
    is_urgent: false,
    created_at: new Date().toISOString(),
    seller: {
      store_name: "Meow Pet Shop",
      is_verified_breeder: false
    }
  },
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
    is_urgent: true,
    created_at: new Date().toISOString(),
    seller: {
      store_name: "JB Pet Trading",
      is_verified_breeder: false
    }
  },
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
    is_urgent: false,
    created_at: new Date().toISOString(),
    seller: {
      store_name: "Mutiara Cat Spa",
      is_verified_breeder: true
    }
  }
];

export default async function Home() {
  let user = null;
  let dbFeaturedAds = [];
  let dbRecentAds = [];
  let databaseIsConnected = false;

  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    user = userData?.user || null;

    // Fetch Featured Ads
    const { data: featuredData } = await supabase
      .from("ads")
      .select("*, seller:profiles(id, store_name, is_verified_breeder, avatar_url)")
      .eq("status", "active")
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(6);

    // Fetch Recent Ads
    const { data: recentData } = await supabase
      .from("ads")
      .select("*, seller:profiles(id, store_name, is_verified_breeder, avatar_url)")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(10);

    dbFeaturedAds = featuredData || [];
    dbRecentAds = recentData || [];
    databaseIsConnected = true;
  } catch (error) {
    console.error("Gagal menyambung ke database Supabase:", error);
  }

  // Gabungkan dengan Fallback Ads jika DB kosong demi penampilan premium
  const featuredAds = dbFeaturedAds.length > 0 
    ? dbFeaturedAds 
    : DUMMY_ADS.filter(ad => ad.is_featured);

  const recentAds = dbRecentAds.length > 0 
    ? dbRecentAds 
    : DUMMY_ADS;

  return (
    <main style={{ padding: "20px 16px 80px 16px", display: "flex", flexDirection: "column", gap: "24px", minHeight: "100vh" }}>
      {/* PWA Header */}
      <header style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        paddingBottom: "4px"
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
          <span style={{ fontSize: "2.2rem", filter: "drop-shadow(0 2px 4px rgba(255, 140, 50, 0.2))" }}>🐈</span>
          <h1 style={{ 
            color: "var(--color-primary)", 
            fontSize: "1.65rem", 
            margin: 0, 
            letterSpacing: "-0.8px",
            fontWeight: 800 
          }}>
            Meowdah<span style={{ color: "var(--color-text-main)" }}>.my</span>
          </h1>
        </Link>
        
        {user ? (
          <Link href="/dashboard" style={{
            backgroundColor: "#FFF2E6",
            color: "var(--color-primary)",
            padding: "8px 16px",
            borderRadius: "var(--radius-full)",
            fontSize: "0.85rem",
            fontWeight: "700",
            border: "1px solid rgba(255, 140, 50, 0.2)",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "var(--transition)"
          }}>
            👤 {user.user_metadata?.full_name || user.email?.split('@')[0] || "Profil"}
          </Link>
        ) : (
          <Link href="/login" style={{
            backgroundColor: "var(--color-primary)",
            color: "white",
            padding: "8px 16px",
            borderRadius: "var(--radius-full)",
            fontSize: "0.85rem",
            fontWeight: "700",
            boxShadow: "0 4px 12px rgba(255, 140, 50, 0.25)",
            textDecoration: "none",
            transition: "var(--transition)"
          }}>
            🔑 Log Masuk
          </Link>
        )}
      </header>

      {/* Hero Search Section */}
      <section style={{ 
        background: "linear-gradient(135deg, var(--color-surface) 0%, #FFFDFB 100%)", 
        border: "1px solid var(--color-border)", 
        borderRadius: "var(--radius-lg)", 
        padding: "24px",
        boxShadow: "var(--shadow-md)",
        display: "flex",
        flexDirection: "column",
        gap: "18px",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Subtle Background Accent */}
        <div style={{
          position: "absolute",
          top: "-50px",
          right: "-50px",
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,140,50,0.1) 0%, rgba(255,140,50,0) 70%)",
          pointerEvents: "none"
        }} />

        <div>
          <h2 style={{ 
            fontSize: "1.45rem", 
            marginBottom: "6px", 
            color: "var(--color-text-main)", 
            letterSpacing: "-0.5px",
            lineHeight: 1.25
          }}>
            Cari Kucing Oyen & Keperluan Si Bulus 🐱
          </h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.82rem", lineHeight: "1.45" }}>
            Platform classifieds khusus kucing #1 di Malaysia. Cari baka tulen, adopsi percuma, hotel & pasangan mating setempat!
          </p>
        </div>

        {/* Dynamic Search Input Form */}
        <form action="/search" method="GET" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <input 
              type="text" 
              name="q"
              placeholder="Cari BSH, Munchkin, Makanan..." 
              style={{
                width: "100%",
                padding: "14px 16px 14px 44px",
                borderRadius: "var(--radius-md)",
                border: "1.5px solid var(--color-border)",
                backgroundColor: "var(--color-bg)",
                fontSize: "0.9rem",
                color: "var(--color-text-main)",
                outline: "none",
                transition: "var(--transition)"
              }}
              required
            />
            <span style={{ position: "absolute", left: "16px", fontSize: "1.1rem", color: "var(--color-text-muted)" }}>🔍</span>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <select 
              name="state"
              style={{
                flex: 1,
                padding: "12px 14px",
                borderRadius: "var(--radius-md)",
                border: "1.5px solid var(--color-border)",
                backgroundColor: "var(--color-surface)",
                fontSize: "0.85rem",
                color: "var(--color-text-main)",
                outline: "none",
                cursor: "pointer"
              }}
            >
              <option value="">📍 Seluruh Malaysia</option>
              {MALAYSIA_STATES.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>

            <button type="submit" className="btn btn-primary" style={{ flex: 1.2, padding: "12px 18px", fontSize: "0.9rem" }}>
              Cari Sekarang
            </button>
          </div>
        </form>
      </section>

      {/* Quick Categories Slider */}
      <section>
        <h3 style={{ fontSize: "1rem", marginBottom: "14px", color: "var(--color-text-main)", fontWeight: "700" }}>
          Kategori Pilihan
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
          {[
            { icon: "🐈", label: "Kucing", name: "Kucing" },
            { icon: "🐟", label: "Makanan", name: "Makanan" },
            { icon: "🧸", label: "Aksesori", name: "Aksesori" },
            { icon: "🏥", label: "Servis", name: "Servis" }
          ].map((cat, idx) => (
            <Link 
              key={idx} 
              href={`/search?category=${cat.name}`}
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding: "16px 8px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                boxShadow: "var(--shadow-sm)",
                transition: "var(--transition)",
                textDecoration: "none"
              }}
              className="category-card"
            >
              <span style={{ fontSize: "2rem", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.05))" }}>{cat.icon}</span>
              <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--color-text-main)" }}>{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Ad Carousel / Slaid */}
      <section style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "1.05rem", color: "var(--color-text-main)", display: "flex", alignItems: "center", gap: "6px" }}>
            🔥 Iklan Pilihan <span style={{ 
              fontSize: "0.7rem", 
              backgroundColor: "rgba(255, 140, 50, 0.12)", 
              color: "var(--color-primary)", 
              padding: "2px 8px", 
              borderRadius: "10px", 
              fontWeight: 700 
            }}>Premium</span>
          </h3>
          <Link href="/search?featured=true" style={{ color: "var(--color-primary)", fontSize: "0.8rem", fontWeight: "700", textDecoration: "none" }}>
            Lihat Semua
          </Link>
        </div>

        {/* Horizontal scrollable Featured container */}
        <div style={{ 
          display: "flex", 
          gap: "16px", 
          overflowX: "auto", 
          paddingBottom: "8px",
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none" // Hide standard scrollbar
        }} className="featured-scroller">
          {featuredAds.map((ad, idx) => {
            const imageSrc = ad.images && ad.images.length > 0 ? ad.images[0] : "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600";
            return (
              <div 
                key={ad.id || idx} 
                style={{
                  minWidth: "280px",
                  width: "280px",
                  backgroundColor: "var(--color-surface)",
                  border: "2px solid #FFE4CE",
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                  boxShadow: "var(--shadow-md)",
                  display: "flex",
                  flexDirection: "column",
                  scrollSnapAlign: "start",
                  position: "relative"
                }}
              >
                {/* Featured Badge Overlay */}
                <div style={{
                  position: "absolute",
                  top: "12px",
                  left: "12px",
                  backgroundColor: "var(--color-primary)",
                  color: "white",
                  padding: "4px 8px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.68rem",
                  fontWeight: "800",
                  zIndex: 2,
                  boxShadow: "0 2px 6px rgba(255, 140, 50, 0.35)",
                  letterSpacing: "0.5px"
                }}>FEATURED</div>

                {ad.is_urgent && (
                  <div style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    backgroundColor: "var(--color-error)",
                    color: "white",
                    padding: "4px 8px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.68rem",
                    fontWeight: "800",
                    zIndex: 2,
                    boxShadow: "0 2px 6px rgba(231, 76, 60, 0.3)"
                  }}>URGENT</div>
                )}

                {/* Ad Image with Gradient Cover */}
                <Link href={`/ads/${ad.id}`} style={{ display: "block", position: "relative", height: "160px", backgroundColor: "#FFEAD7", overflow: "hidden" }}>
                  <SafeImage 
                    src={imageSrc} 
                    alt={ad.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "var(--transition)" }}
                  />
                  <div style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "40%",
                    background: "linear-gradient(to top, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 100%)",
                    pointerEvents: "none"
                  }} />
                </Link>

                {/* Ad Content */}
                <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "8px", flexGrow: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "var(--color-text-muted)", fontSize: "0.72rem", fontWeight: "600" }}>
                      📍 {ad.city}, {ad.state}
                    </span>
                    {ad.breed && (
                      <span style={{ 
                        backgroundColor: "#FFF2E6", 
                        color: "var(--color-primary)", 
                        padding: "2px 6px", 
                        borderRadius: "4px", 
                        fontSize: "0.68rem", 
                        fontWeight: "700" 
                      }}>
                        {ad.breed}
                      </span>
                    )}
                  </div>

                  <Link href={`/ads/${ad.id}`} style={{ textDecoration: "none" }}>
                    <h4 style={{ 
                      fontSize: "0.92rem", 
                      fontWeight: "700", 
                      color: "var(--color-text-main)",
                      lineHeight: "1.35",
                      height: "36px",
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      margin: 0
                    }} className="card-title">
                      {ad.title}
                    </h4>
                  </Link>

                  {/* Health badges */}
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", margin: "2px 0" }}>
                    {ad.is_vaccinated && (
                      <span style={{ color: "var(--color-accent)", fontSize: "0.68rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "2px" }}>
                        🛡️ Vaksin
                      </span>
                    )}
                    {ad.is_neutered && (
                      <span style={{ color: "var(--color-accent)", fontSize: "0.68rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "2px" }}>
                        ✂️ Mandul
                      </span>
                    )}
                    {ad.seller?.is_verified_breeder && (
                      <span style={{ color: "#2980B9", fontSize: "0.68rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "2px" }}>
                        💎 Breeder
                      </span>
                    )}
                  </div>

                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    marginTop: "auto",
                    paddingTop: "6px",
                    borderTop: "1px solid var(--color-border)"
                  }}>
                    <span style={{ color: "var(--color-primary)", fontSize: "1.1rem", fontWeight: "800" }}>
                      RM {ad.price.toLocaleString("ms-MY", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                    <Link 
                      href={`/ads/${ad.id}`}
                      style={{ 
                        fontSize: "0.78rem", 
                        fontWeight: "700", 
                        color: "var(--color-primary)",
                        textDecoration: "none",
                        backgroundColor: "#FFF2E6",
                        padding: "4px 10px",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,140,50,0.15)"
                      }}
                    >
                      Beli ➔
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent Grid List */}
      <section style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <h3 style={{ fontSize: "1.05rem", color: "var(--color-text-main)", fontWeight: "700" }}>
          Iklan Terkini (Bilus Baru)
        </h3>

        <div className="ads-grid">
          {recentAds.map((ad, idx) => {
            const imageSrc = ad.images && ad.images.length > 0 ? ad.images[0] : "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600";
            return (
              <div 
                key={ad.id || idx}
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                  boxShadow: "var(--shadow-sm)",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative"
                }}
              >
                {/* Urgent overlay on small cards */}
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

                <Link href={`/ads/${ad.id}`} style={{ display: "block", position: "relative", height: "120px", backgroundColor: "#FFEAD7" }}>
                  <SafeImage 
                    src={imageSrc} 
                    alt={ad.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </Link>

                <div style={{ padding: "10px", display: "flex", flexDirection: "column", gap: "6px", flexGrow: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "var(--color-text-muted)", fontSize: "0.65rem" }}>
                      📍 {ad.city}
                    </span>
                    <span style={{ 
                      fontSize: "0.62rem", 
                      backgroundColor: "rgba(255,140,50,0.06)", 
                      color: "var(--color-primary)", 
                      padding: "1px 4px", 
                      borderRadius: "3px",
                      fontWeight: 700
                    }}>
                      {ad.category}
                    </span>
                  </div>

                  <Link href={`/ads/${ad.id}`} style={{ textDecoration: "none" }}>
                    <h4 style={{ 
                      fontSize: "0.82rem", 
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
                  </Link>

                  <span style={{ color: "var(--color-primary)", fontSize: "0.95rem", fontWeight: "800", marginTop: "auto" }}>
                    RM {ad.price.toLocaleString("ms-MY")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* PWA Info Advice Footer */}
      <footer style={{ 
        textAlign: "center", 
        color: "var(--color-text-muted)", 
        fontSize: "0.75rem", 
        marginTop: "30px",
        padding: "24px 0 12px 0",
        borderTop: "1px solid var(--color-border)",
        display: "flex",
        flexDirection: "column",
        gap: "6px"
      }}>
        <p style={{ fontWeight: "700", color: "var(--color-text-main)" }}>
          📱 Pasang Meowdah.my ke skrin utama telefon bimbit anda!
        </p>
        <p style={{ padding: "0 10px" }}>Di Safari/Chrome, pilih ikon **Kongsi (Share)** atau **Lagi (More)** dan klik **"Add to Home Screen"** untuk pengalaman offline terpantas.</p>
        <p style={{ marginTop: "12px", fontSize: "0.68rem" }}>© 2026 Meowdah.my. Semua hak terpelihara.</p>
      </footer>
    </main>
  );
}
