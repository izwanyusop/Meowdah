"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

function BoostContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const adId = searchParams.get("adId");
  const supabase = createClient();

  // State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ad, setAd] = useState<any>(null);
  const [activeGateway, setActiveGateway] = useState<string>("none");
  const [selectedPackage, setSelectedPackage] = useState<"featured" | "urgent" | "combo">("combo");
  const [paying, setPaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Initial Load
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

        if (!adId) {
          setErrorMessage("ID iklan diperlukan.");
          setLoading(false);
          return;
        }

        // Fetch ad details
        const { data: adData, error } = await supabase
          .from("ads")
          .select("*")
          .eq("id", adId)
          .eq("seller_id", user.id)
          .single();

        if (error || !adData) {
          setErrorMessage("Iklan tidak ditemui atau anda bukan pemilik.");
        } else {
          setAd(adData);
        }

        // Fetch active payment config
        const configRes = await fetch("/api/pay/config");
        const configData = await configRes.json();
        setActiveGateway(configData.activeGateway || "none");
      } catch (err) {
        console.error("Ralat init boost:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [adId]);

  // Handle Checkout Click
  const handlePayment = async () => {
    if (!adId || paying) return;
    setPaying(true);
    setErrorMessage("");

    try {
      const endpoint = activeGateway === "billplz" 
        ? "/api/pay/billplz" 
        : activeGateway === "toyyibpay" 
        ? "/api/pay/toyyibpay" 
        : null;

      if (!endpoint) {
        // Sandboxed Mode / Free Boost Option
        console.log("Mengaktifkan booster mod sandbox secara percuma...");
        
        let updateFields: any = {};
        if (selectedPackage === "featured") {
          updateFields = { is_featured: true };
        } else if (selectedPackage === "urgent") {
          updateFields = { is_urgent: true };
        } else if (selectedPackage === "combo") {
          updateFields = { is_featured: true, is_urgent: true };
        }

        const { error } = await supabase
          .from("ads")
          .update(updateFields)
          .eq("id", adId)
          .eq("seller_id", currentUser.id);

        if (error) throw error;

        alert("🎉 Mod Sandbox: Iklan anda berjaya di-boost secara percuma!");
        router.push(`/dashboard/my-ads?payment=success&adId=${adId}&boost=${selectedPackage}`);
        return;
      }

      // Live Checkout redirect flow
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId, boostType: selectedPackage })
      });

      const data = await response.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error(data.error || "Gagal menjana pautan pembayaran.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Gagal memproses pembayaran. Sila cuba lagi.");
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: "16px" }}>
        <span style={{ fontSize: "2.5rem" }} className="animate-spin">🔄</span>
        <p style={{ color: "var(--color-text-muted)" }}>Menyediakan gerbang pembayaran...</p>
      </div>
    );
  }

  if (errorMessage && !ad) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--color-bg)", padding: "20px" }}>
        <header style={{ display: "flex", alignItems: "center", paddingBottom: "16px" }}>
          <button onClick={() => router.back()} style={{ background: "none", border: "none", fontSize: "1.4rem", color: "var(--color-text-main)", cursor: "pointer" }}>←</button>
        </header>
        <div style={{ padding: "40px 20px", textAlign: "center", backgroundColor: "white", borderRadius: "12px", border: "1px solid var(--color-border)" }}>
          <span style={{ fontSize: "2.5rem" }}>⚠️</span>
          <h4 style={{ marginTop: "12px", color: "var(--color-error)" }}>Ralat Ditemui</h4>
          <p style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", marginTop: "4px" }}>{errorMessage}</p>
          <Link href="/dashboard/my-ads" className="btn btn-primary" style={{ marginTop: "16px", display: "inline-block", padding: "10px 18px", fontSize: "0.82rem", textDecoration: "none" }}>Kembali ke Iklan Saya</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--color-bg)", paddingBottom: "60px" }}>
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
        <button 
          onClick={() => router.back()} 
          style={{ background: "none", border: "none", fontSize: "1.4rem", color: "var(--color-text-main)", cursor: "pointer" }}
        >
          ←
        </button>
        <h2 style={{ fontSize: "1rem", color: "var(--color-text-main)", fontWeight: "800", margin: 0 }}>
          🚀 Boost & Gandakan View Iklan
        </h2>
        <span style={{ width: "24px" }} />
      </header>

      <main style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: "20px" }}>
        
        {/* Ad summary snippet */}
        {ad && (
          <div style={{
            backgroundColor: "white",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
            padding: "12px",
            display: "flex",
            gap: "12px",
            alignItems: "center"
          }}>
            <div style={{ width: "50px", height: "50px", borderRadius: "6px", overflow: "hidden", backgroundColor: "#FFEAD7" }}>
              <img 
                src={ad.images && ad.images.length > 0 ? ad.images[0] : "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=200"} 
                alt="Ad Thumbnail" 
                style={{ width: "100%", height: "100%", objectFit: "cover" }} 
              />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: "0.82rem", fontWeight: "bold", color: "var(--color-text-main)", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden", margin: 0 }}>
                {ad.title}
              </h4>
              <p style={{ fontSize: "0.75rem", color: "var(--color-primary)", fontWeight: "bold", margin: "2px 0 0 0" }}>
                Harga Asal: RM {ad.price.toLocaleString("ms-MY")}
              </p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div style={{ backgroundColor: "#FDF2F0", border: "1px solid var(--color-error)", color: "var(--color-error)", padding: "10px", borderRadius: "8px", fontSize: "0.78rem" }}>
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Dynamic Promotion Packages Cards List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          
          {/* PACKAGE 1: COMBO BOOST */}
          <div 
            onClick={() => setSelectedPackage("combo")}
            style={{
              backgroundColor: "white",
              border: selectedPackage === "combo" ? "2.5px solid var(--color-primary)" : "1px solid var(--color-border)",
              borderRadius: "16px",
              padding: "16px",
              cursor: "pointer",
              position: "relative",
              boxShadow: selectedPackage === "combo" ? "0 8px 20px rgba(255, 140, 50, 0.12)" : "var(--shadow-sm)",
              transition: "all 0.2s ease"
            }}
          >
            {/* Best Value Badge */}
            <span style={{
              position: "absolute",
              top: "-10px",
              right: "20px",
              backgroundColor: "var(--color-primary)",
              color: "white",
              fontSize: "0.62rem",
              fontWeight: "bold",
              padding: "3px 10px",
              borderRadius: "var(--radius-full)",
              boxShadow: "0 4px 10px rgba(255,140,50,0.3)"
            }}>
              🔥 PILIHAN UTAMA (SAVE RM3)
            </span>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h4 style={{ fontSize: "0.95rem", fontWeight: "900", color: "var(--color-text-main)", margin: 0 }}>
                  ⚡ Combo Premium Boost
                </h4>
                <p style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", marginTop: "4px", lineHeight: 1.4 }}>
                  Dapatkan kedua-dua lencana **Iklan Utama (Featured)** & **Iklan Segera (Urgent)** untuk perhatian pembeli berganda!
                </p>
                <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                  <span style={{ backgroundColor: "#FFEAD7", color: "var(--color-primary)", fontSize: "0.6rem", fontWeight: "bold", padding: "2px 8px", borderRadius: "4px" }}>
                    ⭐ FEATURED
                  </span>
                  <span style={{ backgroundColor: "#FDF2F0", color: "var(--color-error)", fontSize: "0.6rem", fontWeight: "bold", padding: "2px 8px", borderRadius: "4px" }}>
                    🚨 URGENT
                  </span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", textDecoration: "line-through", display: "block" }}>RM 15.00</span>
                <span style={{ fontSize: "1.2rem", fontWeight: "900", color: "var(--color-primary)" }}>RM 12.00</span>
              </div>
            </div>
          </div>

          {/* PACKAGE 2: FEATURED AD */}
          <div 
            onClick={() => setSelectedPackage("featured")}
            style={{
              backgroundColor: "white",
              border: selectedPackage === "featured" ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
              borderRadius: "16px",
              padding: "16px",
              cursor: "pointer",
              boxShadow: selectedPackage === "featured" ? "0 8px 16px rgba(255, 140, 50, 0.08)" : "var(--shadow-sm)",
              transition: "all 0.2s ease"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h4 style={{ fontSize: "0.9rem", fontWeight: "bold", color: "var(--color-text-main)", margin: 0 }}>
                  ⭐ Featured Ad (Iklan Utama)
                </h4>
                <p style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", marginTop: "4px", lineHeight: 1.4 }}>
                  Pin iklan kucing anda di barisan atas halaman utama. Glowing oyen oufit card untuk visual terhebat.
                </p>
              </div>
              <span style={{ fontSize: "1.05rem", fontWeight: "900", color: "var(--color-text-main)" }}>RM 10.00</span>
            </div>
          </div>

          {/* PACKAGE 3: URGENT AD */}
          <div 
            onClick={() => setSelectedPackage("urgent")}
            style={{
              backgroundColor: "white",
              border: selectedPackage === "urgent" ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
              borderRadius: "16px",
              padding: "16px",
              cursor: "pointer",
              boxShadow: selectedPackage === "urgent" ? "0 8px 16px rgba(255, 140, 50, 0.08)" : "var(--shadow-sm)",
              transition: "all 0.2s ease"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h4 style={{ fontSize: "0.9rem", fontWeight: "bold", color: "var(--color-text-main)", margin: 0 }}>
                  🚨 Urgent Ad (Iklan Segera)
                </h4>
                <p style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", marginTop: "4px", lineHeight: 1.4 }}>
                  Lekatkan lencana merah terang "URGENT" untuk meyakinkan pembeli anda mahu letgo si bulus dengan pantas.
                </p>
              </div>
              <span style={{ fontSize: "1.05rem", fontWeight: "900", color: "var(--color-text-main)" }}>RM 5.00</span>
            </div>
          </div>

        </div>

        {/* Payment Gateways Configured */}
        <div style={{
          backgroundColor: "#FDFCFB",
          border: "1.5px dashed var(--color-border)",
          borderRadius: "12px",
          padding: "14px",
          marginTop: "10px"
        }}>
          <h4 style={{ fontSize: "0.8rem", fontWeight: "bold", color: "var(--color-text-main)", margin: 0 }}>
            🔒 Pembayaran FPX Selamat & Rasmi
          </h4>
          <p style={{ fontSize: "0.68rem", color: "var(--color-text-muted)", marginTop: "4px", lineHeight: 1.4 }}>
            {activeGateway === "toyyibpay" 
              ? "Pembayaran dikendalikan secara rasmi oleh ToyyibPay FPX Gateway." 
              : activeGateway === "billplz" 
              ? "Pembayaran dikendalikan secara rasmi oleh Billplz FPX Gateway." 
              : "🎁 Mod Sandbox / Percuma dikesan. Anda boleh menguji dan menaik taraf secara percuma!"}
          </p>
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePayment}
          disabled={paying}
          className="btn btn-primary"
          style={{
            width: "100%",
            padding: "14px",
            fontSize: "0.9rem",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            boxShadow: "0 6px 15px rgba(255, 140, 50, 0.25)"
          }}
        >
          {paying ? (
            <>🔄 Menghubungkan ke FPX...</>
          ) : (
            <>
              🚀 Bayar RM{" "}
              {selectedPackage === "combo" ? "12.00" : selectedPackage === "featured" ? "10.00" : "5.00"}{" "}
              & Boost Iklan Sekarang! ➔
            </>
          )}
        </button>

      </main>
    </div>
  );
}

export default function BoostAdPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: "16px" }}>
        <span style={{ fontSize: "2.5rem" }}>🔄</span>
        <p style={{ color: "var(--color-text-muted)" }}>Menyediakan gerbang pembayaran...</p>
      </div>
    }>
      <BoostContent />
    </Suspense>
  );
}
