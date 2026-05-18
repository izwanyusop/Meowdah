"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

// Senarai Negeri Malaysia
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

// Senarai Baka Kucing Popular
const POPULAR_BREEDS = [
  "BSH",
  "Persian",
  "Munchkin",
  "Siam",
  "Bengal",
  "Maine Coon",
  "Ragdoll",
  "Domestic (DSH)",
  "Scottish Fold"
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
    latitude: 3.0738,
    longitude: 101.5183,
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
    latitude: 3.1072,
    longitude: 101.7634,
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
    latitude: 1.4927,
    longitude: 103.7414,
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
    latitude: 5.4164,
    longitude: 100.3301,
    is_featured: false,
    is_urgent: false,
    created_at: new Date().toISOString(),
    seller: {
      store_name: "Mutiara Cat Spa",
      is_verified_breeder: true
    }
  }
];

// Pengiraan Haversine Formula untuk Geolocation
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Jejari Bumi dalam KM
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Jarak dalam KM
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  // State Carian dan Tapisan
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [state, setState] = useState(searchParams.get("state") || "");
  const [breed, setBreed] = useState(searchParams.get("breed") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [vaccinated, setVaccinated] = useState(searchParams.get("vaccinated") === "true");
  const [neutered, setNeutered] = useState(searchParams.get("neutered") === "true");
  
  // Geolocation States
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [radius, setRadius] = useState<number>(25); // default radius 25KM
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoActive, setGeoActive] = useState(false);

  // UI Bottom Sheet Control
  const [filterOpen, setFilterOpen] = useState(false);
  
  // Ads States
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data berdasarkan kriteria carian utama
  useEffect(() => {
    async function fetchAds() {
      setLoading(true);
      try {
        let query = supabase
          .from("ads")
          .select("*, seller:profiles(id, store_name, is_verified_breeder, avatar_url)")
          .eq("status", "active");

        // DB filtering untuk parameter asas (supaya scaling bagus)
        if (category) {
          query = query.eq("category", category);
        }
        if (state) {
          query = query.eq("state", state);
        }

        const { data, error } = await query.order("created_at", { ascending: false });

        if (error) throw error;
        
        let fetchedAds = data || [];

        // Jika DB kosong, guna data dummy premium untuk visual yang menakjubkan
        if (fetchedAds.length === 0) {
          fetchedAds = DUMMY_ADS;
        }

        setAds(fetchedAds);
      } catch (err) {
        console.error("Gagal memuatkan iklan:", err);
        setAds(DUMMY_ADS); // Fallback
      } finally {
        setLoading(false);
      }
    }
    fetchAds();
  }, [category, state]);

  // Request browser GPS Geolocation
  const requestLocation = () => {
    if (!navigator.geolocation) {
      alert("Pelayar anda tidak menyokong fungsi Geolocation.");
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setGeoActive(true);
        setGeoLoading(false);
      },
      (error) => {
        console.error("Ralat mendapatkan lokasi:", error);
        alert("Gagal mendapatkan lokasi GPS anda. Sila benarkan akses lokasi dalam tetapan.");
        setGeoLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  // Tapis data secara tempatan (instant response & distance filtering)
  const filteredAds = ads.filter((ad) => {
    // 1. Tapis mengikut query text (Tajuk atau Keterangan)
    if (q.trim()) {
      const term = q.toLowerCase();
      const matchTitle = ad.title?.toLowerCase().includes(term);
      const matchDesc = ad.description?.toLowerCase().includes(term);
      const matchBreed = ad.breed?.toLowerCase().includes(term);
      if (!matchTitle && !matchDesc && !matchBreed) return false;
    }

    // 2. Tapis mengikut baka kucing
    if (breed && ad.breed !== breed) {
      return false;
    }

    // 3. Tapis mengikut Julat Harga
    if (minPrice && ad.price < parseFloat(minPrice)) {
      return false;
    }
    if (maxPrice && ad.price > parseFloat(maxPrice)) {
      return false;
    }

    // 4. Tapis mengikut Lencana Kesihatan
    if (vaccinated && !ad.is_vaccinated) {
      return false;
    }
    if (neutered && !ad.is_neutered) {
      return false;
    }

    // 5. Tapis mengikut Geolocation Jarak KM
    if (geoActive && userCoords && ad.latitude && ad.longitude) {
      const distance = getDistance(
        userCoords.latitude,
        userCoords.longitude,
        ad.latitude,
        ad.longitude
      );
      if (distance > radius) {
        return false;
      }
    }

    return true;
  });

  // Susun semula mengikut jarak jika GPS diaktifkan
  const sortedAds = [...filteredAds].sort((a, b) => {
    if (geoActive && userCoords && a.latitude && a.longitude && b.latitude && b.longitude) {
      const distA = getDistance(userCoords.latitude, userCoords.longitude, a.latitude, a.longitude);
      const distB = getDistance(userCoords.latitude, userCoords.longitude, b.latitude, b.longitude);
      return distA - distB; // Terdekat dahulu
    }
    return 0; // Lalai dikekalkan
  });

  // Jalankan semula carian apabila input teks berubah
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const resetFilters = () => {
    setQ("");
    setCategory("");
    setState("");
    setBreed("");
    setMinPrice("");
    setMaxPrice("");
    setVaccinated(false);
    setNeutered(false);
    setGeoActive(false);
    setUserCoords(null);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
      {/* Search Page Header */}
      <header style={{ 
        position: "sticky", 
        top: 0, 
        backgroundColor: "var(--color-bg)", 
        borderBottom: "1px solid var(--color-border)",
        padding: "14px 16px",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        boxShadow: "var(--shadow-sm)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/" style={{ fontSize: "1.4rem", textDecoration: "none", color: "var(--color-primary)", fontWeight: "bold" }}>
            ←
          </Link>
          
          <form onSubmit={handleSearchSubmit} style={{ flex: 1, position: "relative" }}>
            <input 
              type="text" 
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari kucing, baka, makanan..." 
              style={{
                width: "100%",
                padding: "10px 14px 10px 38px",
                borderRadius: "var(--radius-full)",
                border: "1.5px solid var(--color-border)",
                backgroundColor: "var(--color-surface)",
                fontSize: "0.85rem",
                color: "var(--color-text-main)",
                outline: "none"
              }}
            />
            <span style={{ position: "absolute", left: "14px", top: "10px", fontSize: "0.95rem" }}>🔍</span>
            {q && (
              <button 
                type="button" 
                onClick={() => setQ("")}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "10px",
                  border: "none",
                  background: "none",
                  fontSize: "0.85rem",
                  color: "var(--color-text-muted)",
                  cursor: "pointer"
                }}
              >
                ✕
              </button>
            )}
          </form>

          {/* Filter Trigger Button */}
          <button 
            onClick={() => setFilterOpen(true)}
            style={{
              padding: "10px",
              borderRadius: "50%",
              backgroundColor: "var(--color-surface)",
              border: `1.5px solid ${filterOpen || breed || minPrice || maxPrice || vaccinated || neutered || geoActive ? "var(--color-primary)" : "var(--color-border)"}`,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              transition: "var(--transition)"
            }}
          >
            ⚙️
            {(breed || minPrice || maxPrice || vaccinated || neutered || geoActive) && (
              <span style={{
                position: "absolute",
                top: "-2px",
                right: "-2px",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "var(--color-primary)"
              }} />
            )}
          </button>
        </div>

        {/* Quick Category Chips */}
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "2px", scrollbarWidth: "none" }}>
          {["Kucing", "Makanan", "Aksesori", "Servis"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(category === cat ? "" : cat)}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-full)",
                fontSize: "0.76rem",
                fontWeight: "700",
                border: "1.5px solid",
                borderColor: category === cat ? "var(--color-primary)" : "var(--color-border)",
                backgroundColor: category === cat ? "#FFF2E6" : "var(--color-surface)",
                color: category === cat ? "var(--color-primary)" : "var(--color-text-main)",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "var(--transition)"
              }}
            >
              {cat}
            </button>
          ))}
          
          {/* Quick State Selector Chip */}
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            style={{
              padding: "6px 12px",
              borderRadius: "var(--radius-full)",
              fontSize: "0.76rem",
              fontWeight: "700",
              border: "1.5px solid",
              borderColor: state ? "var(--color-primary)" : "var(--color-border)",
              backgroundColor: state ? "#FFF2E6" : "var(--color-surface)",
              color: state ? "var(--color-primary)" : "var(--color-text-main)",
              cursor: "pointer",
              outline: "none"
            }}
          >
            <option value="">📍 Seluruh Malaysia</option>
            {MALAYSIA_STATES.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Main Results Body */}
      <main style={{ flex: 1, padding: "16px 16px 40px 16px", display: "flex", flexDirection: "column", gap: "16px" }}>
        
        {/* Filter Summary Label */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", fontWeight: "600" }}>
            Menunjukkan {sortedAds.length} daripada {ads.length} hasil carian
          </span>
          {geoActive && userCoords && (
            <span style={{ fontSize: "0.78rem", color: "var(--color-accent)", fontWeight: "700" }}>
              📍 GPS Jarak Dekat Aktif ({radius}km)
            </span>
          )}
        </div>

        {/* Dynamic Card List */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "200px", gap: "12px" }}>
            <span style={{ fontSize: "2.5rem" }} className="animate-spin">🔄</span>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Sedang mencari si bulus...</p>
          </div>
        ) : sortedAds.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {sortedAds.map((ad, idx) => {
              const imageSrc = ad.images && ad.images.length > 0 ? ad.images[0] : "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600";
              let distanceKm: number | null = null;
              if (geoActive && userCoords && ad.latitude && ad.longitude) {
                distanceKm = getDistance(userCoords.latitude, userCoords.longitude, ad.latitude, ad.longitude);
              }
              return (
                <Link 
                  key={ad.id || idx} 
                  href={`/ads/${ad.id}`}
                  style={{
                    display: "flex",
                    backgroundColor: "var(--color-surface)",
                    border: ad.is_featured ? "1.5px solid #FFD9B9" : "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    overflow: "hidden",
                    boxShadow: ad.is_featured ? "var(--shadow-md)" : "var(--shadow-sm)",
                    textDecoration: "none",
                    height: "124px",
                    position: "relative",
                    transition: "var(--transition)"
                  }}
                >
                  {/* Featured Highlight Ribbon */}
                  {ad.is_featured && (
                    <span style={{
                      position: "absolute",
                      top: "6px",
                      left: "6px",
                      backgroundColor: "var(--color-primary)",
                      color: "white",
                      fontSize: "0.58rem",
                      fontWeight: "900",
                      padding: "2px 5px",
                      borderRadius: "3px",
                      zIndex: 2,
                      letterSpacing: "0.3px"
                    }}>FEATURED</span>
                  )}
                  {ad.is_urgent && (
                    <span style={{
                      position: "absolute",
                      top: "6px",
                      right: "6px",
                      backgroundColor: "var(--color-error)",
                      color: "white",
                      fontSize: "0.58rem",
                      fontWeight: "900",
                      padding: "2px 5px",
                      borderRadius: "3px",
                      zIndex: 2
                    }}>URGENT</span>
                  )}

                  {/* Left Side image */}
                  <div style={{ width: "120px", minWidth: "120px", height: "100%", backgroundColor: "#FFEAD7", position: "relative" }}>
                    <img 
                      src={imageSrc} 
                      alt={ad.title} 
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600";
                      }}
                    />
                  </div>

                  {/* Right Side details */}
                  <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", justifySelf: "stretch", flexGrow: 1, minWidth: 0, justifyContent: "space-between" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <span style={{ color: "var(--color-text-muted)", fontSize: "0.68rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "2px" }}>
                          📍 {ad.city}
                          {distanceKm !== null && (
                            <span style={{ color: "var(--color-primary)", fontWeight: "700" }}>
                              ({distanceKm.toFixed(1)} km)
                            </span>
                          )}
                        </span>
                        
                        {ad.breed && (
                          <span style={{
                            backgroundColor: "rgba(255, 140, 50, 0.08)",
                            color: "var(--color-primary)",
                            padding: "1px 4px",
                            borderRadius: "3px",
                            fontSize: "0.62rem",
                            fontWeight: "800"
                          }}>{ad.breed}</span>
                        )}
                      </div>

                      <h4 style={{
                        fontSize: "0.85rem",
                        fontWeight: "700",
                        color: "var(--color-text-main)",
                        lineHeight: "1.3",
                        height: "34px",
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        margin: 0
                      }}>
                        {ad.title}
                      </h4>
                    </div>

                    {/* Bottom area of card */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                      <span style={{ color: "var(--color-primary)", fontSize: "1.05rem", fontWeight: "800" }}>
                        RM {ad.price.toLocaleString("ms-MY")}
                      </span>
                      
                      {/* Health Badges indicator in row */}
                      <div style={{ display: "flex", gap: "4px" }}>
                        {ad.is_vaccinated && <span style={{ fontSize: "0.68rem" }} title="Divaksin">🛡️</span>}
                        {ad.is_neutered && <span style={{ fontSize: "0.68rem" }} title="Dimandulkan">✂️</span>}
                        {ad.seller?.is_verified_breeder && <span style={{ fontSize: "0.68rem" }} title="Verified Breeder">💎</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* Empty Search results state */
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            justifyContent: "center", 
            padding: "48px 24px", 
            textAlign: "center",
            backgroundColor: "var(--color-surface)",
            borderRadius: "var(--radius-lg)",
            border: "1px dashed var(--color-border)",
            marginTop: "20px"
          }}>
            <span style={{ fontSize: "4rem", marginBottom: "16px" }}>😿</span>
            <h3 style={{ fontSize: "1.1rem", color: "var(--color-text-main)", marginBottom: "8px" }}>Meow... Tiada Hasil Carian</h3>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", lineHeight: "1.5", marginBottom: "20px" }}>
              Kami tidak menemui iklan yang sepadan dengan tapisan anda. Cuba cari kata kunci lain atau set semula tapisan.
            </p>
            <button onClick={resetFilters} className="btn btn-primary" style={{ padding: "10px 20px", fontSize: "0.85rem" }}>
              Tetapkan Semula Tapisan
            </button>
          </div>
        )}
      </main>

      {/* FILTER BOTTOM SHEET BACKDROP */}
      <div 
        onClick={() => setFilterOpen(false)}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: 100,
          opacity: filterOpen ? 1 : 0,
          pointerEvents: filterOpen ? "auto" : "none",
          transition: "opacity 0.3s ease"
        }}
      />

      {/* FILTER BOTTOM SHEET */}
      <div 
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: filterOpen ? "translate(-50%, 0)" : "translate(-50%, 100%)",
          width: "100%",
          maxWidth: "480px",
          backgroundColor: "var(--color-bg)",
          borderTopLeftRadius: "var(--radius-lg)",
          borderTopRightRadius: "var(--radius-lg)",
          boxShadow: "0 -8px 32px rgba(0, 0, 0, 0.15)",
          zIndex: 101,
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          maxHeight: "82vh",
          display: "flex",
          flexDirection: "column"
        }}
      >
        {/* Bottom sheet header */}
        <div style={{ 
          padding: "16px 20px", 
          borderBottom: "1px solid var(--color-border)", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center"
        }}>
          <h3 style={{ fontSize: "1.1rem", color: "var(--color-text-main)", margin: 0 }}>⚙️ Penapis Carian</h3>
          <button 
            onClick={() => setFilterOpen(false)}
            style={{ border: "none", background: "none", fontSize: "1.1rem", color: "var(--color-text-muted)", cursor: "pointer", padding: "4px" }}
          >
            ✕
          </button>
        </div>

        {/* Bottom sheet form fields (scrollable container) */}
        <div style={{ padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Geolocation hyper-local filter */}
          <div style={{ 
            backgroundColor: "var(--color-surface)", 
            padding: "14px", 
            borderRadius: "var(--radius-md)", 
            border: "1px solid var(--color-border)",
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          }}>
            <h4 style={{ fontSize: "0.88rem", color: "var(--color-text-main)", display: "flex", alignItems: "center", gap: "6px" }}>
              📍 Carian Hyper-local (GPS)
            </h4>
            <p style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>
              Cari kucing & keperluan berdekatan anda dalam radius tertentu menggunakan GPS peranti.
            </p>
            
            {!geoActive ? (
              <button 
                type="button" 
                onClick={requestLocation}
                disabled={geoLoading}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "10px",
                  border: "1px dashed var(--color-primary)",
                  backgroundColor: "#FFF9F5",
                  color: "var(--color-primary)",
                  fontWeight: "bold",
                  fontSize: "0.78rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px"
                }}
              >
                {geoLoading ? "⏳ Mengesan koordinat GPS..." : "📍 Aktifkan Lokasi Berdekatan Saya"}
              </button>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                  <span style={{ color: "var(--color-accent)", fontWeight: "bold" }}>🟢 Lokasi GPS Aktif</span>
                  <button 
                    type="button" 
                    onClick={() => { setGeoActive(false); setUserCoords(null); }}
                    style={{ border: "none", background: "none", color: "var(--color-error)", fontSize: "0.75rem", cursor: "pointer", fontWeight: "bold" }}
                  >
                    Matikan
                  </button>
                </div>
                
                {/* Distance Radius slider */}
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--color-text-main)", fontWeight: "600" }}>
                    <span>Radius Carian:</span>
                    <span style={{ color: "var(--color-primary)" }}>{radius} KM</span>
                  </div>
                  <input 
                    type="range" 
                    min="5" 
                    max="150" 
                    step="5"
                    value={radius} 
                    onChange={(e) => setRadius(parseInt(e.target.value))}
                    style={{ width: "100%", accentColor: "var(--color-primary)" }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Breed input */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--color-text-main)" }}>Baka Kucing</label>
            <select
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              style={{
                padding: "10px 12px",
                borderRadius: "10px",
                border: "1.5px solid var(--color-border)",
                backgroundColor: "var(--color-surface)",
                fontSize: "0.85rem",
                outline: "none"
              }}
            >
              <option value="">Semua Baka</option>
              {POPULAR_BREEDS.map((br) => (
                <option key={br} value={br}>{br}</option>
              ))}
            </select>
          </div>

          {/* Price Range inputs */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--color-text-main)" }}>Julat Harga (RM)</label>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <input 
                type="number" 
                placeholder="Min" 
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "10px",
                  border: "1.5px solid var(--color-border)",
                  fontSize: "0.85rem",
                  outline: "none"
                }}
              />
              <span style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}>hingga</span>
              <input 
                type="number" 
                placeholder="Max" 
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "10px",
                  border: "1.5px solid var(--color-border)",
                  fontSize: "0.85rem",
                  outline: "none"
                }}
              />
            </div>
          </div>

          {/* Health Check Badges */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <label style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--color-text-main)" }}>Lencana Kesihatan</label>
            <div style={{ display: "flex", gap: "16px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", cursor: "pointer" }}>
                <input 
                  type="checkbox" 
                  checked={vaccinated}
                  onChange={(e) => setVaccinated(e.target.checked)}
                  style={{ width: "16px", height: "16px", accentColor: "var(--color-primary)" }}
                />
                🛡️ Telah Divaksin
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", cursor: "pointer" }}>
                <input 
                  type="checkbox" 
                  checked={neutered}
                  onChange={(e) => setNeutered(e.target.checked)}
                  style={{ width: "16px", height: "16px", accentColor: "var(--color-primary)" }}
                />
                ✂️ Telah Dimandul
              </label>
            </div>
          </div>

        </div>

        {/* Bottom sheet CTA controls */}
        <div style={{ 
          padding: "16px 20px", 
          borderTop: "1px solid var(--color-border)", 
          display: "flex", 
          gap: "12px",
          backgroundColor: "var(--color-surface)"
        }}>
          <button 
            type="button" 
            onClick={resetFilters}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-bg)",
              color: "var(--color-text-main)",
              fontSize: "0.85rem",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            Reset
          </button>
          
          <button 
            type="button" 
            onClick={() => setFilterOpen(false)}
            style={{
              flex: 2,
              padding: "12px",
              borderRadius: "12px",
              border: "none",
              backgroundColor: "var(--color-primary)",
              color: "white",
              fontSize: "0.85rem",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: "0 4px 10px rgba(255,140,50,0.25)"
            }}
          >
            Guna Penapis
          </button>
        </div>
      </div>

    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <p style={{ color: "var(--color-text-muted)" }}>Memuatkan halaman carian...</p>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}
