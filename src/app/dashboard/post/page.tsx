"use client";

import { useState, useEffect, use, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

// Senarai Negeri dan Bandar beserta Koordinat
const LOCATION_COORDINATES: Record<string, Record<string, { lat: number; lng: number }>> = {
  "Selangor": {
    "Shah Alam": { lat: 3.0738, lng: 101.5183 },
    "Petaling Jaya": { lat: 3.1073, lng: 101.6067 },
    "Subang Jaya": { lat: 3.0648, lng: 101.5858 },
    "Klang": { lat: 3.0449, lng: 101.4456 },
    "Kajang": { lat: 2.9896, lng: 101.7925 },
    "Puchong": { lat: 3.0236, lng: 101.6190 },
    "Cyberjaya": { lat: 2.9213, lng: 101.6559 },
    "Banting": { lat: 2.8123, lng: 101.5019 }
  },
  "Kuala Lumpur": {
    "Wangsa Maju": { lat: 3.2058, lng: 101.7317 },
    "Cheras": { lat: 3.1072, lng: 101.7634 },
    "Bukit Bintang": { lat: 3.1478, lng: 101.7102 },
    "Kepong": { lat: 3.2144, lng: 101.6375 },
    "Setapak": { lat: 3.1963, lng: 101.7067 }
  },
  "Johor": {
    "Johor Bahru": { lat: 1.4927, lng: 103.7414 },
    "Batu Pahat": { lat: 1.8548, lng: 102.9326 },
    "Muar": { lat: 2.0442, lng: 102.5689 }
  },
  "Penang": {
    "Georgetown": { lat: 5.4164, lng: 100.3301 },
    "Butterworth": { lat: 5.3991, lng: 100.3638 },
    "Bayan Lepas": { lat: 5.2951, lng: 100.2588 }
  },
  "Perak": {
    "Ipoh": { lat: 4.5975, lng: 101.0901 },
    "Taiping": { lat: 4.8517, lng: 100.7333 }
  },
  "Kedah": {
    "Alor Setar": { lat: 6.1248, lng: 100.3678 },
    "Sungai Petani": { lat: 5.6433, lng: 100.4901 },
    "Langkawi": { lat: 6.3500, lng: 99.8000 }
  },
  "Melaka": {
    "Melaka Tengah": { lat: 2.1896, lng: 102.2501 },
    "Alor Gajah": { lat: 2.3837, lng: 102.2089 }
  },
  "Negeri Sembilan": {
    "Seremban": { lat: 2.7258, lng: 101.9422 },
    "Port Dickson": { lat: 2.5228, lng: 101.7948 }
  },
  "Pahang": {
    "Kuantan": { lat: 3.8077, lng: 103.3260 },
    "Temerloh": { lat: 3.4475, lng: 102.4175 }
  },
  "Kelantan": {
    "Kota Bharu": { lat: 6.1254, lng: 102.2381 }
  },
  "Terengganu": {
    "Kuala Terengganu": { lat: 5.3302, lng: 103.1408 }
  },
  "Sabah": {
    "Kota Kinabalu": { lat: 5.9804, lng: 116.0753 },
    "Sandakan": { lat: 5.8402, lng: 118.1179 }
  },
  "Sarawak": {
    "Kuching": { lat: 1.5533, lng: 110.3592 },
    "Miri": { lat: 4.3896, lng: 113.9808 }
  },
  "Perlis": {
    "Kangar": { lat: 6.4414, lng: 100.1986 }
  }
};

const CAT_BREEDS = [
  "British Shorthair (BSH)",
  "Persian",
  "Munchkin",
  "Maine Coon",
  "Ragdoll",
  "Bengal",
  "Siamese",
  "Sphynx",
  "Scottish Fold",
  "Domestic Short Hair (Kampung)",
  "Lain-lain"
];

function PostAdForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const supabase = createClient();

  // State Pengguna & Loading
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [step, setStep] = useState(1);

  // Form Fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Kucing");
  const [breed, setBreed] = useState("");
  const [ageMonths, setAgeMonths] = useState<number | "">("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [isVaccinated, setIsVaccinated] = useState(false);
  const [isNeutered, setIsNeutered] = useState(false);
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  
  // Gambar List (Base64 WebP + Blobs for Upload)
  const [images, setImages] = useState<{ preview: string; blob: Blob | null }[]>([]);
  const [processingImages, setProcessingImages] = useState(false);

  // Load User & Edit Data jika ada
  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }
        setCurrentUser(user);

        // Jika mode sunting (edit)
        if (editId) {
          const { data: ad, error } = await supabase
            .from("ads")
            .select("*")
            .eq("id", editId)
            .eq("seller_id", user.id)
            .single();

          if (error || !ad) {
            setErrorMessage("Iklan tidak ditemui atau anda bukan pemilik.");
          } else {
            setTitle(ad.title);
            setCategory(ad.category);
            setBreed(ad.breed || "");
            setAgeMonths(ad.age_months !== null && ad.age_months !== undefined ? ad.age_months : "");
            setPrice(ad.price.toString());
            setDescription(ad.description || "");
            setIsVaccinated(ad.is_vaccinated);
            setIsNeutered(ad.is_neutered);
            setState(ad.state);
            setCity(ad.city);
            
            // Set existing images as previews
            if (ad.images && ad.images.length > 0) {
              setImages(ad.images.map((img: string) => ({ preview: img, blob: null })));
            }
          }
        }
      } catch (err) {
        console.error("Ralat init:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [editId]);

  // Handle Dynamic City Select & Auto Lat Lng Coordinates
  const statesList = Object.keys(LOCATION_COORDINATES);
  const citiesList = state ? Object.keys(LOCATION_COORDINATES[state]) : [];

  useEffect(() => {
    if (citiesList.length > 0 && !citiesList.includes(city)) {
      setCity(citiesList[0]);
    }
  }, [state]);

  // Canvas-based WebP Compressor + EXIF Stripper + Watermark
  const processImageFile = (file: File): Promise<{ preview: string; blob: Blob }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Gagal membuka konteks lukisan kanvas"));
            return;
          }

          // Reka saiz maksimum 1000px lebar/tinggi
          const MAX_WIDTH = 1000;
          const MAX_HEIGHT = 1000;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Lukis gambar (Proses ini melupuskan EXIF/GPS Metadata)
          ctx.drawImage(img, 0, 0, width, height);

          // Tampal Watermark Separa Telus
          ctx.font = "bold 24px 'Outfit', sans-serif";
          ctx.fillStyle = "rgba(255, 140, 50, 0.45)"; // Warna Oren Oyen telus
          ctx.textAlign = "right";
          ctx.textBaseline = "bottom";
          ctx.fillText("Meowdah.my", width - 20, height - 20);

          // Tukar kepada WebP
          canvas.toBlob((blob) => {
            if (blob) {
              const previewUrl = URL.createObjectURL(blob);
              resolve({ preview: previewUrl, blob });
            } else {
              reject(new Error("Canvas toBlob gagal"));
            }
          }, "image/webp", 0.82); // 82% WebP Quality
        };
        img.src = event.target?.result as string;
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setProcessingImages(true);
    setErrorMessage("");

    const newFiles = Array.from(e.target.files);
    if (images.length + newFiles.length > 5) {
      setErrorMessage("Anda hanya boleh memuat naik maksimum 5 gambar.");
      setProcessingImages(false);
      return;
    }

    try {
      const processed = await Promise.all(
        newFiles.map((file) => processImageFile(file))
      );
      setImages((prev) => [...prev, ...processed]);
    } catch (err) {
      console.error(err);
      setErrorMessage("Ralat memproses gambar. Sila cuba lagi.");
    } finally {
      setProcessingImages(false);
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // Submit Listing Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !state || !city || images.length === 0) {
      setErrorMessage("Sila lengkapkan semua medan wajib dan muat naik sekurang-kurangnya 1 gambar.");
      return;
    }

    setSaving(true);
    setErrorMessage("");

    try {
      // 1. Upload new image blobs to Supabase Storage bucket 'ads'
      const uploadedUrls: string[] = [];

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (img.blob) {
          // Imej baru yang belum dimuat naik
          const fileExt = "webp";
          const fileName = `${currentUser.id}_${Date.now()}_${i}.${fileExt}`;
          
          const { data, error } = await supabase.storage
            .from("ads")
            .upload(fileName, img.blob, {
              contentType: "image/webp",
              cacheControl: "3600"
            });

          if (error) {
            throw new Error(`Storage upload gagal: ${error.message}`);
          }

          // Get Public URL
          const { data: { publicUrl } } = supabase.storage
            .from("ads")
            .getPublicUrl(fileName);

          uploadedUrls.push(publicUrl);
        } else {
          // Imej sedia ada (Sunting mod)
          uploadedUrls.push(img.preview);
        }
      }

      // Ambil lat & lng automatik
      const coords = LOCATION_COORDINATES[state]?.[city] || { lat: 3.0738, lng: 101.5183 };

      const adData = {
        seller_id: currentUser.id,
        title,
        description,
        price: parseFloat(price),
        category,
        breed: category === "Kucing" ? breed : null,
        age_months: category === "Kucing" && ageMonths !== "" ? Number(ageMonths) : null,
        is_vaccinated: category === "Kucing" ? isVaccinated : false,
        is_neutered: category === "Kucing" ? isNeutered : false,
        images: uploadedUrls,
        state,
        city,
        latitude: coords.lat,
        longitude: coords.lng,
        status: "active"
      };

      if (editId) {
        // Edit Mode
        const { error } = await supabase
          .from("ads")
          .update(adData)
          .eq("id", editId)
          .eq("seller_id", currentUser.id);

        if (error) throw error;
        alert("🎉 Iklan anda berjaya dikemas kini!");
      } else {
        // Create Mode
        const { error } = await supabase
          .from("ads")
          .insert([adData]);

        if (error) throw error;
        alert("🎉 Iklan anda berjaya diterbitkan secara langsung!");
      }

      router.push("/dashboard/my-ads");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Gagal menerbitkan iklan. Sila semak profil/bucket Supabase.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: "16px" }}>
        <span style={{ fontSize: "2.5rem" }} className="animate-spin">🔄</span>
        <p style={{ color: "var(--color-text-muted)" }}>Menyediakan borang...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--color-bg)", paddingBottom: "60px" }}>
      {/* Navbar */}
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
        <h2 style={{ fontSize: "1rem", color: "var(--color-text-main)", fontWeight: "800", margin: 0 }}>
          {editId ? "Sunting Iklan Kucing" : "Post Iklan Baru"}
        </h2>
        <span style={{ width: "24px" }} />
      </header>

      {/* Progress Indicator */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "12px 24px",
        backgroundColor: "#FFF2E6",
        borderBottom: "1px solid var(--color-border)"
      }}>
        {[1, 2, 3].map((s) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              backgroundColor: step === s ? "var(--color-primary)" : step > s ? "var(--color-accent)" : "white",
              color: step >= s ? "white" : "var(--color-text-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.75rem",
              fontWeight: "bold",
              border: "1px solid var(--color-border)"
            }}>
              {step > s ? "✓" : s}
            </span>
            <span style={{
              fontSize: "0.72rem",
              fontWeight: step === s ? "bold" : "normal",
              color: step === s ? "var(--color-text-main)" : "var(--color-text-muted)"
            }}>
              {s === 1 ? "Kategori" : s === 2 ? "Butiran" : "Gambar"}
            </span>
          </div>
        ))}
      </div>

      <main style={{ padding: "20px 16px" }}>
        {errorMessage && (
          <div style={{
            backgroundColor: "#FDF2F0",
            border: "1px solid var(--color-error)",
            color: "var(--color-error)",
            padding: "12px",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.8rem",
            marginBottom: "16px"
          }}>
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* STEP 1: CATEGORY & GENERAL DETAILS */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Kategori Listing *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "var(--radius-md)",
                    border: "1.5px solid var(--color-border)",
                    backgroundColor: "white",
                    fontSize: "0.9rem"
                  }}
                >
                  <option value="Kucing">🐈 Kucing (Baka / Si Bulus)</option>
                  <option value="Makanan">🐟 Makanan Kucing</option>
                  <option value="Aksesori">🧸 Aksesori & Sangkar</option>
                  <option value="Servis">🏥 Servis (Grooming / Mating)</option>
                </select>
              </div>

              {category === "Kucing" && (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Baka Kucing *</label>
                    <select
                      value={breed}
                      onChange={(e) => setBreed(e.target.value)}
                      style={{
                        padding: "12px 14px",
                        borderRadius: "var(--radius-md)",
                        border: "1.5px solid var(--color-border)",
                        backgroundColor: "white",
                        fontSize: "0.9rem"
                      }}
                      required
                    >
                      <option value="">-- Pilih Baka --</option>
                      {CAT_BREEDS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Umur Kucing (Bulan) *</label>
                    <input
                      type="number"
                      value={ageMonths}
                      onChange={(e) => setAgeMonths(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="Contoh: 4"
                      min="0"
                      style={{
                        padding: "12px 14px",
                        borderRadius: "var(--radius-md)",
                        border: "1.5px solid var(--color-border)",
                        backgroundColor: "white",
                        fontSize: "0.9rem"
                      }}
                      required
                    />
                  </div>
                </>
              )}

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setStep(2)}
                style={{ width: "100%", marginTop: "10px" }}
              >
                Seterusnya ➔
              </button>
            </div>
          )}

          {/* STEP 2: TITLE, DESCRIPTION, PRICE & LOCATION */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Tajuk Iklan *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: BSH Pure Breed Oyen Gemuk Comel"
                  maxLength={60}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "var(--radius-md)",
                    border: "1.5px solid var(--color-border)",
                    backgroundColor: "white",
                    fontSize: "0.9rem"
                  }}
                  required
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Harga Jualan (RM) *</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  style={{
                    padding: "12px 14px",
                    borderRadius: "var(--radius-md)",
                    border: "1.5px solid var(--color-border)",
                    backgroundColor: "white",
                    fontSize: "0.9rem"
                  }}
                  required
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Keterangan Iklan</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Terangkan secara terperinci tentang si bulus / keperluan anda (diet, kesihatan, perangai, dll)..."
                  rows={5}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "var(--radius-md)",
                    border: "1.5px solid var(--color-border)",
                    backgroundColor: "white",
                    fontSize: "0.9rem",
                    resize: "none"
                  }}
                />
              </div>

              {/* Location Selectors */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderTop: "1px solid var(--color-border)", paddingTop: "12px" }}>
                <h4 style={{ fontSize: "0.9rem", fontWeight: "bold" }}>📍 Lokasi COD / Pertemuan</h4>

                <div style={{ display: "flex", gap: "10px" }}>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Negeri *</label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      style={{
                        padding: "10px",
                        borderRadius: "var(--radius-sm)",
                        border: "1.5px solid var(--color-border)",
                        fontSize: "0.85rem",
                        backgroundColor: "white"
                      }}
                      required
                    >
                      <option value="">-- Pilih --</option>
                      {statesList.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Bandar / Lokasi *</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      style={{
                        padding: "10px",
                        borderRadius: "var(--radius-sm)",
                        border: "1.5px solid var(--color-border)",
                        fontSize: "0.85rem",
                        backgroundColor: "white"
                      }}
                      required
                      disabled={!state}
                    >
                      <option value="">-- Pilih --</option>
                      {citiesList.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setStep(1)}
                  style={{ flex: 1 }}
                >
                  Kembali
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setStep(3)}
                  style={{ flex: 1 }}
                >
                  Seterusnya ➔
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: HEALTH BADGES & IMAGES UPLOAD */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              {category === "Kucing" && (
                <div style={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px"
                }}>
                  <h4 style={{ fontSize: "0.9rem", fontWeight: "bold" }}>🛡️ Lencana Kesihatan Kucing</h4>
                  
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={isVaccinated}
                      onChange={(e) => setIsVaccinated(e.target.checked)}
                      style={{ width: "18px", height: "18px", accentColor: "var(--color-primary)" }}
                    />
                    Sudah divaksin (Vaccinated)
                  </label>

                  <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={isNeutered}
                      onChange={(e) => setIsNeutered(e.target.checked)}
                      style={{ width: "18px", height: "18px", accentColor: "var(--color-primary)" }}
                    />
                    Sudah dimandulkan (Neutered)
                  </label>
                </div>
              )}

              {/* Images Multi Upload area */}
              <div style={{
                backgroundColor: "var(--color-surface)",
                border: "1.5px dashed var(--color-primary)",
                borderRadius: "var(--radius-md)",
                padding: "24px 16px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
                position: "relative"
              }}>
                <span style={{ fontSize: "2.5rem" }}>📷</span>
                <div>
                  <h4 style={{ fontSize: "0.9rem", fontWeight: "bold" }}>Muat Naik Gambar</h4>
                  <p style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", marginTop: "4px" }}>
                    Maksimum 5 gambar. Tukar automatik ke format **WebP** & letak watermark **Meowdah.my**.
                  </p>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    opacity: 0,
                    cursor: "pointer"
                  }}
                  disabled={processingImages || images.length >= 5}
                />
                
                {processingImages && (
                  <span style={{ fontSize: "0.75rem", color: "var(--color-primary)", fontWeight: "bold" }}>
                    🔄 Menukarkan & memampatkan imej ke format WebP premium...
                  </span>
                )}
              </div>

              {/* Images Preview Grid */}
              {images.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px" }}>
                  {images.map((img, idx) => (
                    <div key={idx} style={{
                      position: "relative",
                      aspectRatio: "1",
                      borderRadius: "var(--radius-sm)",
                      overflow: "hidden",
                      border: "1px solid var(--color-border)"
                    }}>
                      <img
                        src={img.preview}
                        alt="Preview"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        style={{
                          position: "absolute",
                          top: "2px",
                          right: "2px",
                          backgroundColor: "rgba(231, 76, 60, 0.9)",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "20px",
                          height: "20px",
                          fontSize: "0.7rem",
                          fontWeight: "bold",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setStep(2)}
                  style={{ flex: 1 }}
                  disabled={saving}
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1.5 }}
                  disabled={saving || processingImages}
                >
                  {saving ? "Menerbitkan..." : editId ? "Kemas Kini Iklan" : "Tampilkan Iklan! ➔"}
                </button>
              </div>
            </div>
          )}

        </form>
      </main>
    </div>
  );
}

export default function PostAdPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: "16px" }}>
        <span style={{ fontSize: "2.5rem" }}>🔄</span>
        <p style={{ color: "var(--color-text-muted)" }}>Menyediakan borang...</p>
      </div>
    }>
      <PostAdForm />
    </Suspense>
  );
}
